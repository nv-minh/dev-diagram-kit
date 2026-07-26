# Atlas Re — data model (ERD, Mermaid inline)

> Anonymized reinsurance underwriting model. See [`../DOMAIN.md`](../DOMAIN.md). Inline so it renders on GitHub/Obsidian.

%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%
```mermaid
erDiagram
  INSURED ||--o{ SUBMISSION : "places"
  BROKER ||--o{ SUBMISSION : "brokers"
  SUBMISSION ||--o{ LAYER : "structured as"
  SUBMISSION ||--|| CONTRACT : "binds into"
  CONTRACT ||--o{ CLAIM : "may incur"
  CLAIM ||--o{ CLAIM_PAYMENT : "settled by"
  CONTRACT ||--o{ PREMIUM_SCHEDULE : "paid via"

  INSURED { string id PK "unique"
            string name
            string industry
            string country }
  BROKER { string id PK "unique"
           string name
           string brokerageHouse }
  SUBMISSION { string id PK "unique"
               string insuredId FK
               string brokerId FK
               string businessLine
               string status "DRAFT, QUOTED, BOUND, DECLINED" }
  LAYER { string id PK "unique"
          string submissionId FK
          decimal limit
          decimal excess }
  CONTRACT { string id PK "unique"
             string submissionId FK
             decimal premium
             date inceptionDate
             string status "QUOTED, PENDING, BOUND, CANCELLED" }
  CLAIM { string id PK "unique"
          string contractId FK
          decimal lossAmount
          datetime reportedAt
          string status "PRECAUTIONARY, REGISTERED, IN_PROGRESS, CLOSED" }
  CLAIM_PAYMENT { string id PK "unique"
                  string claimId FK
                  decimal amount
                  string status "PENDING_APPROVAL, APPROVED, PAID" }
```

**Reads:** an Insured (via a Broker) places a **Submission** → structured into **Layers** → bound into a **Contract** → which may incur **Claims** (settled by payments) and is paid via a **Premium schedule**. Cardinality is read off the crow's-foot. Compare with the standalone `/d2-erd` version for a nicer export image.
