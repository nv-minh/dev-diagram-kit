---
type: api-map
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/integration/api-summary-catmodel.md
  - docs/atlas-re/integration/api-design.md
---

# Atlas Re — field mapping (CatModel provider ↔ model ↔ UI)

## Mapping

| # | Provider field | Our model field | UI element | Owner | Direction | Transform |
|---|---|---|---|---|---|---|
| 1 | `job_id` | Submission.catmodel_job_id | (none — internal) | ours | bi | none (we send, they echo) |
| 2 | `loss_estimate.amount` | Submission.loss_estimate | [2] Claim detail → amount context | theirs | in | none |
| 3 | `loss_estimate.currency` | Submission.loss_estimate (store as USD) | (none) | derived | in | convert to USD at filing-date rate if ≠ USD (BR-atlas-re-001 FX path) |
| 4 | `submission.insured_id` | Submission.insured_id | (none — internal) | ours | out | none |
| 5 | `submission.business_line` | Submission.business_line | (none — internal) | ours | out | enum map: our `fire`/`casualty`/`prof` → their `FIRE`/`CAS`/`PL` |
| 6 | `layers[]` | Layer[] (limit/excess) | [2] Claim detail | ours | out | none |

## Flags

- Ownerless: none (every mapped field has an owner per the design §3).
- ERD name mismatches: `loss_estimate` is stored on Submission per the design state-map; the ERD may later split it into a `PricingResult` entity — flagged for `/erd` reconciliation when that lands.
