# UC-approve-claim — Approve a claim

Scope: Atlas Re platform · Level: user-goal · Primary Actor: Approver

Trigger: a VALIDATED claim enters the approver's queue.
Preconditions: the claim is VALIDATED; the approver's authority tier covers the claim amount.
Minimal Guarantee: claim state and transition history remain consistent; no partial decision is recorded.
Success Guarantee: the claim is APPROVED (or REJECTED) with actor and timestamp recorded, and the handler is notified.

## Main Success Scenario

1. Approver opens the claim from their tier queue.
2. System shows the claim amount, the Finance reserve check, and the full transition history.
3. Approver submits an approve decision.
4. System records the transition (actor, timestamp, prior state).
5. System notifies the claims handler of the decision.

## Extensions

- 3a. Approver is the user who validated this claim → system blocks the decision and names the validator ([[docs/atlas-re/srs/atlas-re-spec.md#E-atlas-re-001|E-atlas-re-001]]).
- 3b. Another approver decided the claim concurrently → first commit wins; system shows who decided and when ([[docs/atlas-re/srs/atlas-re-spec.md#E-atlas-re-004|E-atlas-re-004]]).
- 5a. Notification publish fails → the decision stands; the event retries with backoff, ops alerted after 3 failures ([[docs/atlas-re/srs/atlas-re-spec.md#E-atlas-re-003|E-atlas-re-003]]).

## Related Requirements

[[docs/atlas-re/srs/atlas-re-spec.md#FR-atlas-re-006|FR-atlas-re-006]] · [[docs/atlas-re/srs/atlas-re-spec.md#FR-atlas-re-007|FR-atlas-re-007]] · BR-atlas-re-002 · BR-atlas-re-003
