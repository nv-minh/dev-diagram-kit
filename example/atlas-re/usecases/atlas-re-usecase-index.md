---
type: usecase-index
feature: atlas-re
status: approved
updated: 2026-08-01
links:
  - docs/atlas-re/srs/atlas-re-spec.md
---

# Atlas Re claim approval — Use Cases Index

## Use cases

> This table is a **per-feature traceability matrix** (UC↔FR↔Screen↔Error↔OQ) and also metadata/lifecycle — a single source, not split into a separate file. Only `/gap` checks cross-doc orphans/broken links (→ `docs/_shared/traceability.md`).

| # | Slug | Level | Status | Actor primary | Covers FR | Screens | Errors (E-*) | OQ ref | Priority | Updated |
|---|------|-------|--------|---------------|-----------|---------|--------------|--------|----------|---------|
| 1 | [uc-approve-claim](uc-approve-claim.md) | user-goal | approved | Approver | FR-atlas-re-006, FR-atlas-re-007 | [2] [3] [4] | E-atlas-re-001, E-atlas-re-003, E-atlas-re-004 | spec.md OQ-1 | P0 | 2026-08-01 |

## CRUD matrix

> Which use case operates on which entity (C=Create, R=Read, U=Update, D=Delete). Entities named per the ERD (`srs/atlas-re-erd.md`).

| UC \ Entity | Claim | Contract |
|---|---|---|
| [uc-approve-claim](uc-approve-claim.md) | RU | R |

## Actors

| Actor | Type | Description | Source |
|---|---|---|---|
| Approver | primary | Manager (tier 2) or committee member (tier 3) deciding validated claims | URD persona: Head of Claims |
| Claims handler | secondary | Receives the decision notification | URD persona |
| Notification service | system | Fans the decision event out via Service Bus | SRS actor table |

## Diagram

<img src="atlas-re-usecase-diagram.svg" alt="Use case diagram: atlas-re">

*The real source is `atlas-re-usecase-diagram.puml` (PlantUML native), rendered to `.svg` via `render.sh`. To change content → edit the `.puml` then re-run `/usecase-diagram`, do NOT hand-edit the `.svg`.*

## Data sources

- FR + Error Matrix: [[docs/atlas-re/srs/atlas-re-spec.md|SRS spec]]
- Screens: `srs/atlas-re-userflow.md` (flow `approve-claim`)
- Open Questions: `srs/atlas-re-spec.md` Open Questions section (canonical)
