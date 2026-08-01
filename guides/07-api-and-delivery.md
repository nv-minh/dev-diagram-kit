# 07 — API integration & delivery guide

**English** · [Tiếng Việt](../huong-dan/07-api-va-ban-giao.md)

> The API integration chain (wave 5) and the delivery & sync family (wave 6). Each skill: call syntax, what to prepare, what it asks, where the output goes. Everything follows the **approval gate** and passes **`doc-validate`** before reporting done.

Notation: `<slug>` = feature name in kebab-case. The 7-step chain order is mandatory (with two skip points); see `rules/api-integration.md`.

Simulated sessions for API + delivery skills (atlas-re / CatModel where committed). API steps 1–3: [`example/atlas-re/integration/`](example/atlas-re/integration/).

| Skill | Simulated session | Committed example (if any) |
|---|---|---|
| `/api-assess` | [`skills/api-assess/references/example-session.md`](../skills/api-assess/references/example-session.md) | [`api-assess.md`](example/atlas-re/integration/api-assess.md) |
| `/api-doc` | [`skills/api-doc/references/example-session.md`](../skills/api-doc/references/example-session.md) | [`api-summary-catmodel.md`](example/atlas-re/integration/api-summary-catmodel.md) |
| `/api-design` | [`skills/api-design/references/example-session.md`](../skills/api-design/references/example-session.md) | [`api-design.md`](example/atlas-re/integration/api-design.md) |
| `/api-map` | [`skills/api-map/references/example-session.md`](../skills/api-map/references/example-session.md) | [`api-map.md`](example/atlas-re/integration/api-map.md) |
| `/api-checklist` | [`skills/api-checklist/references/example-session.md`](../skills/api-checklist/references/example-session.md) | guide-only |
| `/api-test` | [`skills/api-test/references/example-session.md`](../skills/api-test/references/example-session.md) | guide-only |
| `/api-readiness` | [`skills/api-readiness/references/example-session.md`](../skills/api-readiness/references/example-session.md) | guide-only |
| `/jira` | [`skills/jira/references/example-session.md`](../skills/jira/references/example-session.md) | external-write |
| `/confluence` | [`skills/confluence/references/example-session.md`](../skills/confluence/references/example-session.md) | external-write |
| `/export` | [`skills/export/references/example-session.md`](../skills/export/references/example-session.md) | guide-only |
| `/userguide` | [`skills/userguide/references/example-session.md`](../skills/userguide/references/example-session.md) | guide-only |
| `/meeting` | [`skills/meeting/references/example-session.md`](../skills/meeting/references/example-session.md) | guide-only |
| `/inbox` | [`skills/inbox/references/example-session.md`](../skills/inbox/references/example-session.md) | guide-only |
| `/doc-review` | [`skills/doc-review/references/example-session.md`](../skills/doc-review/references/example-session.md) | guide-only |
| `/dashboard` | [`skills/dashboard/references/example-session.md`](../skills/dashboard/references/example-session.md) | guide-only |

Discovery → spec skills (21): [06 — BA documents](06-ba-documents.md).

---

## The API integration chain — `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`

### 1. `/api-assess` — build-vs-buy / provider selection [0]

**Syntax:** `/api-assess <feature> ["<need>"]`

**Use when:** the feature needs a 3rd-party integration and the provider is NOT yet chosen. **Skippable** when the provider is fixed (go straight to `/api-doc`).

**Output:** `docs/{slug}/integration/api-assess.md` — a weighted scorecard (candidates × criteria) + a recommendation citing the deciding criterion.

**Tip:** every score cell needs a basis (provider docs, a quote); unknowns → OQ, never a guessed SLA.

**Simulated session:** [`example-session.md`](../skills/api-assess/references/example-session.md)

---

### 2. `/api-doc` — digest the 3rd-party contract [1]

**Syntax:** `/api-doc <feature> [--provider <name>] <openapi-or-docs-source>`

**Use when:** the provider is chosen and you need the internal summary of what THEY offer. **Refuses to fabricate** — no source → ask for it.

**Output:** `docs/{slug}/integration/api-summary.md` (or `api-summary-{provider}.md`) — endpoints/auth/webhooks/rate-limits/errors, every row provenance-tagged to the spec page.

**Tip:** version the spec; a v2→v3 bump breaks the design silently.

**Simulated session:** [`example-session.md`](../skills/api-doc/references/example-session.md)

---

### 3. `/api-design` — Integration Blueprint [2]

**Syntax:** `/api-design <feature>`

**Use when:** design how WE orchestrate the integration. Needs the summary from `/api-doc`.

**Output:** `docs/{slug}/integration/api-design.md` — orchestration + state-map + source-of-truth per field + webhook handling (each with a reconciliation partner) + retry + degraded-UX.

**Tip:** a webhook with no reconciliation path is a silent data-loss bug — the self-check exists for it.

**Simulated session:** [`example-session.md`](../skills/api-design/references/example-session.md)

---

### 4. `/api-map` — 3-layer field mapping [3]

**Syntax:** `/api-map <feature> [--provider <name>]`

**Use when:** map fields end to end (provider payload ↔ our model ↔ UI). **Skippable** for pure trigger integrations with no data.

**Output:** `docs/{slug}/integration/api-map.md` — one row per field with owner (ours/theirs/derived) + direction + transform. Flags ownerless fields + ERD name mismatches.

**Simulated session:** [`example-session.md`](../skills/api-map/references/example-session.md)

---

### 5. `/api-checklist` — integration test outline [4]

**Syntax:** `/api-checklist <feature>`

**Use when:** outline what to test across the integration. Needs the design (+ map).

**Output:** `docs/{slug}/test/api/api-checklist.md` — `CHK-` rows with `test_layer` (own/3rd/mixed) + `direction` (out/in). Path-scoped CHK (independent of the feature-wide checklist).

**Simulated session:** [`example-session.md`](../skills/api-checklist/references/example-session.md)

---

### 6. `/api-test` — Bruno collection + test table [5]

**Syntax:** `/api-test <feature>`

**Use when:** prove the calls work. Needs the checklist.

**Output:** `docs/{slug}/test/api/api-tests.md` + `docs/{slug}/bruno/` (one collection per provider; `.bru` per automatable CHK; env vars for auth, never secrets).

**Tip:** sandbox only — never run against production from the doc; secrets never in `.bru`.

**Simulated session:** [`example-session.md`](../skills/api-test/references/example-session.md)

---

### 7. `/api-readiness` — go-live gate [6]

**Syntax:** `/api-readiness <feature>`

**Use when:** the integration is built and tested; gate the go-live. Reads the whole chain. **Hard-refuses "go" if `/api-test` results are absent.**

**Output:** `docs/{slug}/integration/api-readiness.md` — cutover sequence + feature flags (kill switch) + monitoring + rollback + SLA/deprecation + a go/no-go table (each gate item ready/blocked with evidence).

**Simulated session:** [`example-session.md`](../skills/api-readiness/references/example-session.md)

---

## Delivery & sync

### 8. `/jira` — push/sync stories to Jira

**Syntax:** `/jira <feature> [--push|--pull] [--dry-run]`

**Use when:** the stories are ready and you want them as Jira issues (and their status pulled back). **External-write hard HITL** — preview + Y per issue. Refuses `status: stale` stories (refresh via `/userstory` first).

**Output:** no local doc — Jira issues + the story-index `jira-key`/`status` columns + `sync-state.yaml` `mappings.jira`. One issue per story; re-pushes only changed stories (hash watermark).

**Simulated session:** [`example-session.md`](../skills/jira/references/example-session.md)

---

### 9. `/confluence` — publish docs to Confluence

**Syntax:** `/confluence <feature|doc-path> [confluence:<space-url>]`

**Use when:** you want the BA docs out as a Confluence page tree. **External-write hard HITL**; reuses the `/sync-confluence` mechanics (cloudId, markdown-read/html-write, drift detection). For keeping an existing page current with a code diff → `/sync-confluence`.

**Output:** Confluence pages + `sync-state.yaml` `mappings.confluence`. Drift (page changed outside the kit) → warn, review before overwrite.

**Simulated session:** [`example-session.md`](../skills/confluence/references/example-session.md)

---

### 10. `/export` — stakeholder package

**Syntax:** `/export [--scope all|<feature>] [--format md|html|pdf|docx]`

**Use when:** a stakeholder needs a dated bundle of the docs (with a change-history section rendered from the activity log). PDF/DOCX need `pandoc` (degrades to md+html if missing).

**Output:** `docs/exports/{date}-{scope}-package.{ext}` — a snapshot; the source docs remain the truth.

**Simulated session:** [`example-session.md`](../skills/export/references/example-session.md)

---

### 11. `/userguide` — end-user manual

**Syntax:** `/userguide [--feature <slug>] [--lang en|vi]`

**Use when:** end users need task-oriented guidance (how to do X, not how the system works). Phased — outline HARD STOP before generating. **Light mode only.**

**Output:** `docs/userguide/{name}.html` (entry, double-click) + a same-name bundle (`index.md`/`data.js`/`pages/*.md`/`images/`). Compact structure — only `.html` visible at top level.

**Simulated session:** [`example-session.md`](../skills/userguide/references/example-session.md)

---

### 12. `/meeting` — meeting notes

**Syntax:** `/meeting "<title>" [--type standup|review|kickoff]`

**Use when:** you need structured minutes. Decisions/blockers/actions live as **tables within the note file** (no separate files). Action items need an owner + deadline (ownerless ones are flagged).

**Output:** `docs/meetings/YYYY-MM-DD-{type}-{slug}.md`. A decision touching a doc links it (so `/gap`/`/dashboard` see it).

**Simulated session:** [`example-session.md`](../skills/meeting/references/example-session.md)

---

### 13. `/inbox` — capture + triage

**Syntax:** `/inbox "<note>"` (capture) or `/inbox --triage` (route)

**Use when:** you need to dump a raw note fast (capture), or sort the pile into the right skill (triage routes via the `/ba` table). Excluded from the activity log (raw capture isn't a business event).

**Output:** `docs/inbox/YYYY-MM-DD-{slug}.md` (capture); triage invokes the destination skill with the note carried through and marks the note routed.

**Simulated session:** [`example-session.md`](../skills/inbox/references/example-session.md)

---

### 14. `/doc-review` — multi-agent quality review

**Syntax:** `/doc-review <doc-path|feature> [--agents <list>]`

**Use when:** you want a quality audit (not coverage — that's `/gap`). Spawns reviewer agents, aggregates findings (BLOCKING/WARNING/SUGGESTION), applies accepted fixes as L2 diffs, drives the status transition. **Renamed from `/review`** (collided with the user-level pre-landing PR review).

**Output:** edits to the target docs + status transition. Agents return findings, never edit (the orchestrator applies).

**Simulated session:** [`example-session.md`](../skills/doc-review/references/example-session.md)

---

### 15. `/dashboard` — vault status

**Syntax:** `/dashboard [--open]`

**Use when:** you want the internal pulse — feature statuses, staleness, activity, Open-Question debt. Read-only scan; writes only the HTML + `feature-list.md`.

**Output:** `docs/_shared/dashboard.html` (one-file, self-contained) + regenerates `docs/feature-list.md`. OQ debt is the leading indicator — a feature with growing unresolved OQs is drifting from its sources.

**Simulated session:** [`example-session.md`](../skills/dashboard/references/example-session.md)
