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

# Entities — Atlas Re (pointer-heavy)

> Tier 2 — the entity set + state machines. **Pointer-heavy**: the canonical diagram lives in the ERD, not duplicated here (duplicated structure drifts). ✅ read.

## Entities (9)

Insured · Broker · Submission · Layer · Contract · Claim · ClaimPayment · PremiumSchedule · User. ✅ `DOMAIN.md:25`

## Cardinality

Insured 1—N Submission · Broker 1—N Submission · Submission 1—N Layer · Submission 1—1 Contract · Contract 1—N Claim · Claim 1—N ClaimPayment · Contract 1—N PremiumSchedule. ✅ `DOMAIN.md:37`

## State machines (the ones that matter)

- **Submission:** DRAFT → QUOTED → BOUND / DECLINED ✅ `DOMAIN.md:29`
- **Contract:** QUOTED → PENDING → BOUND → CANCELLED / NOT_TAKEN_UP ✅ `DOMAIN.md:31`
- **Claim:** PRECAUTIONARY → REGISTERED → IN_PROGRESS → CLOSED (→ REOPEN) ✅ `DOMAIN.md:32`
- **ClaimPayment:** PENDING_APPROVAL → APPROVED → PAID ✅ `DOMAIN.md:33`

## Pointers (canonical depth)

- ERD (D2): [`atlas-re/d2-erd/atlas-re.d2`](../../atlas-re/d2-erd/atlas-re.d2)
- ERD (inline Mermaid): in [`atlas-re/srs/`](../../atlas-re/srs/)
- DBML: [`atlas-re/dbdiagram/`](../../atlas-re/dbdiagram/)
