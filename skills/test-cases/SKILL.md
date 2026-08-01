---
name: test-cases
description: Use when you need full executable test cases — steps, test data, expected results — expanding the test checklist's CHK- rows into TC- IDs. Trigger with `/test-cases <feature> [--chk CHK-...]`. Refuses without a checklist (route /test-checklist) — the canonical group-B example. Differs from `/test-checklist` (the outline) and `/ac` (business pass/fail conditions; test cases are QA execution steps).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--chk CHK-...]"
---

# /test-cases — Full test cases (steps/data/expected)

## Goal

Expand each `CHK-` row into one or more `TC-{NNN}` test cases — numbered steps, concrete test data, and the expected observable outcome (+ error code/message where applicable). **Single output**: `docs/{feature}/test/testcases/{feature}-testcase-index.md` (type `test-cases-index`).

## Constraints

- **Group B** (`feature-bootstrap.md` canonical example): no `test/checklist/{feature}-checklist-index.md` → **refuse + route `/test-checklist`**. Expanding nothing = fabricating tests.
- **Mint `TC-{NNN}`** (`test-conventions.md`) — 3-digit, path-scoped, max+1, never reused.
- **One CHK → one or more TC** — a boundary `CHK-` expands to the at/below/above triple as separate `TC-` rows; an error `CHK-` to one `TC-` per `E-` code it covers. Every `TC-` links back via the `Expands CHK` column.
- **Test data is sourced** — values come from the spec/AC (BR thresholds, E- messages); unknown values → ask or OQ, never invented.
- **One action per step** — numbered steps, each a single click/enter/submit; no prose padding.
- **Expected = observable** — the outcome a tester sees + the exact error wording/code where applicable.
- **Fill the checklist's `TC` column** — after generating, write the `TC-` back into the checklist row (the reverse pointer `/gap` joins on).
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run → new CHK- rows get new TC-; existing TC- get L2 diffs.
- **Template** — `@../../templates/doc-testcase-index.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/test-cases <feature>                # expand every CHK- with no TC yet
/test-cases <feature> --chk CHK-003  # one checklist row
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Checklists (required source): !`ls docs/*/test/checklist/*-checklist-index.md 2>/dev/null | head -10`
Existing test cases: !`ls docs/*/test/testcases/*-testcase-index.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No checklist → refuse + route `/test-checklist` (standard group-B message). Read the checklist (every `CHK-`, its `Covers`, layer) + the spec/AC for the source values (boundaries, error messages).
2. **Expansion plan** — per uncovered `CHK-`: how many `TC-` (boundary → 3, error → 1 per E-, functional → 1); note the test data needed per case.
3. **Fact-list** — per planned `TC-`: the steps, the data (sourced), the expected (+ E- code).
4. **Ask data gaps** — any value the spec/AC doesn't pin (one batched round); "skip" → mark the case `data: TBD`.
5. **Assign `TC-` IDs** — scan the existing testcase index for max.
6. **Draft** per the template — rows with Title / Expands CHK / Steps / Test data / Expected / Status.
7. **L1 plan preview** — TC count + per-CHK expansion breakdown + data-gaps flagged.
8. **Write the testcase index + edit the checklist's `TC` column.** **Activity log** — `CLAUDE_SKILL_NAME=/test-cases` + note + author.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/test/`. Exit 1 → fix, ≤2 attempts.
10. **Output report** — TC generated + data-gaps + next (`/gap` to prove AC→CHK→TC coverage).

## L1 plan preview

> I'll expand **{feature}**'s checklist into **{N} test cases** (TC-{first}…TC-{last}) in `test/testcases/{feature}-testcase-index.md`: {per-CHK expansion: CHK-001 → TC-001; CHK-002 (boundary) → TC-002/003/004…}.
> Data gaps needing your input: {list | none}. Checklist `TC` column will be back-filled.
> Logged: activity log "{N} test cases from {C} CHK".
> Apply? (Y / edit)

## Output report

```
✅ Test cases written: test/testcases/{feature}-testcase-index.md
   TC: {first}…{last} ({N}) | Checklist TC column back-filled for {C} rows | doc-validate: OK
   Data gaps (marked TBD): {list | none}

Prove the coverage? /gap (AC→CHK→TC is part of the traceability spine).
```

## Gotchas

- **No checklist = no test cases** — this is the canonical group-B refusal; don't soften it. Generating tests from FRs directly skips the outline and produces uneven coverage.
- **Boundary triple is non-negotiable** — a ≤ 50k rule tested only at 40k leaves the edge ambiguous; the at/below/above cases are why `/test-cases` exists over a flat generator.
- **Expected wording must match the spec** — the `E-` message in the test case is the exact string the user sees; paraphrasing it breaks the tester.
- **Don't renumber** — a `TC-` retired by a changed requirement keeps its number; new cases take max+1.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/test-conventions.md
- @../../rules/language.md
- @../../templates/doc-testcase-index.md
- @../../scripts/doc-validate.ts (validate after Write — step 9)
