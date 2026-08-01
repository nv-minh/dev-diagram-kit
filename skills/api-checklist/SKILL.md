---
name: api-checklist
description: Use when you need the integration test outline — CHK- rows with test_layer (own/3rd/mixed) and direction (out/in) columns, covering orchestration, mapping, webhooks+reconciliation, and degraded UX. Written to test/api/api-checklist.md. Trigger with `/api-checklist <feature>`. Step [4] of the API chain; needs the design + map. Differs from /test-checklist (feature-wide; this is integration-only).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /api-checklist — Integration test outline (API chain [4])

## Goal

Derive the integration test outline from the design (orchestration/webhook/retry) + the map (field transforms) — `CHK-{NNN}` rows carrying `test_layer` (own/3rd/mixed) and `direction` (out/in) per `api-integration.md`. **Single output**: `docs/{feature}/test/api/api-checklist.md` (type `api-checklist`). Expanded by `/api-test` into Bruno requests.

## Constraints

- **Step [4]** (`api-integration.md`): needs `api-design.md` (+ `api-map.md` if present). Design missing → refuse + route `/api-design`.
- **Path-scoped `CHK-`** under `test/api/` (`test-conventions.md`) — no collision with the feature-wide `test/checklist/` (different folder).
- **Two integration-specific columns** — `test_layer` (own/3rd/mixed) + `direction` (out/in) on every row, per `api-integration.md`.
- **Webhook ⇄ reconciliation coverage** — every webhook row has a "happy" check AND a "missed-webhook → reconciliation" check (the pair the design mandated).
- **Degraded-UX coverage** — the design's degraded paths get `test_layer: own` rows (we can test our fallback without the provider).
- **Every row Covers a design/map decision** — a row with no source is fabrication.
- **The `TC` column starts empty** — `/api-test` fills it.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — L2 diff.
- **Template** — `@../../templates/doc-api-checklist.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-checklist <feature>          # derive from design + map
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Designs (required): !`ls docs/*/integration/api-design.md 2>/dev/null | head -10`
Maps: !`ls docs/*/integration/api-map.md 2>/dev/null | head -10`
Existing API checklists: !`ls docs/*/test/api/api-checklist.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No design → refuse + route `/api-design`. Read the design (orchestration/webhooks/retry/degraded) + the map (transforms to verify).
2. **Derive candidates** — per endpoint: an `out` functional + an error (their error response); per webhook: happy `in` + reconciliation `mixed`; per degraded path: an `own` fallback; per transform: a boundary check.
3. **Classify** — assign `test_layer` + `direction` per row.
4. **Assign `CHK-` IDs** — scan the existing api-checklist for max (path-scoped, independent of the feature-wide checklist's max).
5. **Draft** per the template — rows with test_layer/direction, `Covers` filled, `TC` empty.
6. **L1 plan preview** — row count by layer + direction + the webhook⇄reconciliation pairs + degraded coverage.
7. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-checklist` + note + author.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/test/api/api-checklist.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — layer/direction breakdown + next (`/api-test`).

## L1 plan preview

> I'll write the integration test outline for **{feature}** to `test/api/api-checklist.md`: **{N} rows** (own {o} · 3rd {t} · mixed {m}; out {out} · in {in}).
> Webhook⇄reconciliation pairs: {p}/{p}. Degraded-UX checks: {d}. Covers: design + map.
> Apply? (Y / edit)

## Output report

```
✅ Integration checklist written: test/api/api-checklist.md
   Rows: {N} (own {o} · 3rd {t} · mixed {m}) | Webhook pairs: {p} | doc-validate: OK

Next: /api-test {feature} — Bruno collection + per-row expected responses.
```

## Gotchas

- **Webhook reconciliation is the high-value row** — the "happy webhook" check almost always passes; the "missed webhook → reconciliation polls" check catches the data-loss bug. Don't drop it.
- **`3rd` rows may be unautomatable** — testing their sandbox availability is real but flaky; flag those for manual/periodic, not the CI gate.
- **Don't merge with the feature checklist** — different folder, different scope; `/gap` joins both via the CHK/TC spine.
- **Degraded-UX is `own`-testable** — that's the point of testing it: our fallback works without the provider.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/test-conventions.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-checklist.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
