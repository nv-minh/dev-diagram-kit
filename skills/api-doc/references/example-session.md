<!--
REFERENCE for /api-doc → /api-design → /api-map — simulated session (atlas-re CatModel).
Full artifacts: example/atlas-re/integration/
-->

## /api-doc

**Command:** `/api-doc atlas-re --provider CatModel @legacy/catmodel-openapi.yaml`

**Skill:** refuses without source ✓ — parses OpenAPI, tags every row with provenance.

**Output excerpt:**

```markdown
| POST | /submissions/{id}/quote | request a loss estimate | out | openapi §paths./quote |
| quote.completed | webhook | `{job_id, loss_estimate:{amount,currency}}` | openapi §webhooks |
```

---

## /api-design

**Command:** `/api-design atlas-re`

**Skill reads:** api-summary-catmodel.md · pairs webhook with polling reconciliation.

**Output excerpt:**

```markdown
Source of truth: loss_estimate = theirs (CatModel authority); priced_at = derived (our timestamp).
Webhook quote.completed MUST have reconciliation partner: GET /jobs/{job_id} poll every 5m until terminal.
```

---

## /api-map

**Command:** `/api-map atlas-re --provider CatModel`

**Output excerpt:**

```markdown
| loss_estimate.amount | CatModel payload | Quote model | UI quote panel | theirs | in | none |
| priced_at            | —                | Quote model | UI quote panel | derived | — | set on webhook receipt |
```

**Output report:**

```
✅ API chain steps 1–3 committed | OQ: production base URL flagged | doc-validate: OK
Next: /api-checklist atlas-re
```
