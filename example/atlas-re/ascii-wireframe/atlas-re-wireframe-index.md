---
type: screen-index
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/srs/atlas-re-userflow.md
---

# Atlas Re claim approval — Screens Index

## Screens

| # | Slug | Name | Owning flow | Status | Figma | HTML | HTML prototype | Updated |
|---|---|---|---|---|---|---|---|---|
| [1] | claim-queue | Claim queue | approve-claim | approved | — | — | — | 2026-08-01 |
| [2] | claim-detail | Claim detail | approve-claim | approved | — | — | — | 2026-08-01 |
| [3] | decision-panel | Decision panel | approve-claim | approved | — | — | — | 2026-08-01 |
| [4] | confirmation | Confirmation | approve-claim | approved | — | — | — | 2026-08-01 |
| [5] | history-search | History search | review-history | draft | — | — | — | 2026-08-01 |
| [6] | transition-log | Transition log | review-history | draft | — | — | — | 2026-08-01 |

## Descriptions

### [1] claim-queue

The approver's tier-filtered work list, sorted by state age — the daily entry point (FR-atlas-re-001).

### [2] claim-detail

One claim's amount, reserve-check status, and history summary — the surface where the approver decides to proceed (FR-atlas-re-003, BR-atlas-re-002).

### [3] decision-panel

The approve/reject act with the confirm-checkbox guard; all error edges (validator conflict, concurrency) surface here.

### [4] confirmation

Records the decision + actor + timestamp and the handler-notification status; returns to the queue (FR-atlas-re-002, E-atlas-re-003).

### [5] history-search

Filter claims by contract/cedent/period for the audit read path (flow `review-history`).

### [6] transition-log

The append-only transition history for a filtered set — the auditor's primary surface (FR-atlas-re-002, NFR-atlas-re-002).
