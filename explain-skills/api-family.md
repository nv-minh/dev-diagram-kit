---
type: skill-explainer
skill: api-family
updated: 2026-08-01
---

# The API integration family — the 7-step chain

**English** · [Tiếng Việt](api-family.vi.md)

## 1. Why this family exists

Integrating a 3rd-party API is a predictable sequence of decisions, and doing them out of order is where integrations go wrong (designing the orchestration before you've read the contract; testing before you've designed the retry). These seven skills enforce the order, each reading the upstream one.

## 2. The chain

```
/api-assess ──▶ /api-doc ──▶ /api-design ──▶ /api-map ──▶ /api-checklist ──▶ /api-test ──▶ /api-readiness
  [0] choose     [1] digest   [2] blueprint    [3] fields   [4] test outline   [5] prove    [6] go/no-go
  (skip if       (no fabricate)               (skip if no   (test_layer +      (Bruno)      (hard-refuse
   fixed)                                       data map)    direction)                      without [5])
```

## 3. Quick pick

| You need to… | Run |
|---|---|
| Decide build-vs-buy / pick a provider | `/api-assess` |
| Understand what their API actually offers | `/api-doc <source>` |
| Design how we orchestrate it | `/api-design` |
| Map fields provider ↔ our model ↔ UI | `/api-map` |
| Outline the integration tests | `/api-checklist` |
| Prove the calls work (Bruno) | `/api-test` |
| Gate the go-live | `/api-readiness` |

## 4. The two skip points + the one hard gate

- **[0] `/api-assess`** is skippable when the provider is already fixed (contract signed, internal mandate) — go straight to `/api-doc`. Don't fabricate a faux decision record.
- **[3] `/api-map`** is skippable for pure trigger/webhook integrations with no data to map — say so and move on.
- **[6] `/api-readiness` hard-refuses a "go" if `/api-test` results are absent** — you can't enable what you haven't proven works. The doc still gets written, with verdict `blocked`.

## 5. The disciplines that make integrations not bite

- **`/api-doc` refuses to fabricate** — every endpoint/auth/limit has provenance to the spec page; unknowns become OQs. A guessed rate limit is the most dangerous fabrication in the kit.
- **`/api-design` pairs every webhook with a reconciliation path** — a webhook with no "if missed, poll X" fallback is a silent data-loss bug; the self-check catches it.
- **`/api-design` declares source-of-truth per field** — when both sides hold a value, who's right? Answered at design time, not at the first conflict.
- **`/api-map` flags ownerless fields + ERD name mismatches** — a field with no owner drifts; a silent rename breaks the model.

## 6. The shared rule

`rules/api-integration.md` defines the chain order, the skip conditions, the `test_layer`/`direction` column semantics, the provider-suffix rule, the Bruno layout, and the go/no-go table. Every skill references it.

## 7. Worked example

`example/atlas-re/integration/` carries an `api-design.md` + `api-map.md` for a fictional catastrophe-model data provider (the integration that feeds the pricing engine), showing the orchestration, webhook⇄reconciliation pairing, and the 3-layer field map with owners.

## See also

- `explain-skills/testing-family.md` — `/test-checklist`/`/test-cases`, the feature-wide counterpart to `/api-checklist`/`/api-test`
- `rules/api-integration.md` — the chain contract
- `rules/doc-selection.md` — the full matrix + wave status
