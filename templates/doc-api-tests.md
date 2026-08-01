---
type: api-tests
feature: {{feature}}
status: draft
updated: {{date}}
links:
  - docs/{{feature}}/test/api/api-checklist.md
---

# {{feature_name}} — API tests (Bruno)

## Requests

| CHK | Title | .bru | Method | Path | Expected status | Key assertion | Provider |
|---|---|---|---|---|---|---|---|
| CHK-001 | {{title}} | bruno/{{provider}}/{{slug}}.bru | {{method}} | {{path}} | {{status}} | {{field}} | {{provider}} |

## Notes

- `own`-only rows kept as unit tests: {{list_or_none}}
- Environment: sandbox only — never run against production from this doc.
