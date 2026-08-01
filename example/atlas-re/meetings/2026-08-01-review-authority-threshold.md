---
type: meeting
status: processed
updated: 2026-08-01
---

# 2026-08-01 — review: Authority threshold adjustment

## Attendees

Head of Claims, Finance lead, Senior underwriter, BA

## Agenda

1. Q2 claim-volume review — the manager-tier queue bottleneck
2. Proposed threshold change (handler ceiling 50k → 60k)

## Discussion

Finance's Q2 analysis showed handler-tier claims cluster just under the 50k ceiling, pushing ~15% of volume into the manager tier and creating the new bottleneck. Raising the handler ceiling to 60k moves that volume back without touching the committee threshold (250k) — risk appetite above 250k is unchanged. The underwriter confirmed no concentration-risk concern.

## Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | Raise the handler authority ceiling from 50k to 60k USD | removes the manager-tier bottleneck; committee threshold unchanged | [[docs/atlas-re/srs/atlas-re-spec.md#FR-atlas-re-006\|FR-atlas-re-006]], BR-atlas-re-001 |
| 2 | Backfill the test cases for the new 60k boundary before cutover | the existing 50k boundary triples must move | CHK-002, TC-002..004 |

## Blockers

| # | Blocker | Owner | Needs |
|---|---|---|---|
| 1 | Committee quorum rule still open (OQ-1) | Head of Claims | a decision before the next committee-tier claim |

## Action items

| # | Action | Owner | Due | Status |
|---|---|---|---|---|
| 1 | Record the threshold change as a CR + apply it | BA | 2026-08-02 | open → `/cr "raise handler ceiling to 60k"` |
| 2 | Confirm the committee quorum rule | Head of Claims | 2026-08-08 | open |
