---
type: srs-erd
feature: payment
updated: 2026-07-13
---

# payment — Entity Relationship Diagram

> Scope: feature payment

## Diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o{ PAYMENT_METHOD : "owns"
    ORDER ||--|{ TRANSACTION : "generates"
    TRANSACTION }o--o| PAYMENT_METHOD : "uses"
    TRANSACTION ||--o{ REFUND : "may be refunded"

    USER {
        string id PK
        string email "contact address, unique"
        string phone "phone number, may be empty"
        date created_at "creation date"
    }

    ORDER {
        string id PK
        string user_id FK "empty if guest"
        decimal amount "amount (VND)"
        string status "pending | confirmed | paid | cancelled"
        date created_at "creation date"
    }

    TRANSACTION {
        string id PK
        string order_id FK "which order it belongs to"
        string payment_method_id FK "empty if paid via redirect"
        string gateway "Momo | VNPay | Stripe"
        string status "pending | success | failed | refunded"
        decimal amount "transaction amount (VND)"
        date created_at "creation date"
    }

    PAYMENT_METHOD {
        string id PK
        string user_id FK "which customer it belongs to"
        string type "card | Momo | VNPay"
        string display_name "display name for the customer to choose"
        boolean is_default "default method?"
    }

    REFUND {
        string id PK
        string transaction_id FK "which transaction is refunded"
        decimal amount "refund amount (VND)"
        string reason "refund reason"
        string approved_by FK "admin who approved the refund"
        string status "pending | success | failed"
        date created_at "creation date"
    }
```

## Entity Reference

| Entity | Purpose | Key attributes |
|--------|---------|----------------|
| USER | Customer account (guests have no record) | email (unique), phone, creation date |
| ORDER | Order created from checkout | amount, order status |
| TRANSACTION | Each payment attempt for an order | payment gateway, status, amount |
| PAYMENT_METHOD | Saved method for the customer to reuse later | type, display name, default |
| REFUND | Each admin-approved refund | refund amount, reason, approving admin |

## Notes & Assumptions

- **Guests have no USER record** — `ORDER.user_id` is left empty; only logged-in customers can be tied to an account.
- **ORDER status is one-way:** pending → confirmed → paid, or branches to cancelled. No going back. (For transition details see `srs/payment-states.md`.)
- **TRANSACTION.payment_method_id is left empty** when the customer pays via redirect (Momo/VNPay redirect to the gateway page) — only the Stripe card flow records a saved method.
- **REFUND.approved_by** points to the approving admin's account — the business rule is that only an admin may create a refund order (BR-payment-004).
- **Admins share the USER table** with customers, distinguished by role — no separate ADMIN entity (Mermaid has no inheritance syntax; see the inheritance gotcha).
- **Refund v1 is full-refund only** — partial refunds deferred to Phase 1.1.
