---
type: api-map
feature: {{feature}}
status: draft
updated: {{date}}
links:
  - docs/{{feature}}/integration/api-summary.md
  - docs/{{feature}}/integration/api-design.md
---

# {{feature_name}} — field mapping (provider ↔ model ↔ UI)

## Mapping

| # | Provider field | Our model field | UI element | Owner | Direction | Transform |
|---|---|---|---|---|---|---|
| 1 | {{provider_field}} | {{model_field}} | {{ui}} | ours / theirs / derived | out / in / bi | {{transform_or_none}} |

## Flags

- Ownerless: {{list_or_none}}
- ERD name mismatches: {{list_or_none}}
