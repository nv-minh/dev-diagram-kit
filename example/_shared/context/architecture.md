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

# Architecture — Atlas Re (pointer-heavy)

> Tier 2 — services + how they talk. **Pointer-heavy**: the canonical diagrams live in the C4 + module views, not duplicated here. ✅ read.

## Services

`auth` (Azure AD) · `submission-svc` · `contract-svc` · `claim-svc` · `pricing-svc` (fire/cat/professional engines + WebSocket) · `receipt-svc` (premium receipts) · `reference-svc` (lookups). ✅ `DOMAIN.md:42`

## Sync interactions (REST, need an immediate answer)

- `submission-svc → pricing-svc` — rate/quote. ✅ `DOMAIN.md:52`
- `contract-svc → submission-svc` — validate submission is `QUOTED`. ✅ `DOMAIN.md:53`
- `contract-svc → pricing-svc` — final rate at bind. ✅ `DOMAIN.md:54`
- `claim-svc → contract-svc` — fetch coverage/Layers. ✅ `DOMAIN.md:55`
- `claim-svc → reference-svc` — loss/industry lookups. ✅ `DOMAIN.md:56`
- `contract-svc → receipt-svc` — schedule installments. ✅ `DOMAIN.md:57`

## Async interactions (Service Bus / Kafka — publish + fan-out)

- `submission.quoted` → `contract-svc` (pre-stage draft contract). ✅ `DOMAIN.md:60`
- `contract.bound` → `claim-svc` + `receipt-svc`. ✅ `DOMAIN.md:61`
- `claim.registered` → `receipt-svc` / finance. ✅ `DOMAIN.md:63`

## Pointers (canonical depth)

- System architecture (D2): [`atlas-re/d2-architect/atlas-re.d2`](../../atlas-re/d2-architect/atlas-re.d2)
- C4 Context + Container: [`atlas-re/system-design/`](../../atlas-re/system-design/)
- Cloud views (draw.io): [`atlas-re/drawio/`](../../atlas-re/drawio/)
