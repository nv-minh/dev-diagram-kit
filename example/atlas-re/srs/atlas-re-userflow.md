---
type: srs-userflow
feature: atlas-re
updated: 2026-08-01
stage: approved
flow_approved_at: 2026-08-01
flow_hash: 3f8a2c91
primary_device: desktop
---

# Atlas Re claim approval — User Flow

## Flow: approve-claim

Screens: `[1] Claim queue` — tier-filtered work list · `[2] Claim detail` — amount, reserve check, history · `[3] Decision panel` — approve/reject with note · `[4] Confirmation` — recorded decision + next claim

```mermaid
flowchart TD
    S1["[1] Claim queue"] --> S2["[2] Claim detail"]
    S2 --> D1{Within my tier?}
    D1 -->|yes| S3["[3] Decision panel"]
    D1 -->|no - routed elsewhere| S1
    S3 -->|approve / reject| S4["[4] Confirmation"]
    S3 -->|validator conflict E-atlas-re-001| S2
    S3 -->|already decided E-atlas-re-004| S2
    S4 --> S1
```

## Flow: review-history

Screens: `[5] History search` — filter by contract/cedent/period · `[6] Transition log` — the append-only trail

```mermaid
flowchart TD
    S5["[5] History search"] --> S6["[6] Transition log"]
    S6 --> S5
```
