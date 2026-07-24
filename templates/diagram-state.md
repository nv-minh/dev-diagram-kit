---
type: srs-states
feature: {{feature}}
updated: {{date}}
---

# {{feature}} — State Diagrams

> State diagram per entity of feature **{{feature}}**. One `## State: {Entity}` section per entity.

## State: {{entity}}

**Related UC**: [[../usecases/uc-{{slug}}.md]]
**Related BR**: BR-{{feature}}-{{NNN}}

```mermaid
{{mermaid_code}}
```

### Invalid transitions

| From | To | Why not |
|---|---|---|
| {{from}} | {{to}} | {{reason}} |
