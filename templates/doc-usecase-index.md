---
type: usecase-index
feature: {{feature_slug}}
status: draft
updated: {{date}}
links:
  - docs/{{feature_slug}}/srs/{{feature}}-spec.md
---

# {{feature_name}} — Use Cases Index

## Use cases

> This table is a **per-feature traceability matrix** (UC↔FR↔Screen↔Error↔OQ) and also metadata/lifecycle — a single source, not split into a separate file. Only `/gap` checks cross-doc orphans/broken links (→ `docs/_shared/traceability.md`).

| # | Slug | Level | Status | Actor primary | Covers FR | Screens | Errors (E-*) | OQ ref | Priority | Updated |
|---|------|-------|--------|---------------|-----------|---------|--------------|--------|----------|---------|
| 1 | [{{uc_slug_1}}]({{uc_slug_1}}.md) | sea | draft | {{actor}} | FR-{{feature}}-001 | login, success | E-{{feature}}-001 | — | P0 | {{date}} |

## CRUD matrix

> Which use case operates on which entity (C=Create, R=Read, U=Update, D=Delete). Empty cell = no interaction. Source of the UC→entity edge (OPERATES_ON) — the classic BA CRUD table, cross-checked against the ERD (`srs/{{feature}}-erd.md`). Entities named in CamelCase matching the ERD.

| UC \ Entity | {{Entity1}} | {{Entity2}} |
|---|---|---|
| [{{uc_slug_1}}]({{uc_slug_1}}.md) | CRUD | R |

## Actors

| Actor | Type | Description | Source |
|---|---|---|---|
| {{actor_1}} | primary / secondary / system | {{description}} | {{source}} |

## Diagram

<img src="{{feature}}-usecase-diagram.svg" alt="Use case diagram: {{feature}}">

*The real source is `{{feature}}-usecase-diagram.puml` (PlantUML native), rendered to `.svg` via `render.sh`. To change content → edit the `.puml` then re-run `/usecase-diagram`, do NOT hand-edit the `.svg`.*

## Relationships

| Type | From | To | Rationale |
|---|---|---|---|
| include | {{base_uc}} | {{included_uc}} | {{included_uc}} is always needed for {{base_uc}} to complete |
| extend | {{extending_uc}} | {{base_uc}} | {{extending_uc}} augments {{base_uc}} when {{condition}} (base is still sufficient if it does not occur) |

## Data sources

- FR + Error Matrix: [[../srs/{{feature}}-spec.md|SRS spec]]
- Screens: [[../ascii-wireframe/{{feature}}-wireframe-index.md|Screens index]]
- Open Questions: `srs/{{feature}}-spec.md` Open Questions section (canonical — the table above only points to ref `spec.md#OQ-N`)
