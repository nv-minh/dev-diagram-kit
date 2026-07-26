# Atlas Re — domain model (anonymized, the source of truth for every example diagram)

> **Atlas Re** is a *fictional* B2B SaaS **reinsurance underwriting platform**, modelled on a real
> NestJS + React codebase but **fully anonymized** here: no real project name, no real DB fields, no real
> file paths, no proprietary business rules. Reinsurance *terminology* (Submission / Contract / Layer /
> Claim / Premium / Insured / Broker) is industry-standard and public — only the implementation specifics
> are obscured. Every diagram under `example/atlas-re/` draws from this file, so they stay consistent.

## What the platform does

Manage the **reinsurance policy lifecycle**: a broker/underwriter creates a **Submission** (a risk to
place), the platform **prices** it (fire / catastrophe / professional-lines engines), **binds** it into a
**Contract**, schedules **Premium** installments, and later handles **Claims** + payments. Multi-party:
Underwriter, Broker, Finance, Claims, Admin.

## Stack (anonymized)

- **Backend:** NestJS (TypeScript) + TypeORM, REST + a WebSocket gateway for live pricing.
- **Database:** PostgreSQL.
- **Frontend:** React + Vite + Ant Design + Zustand + React Query.
- **Cloud:** Azure — Azure AD (auth), Azure Blob (files), Azure Service Bus (async), App Insights.

## Entities (generic fields) — the data model used by /erd /d2-erd /dbdiagram

| Entity | Key fields | Status (state machine) |
|---|---|---|
| **Insured** | id, name, industry, country | — |
| **Broker** | id, name, brokerage_house | — |
| **Submission** | id, insured_id, broker_id, business_line, created_at | DRAFT → QUOTED → BOUND / DECLINED |
| **Layer** | id, submission_id, limit, excess | — |
| **Contract** | id, submission_id, premium, inception_date | QUOTED → PENDING → BOUND → CANCELLED / NOT_TAKEN_UP |
| **Claim** | id, contract_id, loss_amount, reported_at | PRECAUTIONARY → REGISTERED → IN_PROGRESS → CLOSED (→ REOPEN) |
| **ClaimPayment** | id, claim_id, amount | PENDING_APPROVAL → APPROVED → PAID |
| **PremiumSchedule** | id, contract_id, installment_no, due_date, amount | — |
| **User** | id, name, role | role: UNDERWRITER / FINANCE / CLAIMS / ADMIN |

Cardinality: Insured 1—N Submission; Broker 1—N Submission; Submission 1—N Layer; Submission 1—1 Contract;
Contract 1—N Claim; Claim 1—N ClaimPayment; Contract 1—N PremiumSchedule.

## Services (anonymized modules) — used by /d2-architect /system-design /sequence /dfd

`auth` (Azure AD) · `submission-svc` · `contract-svc` · `claim-svc` · `pricing-svc` (fire/cat/professional
engines + WebSocket) · `receipt-svc` (premium receipts) · `reference-svc` (lookups).

## Fabricated additions (the real project lacks these — added to exercise the full shape/icon catalog)

Marked **(proposed)** wherever they appear:

- **Redis** — cache for sessions + reference-data lookups.
- **Kafka** — event bus for `submission.*` / `contract.*` / `claim.*` domain events (parallels the Azure
  Service Bus that really exists).
- **Elasticsearch** *(optional)* — search over submissions/contracts.
- **Cloud-migration variants** — `/drawio-aws`, `/drawio-gcp`, `/drawio-databricks` depict Atlas Re *as if*
  ported to those clouds (the real platform is Azure → `/drawio-azure` is closest to reality).

## Obfuscation rules (enforced)

- Project name → **"Atlas Re"** (never the real name).
- Entity *names* stay industry-standard; *field names* are generic (no real columns).
- **No real file paths** — `/code-flow` traces a small sample created under `code-flow/sample/`.
- No verbatim business rules; flows are simplified, representative versions.
- Fabricated services are labelled **(proposed)**.

## How to regenerate any diagram

Each subfolder's diagram is produced by its skill's real pipeline (not hand-drawn). Regenerate with the
command in `README.md`. All artifacts must pass `scripts/diagram-validate.ts`.
