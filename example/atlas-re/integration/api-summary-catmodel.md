---
type: api-summary
feature: atlas-re
status: approved
updated: 2026-08-01
---

# CatModel — contract summary

> Provider: CatModel (fictional catastrophe-modeling service) · Spec: CatModel API v2.3 (2026-06) · Source: `legacy/catmodel-openapi.yaml` (anonymized)

## 1. Auth

| Scheme | Details | Provenance |
|---|---|---|
| HMAC-SHA256 | each request signed with a shared secret over the body + timestamp | openapi §components.securitySchemes |

## 2. Endpoints

| Method | Path | Purpose | Direction | Provenance |
|---|---|---|---|---|
| POST | /submissions/{id}/quote | request a loss estimate | out | openapi §paths./quote |
| GET | /jobs/{job_id} | poll the quote job status | out | openapi §paths./jobs |

## 3. Webhooks

| Event | Payload shape | Provenance |
|---|---|---|
| quote.completed | `{job_id, loss_estimate:{amount,currency}, status}` | openapi §webhooks.quote.completed |

## 4. Rate limits & pagination

- Rate limit: 100 requests/min per account (documented) — openapi §info.
- Pagination: n/a (job-based, not list-based).

## 5. Errors

| HTTP | Code | Meaning | Provenance |
|---|---|---|---|
| 429 | rate_limited | over the 100/min limit, retry after `Retry-After` | openapi §responses.429 |
| 422 | invalid_submission | the submission payload failed validation | openapi §responses.422 |

## Open Questions (undocumented)

- [ ] OQ-1: the sandbox base URL is documented but the production base URL is not in the spec — confirm with CatModel.
