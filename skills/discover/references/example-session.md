# /discover — worked example session (atlas-re)

> A concrete walk-through of `/discover` on the `example/atlas-re/` vault, including the 5-question interview. Illustrates the scan → HARD STOP → generate flow and the 91-line `DOMAIN.md` → ≤60-line Tier-1 compression. Read alongside `../SKILL.md`.

## Setup

User runs `/discover` from the `example/atlas-re/` root (a fictional NestJS + React reinsurance underwriting platform). Manifest sniff finds `package.json`; the Context block shows no existing profile → fresh run.

## Phase 1 — scan + interview

### Subagent findings (distilled back to the main thread)

| Aspect | Finding | Evidence |
|---|---|---|
| Stack | NestJS + TypeORM, PostgreSQL, React+Vite+AntD, Azure | `package.json`, `src/main.ts` ✅ |
| Entities | Insured, Broker, Submission, Layer, Contract, Claim, ClaimPayment, PremiumSchedule, User | `src/*/entities/*.entity.ts` ✅ |
| Services | auth, submission-svc, contract-svc, claim-svc, pricing-svc, receipt-svc, reference-svc | `src/*/` dirs ✅ |
| External | Azure AD, Blob, Service Bus, Kafka | `.env.example`, `@azure/*` imports ✅ |
| Actors | Underwriter, Broker, Claims handler, Admin | `src/auth/roles.enum.ts` ✅ |
| Interactions | sync REST (submission→pricing, contract→receipt) + async Service Bus fan-out (claim→payment) | `*.controller.ts`, `@EventPattern` 🔵 |

Ingest `DOMAIN.md` + README → consistent with code (no conflict).

### The 5-question interview (one at a time, Recommended named first)

**Q1 — Business purpose & who pays.** What is Atlas Re for, in plain terms?
> *Recommended:* "A B2B SaaS where **reinsurers** underwrite policies brokers submit; the reinsurer (not the broker) pays for the platform." — *Rationale: matches the submission→bind→premium→claim lifecycle the scan found.*
>
> User: confirms.

**Q2 — Glossary collisions.** The scan flagged: the code calls it `Submission`, the business says "quote"; `Contract` = "policy". Confirm?
> *Recommended:* table `Submission → quote`, `Contract → policy`. — *Rationale: the route guards + UI strings use the business words.*
>
> User: yes, and add `Layer → share` (reinsurance term).

**Q3 — Business rules not visible in code.** Any invariant the code doesn't enforce?
> *Recommended:* "A Submission with >3 layers requires senior underwriter approval." — *Rationale: the pricing service caps at 3 but the approval gate isn't in code; it's a business rule.*
>
> User: correct.

**Q4 — Actor authority.** Who can bind (approve) a Contract?
> *Recommended:* "Only Underwriter (senior) role; Broker may submit but never bind." — *Rationale: matches `roles.enum.ts` + the contract controller guard.*
>
> User: correct.

**Q5 — The one gotcha.** What bites newcomers?
> *Recommended:* "Premium is calculated per **Layer**, not per Contract — summing contract-level premiums double-counts." — *Rationale: the `PremiumSchedule` is 1:N with Layer, a classic trap.*
>
> User: yes, that's the big one.

Each answer is written back into `docs/_shared/.discover-plan.md` immediately after the reply.

### HARD STOP — L1 preview

> Scanned **Atlas Re** (NestJS + TypeORM + Postgres + React, Azure). Tier 1 will hold: purpose · stack · 4 actors · 3 glossary collisions (Submission/Layer/Contract) · 5 gotchas · pointers to 5 Tier-2 files.
> 🟡 Uncertain: exact Service Bus topic names.
>
> Write the context set to `docs/_shared/`? (Y / edit / drop)

User: **Y**.

## Phase 2 — generate

Tier 1 (`project-context.md`) is written and **measures ≤60 lines** (the 91-line `DOMAIN.md` compresses because entity fields, service tables, and interaction maps move to Tier 2 / are re-derivable). Tier 2 files written: `glossary.md`, `domain-rules.md`, `actors.md`, `entities.md` (points to `d2-erd/atlas-re.d2`), `architecture.md` (points to `system-design/atlas-re-context.d2`). Frontmatter stamped: `profile_hash`, `source_watermark: <HEAD sha>`, `version: 1.0.0`. `doc-validate` passes (incl. the 60-line cap).

## Result

Consuming skills now load Tier 1 automatically: `/srs claim-payment` sees "Premium is per Layer" and does not re-ask; `/erd` reads `entities.md` and uses `Submission`/`Layer`/`Contract` (not invented names); `/userstory` reads `actors.md` + `domain-rules.md`. Six weeks later, after 40 commits, the loader banner fires (`⚠️ STALE …`) until someone runs `/discover --update`.
