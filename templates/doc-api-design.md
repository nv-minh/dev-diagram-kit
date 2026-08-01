---
type: api-design
feature: {{feature}}
status: draft
updated: {{date}}
links:
  - docs/{{feature}}/integration/api-summary.md
---

# {{feature_name}} — Integration Blueprint

## 1. Orchestration

| Endpoint | Trigger | Sync/async | Provenance |
|---|---|---|---|
| {{endpoint}} | {{trigger}} | {{sync}} | summary / SRS |

## 2. State-map

| Entity | Field | Integration role |
|---|---|---|
| {{entity}} | {{field}} | holds {{what}} |

## 3. Source-of-truth

| Synced field | Owner | Notes |
|---|---|---|
| {{field}} | ours / theirs / derived ({{formula}}) | {{notes}} |

## 4. Webhook handling

| Webhook | Verify | Idempotency key | Apply | Reconciliation |
|---|---|---|---|---|
| {{event}} | {{how}} | {{key}} | {{action}} | poll {{endpoint}} every {{interval}} |

## 5. Retry policy

- Attempts: {{n}} · Backoff: {{strategy}} · Budget vs NFR: {{fits_or_blows}}

## 6. Degraded UX

| Trigger | User sees |
|---|---|
| provider down | {{fallback_surface}} |

## Open Questions

- [ ] OQ-1: {{gap}}
