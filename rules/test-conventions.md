---
paths:
  - ".claude/skills/test-checklist/**"
  - ".claude/skills/test-cases/**"
  - ".claude/skills/api-checklist/**"
  - "docs/**/test/**"
---

# Test Conventions — checklist → test cases

> Shared rule for `/test-checklist` and `/test-cases` (feature-wide) and `/api-checklist` (integration, wave 5). Defines the `CHK-`/`TC-` IDs, the checklist→case expansion, and the link-back to AC/FR/E.

## IDs (path-scoped, like US/AC)

| Type | Format | Example | Scope |
|------|--------|-------|-------|
| Checklist row | `CHK-{NNN}` | `CHK-001` | Per feature, in `test/checklist/{f}-checklist-index.md` |
| Test case | `TC-{NNN}` | `TC-001` | Per feature, in `test/testcases/{f}-testcase-index.md` |

- Path-scoped (no feature prefix) — the feature is implied by the folder (`docs/{feature}/test/…`), exactly like `US-{NNN}` and `AC-{NNN}`.
- 3-digit zero-pad, `max+1`, never reused (same discipline as the rest of the spine).

## Checklist row anatomy

Each `CHK-` row in `{f}-checklist-index.md`:

| ID | What to test | Covers | Layer | Priority | Status | TC |
|---|---|---|---|---|---|---|
| `CHK-001` | Approver within tier can approve | AC-001, FR-{f}-006 | functional | P0 | draft | TC-001 |

- **Covers** — the AC(s) and/or FR(s)/E-(s) this row verifies. A row with no `Covers` is a coverage gap (flag it).
- **Layer** — `functional` / `boundary` / `error` / `non-functional` / `integration` (wave 5 adds `test_layer` own/3rd/mixed + `direction`).
- **TC** — the `TC-` that expands this row (filled by `/test-cases`; empty until then).

## Test case anatomy

Each `TC-` row in `{f}-testcase-index.md` expands exactly one `CHK-`:

| ID | Title | Expands CHK | Steps | Test data | Expected | Status |
|---|---|---|---|---|---|---|

- **Steps** — numbered, one action each (click/enter/submit), no prose padding.
- **Test data** — the concrete values (sourced from the spec/AC; boundary cases carry the at/below/above values).
- **Expected** — the observable outcome + the error code/message where applicable (`E-{f}-NNN`).

## Expansion rules

- `/test-cases` **refuses without a checklist** (`feature-bootstrap.md` canonical group-B example) — expanding nothing = fabricating tests.
- One `CHK-` → **one or more** `TC-`: a boundary `CHK-` (e.g. "tier boundary at 50k") expands to the at/below/above triple as separate `TC-` rows; an error `CHK-` expands to one `TC-` per `E-` code it covers.
- Every `TC-` links back to its `CHK-` (the `Expands CHK` column) — `/gap` joins CHK→TC this way.
- The checklist's `TC` column is the reverse pointer (filled as cases are generated).

## What this rule does NOT cover

- The API integration checklist (`test_layer`/`direction` columns, Bruno layout) — `rules/api-integration.md` (wave 5).
- QA execution results / automation status — out of scope; these skills produce the *design* of the tests, not a run report.
