---
type: change-request
feature: {{feature}}
status: draft
updated: {{date}}
---

# CR-{{YYYYMMDD}}-{{NNN}} — {{title}}

> Change: {{one_line_change}} · Recorded {{date}} · Status: draft / applied

## 1. Rationale

{{why_this_change}}

## 2. Impact Matrix

| ID | Doc | Impact | New value | Confidence |
|---|---|---|---|---|
| {{FR_or_US_or_E}} | {{path}} | add / modify / remove | {{new_value}} | high / medium / low |

## 3. Detailed Impact

{{narrative_per_affected_area}}

## 4. Apply order

1. {{doc}} — {{edit_summary}} (dependency: {{none_or_prior_step}})
2. {{doc}} — {{edit_summary}}

## 5. Rollback Plan

- Revert order: {{reverse_sequence}}
- Prior values to restore: {{per_id_prior_value}}
- Rollback confidence: reversible / complex / irreversible

## 6. Applied status

- [ ] Step 1 ({{doc}})
- [ ] Step 2 ({{doc}})
- Applied: —
