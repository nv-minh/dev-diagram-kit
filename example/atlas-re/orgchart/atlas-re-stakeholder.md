# Atlas Re — stakeholder power / interest

> Companion to [`atlas-re-orgchart.d2`](./atlas-re-orgchart.d2). Coordinates are [interest, power] in 0..1.

%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%
```mermaid
quadrantChart
  title Atlas Re stakeholders
  x-axis Low interest --> High interest
  y-axis Low power --> High power
  quadrant-1 Manage closely
  quadrant-2 Keep satisfied
  quadrant-3 Monitor
  quadrant-4 Keep informed
  "CEO / sponsor": [0.9, 0.95]
  "CIO": [0.8, 0.8]
  "Underwriting Lead": [0.85, 0.6]
  "CFO": [0.6, 0.85]
  "Claims handlers": [0.7, 0.3]
  "Brokers (external)": [0.5, 0.45]
```

- **Manage closely:** CEO/sponsor, CIO — co-own roadmap.
- **Keep satisfied:** CFO — brief on finance milestones.
- **Keep informed:** Underwriting Lead, Claims handlers — share release notes.
- **Monitor:** Brokers — periodic feedback.
