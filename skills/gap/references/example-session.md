<!--
REFERENCE for /gap — simulated session (atlas-re).
Full artifact: example/atlas-re/_shared/traceability.md
-->

## Command

```
/gap --feature atlas-re
```

**Mode:** read-only scan — writes one report only.

## Skill runs rules

Scans UN→BO→CAP→FR→UC/US→AC→CHK→TC spine + E- citations + orphans + stale links.

## Output excerpt

```markdown
| Rule | Count | Worst examples |
|---|---|---|
| FR without UC or US | 3 | FR-atlas-re-004, FR-atlas-re-005, FR-atlas-re-008 — not yet sliced into stories |
| E- uncited | 0 | — |
```

## Output report

```
✅ Traceability report: docs/_shared/traceability.md
   Spine intact | 3 FRs deliberately unsliced (visible decision, not silent gap)
   Fix gaps via owning skill — /userstory atlas-re for the three FRs
```
