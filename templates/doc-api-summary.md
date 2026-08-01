---
type: api-summary
feature: {{feature}}
status: draft
updated: {{date}}
---

# {{provider}} — contract summary

> Provider: {{provider}} · Spec: {{spec_name}} v{{version}} ({{date}}) · Source: {{url_or_file}}

## 1. Auth

| Scheme | Details | Provenance |
|---|---|---|
| {{scheme}} | {{details}} | {{spec_page}} |

## 2. Endpoints

| Method | Path | Purpose | Direction | Provenance |
|---|---|---|---|---|
| {{method}} | {{path}} | {{purpose}} | out / in | {{spec_page}} |

## 3. Webhooks

| Event | Payload shape | Provenance |
|---|---|---|
| {{event}} | {{shape}} | {{spec_page}} |

## 4. Rate limits & pagination

- Rate limit: {{value_or_OQ}}
- Pagination: {{style}}

## 5. Errors

| HTTP | Code | Meaning | Provenance |
|---|---|---|---|
| {{status}} | {{code}} | {{meaning}} | {{spec_page}} |

## Open Questions (undocumented)

- [ ] OQ-1: {{undocumented_aspect}}
