---
type: srs-flows
feature: {{feature}}
updated: {{date}}
---

# {{process}} — Activity Diagram

> Business process **{{process}}** in feature **{{feature}}**.

## Process overview

{{overview}}

*1-2 paragraphs describing the process purpose, who runs it, when it is triggered.*

## Roles / Lanes (if any)

| Lane | Role | Responsibility |
|---|---|---|
| {{lane_1}} | {{role}} | {{responsibility}} |

## Diagram

```mermaid
{{mermaid_code}}
```

## Decision points

| ID | When | YES | NO |
|---|---|---|---|
| D1 | {{condition}} | {{yes_path}} | {{no_path}} |

## Parallel / Sub-processes

{{parallels}}

*List branches running in parallel or sub-processes invoked.*

## Notes

{{notes}}

*Cross-ref: `docs/{{feature}}/srs/{{feature}}-flows.md`, related sequence diagrams, `usecases/`.*
