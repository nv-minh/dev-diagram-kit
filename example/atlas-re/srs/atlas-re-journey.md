# Atlas Re — underwriter journey (Mermaid inline)

> The underwriter's submission-to-bind experience across the 10 workflow tabs, with a satisfaction
> rating (1 low – 5 high). Anonymized. See [`../DOMAIN.md`](../DOMAIN.md).

%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%
```mermaid
journey
  title Underwriter — submission to bind
  section Capture
    Create submission: 5: Underwriter
    Enter insured / broker: 4: Underwriter
    Upload SoV: 2: Underwriter
  section Price
    Fire rating: 3: Underwriter
    CAT rating: 3: Underwriter
    Review layer results: 4: Underwriter
  section Decide
    Peer review: 3: Underwriter, Lead
    Generate quote: 5: Underwriter
    Bind contract: 5: Underwriter
```

**Pain points (low ratings):** *Upload SoV* (2) — manual file prep + validation; *Fire/CAT rating* (3) —
slow async waits. These are the journey's improvement candidates.
