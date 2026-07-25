# Example orgchart --stakeholder — power / interest map (online-shop)

> What `/orgchart --feature online-shop --stakeholder` writes to `orgchart/{slug}-stakeholder.md`:
> a Mermaid `quadrantChart` plotting each stakeholder by influence (y) × interest (x).
> Coordinates are [interest, power] in 0..1. Quadrant 1 = top-right (Manage closely).

## Stakeholder power / interest

```mermaid
quadrantChart
  title Stakeholder power / interest
  x-axis Low interest --> High interest
  y-axis Low power --> High power
  quadrant-1 Manage closely
  quadrant-2 Keep satisfied
  quadrant-3 Monitor
  quadrant-4 Keep informed
  "CEO / sponsor": [0.9, 0.95]
  "CTO": [0.75, 0.7]
  "Backend Lead": [0.8, 0.55]
  "CMO": [0.5, 0.6]
  "Marketing team": [0.6, 0.3]
  "End users": [0.35, 0.15]
```

### Engagement strategy
- **Manage closely** (high power + interest): CEO/sponsor, CTO — weekly sync, co-own decisions.
- **Keep satisfied** (high power, low interest): CMO — brief on milestones, escalate blockers.
- **Keep informed** (low power, high interest): Backend Lead, Marketing — share roadmap + release notes.
- **Monitor** (low power + interest): End users — usage analytics, periodic survey.
