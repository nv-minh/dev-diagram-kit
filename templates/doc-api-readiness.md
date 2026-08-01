---
type: api-readiness
feature: {{feature}}
status: draft
updated: {{date}}
links:
  - docs/{{feature}}/test/api/api-tests.md
---

# {{feature_name}} — go-live gate

## Go / no-go

| Gate item | Status | Evidence |
|---|---|---|
| Tests present (api-tests.md) | ready / blocked | {{evidence}} |
| Monitoring defined | ready / blocked | {{alerts}} |
| Rollback defined | ready / blocked | {{plan}} |
| Feature flags named | ready / blocked | {{flags}} |

**Verdict: {{GO | NO-GO — blocked: {{items}}}}**

## 1. Cutover

| Step | Action | Owner |
|---|---|---|
| 1 | {{action}} | {{owner}} |

## 2. Feature flags

| Flag | Purpose | Owner | Off-state |
|---|---|---|---|
| {{flag}} | kill switch | {{owner}} | degraded UX ({{surface}}) |

## 3. Monitoring

- Alerts: error rate > {{threshold}}, latency p95 > {{threshold}}, their-status-page subscription
- Runbook: {{link}}

## 4. Rollback

- Disable sequence: {{steps}}
- Partial-data back-out: {{how}}

## 5. SLA / deprecation

- Provider SLA: {{value}} · Sunset date: {{date_or_none}} · Our deprecation notice: {{to_whom}}

## Open Questions

- [ ] OQ-1: {{gap}}
