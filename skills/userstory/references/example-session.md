<!--
REFERENCE for /userstory — simulated session (atlas-re).
Full artifact: example/atlas-re/userstories/us-001.md + story index
-->

## Command

```
/userstory atlas-re --from FR-atlas-re-006
```

**Gate:** refuses without `srs/atlas-re-spec.md` ✓

## Skill proposes slices

**Skill:** From FR-atlas-re-006/007 I see three slices — (1) tier routing + boundary, (2) queue surface, (3) history audit. Proceed with all three?

**You:** Yes.

## L1 plan preview

```
[/userstory] Will perform:
  1 | docs/atlas-re/userstories/us-001.md              | create | tier routing slice
  2 | docs/atlas-re/userstories/us-002.md              | create | queue slice
  3 | docs/atlas-re/userstories/us-003.md              | create | history slice
  4 | docs/atlas-re/userstories/atlas-re-story-index.md | update | coverage map

Apply? (Y / edit):
```

## Output excerpt (us-001)

```markdown
**As an** approver, **I want** validated claims routed to me only when the amount is within my authority,
**so that** small claims stop waiting on the Head of Claims.

## Linked Requirements
FR-atlas-re-006 · FR-atlas-re-007 · BR-atlas-re-001 · BR-atlas-re-003
```

## Output report

```
✅ Stories: US-001…003 + index | FR-atlas-re-006 covered | doc-validate: OK
Next: /ac atlas-re (Given-When-Then inside each story)
```
