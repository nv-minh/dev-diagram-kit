# API Integration — the 7-step chain contract

> Shared rule for the integration family: `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`. Referenced by `naming-conventions.md` (Integration family note). **The skills land in wave 5** — this file holds the chain contract they will follow; sections marked *(wave 5)* are filled when the skills ship.

## The chain

| Step | Skill | Question it answers | Skip when |
|---|---|---|---|
| [0] | `/api-assess` | Build vs buy? Which provider? | The provider is already fixed (contract signed, internal mandate) |
| [1] | `/api-doc` | What does THEIR contract actually offer? | — (never skip; refuses to fabricate a contract) |
| [2] | `/api-design` | How do WE orchestrate it? (state-map, source-of-truth, webhook, retry, reconciliation, degraded-UX) | — |
| [3] | `/api-map` | Which field maps to which? (provider ↔ our model ↔ UI) | No data mapping (pure trigger/webhook integration) |
| [4] | `/api-checklist` | What must be tested? (`test_layer` own/3rd/mixed + `direction` out/in) | — |
| [5] | `/api-test` | Do the calls actually work? (Bruno collection) | No API access in this environment (document why) |
| [6] | `/api-readiness` | Go / no-go? (cutover, flags, monitoring, rollback, SLA) | — (the gate before enabling in production) |

## File conventions (from `naming-conventions.md`)

- Fixed-name files use a **bare name** (no `{feature}-` prefix): `integration/api-assess.md`, `api-summary.md`, `api-design.md`, `api-map.md`, `api-readiness.md`; `test/api/api-checklist.md`, `api-tests.md` + `bruno/`.
- **Multi-provider**: suffix the summary — `api-summary-{provider}.md`; other files stay single (the blueprint orchestrates all providers in one file).
- Legacy test files still under `integration/` migrate to `test/api/` on the next `/api-test` rerun.

## Shared semantics *(full detail lands with wave 5)*

- **`test_layer` column**: `own` (our side only) / `3rd` (their side only, e.g. sandbox availability) / `mixed` (end-to-end through both).
- **`direction` column**: `out` (we call them) / `in` (they call us — webhooks, callbacks).
- **No fabrication**: `/api-doc` summarizes ONLY what the provider docs/OpenAPI actually state, with provenance. Unknowns become OQs, never guesses.
- **Checklist IDs**: `CHK-{NNN}`, path-scoped under `test/api/` (no collision with the feature-wide checklist — different folder).
- **Bruno layout** *(wave 5)*: collection per provider, one `.bru` per checklist row that is automatable.

## References

- `rules/naming-conventions.md` — paths + `type:` values for the 7 outputs
- `rules/doc-selection.md` — routing into the chain (provider open → `/api-assess`; provider fixed → `/api-doc`)
