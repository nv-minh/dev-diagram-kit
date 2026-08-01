<!--
REFERENCE for /prd-epic — simulated session (atlas-re).
Full artifact: example/atlas-re/atlas-re-prd.md
-->

## Command

```
/prd-epic atlas-re
```

## Interview

**Skill asks:**

1. What must be true at launch for this feature to be worth shipping (P0 probe)?
2. Nice-to-haves (P1/P2) and explicit non-goals?
3. Any sequencing constraints between capabilities?

**You answer:**

1. P0: handler queue with waiting-on; full transition history; Finance validation queue; tier routing; validator≠approver rule.
2. P1: same-day large-claim notify to underwriter. P2: auditor CSV export. Non-goals: change intake, cedent portal, fraud scoring.
3. History + validation must land before tier routing (routing assumes VALIDATED state).

## L1 plan preview

```
[/prd-epic] Will perform:
  1 | docs/atlas-re/atlas-re-prd.md | create | 6 CAP- rows, each covers ≥1 BO-

Apply? (Y / edit):
```

**You:** `Y`

## Output excerpt

```markdown
| ID | Capability | Priority | Covers | Notes |
|---|---|---|---|---|
| CAP-atlas-re-04 | Approval routes by authority tier (handler / manager / committee) | P0 | BO-atlas-re-03 | Tiers per BRD rule 1 |
| CAP-atlas-re-05 | Underwriter notified same-day for large claims | P1 | BO-atlas-re-04 | Via Service Bus → email |
```

## Output report

```
✅ PRD written: docs/atlas-re/atlas-re-prd.md
   Capabilities: CAP-atlas-re-01…06 | BO coverage: 4/4
   doc-validate: OK

Next: /srs atlas-re
```
