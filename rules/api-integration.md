# API Integration — the 7-step chain contract

> Shared rule for the integration family: `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`. Referenced by `naming-conventions.md` (Integration family note) and `doc-selection.md`. Every skill in the family MUST reference this file in Constraints + References.

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

The chain has a strict order with two skip points ([0] when the provider is fixed, [3] when there's no data mapping). Every later step reads the upstream — `/api-design` reads the summary, `/api-checklist` reads the design + map, `/api-readiness` reads everything.

## File conventions (from `naming-conventions.md`)

- Fixed-name files use a **bare name** (no `{feature}-` prefix): `integration/api-assess.md`, `api-summary.md`, `api-design.md`, `api-map.md`, `api-readiness.md`; `test/api/api-checklist.md`, `api-tests.md` + `bruno/`.
- **Multi-provider**: suffix the summary — `api-summary-{provider}.md`; other files stay single (the blueprint orchestrates all providers in one file).
- Legacy test files still under `integration/` migrate to `test/api/` on the next `/api-test` rerun.

## Shared semantics

- **`test_layer` column** (in `api-checklist.md`): `own` (our side only — our orchestration, our error handling) / `3rd` (their side only — sandbox availability, their rate limit, their error response) / `mixed` (end-to-end through both — a real request that our code sends and their service answers). Every row carries exactly one layer.
- **`direction` column**: `out` (we call them — a request we initiate) / `in` (they call us — webhooks, callbacks, polling notifications). A webhook integration has `in` rows; a lookup integration has `out` rows; most have both.
- **Provider suffix rule**: when a feature integrates more than one provider, each provider gets its own summary (`api-summary-{provider}.md`) and its own Bruno collection; the design (`api-design.md`) and map (`api-map.md`) stay single files that orchestrate all providers (the blueprint is one integration story, not one per provider).
- **No fabrication**: `/api-doc` summarizes ONLY what the provider docs/OpenAPI actually state, with provenance (which doc page / which spec version). Unknowns become OQs, never guesses — a guessed endpoint or a guessed rate limit is the most dangerous fabrication in the kit.
- **Checklist IDs**: `CHK-{NNN}`, path-scoped under `test/api/` (the feature-wide checklist lives in `test/checklist/` — different folder, no collision, per `test-conventions.md`). The `TC` column stays empty until `/api-test` runs.
- **Source-of-truth ownership**: every mapped field in `api-map.md` declares which side owns the canonical value — ours, theirs, or derived. A field with no owner is a drift bug waiting to happen; flag it.
- **Webhook rows always pair**: every webhook (`direction: in`) row in the checklist has a retry + reconciliation partner — "if the webhook is missed, we reconcile by polling {endpoint} every {interval}". A webhook with no reconciliation is a silent data-loss path.

## Bruno layout

`/api-test` produces a Bruno collection under `docs/{feature}/bruno/` (or migrates a legacy one from `integration/`):

- One **collection per provider** (named `{provider}`), mirroring the `api-summary-{provider}.md` split.
- One `.bru` (request) **per `CHK-` row that is automatable** — `test_layer: own` rows that only test our code may be unit tests outside Bruno; `3rd`/`mixed` rows become Bruno requests hitting the sandbox.
- Environment variables for base URL / auth — never hardcode secrets into the `.bru` files.
- The `api-tests.md` table lists each `CHK-` → its `.bru` file + the expected response (status + the key field to assert).

## Go/no-go (`api-readiness.md`)

`/api-readiness` hard-refuses to issue a "go" if `/api-test` results are absent — the go-live gate is downstream of proof the calls work. Its go/no-go table covers:

- **Cutover** — the enablement sequence (flag order, who flips what, the moment the integration goes live).
- **Feature flags** — kill switch name + who can flip it + the off-state behavior (degraded UX).
- **Monitoring** — the alerts (error rate, latency, their-status-page subscription) + the runbook link.
- **Rollback** — the disable sequence + how to back out partial data already written.
- **SLA / deprecation** — their SLA we depend on + any provider sunset date + our deprecation notice to consumers.

## References

- `rules/naming-conventions.md` — paths + `type:` values for the 7 outputs
- `rules/doc-selection.md` — routing into the chain (provider open → `/api-assess`; provider fixed → `/api-doc`)
- `rules/test-conventions.md` — the `CHK-` anatomy (path-scoped, same under `test/api/`)
