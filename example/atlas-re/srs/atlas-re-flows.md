# Atlas Re — flows (sequence + activity, Mermaid inline)

> Anonymized. See [`../DOMAIN.md`](../DOMAIN.md). Inline so it renders on GitHub/Obsidian.

%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%

## Submission → Quote → Bind (sequence)

> Realistic inter-service flow: services call each other (sync REST) and the bus fans events out to consumers —
> see [`../DOMAIN.md`](../DOMAIN.md) "Service interactions". The bind is driven by **contract-svc** (it owns the
> Contract entity), not submission-svc.

```mermaid
sequenceDiagram
  autonumber
  actor UW as Underwriter
  participant Web as Atlas Re Web
  participant API as API Gateway
  participant Auth as Azure AD
  participant Sub as submission-svc
  participant Pri as pricing-svc
  participant Con as contract-svc
  participant DB as PostgreSQL
  participant Bus as Kafka (proposed)
  participant Clm as claim-svc

  UW->>Web: open new submission
  Web->>API: POST /submissions
  API->>Auth: verify bearer token
  Auth-->>API: valid
  API->>Sub: create
  Sub->>DB: insert submission (DRAFT)
  Sub->>Pri: request rating — fire/cat (sync)
  Pri-->>Sub: quote
  Sub->>DB: update status QUOTED
  Sub->>Bus: publish submission.quoted
  Bus-->>Con: pre-stage a draft contract (async)
  Sub-->>API: submission + quote
  API-->>Web: 201
  UW->>Web: bind
  Web->>API: POST /contracts
  API->>Con: bind
  Con->>Sub: fetch + validate submission (sync)
  Sub-->>Con: submission (QUOTED)
  Con->>Pri: final rate (sync)
  Pri-->>Con: rate
  Con->>DB: insert contract (BOUND)
  Con->>Bus: publish contract.bound
  Bus-->>Clm: in-force — claims admissible (async)
  Con-->>API: contract id
  API-->>Web: 201
```

**Reads:** the underwriter drives submission → quote → bind. Services call each other synchronously —
`submission-svc → pricing-svc` for the quote, `contract-svc → submission-svc` to fetch the bound submission,
`contract-svc → pricing-svc` for the final rate. Domain events fan out asynchronously on Kafka (proposed):
`submission.quoted` → `contract-svc`, `contract.bound` → `claim-svc` (the bus is a backbone with consumers,
not a sink). The WebSocket live-pricing path is exercised in `/system-design` and `/dfd`.

## Claim validation (sequence)

```mermaid
sequenceDiagram
  autonumber
  actor CL as Claims handler
  participant Web as Atlas Re Web
  participant API as API Gateway
  participant Clm as claim-svc
  participant Con as contract-svc
  participant Ref as reference-svc
  participant DB as PostgreSQL
  participant Bus as Kafka (proposed)
  participant Rec as receipt-svc

  CL->>Web: report a loss
  Web->>API: POST /claims
  API->>Clm: create
  Clm->>Con: fetch coverage / layers (sync)
  Con-->>Clm: contract + layers
  Clm->>Ref: loss-reference lookup (sync)
  Ref-->>Clm: reference codes
  Clm->>DB: insert claim (PRECAUTIONARY)
  Clm->>Bus: publish claim.registered
  Bus-->>Rec: open reserve + payment workflow (async)
  Clm-->>API: claim id
  API-->>Web: 201
```

**Reads:** when a loss is reported, `claim-svc` calls `contract-svc` (sync) for the coverage/layers that decide
whether the loss is covered, and `reference-svc` for loss-reference codes, before persisting a precautionary
claim. `claim.registered` is published and consumed by `receipt-svc`/finance. The human approval depth is in
`/activity-swimlane` + `/bpmn`.

## Claim registration (compact activity / flowchart)

```mermaid
flowchart LR
  A([Loss reported]) --> B[Validate contract covers loss]
  B --> C{Covered?}
  C -- no --> D[Decline claim]
  C -- yes --> E[Create claim PRECAUTIONARY]
  E --> F[Register claim]
  F --> G([Investigation opens])
  D --> Z([Closed])
```

**Reads:** a loss is validated against the contract; covered losses become a precautionary claim then
registered; declined claims close. The multi-role approval depth is in `/activity-swimlane` + `/bpmn`.
