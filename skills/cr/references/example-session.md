<!--
REFERENCE for /cr — simulated session (atlas-re).
Full artifact: example/atlas-re/cr/CR-20260801-001.md
Origin: meetings/2026-08-01-review-authority-threshold.md decision #1
-->

## Step 1 — record

**Command:**

```
/cr "raise handler authority ceiling from 50k to 60k USD for atlas-re"
```

**Skill reads:** meeting decision + current SRS/story/test IDs citing 50k.

**L1 (record only — no doc edits yet):**

```
[/cr] Will perform:
  1 | docs/cr/CR-20260801-001.md | create | Impact Matrix + Apply order + Rollback

Apply? (Y / edit):
```

**Output excerpt:**

```markdown
## 2. Impact Matrix

| BR-atlas-re-001 | srs/atlas-re-spec.md | modify | ceiling ≤ 50k → ≤ 60k | high |
| AC-002, AC-003 | userstories/us-001.md | modify | boundary 50k → 60k | high |
```

---

## Step 2 — apply

**Command:** `/cr --apply CR-20260801-001`

**Skill:** dependency order 1→4, L2 diff per file, `@change-tracker` ordering.

**You:** approve each diff.

**Output report:**

```
✅ CR-20260801-001 applied — 4 files updated in order | Rollback plan unchanged
   Re-run /gap to confirm spine after apply
```
