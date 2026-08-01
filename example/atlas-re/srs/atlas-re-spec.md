---
type: srs
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/atlas-re-prd.md
---

# Atlas Re claim approval — SRS

## 1. Overview

Approval workflow for claims on bound contracts: FILED → VALIDATED → APPROVED/REJECTED → PAID, with Finance validation, authority-tier routing, full transition history, and large-claim notifications. State machine detail: [[docs/atlas-re/srs/atlas-re-states.md|states]]; flows: [[docs/atlas-re/srs/atlas-re-flows.md|flows]].

### Actors

| Actor | Type | Description |
|---|---|---|
| Claims handler | primary | Works the queue, requests validation, decides tier-1 claims |
| Finance analyst | primary | Validates reserve adequacy |
| Approver | primary | Manager (tier 2) or committee (tier 3) |
| Underwriter | secondary | Receives large-claim notifications |
| Notification service | system | Fans out events via Service Bus |

## 2. Functional Requirements

| ID | Requirement | Covers | Priority | Source |
|---|---|---|---|---|
| FR-atlas-re-001 | The system shall show each handler a queue of claims ordered by state age, with the waiting-on actor per claim, when the handler opens the claims workspace | CAP-atlas-re-01 | P0 | PRD |
| FR-atlas-re-002 | The system shall record actor, timestamp, and prior state for every workflow transition when the transition commits | CAP-atlas-re-02 | P0 | PRD |
| FR-atlas-re-003 | The system shall present the full transition history of a claim when a user opens the claim detail | CAP-atlas-re-02 | P0 | PRD |
| FR-atlas-re-004 | The system shall create a validation request in the Finance queue, ordered by claim amount descending, when a handler submits a FILED claim for validation | CAP-atlas-re-03 | P0 | PRD |
| FR-atlas-re-005 | The system shall move the claim to VALIDATED and unlock approval when the Finance analyst confirms reserve adequacy | CAP-atlas-re-03 | P0 | PRD |
| FR-atlas-re-006 | The system shall route the approval task to the tier derived from the claim amount in USD at filing-date rate (≤50k handler, ≤250k manager, above committee) when a claim reaches VALIDATED | CAP-atlas-re-04 | P0 | BRD rule 1 |
| FR-atlas-re-007 | The system shall reject an approval attempt by the same user who validated the claim, when that user submits an approve/reject decision | CAP-atlas-re-04 | P0 | BRD rule 3 |
| FR-atlas-re-008 | The system shall publish a large-claim event to the notification service within the same business day when a claim over the threshold is filed | CAP-atlas-re-05 | P1 | PRD |

## 3. Non-Functional Requirements

| ID | Category | Requirement | Measure |
|---|---|---|---|
| NFR-atlas-re-001 | performance | Queue view loads under peak post-catastrophe volume | p95 < 2s at 5,000 open claims |
| NFR-atlas-re-002 | security | Transition history is append-only at the database layer | no UPDATE/DELETE grants on the history table |
| NFR-atlas-re-003 | availability | Approval actions survive notification-service outage | approvals commit even when Service Bus is down |

## 4. Business Rules

| ID | Rule | Applies to | Source |
|---|---|---|---|
| BR-atlas-re-001 | Authority tiers are defined in USD converted at the filing-date rate | FR-atlas-re-006 | BRD rule 1 |
| BR-atlas-re-002 | A claim may not be approved before Finance validation | FR-atlas-re-005, FR-atlas-re-006 | BRD rule 2 |
| BR-atlas-re-003 | Validator and approver must be different users | FR-atlas-re-007 | BRD rule 3 |

## 5. Error Matrix

| ID | Condition | System behavior | User sees | Related FR |
|---|---|---|---|---|
| E-atlas-re-001 | Approval submitted by the claim's validator | Transition blocked, no state change | "Validator and approver must differ" with the validator's name | FR-atlas-re-007 |
| E-atlas-re-002 | FX rate for the filing date unavailable | Tier routing deferred, claim flagged in the queue | "Awaiting FX rate — tier pending" badge | FR-atlas-re-006 |
| E-atlas-re-003 | Notification publish fails | Approval commits; event queued for retry with backoff | none (handler unaffected); ops alert after 3 failed retries | FR-atlas-re-008 |
| E-atlas-re-004 | Two approvers decide the same claim concurrently | First commit wins; second gets a conflict | "Claim already decided by {actor} at {time}" | FR-atlas-re-006 |

## 6. Data notes

Claim already carries `status` (see [[docs/atlas-re/srs/atlas-re-erd.md|ERD]]); this feature adds the transition-history table and the validation-request queue.

## Diagrams

> Flows: `srs/atlas-re-flows.md` · States: `srs/atlas-re-states.md` · ERD: `srs/atlas-re-erd.md`.

## Open Questions

- [ ] OQ-1 (inherited from PRD): Does the approval committee need a quorum rule, or any two members? (Blocks the committee-tier detail of FR-atlas-re-006.)
