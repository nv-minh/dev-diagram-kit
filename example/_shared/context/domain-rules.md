---
type: project-context-detail
status: approved
version: 1.0.0
updated: 2026-08-02
profile_hash: derived-from-DOMAIN-md
source_watermark: static-fixture-not-a-real-scan
links:
  - atlas-re/DOMAIN.md
---

# Domain rules — Atlas Re

> Tier 2 — business rules / invariants NOT fully visible in code. Read when drafting specs (SRS rules) or validating flows. ✅ read · 🔵 inferred · 🟡 guessed.

- **>3 Layers ⇒ senior-underwriter approval.** A Submission with more than three Layers requires a senior underwriter to approve before bind. The cap is visible in `pricing-svc`; the approval gate is NOT in code. 🟡 (business rule — confirm)
- **Coverage check before claim.** A reported loss is validated against the contract's coverage and Layers (`claim-svc → contract-svc`) before a Claim is registered. ✅ `DOMAIN.md:55`
- **Contract must be `QUOTED` to bind.** `contract-svc → submission-svc` fetches + validates the submission is `QUOTED` before binding. ✅ `DOMAIN.md:53`
- **Bus is a backbone, not a sink.** Every async event (`submission.quoted`, `contract.bound`, `claim.registered`) has at least one real consumer — events are not fire-and-forget. ✅ `DOMAIN.md:59`
- **Anonymization is enforced.** Entity *names* are industry-standard; *field names* are generic; no real file paths; fabricated services labelled `(proposed)`. ✅ `DOMAIN.md:80`
