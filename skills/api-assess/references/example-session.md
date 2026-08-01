<!--
REFERENCE for remaining API chain steps — simulated session (atlas-re CatModel).
-->

## /api-assess

**Command:** `/api-assess atlas-re "catastrophe loss estimate provider"`

**When:** provider not fixed. Skippable when CatModel already chosen → go to `/api-doc`.

**Output excerpt:**

```markdown
| Candidate | Coverage | Latency SLA | Cost | Weighted score |
| CatModel | 9/10 | 8/10 (basis: public SLA doc) | 7/10 | **8.1** ← recommended |
| RiskCast | 7/10 | … | … | 6.4 |
```

---

## /api-checklist

**Command:** `/api-checklist atlas-re`

**Output:** `test/api/api-checklist.md` — CHK rows with `test_layer: own|3rd|mixed`, `direction: out|in`.

```markdown
| CHK-API-001 | POST /quote returns 202 + job_id | mixed | out | P0 |
| CHK-API-002 | quote.completed webhook parsed | 3rd | in | P0 |
| CHK-API-003 | reconciliation poll catches missed webhook | own | out | P0 |
```

---

## /api-test

**Command:** `/api-test atlas-re`

**Gate:** checklist present · **sandbox only**.

**Output:** `bruno/catmodel/` collection + `test/api/api-tests.md` table mapping TC ↔ CHK ↔ `.bru` file.

---

## /api-readiness

**Command:** `/api-readiness atlas-re`

**Gate:** hard-refuses GO if api-test results absent.

**Output excerpt:**

```markdown
| Gate | Status | Evidence |
| api-test sandbox pass | ready | api-tests.md §results 2026-08-01 |
| kill switch configured | ready | api-design.md §flags |
| production URL (OQ-1) | blocked | needs provider confirmation |
```

**Verdict:** NO-GO until OQ-1 resolved · partial go-live to sandbox documented.
