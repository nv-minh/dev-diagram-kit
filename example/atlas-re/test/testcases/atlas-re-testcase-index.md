---
type: test-cases-index
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/test/checklist/atlas-re-checklist-index.md
---

# Atlas Re claim approval — Test Cases

## Test cases

| ID | Title | Expands CHK | Steps | Test data | Expected | Status |
|---|---|---|---|---|---|---|
| TC-001 | Approve a 40k claim in handler tier | CHK-001 | 1. Open queue 2. Open CLM (40k) 3. Approve | amount=40,000; approver tier=handler | Claim APPROVED; history row recorded; handler notified | approved |
| TC-002 | Boundary — exactly 50,000 routes to handler | CHK-002 | 1. Submit VALIDATED claim 2. Observe routing | amount=50,000.00 | Lands in handler-tier queue (≤ 50k) | approved |
| TC-003 | Boundary — 50,000.01 routes to manager | CHK-002 | 1. Submit VALIDATED claim 2. Observe routing | amount=50,000.01 | Lands in manager-tier queue | approved |
| TC-004 | Boundary — 50,000 USD at filing-date FX | CHK-002 | 1. File claim in EUR 2. Submit for routing | amount=45,850 EUR; filing-date rate=0.917 → 50,000 USD | Routes by the USD-converted value (handler tier) | approved |
| TC-005 | 300k routes to committee | CHK-003 | 1. Submit VALIDATED claim 2. Observe routing | amount=300,000 | Lands in committee queue | approved |
| TC-006 | Validator is blocked from approving | CHK-004 | 1. Validate claim as analyst A 2. Log in as A 3. Submit approve | validator=approver (same user) | Decision blocked; message names the validator (E-atlas-re-001) | approved |
| TC-007 | Concurrent approve — second loses | CHK-005 | 1. Two approvers open the same claim 2. Both approve near-simultaneously | two sessions, same claim | First commit wins; second sees "already decided by {actor} at {time}" (E-atlas-re-004) | approved |
| TC-008 | No FX rate → tier pending | CHK-006 | 1. File claim on a date with no FX row 2. Submit for routing | filing-date FX missing | Claim flagged "tier pending"; not routed (E-atlas-re-002) | approved |
| TC-009 | Notification fail — decision still stands | CHK-007 | 1. Disable Service Bus 2. Approve a claim 3. Observe | notification publish fails | Approval commits; event queued for retry; ops alert after 3 failures (E-atlas-re-003) | approved |
| TC-010 | Transition writes a history row | CHK-008 | 1. Move a claim FILED→VALIDATED | analyst=A; prior=FILED | History row: analyst A, timestamp, prior FILED | approved |
| TC-011 | History table rejects UPDATE | CHK-009 | 1. As app role, attempt UPDATE on history row | any existing history row | Operation denied (NFR-atlas-re-002) | approved |

## Expansion map

| CHK | TC |
|---|---|
| CHK-001 | TC-001 |
| CHK-002 | TC-002, TC-003, TC-004 |
| CHK-003 | TC-005 |
| CHK-004 | TC-006 |
| CHK-005 | TC-007 |
| CHK-006 | TC-008 |
| CHK-007 | TC-009 |
| CHK-008 | TC-010 |
| CHK-009 | TC-011 |
