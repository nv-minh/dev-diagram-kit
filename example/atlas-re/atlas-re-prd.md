---
type: prd
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/atlas-re-brd.md
---

# Atlas Re claim approval — PRD

## 1. Goals

- Every claim has an explicit, visible workflow state from filing to payment.
- Approvals flow through amount-based authority without manual routing.

## 2. Non-goals

- No changes to claim intake or document upload.
- No cedent-facing visibility in this release.

## 3. User Types

| User type | Description | Main capabilities used |
|---|---|---|
| Claims handler | Works the claim queue daily | CAP-atlas-re-01, CAP-atlas-re-02 |
| Finance analyst | Validates reserves before approval | CAP-atlas-re-03 |
| Approver (manager / committee) | Decides claims within authority | CAP-atlas-re-04 |
| Underwriter | Watches claims on own contracts | CAP-atlas-re-05 |

## 4. Capabilities

| ID | Capability | Priority | Covers | Notes |
|---|---|---|---|---|
| CAP-atlas-re-01 | Handler sees a state-ordered claim queue with "waiting on" per claim | P0 | BO-atlas-re-01 | The daily work surface |
| CAP-atlas-re-02 | Every workflow transition records actor + timestamp, viewable as a history | P0 | BO-atlas-re-01, BO-atlas-re-02 | The audit trail |
| CAP-atlas-re-03 | Finance validates reserve adequacy from a prioritized request queue | P0 | BO-atlas-re-03 | Reads reserve data in place |
| CAP-atlas-re-04 | Approval routes by authority tier (handler / manager / committee) | P0 | BO-atlas-re-03 | Tiers per BRD rule 1 |
| CAP-atlas-re-05 | Underwriter notified same-day for claims over the large-claim threshold | P1 | BO-atlas-re-04 | Via Service Bus → email |
| CAP-atlas-re-06 | Auditor exports the full approval trail for a period | P2 | BO-atlas-re-02 | CSV is enough |

## 5. Out of scope

- Fraud scoring, delegated-authority self-service management.

## 6. Release plan

| Phase | Capabilities | Target |
|---|---|---|
| R1 | CAP-atlas-re-01, CAP-atlas-re-02, CAP-atlas-re-03, CAP-atlas-re-04 | first quarter |
| R2 | CAP-atlas-re-05, CAP-atlas-re-06 | fast follow |

## 7. Dependencies

- Reserve data model (exists) · Service Bus notification infra (exists).

## Open Questions

- [ ] OQ-1 (inherited from BRD): Does the approval committee need a quorum rule, or any two members?
