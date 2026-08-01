<!--
REFERENCE for /meeting — simulated session (atlas-re).
Full artifact: example/atlas-re/meetings/2026-08-01-review-authority-threshold.md
-->

## Command

```
/meeting "Q2 review — handler threshold 50k vs 60k" --feature atlas-re
```

## Interview

**Skill asks:** attendees · agenda items · what was decided · blockers · action items with owners/dates?

**You answer:** Head of Claims, Finance lead, Senior underwriter, BA · (1) manager-tier bottleneck (2) propose 60k ceiling · Decision: raise handler ceiling to 60k; backfill boundary tests before cutover · Blocker: committee quorum OQ still open · Action: record CR by 2026-08-02.

## L1 plan preview

```
[/meeting] Will perform:
  1 | docs/atlas-re/meetings/2026-08-01-review-authority-threshold.md | create | decisions link FR-atlas-re-006

Apply? (Y / edit):
```

## Output excerpt

```markdown
| 1 | Raise handler ceiling 50k → 60k USD | removes manager bottleneck | FR-atlas-re-006, BR-atlas-re-001 |
| 1 | Record threshold change as CR | … | open → `/cr "raise handler ceiling to 60k"` |
```

## Output report

```
✅ Meeting note written | Decisions: 2 | Actions: 2 | Affects column links real IDs
   doc-validate: OK
```
