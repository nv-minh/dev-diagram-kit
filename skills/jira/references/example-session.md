<!--
REFERENCE for /jira — simulated session (external-write, dry-run).
Uses atlas-re user stories US-001…003.
-->

## Command

```
/jira atlas-re --push --dry-run
```

**Gate:** story index present · no `status: stale` stories ✓

## L1 hard gate preview

```
[/jira] EXTERNAL WRITE — would create/update Jira issues:

  Project: ATLAS | Epic: ATLAS-12 (claim approval)

  | Story | Summary | FR links | Action |
  | US-001 | Approver decides within tier | FR-006, FR-007 | CREATE ATLAS-??? |
  | US-002 | Handler sees claim queue | FR-001 | CREATE |
  | US-003 | History on every transition | FR-002, FR-003 | CREATE |

--dry-run: no issues written. Re-run without --dry-run + Y to push.
```

**You (live push):** `/jira atlas-re --push` → `Y`

## Output report

```
✅ Jira: ATLAS-201…203 created | story-index jira-key column updated | sync-state.yaml mappings.jira written
```
