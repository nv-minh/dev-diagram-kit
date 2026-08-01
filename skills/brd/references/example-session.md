<!--
REFERENCE for /brd — simulated session (atlas-re).
Full artifact: example/atlas-re/atlas-re-brd.md
-->

## Command

```
/brd atlas-re
```

**Skill reads:** URD + brainstorm (BO rows must cover UN- IDs).

## Interview

**Skill asks:**

1. Why now — what breaks if we wait another quarter?
2. Objectives + how each is measured (no number without a basis)?
3. In/out of scope, dependencies, top risks?

**You answer:**

1. Q2 audit found 40% of sampled claims had no reconstructable approval trail in email alone.
2. Traceability (100% claims answerable in system); audit prep (<1 day vs ~2 weeks); median FILED→decision for ≤50k claims (≤3 days vs 12 today); large-claim notification same business day.
3. In: workflow FILED→PAID, Finance validation, authority tiers, underwriter notify. Out: intake, fraud, cedent portal. Depends on Postgres reserves + Service Bus.

## L1 plan preview

```
[/brd] Will perform:
  1 | docs/atlas-re/atlas-re-brd.md | create | 4 BO- objectives covering all UN-, 3 business rules

Apply? (Y / edit):
```

**You:** `Y`

## Output excerpt

```markdown
| ID | Objective | Success measure | Target | Covers needs |
|---|---|---|---|---|
| BO-atlas-re-03 | Remove the single-approver bottleneck | Median FILED→decision for claims ≤ 50k USD | From 12 days to ≤3 days | UN-atlas-re-005 |
```

## Output report

```
✅ BRD written: docs/atlas-re/atlas-re-brd.md
   Objectives: BO-atlas-re-01…04 | UN coverage: 6/6
   doc-validate: OK

Next: /prd-epic atlas-re
```
