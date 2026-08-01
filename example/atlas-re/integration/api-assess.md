---
type: api-assess
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/srs/atlas-re-spec.md
---

# Atlas Re — provider assessment (catastrophe model)

## 1. The need

Pricing needs a catastrophe-model loss estimate for a submission before bind — coverage of wind/quake perils, async quote job, webhook or poll, sandbox available (supports FR-atlas-re pricing path documented ahead of the claim-approval spine).

## 2. Candidates & criteria (weighted)

| Candidate | Coverage (w=30) | Cost (w=20) | SLA (w=15) | Auth (w=10) | Residency (w=10) | Sunset (w=15) | Total |
|---|---|---|---|---|---|---|---|
| CatModel | 9 | 7 | 8 | 9 | 8 | 8 | **8.25** |
| StormYard | 7 | 8 | 7 | 7 | 6 | 9 | 7.30 |
| Build-in-house | 5 | 3 | — | — | 10 | 10 | 5.60 |

Weights sum to 100%. Totals are weighted averages on a 1–10 scale.

## 3. Basis per score

| Candidate | Criterion | Basis | Source |
|---|---|---|---|
| CatModel | Coverage | Wind + quake + flood; job+webhook API v2.3 | CatModel OpenAPI (anonymized) |
| CatModel | Cost | Quoted $0.12/quote in sandbox tier | Vendor quote 2026-06 |
| CatModel | SLA | 99.5% monthly; p95 job < 45s | Status page + MSA draft |
| CatModel | Auth | HMAC-SHA256 shared secret | OpenAPI securitySchemes |
| CatModel | Residency | EU + US regions selectable | Docs §data-residency |
| CatModel | Sunset | No EOL announced; v1 deprecated with 18mo notice | Changelog |
| StormYard | Coverage | Wind only in current SKU; quake "roadmap" | StormYard datasheet |
| StormYard | Cost | Flat $4k/mo for 50k quotes | Quote 2026-06 |
| Build-in-house | Coverage | Would need actuarial hire + 2 quarters | Internal estimate |

## 4. Recommendation

**CatModel** — wins by ~0.95 over StormYard on weighted total; deciding criterion is **Coverage** (quake required for the book). Biggest winner-risk: vendor concentration — mitigate with the degraded-UX path already in `api-design.md` (flag `pricing_failed`, underwriter override).

## Open Questions

- [ ] OQ-atlas-re-assess-001: Confirm EU residency flag is available on the production tier (sandbox is US-only in the trial).
