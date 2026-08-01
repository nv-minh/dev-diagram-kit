---
type: skill-explainer
skill: ba
updated: 2026-08-01
---

# What is /ba and how does it run?

**English** · [Tiếng Việt](ba.vi.md)

## 1. What it is for

`/ba` is the **document router** — the document-side twin of `/diagram`. You describe the BA document you need in plain language ("write the business case for checkout", "spec out the refund rules", "user stories for payments") and it picks the right document skill, asks at most 2 clarifying questions, and runs that skill with your description carried through.

It exists because the kit's document family is large (discovery → spec → UI design → API integration → testing → traceability → delivery) and growing in waves. Instead of memorizing which of the doc skills fits, you describe the need.

## 2. The whole run — a diagram

```
you: /ba "write the business case for checkout v2"
        │
        ▼
┌─────────────────────────────┐
│ parse the need              │  quoted description, --feature, @file
├─────────────────────────────┤
│ match the routing table     │  rules/doc-selection.md = source of truth
├─────────────────────────────┤
│ ambiguous? ask ≤2 questions │  Q1 altitude/stage · Q2 scope/source
├─────────────────────────────┤
│ check the status column     │  planned (wave N) → tell you + suggest closest
├─────────────────────────────┤
│ announce + delegate         │  → /brd "checkout v2" (because business case)
└─────────────────────────────┘
```

## 3. The two questions

1. **Altitude/stage** — exploring, defining the business/product, specifying the system, designing screens, verifying, or delivering?
2. **Scope or source** — whole product or one feature? From your head, from legacy code/docs, or from a 3rd-party API?

If the routing table decides in one row, it asks nothing.

## 4. What it never does

- It never writes a document itself — it always delegates.
- It never routes to a skill that hasn't landed (`planned (wave N)` rows) — it tells you when the skill is coming and what to use today.
- Anything visual (flows, states, data models, architecture) hands off to `/diagram`.

## See also

- `explain-skills/diagram-selection.md` — the diagram-side signpost
- `rules/doc-selection.md` — the full decision matrix behind this router
