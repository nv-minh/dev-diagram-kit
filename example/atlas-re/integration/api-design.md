---
type: api-design
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/integration/api-summary-catmodel.md
---

# Atlas Re — Integration Blueprint (CatModel provider)

> The pricing engine needs catastrophe-model loss estimates from the **CatModel** provider. This is the integration that feeds pricing (a future capability; the integration is documented ahead of the spec slice).

## 1. Orchestration

| Endpoint | Trigger | Sync/async | Provenance |
|---|---|---|---|
| `POST /submissions/{id}/quote` | handler requests a price | async (returns 202 + job_id) | summary §2 |
| `GET /jobs/{job_id}` | poll until `status=done` | async poll, ≤60s timeout | summary §2 |
| webhook `quote.completed` | provider pushes the result | in (we receive) | summary §3 |

**Sequence:** handler triggers `POST /quote` → we poll `GET /jobs` every 2s → on `done` we store the loss estimate → if the webhook arrives first, we stop polling (idempotent on `job_id`).

## 2. State-map

| Entity | Field | Integration role |
|---|---|---|
| Submission | `catmodel_job_id` | holds the provider job id we poll |
| Submission | `loss_estimate` | holds the result we receive |
| Submission | `priced_at` | holds the result timestamp |

## 3. Source-of-truth

| Synced field | Owner | Notes |
|---|---|---|
| `loss_estimate` | theirs | CatModel is the authority until a human underwriter overrides (override is a separate field) |
| `catmodel_job_id` | ours | we mint the request; they echo it back |
| `priced_at` | derived | our timestamp when we stored their result |

## 4. Webhook handling

| Webhook | Verify | Idempotency key | Apply | Reconciliation |
|---|---|---|---|---|
| `quote.completed` | HMAC-SHA256 signature header vs shared secret | `job_id` (we already have it from the POST) | store `loss_estimate` + `priced_at`, stop polling | if no webhook within 60s of the POST, the poll loop already has the result — no separate reconcile needed; if both miss, flag the submission `pricing_failed` |

## 5. Retry policy

- `POST /quote`: 3 attempts, exponential backoff 1s/2s/4s. Budget vs NFR-atlas-re-001 (p95 < 2s for the *queue* view — this pricing call is async, not on the queue path, so the budget holds).

## 6. Degraded UX

| Trigger | User sees |
|---|---|
| CatModel provider down (POST fails after retries) | submission shows "pricing temporarily unavailable — retry" instead of a loss estimate; the submission is NOT auto-declined |

## Open Questions

- [ ] OQ-1: webhook signature shared-secret rotation policy with CatModel — confirm quarterly vs on-demand.
