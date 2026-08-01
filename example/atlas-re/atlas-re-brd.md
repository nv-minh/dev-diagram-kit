---
type: brd
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/atlas-re-urd.md
---

# Atlas Re claim approval — Business Requirements Document

## 1. Executive Summary

Claim approvals run over email today: state is untraceable, audits take weeks, and one approver signs everything. Moving the approval workflow onto the platform gives every claim an explicit, auditable state and unblocks approvals through amount-based authority tiers.

## 2. Business Objectives & Success Measures

| ID | Objective | Success measure | Target | Covers needs |
|---|---|---|---|---|
| BO-atlas-re-01 | Make claim state traceable end to end | "Where is claim X?" answerable from the system | 100% of claims filed after go-live | UN-atlas-re-001, UN-atlas-re-002 |
| BO-atlas-re-02 | Cut audit preparation effort for claims | Time to produce an approval trail for one audit | From ~2 weeks to <1 day | UN-atlas-re-006 |
| BO-atlas-re-03 | Remove the single-approver bottleneck | Median FILED→decision time for claims ≤ 50k USD | From 12 days to ≤3 days | UN-atlas-re-005 |
| BO-atlas-re-04 | Give underwriters early warning on large claims | Large-claim notification lag after filing | Same business day | UN-atlas-re-004 |

## 3. Business Scope

### In scope

- Approval workflow from FILED to PAID/REJECTED, including Finance validation and authority tiers.
- Notifications to underwriters for claims over the large-claim threshold.

### Out of scope

- Claim intake (exists), fraud scoring, cedent-facing portal.

### Dependencies

- Reserve data in PostgreSQL (Finance validation reads it directly).
- Azure Service Bus for notification fan-out (existing platform infrastructure).

## 4. Business Rules

| # | Rule | Origin |
|---|---|---|
| 1 | Approval authority is tiered by claim amount in USD at filing-date rate: handler ≤ 50k, manager ≤ 250k, committee above | brainstorm decision 1 + OQ-1 resolution |
| 2 | A claim cannot be approved before Finance has validated reserve adequacy | Finance policy |
| 3 | The approver must not be the handler who validated the same claim | audit requirement |

## 5. Cost-Benefit

| Item | Type | Estimate | Basis |
|---|---|---|---|
| Workflow + queue + notifications build | cost | 1 team-quarter | sizing against the bind-workflow build (same shape, shipped last year) |
| Audit prep effort saved | benefit | ~9 analyst-days per audit, 4 audits/year | BO-atlas-re-02 target vs current 2-week discovery |
| Faster small-claim settlement | benefit | not quantified | file as OQ if a monetary target is required |

## 6. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Committee tier becomes the new bottleneck for catastrophe events | medium | high | Queue SLA alert + temporary delegated authority procedure |
| 2 | Handlers keep using spreadsheets in parallel | medium | medium | Make the queue the only source of the daily work list |

## Open Questions

- [ ] OQ-1 (inherited from URD): Does the approval committee need a quorum rule, or any two members?
- [ ] OQ-2: Is a monetary target required for the faster-settlement benefit (Section 5)?
