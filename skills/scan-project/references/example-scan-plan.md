<!--
REFERENCE for /scan-project — sample scan-plan.md produced at the end of Phase 1 (before the HARD STOP). Not a real plan.
Points to imitate: a module table with Source (path) + Confidence (✅/🔵/🟡) columns; a tick-to-select diagram checklist;
a Gaps section listing uncertain spots to ask the user BEFORE drawing.
-->
# shop-api — Architecture scan plan

> Root: `./` · Stack: Node.js + Express + Prisma (PostgreSQL) · Scan: 2026-07-25

## Detected modules (5)

| Module | Responsibility | Source (path) | Confidence |
|---|---|---|---|
| `api` | HTTP routes + controllers | `src/api/**` | ✅ |
| `auth` | Login, JWT, middleware | `src/auth/**` | ✅ |
| `orders` | Create/approve orders, status | `src/orders/**` | ✅ |
| `payments` | Call payment gateway, webhook | `src/payments/**` | ✅ |
| `notifications` | Send email/SMS | `src/notifications/**` | 🔵 (inferred from imports) |

**External systems (3):** Stripe (`src/payments/stripe.ts`) ✅ · SendGrid (`src/notifications/email.ts`) ✅ · Redis cache (`src/lib/redis.ts`) 🔵

**Data store:** PostgreSQL via Prisma — schema `prisma/schema.prisma` (6 models) ✅

## Proposed diagrams (tick to select)

- [x] C4 overview — Context + Container (api / auth / orders / payments / notifications + Postgres + Stripe/SendGrid/Redis)
- [x] Module map + relationships (5 modules; ⚠️ suspected circular `orders ↔ payments`)
- [x] ERD (6 models from `prisma/schema.prisma`: User, Order, OrderItem, Payment, Product, Notification)
- [x] Sequence: «Checkout + payment» · «Stripe webhook updates order»
- [ ] Module detail: `payments` (the most complex module)

## Gaps / needs confirmation

- 🟡 `orders ↔ payments` looks bidirectionally dependent — a real circular or just via interface/event? (need your confirmation before drawing)
- 🟡 Does `notifications` call synchronously or via a queue? No clear queue client found.
- 🟡 There is a `src/legacy/` directory of unclear use — include it in the diagram?

→ Confirm / adjust the points above, then I'll draw the diagram set into `docs/_shared/architecture/`.
