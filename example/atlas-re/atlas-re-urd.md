---
type: urd
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/brainstorms/claim-approval-idea.md
---

# Atlas Re claim approval — User Requirements Document

## 1. Personas

| Persona | Role / context | Goals | Frustrations today |
|---|---|---|---|
| Claims handler | Processes 30–50 claims/month across cedents | Move each claim to a decision quickly | State lives in a personal spreadsheet; sign-offs chased by email |
| Finance analyst | Validates reserve adequacy before approval | Work a prioritized queue | Requests arrive ad hoc with missing context |
| Underwriter | Owns the contracts claims land on | Early warning when a contract deteriorates | Learns of large claims weeks late |
| Head of Claims | Accountable for approval decisions | Approve within authority, delegate the rest | Signs everything personally — a bottleneck |

## 2. Context of use

Office web app, daily use. Claims handlers live in the queue view; Finance dips in twice a day; underwriters only arrive from a notification. Peak load after catastrophe events (many claims filed in days).

## 3. User needs

| ID | Persona | Need statement | Priority | Source |
|---|---|---|---|---|
| UN-atlas-re-001 | Claims handler | See every claim's current state and history in one place | P0 | brainstorm §2 |
| UN-atlas-re-002 | Claims handler | Know whose action a claim is waiting on | P0 | interview |
| UN-atlas-re-003 | Finance analyst | Receive validation requests as a prioritized queue with the claim's context attached | P0 | brainstorm §2 |
| UN-atlas-re-004 | Underwriter | Be notified the day a large claim is filed on my contract | P1 | brainstorm §4 |
| UN-atlas-re-005 | Head of Claims | Have claims below my authority threshold decided without me | P0 | brainstorm §5 |
| UN-atlas-re-006 | Auditor (secondary) | Reconstruct who decided what, when, from the system alone | P1 | brainstorm §1 |

## 4. User environment & constraints

- Web (desktop) only; no mobile requirement from any persona.
- Finance works against the same PostgreSQL reserve data — no export/import steps acceptable.

## 5. Assumptions

- Claim filing itself (intake) already exists on the platform; this feature starts at the workflow after filing.

## Open Questions

- [ ] OQ-1 (inherited from brainstorm OQ-2): Does the approval committee need a quorum rule, or any two members?
