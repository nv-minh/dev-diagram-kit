<!-- zero-frontmatter: screen content file — metadata lives in atlas-re-wireframe-index.md -->
# Flow: approve-claim — ASCII wireframes

> Device: desktop 1024 (from `srs/atlas-re-userflow.md` `primary_device`). Divides per the userflow. See `atlas-re-wireframe-index.md` for metadata + per-screen purpose.

## Screen: claim-queue — [1] Claim queue

```
┌─ [1] Claim queue ─────────────────────────── desktop 1024 ─┐
│  Approver · your tier: manager (≤ 250k USD)                │
│                                                            │
│  [ Search claims.............. ]   [ Filter: state ▾ ]     │
│                                                            │
│  #   Claim     Amount      State age   Waiting on          │
│  1   CLM-204   250,000     9 days      you (approve)       │
│  2   CLM-198   40,000      2 days      you (approve)       │
│  3   CLM-211   300,000     5 days      committee           │
│                                                            │
│  ( Open CLM-204 )                                          │
└────────────────────────────────────────────────────────────┘
```

| # | Items | Control type | Data type | Description |
|---|---|---|---|---|
| 1 | Tier label | text | enum | • Business purpose: shows the approver's authority tier so they know which amounts they may decide. • Sourced from BR-atlas-re-001. |
| 2 | Search | input | text | • Filters the queue by claim id / cedent. • Empty = all in tier. |
| 3 | State filter | select | enum | • Options: all / waiting-on-me / waiting-on-other. • Default all. |
| 4 | Queue row | link | action | • Nav → [2] Claim detail (carries the claim id). • Sorted by state age descending (FR-atlas-re-001). |
| 5 | CLM-204 amount | text | currency | • 250,000 USD — within manager tier (≤ 250k, BR-atlas-re-001). |

## Screen: claim-detail — [2] Claim detail

```
┌─ [2] Claim detail — CLM-204 ──────────────── desktop 1024 ─┐
│  ← Back to queue                                           │
│                                                            │
│  Amount:        USD 250,000                                │
│  Reserves:      ✓ validated (Finance, 2026-08-01)          │
│  History:       4 transitions (FILED → VALIDATED → here)   │
│                                                            │
│  ( Decide )                                                │
└────────────────────────────────────────────────────────────┘
```

| # | Items | Control type | Data type | Description |
|---|---|---|---|---|
| 1 | Back | link | action | • Nav → [1] Claim queue. |
| 2 | Amount | text | currency | • 250,000 USD at filing-date rate (BR-atlas-re-001). • Read-only. |
| 3 | Reserves status | text | enum | • ✓ validated means Finance confirmed adequacy (FR-atlas-re-005). • If not validated, the Decide button is disabled (BR-atlas-re-002). |
| 4 | History summary | link | action | • Nav → [6] Transition log (flow review-history). • Shows count + last transition (FR-atlas-re-003). |
| 5 | Decide | button | action | • Nav → [3] Decision panel. • Disabled unless reserves validated (BR-atlas-re-002). |

## Screen: decision-panel — [3] Decision panel

```
┌─ [3] Decision panel — CLM-204 ─────────────── desktop 1024 ─┐
│  Amount: USD 250,000   (your tier: manager)                 │
│                                                             │
│  [ ] I confirm this decision is mine to make                │
│                                                             │
│  Note (optional): [ ................................... ]   │
│                                                             │
│  ( Approve )   ( Reject )                                  │
└─────────────────────────────────────────────────────────────┘
```

| # | Items | Control type | Data type | Description |
|---|---|---|---|---|
| 1 | Confirm checkbox | checkbox | boolean | • Must be ticked before Approve/Reject enable. • States: default / checked. |
| 2 | Note | textarea | text | • Optional rationale. • Max 500 chars. |
| 3 | Approve | button | action | • Nav → [4] Confirmation (records APPROVED). • Error E-atlas-re-001: blocked if the approver is the validator (BR-atlas-re-003). • Error E-atlas-re-004: conflict if another approver decided concurrently. |
| 4 | Reject | button | action | • Nav → [4] Confirmation (records REJECTED). • Same errors as Approve. |

## Screen: confirmation — [4] Confirmation

```
┌─ [4] Confirmation ─────────────────────────── desktop 1024 ─┐
│  ✓ Decision recorded: CLM-204 APPROVED                      │
│    Actor: you · 2026-08-01 14:03                            │
│    The claims handler has been notified.                    │
│                                                             │
│  ( Back to queue )                                          │
└─────────────────────────────────────────────────────────────┘
```

| # | Items | Control type | Data type | Description |
|---|---|---|---|---|
| 1 | Result text | text | — | • Confirms the decision + actor + timestamp (FR-atlas-re-002). |
| 2 | Notification status | text | enum | • "Handler notified" on success; if publish failed, shows "notification queued" (E-atlas-re-003) — the decision still stands. |
| 3 | Back to queue | button | action | • Nav → [1] Claim queue. |
