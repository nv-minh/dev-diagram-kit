# Atlas Re — flows (sequence + activity, Mermaid inline)

> Anonymized. See [`../DOMAIN.md`](../DOMAIN.md). Inline so it renders on GitHub/Obsidian.

%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%

## Submission → Quote → Bind (sequence)

```mermaid
sequenceDiagram
  autonumber
  actor UW as Underwriter
  participant Web as Atlas Re Web
  participant API as API Gateway
  participant Auth as Azure AD
  participant Sub as submission-svc
  participant Pri as pricing-svc
  participant DB as PostgreSQL
  participant Bus as Kafka (proposed)

  UW->>Web: open new submission
  Web->>API: POST /submissions
  API->>Auth: verify bearer token
  Auth-->>API: valid
  API->>Sub: create
  Sub->>DB: insert submission (DRAFT)
  Sub->>Pri: request rating (fire/cat)
  Pri-->>Sub: quote
  Sub->>DB: update status QUOTED
  Sub->>Bus: publish submission.quoted (proposed)
  Sub-->>API: submission + quote
  API-->>Web: 201
  UW->>Web: bind
  Web->>API: POST /contracts
  API->>Sub: bind
  Sub->>DB: insert contract (BOUND)
  Sub->>Bus: publish contract.bound (proposed)
  Sub-->>API: contract id
  API-->>Web: 201
```

**Reads:** the underwriter drives the submission through quote → bind; auth is checked at the gateway; pricing is async-capable; domain events are published to Kafka (proposed). Kafka + the WebSocket live-pricing path are exercised in `/system-design` and `/dfd`.

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
