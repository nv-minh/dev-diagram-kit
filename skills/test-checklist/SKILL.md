---
name: test-checklist
description: Use when you need a test-coverage outline — a checklist derived from the FRs, business rules, error codes, and acceptance criteria, with CHK- IDs that the test cases expand. Trigger with `/test-checklist <feature>`. Needs the SRS (refuses without it). Differs from `/test-cases` (expands the checklist into full steps/data/expected) and `/api-checklist` (integration-only, wave 5).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /test-checklist — Test coverage outline

## Goal

Derive the test-coverage outline from `srs/{feature}-spec.md` (FR/BR/E), the stories' acceptance criteria (`AC-`), and the use cases' extensions — one `CHK-{NNN}` row per testable thing, classified by layer. **Single output**: `docs/{feature}/test/checklist/{feature}-checklist-index.md` (type `test-checklist-index`).

## Constraints

- **Group B\*** (`feature-bootstrap.md`): `srs/{feature}-spec.md` missing → refuse + route `/srs`. AC files missing → soft warn (the checklist can derive from FRs/E-, but coverage of AC is the stronger path).
- **Mint `CHK-{NNN}`** (`test-conventions.md`) — 3-digit, path-scoped, max+1, never reused.
- **Every row covers something** — `Covers` cites the AC/FR/BR/E it verifies; a row with no source is a fabrication → drop it or send back to `/srs`.
- **Layer classification** — functional / boundary / error / non-functional (the value of the checklist is the *categorized* outline, not a flat list).
- **Boundary awareness** — a BR threshold (e.g. ≤ 50k) → one boundary `CHK-` that `/test-cases` will expand to the at/below/above triple.
- **Error coverage** — every `E-` code → at least one `CHK-` (error layer).
- **The `TC` column starts empty** — `/test-cases` fills it; this skill owns the outline, not the steps.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run → L2 diff (new FRs/E-/ACs append new CHK-).
- **Template** — `@../../templates/doc-test-checklist-index.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/test-checklist <feature>          # derive from spec + AC + UC extensions
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Specs (required source): !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`
Existing checklists: !`ls docs/*/test/checklist/*-checklist-index.md 2>/dev/null | head -10`
Acceptance criteria: !`ls docs/*/userstories/us-*.md 2>/dev/null | head -10`

## Approach

1. **Gate.** Spec missing → refuse + route `/srs`. Read the spec (FR/BR/E rows), the story ACs, and the UC extensions (failure branches → error-layer checks).
2. **Derive candidates** — per FR: the happy-path check + any boundary (BR threshold) + any error (E- code); per AC: a check verifying it; per NFR: a non-functional check where measurable.
3. **Fact-list** — every candidate + its source (FR/BR/E/AC) + its layer.
4. **Assign `CHK-` IDs** — scan the existing checklist for max; classify each row's layer.
5. **Draft** the checklist per the template — rows grouped by layer, `Covers` filled, `TC` empty, `Status: draft`.
6. **L1 plan preview** — row count by layer + coverage map (which FRs/ACs/E- are covered, which aren't).
7. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/test-checklist` + note + author before Write.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/test/checklist/{feature}-checklist-index.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — layer breakdown + uncovered FR/E/AC (so the user knows the outline's edges) + next (`/test-cases`).

## L1 plan preview

> I'll write the test checklist for **{feature}** to `test/checklist/{feature}-checklist-index.md`: **{N} rows** (functional {f} · boundary {b} · error {e} · non-functional {n}).
> Coverage: FR {cf}/{tf} · AC {ca}/{ta} · E- {ce}/{te}. Uncovered: {list | none}.
> Logged: activity log "test checklist {N} rows".
> Apply? (Y / edit)

## Output report

```
✅ Test checklist written: test/checklist/{feature}-checklist-index.md
   Rows: {N} (functional {f} · boundary {b} · error {e} · non-functional {n})
   Coverage: FR {cf}/{tf} · AC {ca}/{ta} · E- {ce}/{te} | doc-validate: OK

Next: /test-cases {feature} — expand each CHK- into steps/data/expected.
```

## Gotchas

- **Don't write steps here** — steps/data/expected are `/test-cases`' job; a checklist row is a one-line "what to test", not a procedure.
- **Boundary = one row, not three** — the at/below/above split happens at the case level; the checklist just flags "test the 50k boundary".
- **E- coverage is mandatory** — an error code with no CHK- is a documented error nobody tests; surface it in the report.
- **AC is the richest source** — if stories have ACs, derive from them first (they're already Given-When-Then); FRs are the fallback.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/test-conventions.md
- @../../rules/language.md
- @../../templates/doc-test-checklist-index.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
