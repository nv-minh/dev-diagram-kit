<!--
REFERENCE for /test-cases — simulated session (atlas-re).
See also: test-checklist/references/example-session.md for the checklist step.
Full artifact: example/atlas-re/test/testcases/atlas-re-testcase-index.md
-->

## Command

```
/test-cases atlas-re
```

**Gate:** refuses without checklist ✓

## Skill

Reads `atlas-re-checklist-index.md` — expands every CHK- with empty TC column. Boundary CHK-002 → at/below/above triple. Each E- → dedicated TC.

## L1 plan preview

```
[/test-cases] Will perform:
  1 | docs/atlas-re/test/testcases/atlas-re-testcase-index.md | create | 11 TC- rows
  2 | docs/atlas-re/test/checklist/atlas-re-checklist-index.md | update | back-fill TC column

Apply? (Y / edit):
```

## Output excerpt

```markdown
| TC-006 | CHK-004 | Validator attempts approve on own validation | approver = validator user | Blocked, message names validator (E-atlas-re-001) |
| TC-007 | CHK-005 | Concurrent approve | two sessions, same claim | First commit wins; second sees E-atlas-re-004 |
```

## Output report

```
✅ Test cases: 11 TC- | checklist TC column filled | doc-validate: OK
```
