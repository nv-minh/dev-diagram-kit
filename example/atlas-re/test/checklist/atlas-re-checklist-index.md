---
type: test-checklist-index
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/srs/atlas-re-spec.md
---

# Atlas Re claim approval — Test Checklist

## Checklist

| ID | What to test | Covers | Layer | Priority | Status | TC |
|---|---|---|---|---|---|---|
| CHK-001 | Approver within tier can approve a claim | AC-001, FR-atlas-re-006 | functional | P0 | approved | TC-001 |
| CHK-002 | Tier boundary at exactly 50,000 USD | AC-002, AC-003, BR-atlas-re-001 | boundary | P0 | approved | TC-002, TC-003, TC-004 |
| CHK-003 | Committee routing above 250,000 USD | AC-004 | functional | P0 | approved | TC-005 |
| CHK-004 | Validator cannot approve their own claim | AC-005, E-atlas-re-001 | error | P0 | approved | TC-006 |
| CHK-005 | Concurrent approval — first commit wins | AC-005, E-atlas-re-004 | error | P0 | approved | TC-007 |
| CHK-006 | Tier pending when FX rate unavailable | AC-006, E-atlas-re-002 | error | P0 | approved | TC-008 |
| CHK-007 | Notification retries on publish failure (decision stands) | FR-atlas-re-008, E-atlas-re-003 | non-functional | P1 | approved | TC-009 |
| CHK-008 | History row recorded on every transition | AC-001 (US-003), FR-atlas-re-002 | functional | P0 | approved | TC-010 |
| CHK-009 | History table denies UPDATE/DELETE | AC-003 (US-003), NFR-atlas-re-002 | non-functional | P0 | approved | TC-011 |

## Coverage summary

| Source | Covered | Total |
|---|---|---|
| FR | 6/8 | FR-atlas-re-004, FR-atlas-re-005, FR-atlas-re-008 partially (queue/validation flows not yet sliced into stories) |
| AC | 9/9 | all (US-001 ×6, US-002 ×2, US-003 ×3 — see story index) |
| E- | 4/4 | E-atlas-re-001, E-atlas-re-002, E-atlas-re-003, E-atlas-re-004 |
| NFR | 2/3 | NFR-atlas-re-001 (perf) not yet testable — needs load env |
