<!--
REFERENCE for /wireframe-ascii — simulated session (atlas-re).
Full artifact: example/atlas-re/ascii-wireframe/approve-claim.md
-->

## Command

```
/wireframe-ascii atlas-re --flow approve-claim
```

**Gate:** reads `srs/atlas-re-userflow.md` — `stage: approved` ✓ · device desktop 1024 ✓

## Skill walks screens [1]…[4]

For each screen: renders ASCII in chat (L3 iterate allowed) → 5-column description table sourced from SRS/UC.

**You (on [3] Decision panel):** Add explicit "Reject" beside "Approve" — both primary actions.

**Skill:** Updated frame — both buttons, Reject routes to same confirmation with decision type.

## L1 plan preview

```
[/wireframe-ascii] Will perform:
  1 | docs/atlas-re/ascii-wireframe/approve-claim.md           | create | screens [1]…[4] + tables
  2 | docs/atlas-re/ascii-wireframe/atlas-re-wireframe-index.md | update | 6 screens, 2 flows

Apply? (Y / edit):
```

## Output excerpt (screen [3] table row)

```markdown
| 4 | Approve button | button | action | • Submits approve decision (FR-atlas-re-006). • Blocked if validator=approver (E-atlas-re-001). |
| 5 | Reject button  | button | action | • Submits reject decision; same validator rule applies. |
```

## Output report

```
✅ ASCII wireframes: approve-claim.md + index | 4 screens | every control cites FR/BR/E-
   doc-validate: OK
Next: /wireframe-html atlas-re (browser view) or /prototype-html (click-through)
```
