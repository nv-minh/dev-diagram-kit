<!--
REFERENCE for /prd + /roadmap — product-level singletons (illustrative).
Not in atlas-re example — shows typical session shape.
-->

## /prd — product PRD

**Command:** `/prd`

**Skill asks:** product pitch · problem · primary users · 3–5 themes · Feature Map slugs?

**You:** "Atlas Re — underwriting platform for reinsurance cedents" · themes: claim workflow, pricing integration, audit/compliance · features: `claim-approval`, `cat-pricing`, `contract-bind`.

**L1:**

```
[/prd] Will perform:
  1 | docs/_product/prd.md | create | Feature Map with 3 slugs

Apply? (Y / edit):
```

**Output excerpt:**

```markdown
| Feature slug | One-line intent | Theme |
|---|---|---|
| claim-approval | Workflow + authority tiers for claim decisions | Operations |
| cat-pricing | CatModel integration for loss estimates | Pricing |
```

---

## /roadmap

**Command:** `/roadmap --format now-next-later`

**Skill reads:** `docs/_product/prd.md` Feature Map · scores RICE-lite with stated basis.

**Output excerpt:**

```markdown
## Now
- claim-approval — P0 ops bottleneck, no workaround in email

## Next
- cat-pricing — depends on claim-approval queue for handoff testing
```

**Output report:**

```
✅ Roadmap written: docs/_product/roadmap.md | scores cite basis | doc-validate: OK
Visual milestones for stakeholders → /timeline
```
