# 07 — API integration & delivery guide

**English** · [Tiếng Việt](../huong-dan/07-api-va-ban-giao.md)

> The API integration chain (wave 5) and, later, the delivery & sync family (wave 6). Each skill: call syntax, what to prepare, what it asks, where the output goes. Everything follows the **approval gate** and passes **`doc-validate`** before reporting done.

Notation: `<slug>` = feature name in kebab-case. The 7-step chain order is mandatory (with two skip points); see `rules/api-integration.md`.

---

## The API integration chain — `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`

### 1. `/api-assess` — build-vs-buy / provider selection [0]

**Syntax:** `/api-assess <feature> ["<need>"]`

**Use when:** the feature needs a 3rd-party integration and the provider is NOT yet chosen. **Skippable** when the provider is fixed (go straight to `/api-doc`).

**Output:** `docs/{slug}/integration/api-assess.md` — a weighted scorecard (candidates × criteria) + a recommendation citing the deciding criterion.

**Tip:** every score cell needs a basis (provider docs, a quote); unknowns → OQ, never a guessed SLA.

---

### 2. `/api-doc` — digest the 3rd-party contract [1]

**Syntax:** `/api-doc <feature> [--provider <name>] <openapi-or-docs-source>`

**Use when:** the provider is chosen and you need the internal summary of what THEY offer. **Refuses to fabricate** — no source → ask for it.

**Output:** `docs/{slug}/integration/api-summary.md` (or `api-summary-{provider}.md`) — endpoints/auth/webhooks/rate-limits/errors, every row provenance-tagged to the spec page.

**Tip:** version the spec; a v2→v3 bump breaks the design silently.

---

### 3. `/api-design` — Integration Blueprint [2]

**Syntax:** `/api-design <feature>`

**Use when:** design how WE orchestrate the integration. Needs the summary from `/api-doc`.

**Output:** `docs/{slug}/integration/api-design.md` — orchestration + state-map + source-of-truth per field + webhook handling (each with a reconciliation partner) + retry + degraded-UX.

**Tip:** a webhook with no reconciliation path is a silent data-loss bug — the self-check exists for it.

---

### 4. `/api-map` — 3-layer field mapping [3]

**Syntax:** `/api-map <feature> [--provider <name>]`

**Use when:** map fields end to end (provider payload ↔ our model ↔ UI). **Skippable** for pure trigger integrations with no data.

**Output:** `docs/{slug}/integration/api-map.md` — one row per field with owner (ours/theirs/derived) + direction + transform. Flags ownerless fields + ERD name mismatches.

---

### 5. `/api-checklist` — integration test outline [4]

**Syntax:** `/api-checklist <feature>`

**Use when:** outline what to test across the integration. Needs the design (+ map).

**Output:** `docs/{slug}/test/api/api-checklist.md` — `CHK-` rows with `test_layer` (own/3rd/mixed) + `direction` (out/in). Path-scoped CHK (independent of the feature-wide checklist).

---

### 6. `/api-test` — Bruno collection + test table [5]

**Syntax:** `/api-test <feature>`

**Use when:** prove the calls work. Needs the checklist.

**Output:** `docs/{slug}/test/api/api-tests.md` + `docs/{slug}/bruno/` (one collection per provider; `.bru` per automatable CHK; env vars for auth, never secrets).

**Tip:** sandbox only — never run against production from the doc; secrets never in `.bru`.

---

### 7. `/api-readiness` — go-live gate [6]

**Syntax:** `/api-readiness <feature>`

**Use when:** the integration is built and tested; gate the go-live. Reads the whole chain. **Hard-refuses "go" if `/api-test` results are absent.**

**Output:** `docs/{slug}/integration/api-readiness.md` — cutover sequence + feature flags (kill switch) + monitoring + rollback + SLA/deprecation + a go/no-go table (each gate item ready/blocked with evidence).

---

## Delivery & sync (wave 6 — landing)

The delivery family (`/jira` `/confluence` `/export` `/userguide` `/meeting` `/inbox` `/doc-review` `/dashboard`) ships in wave 6. This guide will gain their sections then; until then, see `rules/doc-selection.md` for their output paths and the `planned (wave 6)` status.
