<!--
REFERENCE for /test-checklist + /test-cases — simulated session (atlas-re).
Full artifacts: example/atlas-re/test/checklist/ + testcases/
-->

## /test-checklist

**Command:** `/test-checklist atlas-re`

**Skill:** Derives CHK- rows from FR/E/NFR + story ACs — functional, boundary (50k triple), error (one per E-), NFR where testable.

**L1:** create `test/checklist/atlas-re-checklist-index.md` — 9 CHK- rows.

**Output excerpt:**

```markdown
| CHK-002 | Tier boundary at exactly 50,000 USD | AC-002, AC-003, BR-atlas-re-001 | boundary | P0 | approved | (empty — filled by /test-cases) |
```

---

## /test-cases

**Command:** `/test-cases atlas-re --chk CHK-002`

**Skill:** Expands CHK-002 → TC-002 (at 50k), TC-003 (below 49,999), TC-004 (above 50,001). Back-fills checklist TC column.

**Output excerpt:**

```markdown
| TC-002 | CHK-002 | Validated claim at exactly 50,000 USD routes to handler tier | 50,000 USD claim in VALIDATED | Queue shows handler tier |
| TC-003 | CHK-002 | Just below boundary | 49,999 USD | handler tier |
| TC-004 | CHK-002 | Just above boundary | 50,001 USD | manager tier |
```

**Output report:**

```
✅ Test cases: 11 TC- rows | checklist TC column back-filled | doc-validate: OK
```
