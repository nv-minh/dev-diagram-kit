---
type: skill-explainer
skill: testing-family
updated: 2026-08-01
---

# The testing family — /test-checklist /test-cases

**English** · [Tiếng Việt](testing-family.vi.md)

## 1. Why this family exists

The SRS and the stories say *what* the system must do; the AC says *when a story passes*. These two skills turn that into a testable outline and then into full cases a QA can execute — the tail of the traceability spine (`… → AC → CHK → TC`), the part `/gap` uses to prove nothing slipped through.

## 2. Quick pick

| You need to… | Run | It mints |
|---|---|---|
| A categorized coverage outline (what to test) | `/test-checklist <feature>` | `CHK-{NNN}` |
| Full cases (steps / data / expected) | `/test-cases <feature>` | `TC-{NNN}` |

`/test-cases` **refuses without a checklist** — that refusal is the canonical group-B example. Expanding nothing into steps would fabricate tests and produce uneven coverage.

## 3. How they connect — a diagram

```
   srs/{f}-spec.md (FR / BR / E)  +  us-*.md (AC)
        │
        ▼
   /test-checklist ──▶ test/checklist/{f}-checklist-index.md  (CHK- rows, TC column empty)
        │  one CHK per testable thing, layered functional/boundary/error/NFR
        ▼
   /test-cases ──▶ test/testcases/{f}-testcase-index.md  (TC- rows, Expands CHK back-pointer)
        │  boundary CHK → at/below/above triple · error CHK → one TC per E-
        ▼
   /gap joins AC→CHK→TC to prove coverage (no AC untested, no E- unexercised)
```

## 4. The two-layer discipline

- **`/test-checklist` writes the WHAT** — a one-line "test the 50k tier boundary", classified by layer, `Covers` citing the AC/FR/E. No steps. The value is the *categorized* outline.
- **`/test-cases` writes the HOW** — numbered steps (one action each), concrete test data (sourced from the spec, never invented), the expected observable outcome + exact error wording. The boundary row above expands to three TC- (at/below/above).

## 5. What "refuses without a checklist" buys you

It forces the outline-before-cases order. Generating cases straight from FRs skips the layering step and routinely misses boundaries and error codes — the checklist surfaces them as `CHK-` rows first, so the cases expand a *complete* outline.

## 6. Worked example

`example/atlas-re/test/` carries both indexes: the checklist derives `CHK-` rows from the spec's FR/E + US-001's boundary ACs; the test cases expand them (the 50k boundary → at/below/above `TC-` triples, the validator-conflict error → a `TC-` citing `E-atlas-re-001`).

## See also

- `explain-skills/traceability-family.md` — `/gap` that proves AC→CHK→TC coverage
- `rules/test-conventions.md` — the CHK/TC anatomy + expansion rules
- `rules/doc-selection.md` — the full matrix + wave status
