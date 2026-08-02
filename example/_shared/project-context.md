---
type: project-context
status: approved
version: 1.0.0
updated: 2026-08-02
profile_hash: derived-from-DOMAIN-md
source_watermark: static-fixture-not-a-real-scan
staleness_budget_commits: 200
human_edited: [glossary, gotchas]
links:
  - atlas-re/DOMAIN.md
---

# Atlas Re — project context (Tier 1, always loaded)

> Distilled from `atlas-re/DOMAIN.md` (91 lines → this). The non-derivable slice every later skill consumes. ✅ read · 🔵 inferred · 🟡 guessed (+ provenance).

## 1. What it does & who pays

A B2B SaaS **reinsurance underwriting platform**: a broker/underwriter places risk (a **Submission**) → it is **priced** → **bound** into a **Contract** → **Premium** installments scheduled → **Claims** + payments handled. The **reinsurer** (not the broker) pays for the platform. ✅ `DOMAIN.md:11`

## 2. Stack

NestJS + TypeORM (REST + WebSocket gateway for live pricing), PostgreSQL, React+Vite+AntD+Zustand, Azure (AD / Blob / Service Bus / App Insights). ✅ `DOMAIN.md:18`

## 3. Actors

Underwriter, Broker, Finance, Claims, Admin. Real-world authority in `context/actors.md`. ✅ `DOMAIN.md:14`

## 4. Glossary — collisions only (business word ≠ code identifier)

| Business term | Code / model | Note |
|---|---|---|
| Submission | `submission` entity | A risk to place — NOT a form submit. ✅ `DOMAIN.md:29` |
| Layer | `layer` entity | A slice of the risk; **premium is per Layer**. ✅ `DOMAIN.md:30` |
| Bind | Contract `QUOTED → BOUND` | 🔵 `DOMAIN.md:31` |

## 5. Gotchas (max 5)

- **Premium is per Layer, not per Contract** — summing contract-level premiums double-counts. 🔵 `DOMAIN.md:30`
- A Submission with **>3 Layers needs senior-underwriter approval** — the rule is NOT in code. 🟡 (business rule)
- Any runtime diagram must show **≥1 service→service call AND ≥1 bus consumer** — never a gateway fan-out of stores only. ✅ `DOMAIN.md:66`
- Fabricated services (Redis / Kafka / Elasticsearch) are labelled **(proposed)** — the real platform is Azure-only. ✅ `DOMAIN.md:69`
- A Contract must be `QUOTED` before bind; a Claim is validated against the contract's coverage/layers. ✅ `DOMAIN.md:53`

## 6. Pointers (Tier 2 — read on demand)

- `context/glossary.md` — full term map.
- `context/domain-rules.md` — business rules / invariants (the >3-layer approval, coverage checks).
- `context/actors.md` — actor detail + real-world authority (who can bind / approve / pay).
- `context/entities.md` — entity pointers (defers to the ERD).
- `context/architecture.md` — service / architecture pointers (defers to the C4 + module diagrams).
