<!--
REFERENCE for /brainstorm — simulated session (atlas-re).
Full artifact: example/atlas-re/brainstorms/claim-approval-idea.md
-->

## Command

```
/brainstorm "claims on bound contracts are approved over email today — nothing is traceable" --feature atlas-re
```

## Round 1 — the frame

**Skill asks:**

1. What problem or opportunity does this idea address?
2. Who is affected today, and how do they work around it?
3. What would success look like if this worked?

**You answer:**

1. Claim approvals run over email; nobody can answer "where is claim X stuck?" without asking around.
2. Claims handlers use personal spreadsheets; Finance gets ad-hoc validation requests; the Head of Claims signs everything.
3. Any claim's state and history answerable in one click; audit prep drops from weeks to hours.

## Round 2 — exploration

**Skill offers:** what-if at 10× volume · persona role-play · constraint removal.

**You pick:** what-if at 10× volume.

**You answer:** The single-approver bottleneck breaks first — need amount-based authority tiers (handler ≤ 50k, manager ≤ 250k, committee above).

## L1 plan preview

```
[/brainstorm] Will perform:
  # | path                                              | action | summary
  1 | docs/atlas-re/brainstorms/claim-approval-idea.md  | create | problem, users, sketch, 2 decisions, 2 OQs

New feature `atlas-re` will be created.
Apply? (Y / edit):
```

**You:** `Y`

## Output excerpt

```markdown
## 1. Problem / opportunity

When a cedent files a claim against a bound contract, the claims handler collects documents by email…

## 6. Key decisions so far

| # | Decision | Rationale | Decided |
|---|---|---|---|
| 1 | Approval authority tiers by claim amount | Removes the single-approver bottleneck | 2026-08-01 |

## Open Questions

- [x] OQ-1: Which currencies do authority tiers apply in? → tiers are defined in USD…
- [ ] OQ-2: Does the approval committee need a quorum rule, or any two members?
```

## Output report

```
✅ Brainstorm written: docs/atlas-re/brainstorms/claim-approval-idea.md
   Sections: 7 | Decisions: 2 | Open Questions: 2
   doc-validate: OK

Next in the discovery chain: /urd atlas-re
```
