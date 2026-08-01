<!--
REFERENCE for /api-design — simulated session (atlas-re CatModel).
Full section in api-doc family reference + artifact example/atlas-re/integration/api-design.md
-->

## Command

```
/api-design atlas-re
```

**Prep:** `/api-doc` summary present ✓

## Skill output (excerpt)

```markdown
Source of truth: loss_estimate = theirs (CatModel authority); priced_at = derived.
Webhook quote.completed MUST have reconciliation partner: GET /jobs/{job_id} poll every 5m until terminal.
```

See also: `skills/api-doc/references/example-session.md` (full api-doc → api-map chain).
