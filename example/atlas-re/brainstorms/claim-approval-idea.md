---
type: brainstorm
feature: atlas-re
status: approved
updated: 2026-08-01
---

# Brainstorm — Claim approval workflow

> Idea seed: claims on bound contracts are approved over email today; nothing is traceable.

## 1. Problem / opportunity

When a cedent files a claim against a bound contract, the claims handler collects documents by email, asks Finance to validate reserves in a spreadsheet, and gets sign-off in whatever channel works. Approval state lives in people's inboxes: nobody can answer "where is claim X stuck?" without asking around, and auditors reconstruct decisions from email threads.

## 2. Who is affected

| Who | Situation today | Pain / gain |
|---|---|---|
| Claims handler | Tracks claim state in a personal spreadsheet | Re-keys data, chases sign-offs by email |
| Finance | Validates reserve adequacy on request, no queue | Requests arrive ad hoc, no priority order |
| Underwriter | Learns of large claims late | No early signal that a contract is deteriorating |
| Auditor | Reconstructs approvals from email | Weeks of discovery per audit |

## 3. Idea sketch

A claim moves through an explicit approval workflow on the platform: FILED → VALIDATED (Finance checks reserves) → APPROVED / REJECTED (authority depends on amount) → PAID. Every transition is recorded with actor + timestamp; handlers see a queue, underwriters see claims on their contracts.

## 4. What success looks like

Any claim's state and history answerable in one click; audit prep for claims drops from weeks to hours; large-claim notifications reach the underwriter the day the claim is filed.

## 5. Explorations

### What breaks at 10× claim volume

The single-approver bottleneck: today one Head of Claims signs everything. Amount-based authority tiers (handler ≤ 50k, manager ≤ 250k, committee above) keep the queue moving.

## 6. Key decisions so far

| # | Decision | Rationale | Decided |
|---|---|---|---|
| 1 | Approval authority tiers by claim amount | Removes the single-approver bottleneck found in the 10× exploration | 2026-08-01 |
| 2 | Workflow lives on the platform, not in a BPM suite | The platform already owns the Claim entity and its state machine | 2026-08-01 |

## 7. Out of scope (for now)

- Automated fraud scoring
- Cedent-facing claim portal (separate idea)

## Open Questions

- [x] OQ-1: Which currencies do authority tiers apply in? → tiers are defined in USD, converted at filing-date rate.
- [ ] OQ-2: Does the approval committee need a quorum rule, or any two members?
