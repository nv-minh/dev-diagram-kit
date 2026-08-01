<!--
REFERENCE for /ac — simulated session (atlas-re).
Full artifact: example/atlas-re/userstories/us-001.md
-->

## Command

```
/ac atlas-re us-001
```

**Mode:** L2 diff only — edits story in place, no new files.

## Skill states coverage plan

**Skill:** US-001 links FR-atlas-re-006 (tier routing) + E-atlas-re-001/002/004. I'll add:
- happy path AC
- boundary triple at 50k (at / below / above)
- one AC per error code

Committee-tier ACs blocked by open OQ-1 (quorum) — flagged, not invented.

## L2 diff preview (excerpt)

```diff
+ - AC-002: Given a VALIDATED claim of exactly 50,000 USD, when tier routing runs, then it lands in a handler-tier queue (boundary: ≤ 50k).
+ - AC-003: Given a VALIDATED claim of 50,001 USD, when tier routing runs, then it lands in a manager-tier queue (boundary: just above 50k).
+ - AC-005: Given the approver also validated this claim, when they submit a decision, then the system blocks it (E-atlas-re-001).
```

**You:** `Y`

## Output report

```
✅ AC added to us-001.md — 6 AC- rows | boundary triple present | E- coverage: 3/3 linked
   doc-validate: OK
```
