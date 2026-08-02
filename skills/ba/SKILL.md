---
name: ba
description: Router — describe the BA document you need, and this picks the right document skill for you (asks at most 2 clarifying questions, then runs it). Use when you're unsure which of the kit's document skills fits — requirements, specs, tests, traceability, delivery. Trigger with `/ba "<what you need>"` or just describe the need. Source of truth: `rules/doc-selection.md`. Anything visual routes to `/diagram`.
allowed-tools: Read, Glob, Grep
user-invocable: true
argument-hint: "\"<what you need>\" [--recommend-only]"
---

# /ba — Which document should I write? (router)

> You describe a need → this skill asks **at most 2** disambiguating questions → picks the right document skill → **runs it** with the inferred args. The document-side twin of `/diagram`. The decision matrix that backs this lives in `@../../rules/doc-selection.md` (source of truth — keep them in sync when a skill is added/removed).

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`

## Goal

Map a natural-language need → exactly ONE document skill, then delegate to it. Do NOT write any document yourself — you decide + hand off.

## Constraints

- **Decide, don't write.** Output the chosen skill + the command, then RUN that skill (unless `--recommend-only`). Do not invent a document type outside the matrix.
- **At most 2 questions** — only when the need is genuinely ambiguous between 2-3 candidates. If one skill clearly fits → ask nothing, just run it.
- **Mirror `doc-selection.md`** — the routing table below is a condensed copy; the rule is the source of truth. If they disagree, the rule wins.
- **Planned skills are not routable** — rows marked `planned (wave N)` in `doc-selection.md` have not landed. Tell the user "coming in wave N" + suggest the closest existing skill instead of delegating.
- **Pass context through** — when you delegate, carry the user's description + any answers into the target skill's args (e.g. `--feature`, the quoted description).
- **Anything visual → `/diagram`.** If the need is a picture, hand off to the diagram router with the description carried through.

## Routing table (condensed — full version + status column in `doc-selection.md`)

| The user wants… | Skill | Key disambiguator |
|---|---|---|
| Learn the project / set up shared context (first time in this repo) | `/discover` | project-level; produces the context brief every row below consumes |
| Explore a raw idea | `/brainstorm` | nothing structured yet |
| What users need (personas, pains, context of use) | `/urd` | user altitude |
| The business case (objectives, ROI, scope, risks) | `/brd` | money/why altitude |
| What we'll build for ONE feature (capabilities P0/P1/P2) | `/prd-epic` | feature altitude |
| Define the WHOLE product (pitch, themes, Feature Map) | `/prd` | product singleton, `_product/` |
| Sequence/prioritize features (RICE-lite, Now/Next/Later) | `/roadmap` | plan doc; visual milestones = `/timeline` |
| Precise system behavior (FR/NFR/BR/error matrix) | `/srs` | system-shall altitude |
| Actor-goal narrative with extensions (Cockburn text) | `/usecase` | visual scope = `/usecase-diagram` |
| Dev-ready backlog items (INVEST) | `/userstory` | slices of FRs; needs the SRS |
| Pass/fail conditions per story (Given-When-Then) | `/ac` | edits stories in place |
| Screen-navigation map | `/user-flow` | prerequisite for wireframes |
| Sketch screens (chat-reviewable / browser) | `/wireframe-ascii` / `/wireframe-html` | ASCII in chat vs HTML in browser; both need the user flow |
| Clickable demo | `/prototype-html` | navigation works; needs the wireframes |
| Push wireframes to Figma frames | `/figma` | external-write hard gate; URLs in the index |
| Integrate a 3rd-party API (full 7-step chain) | `/api-assess` (provider open) / `/api-doc` (provider fixed) → `/api-design` → `/api-map` → `/api-checklist` → `/api-test` → `/api-readiness` | assess→doc→design→map→checklist→test→readiness |
| Test coverage outline / full test cases | `/test-checklist` / `/test-cases` | outline vs executable steps; needs the SRS |
| What's missing/orphaned across docs | `/gap` | cross-doc coverage matrix; read-only |
| Scope changed — impact + rollback | `/cr` | change request + guided apply |
| Legacy docs/code → BA documents | `/reverse-doc` | source-driven; code→diagrams = `/scan-project` |
| Push stories to Jira / publish docs to Confluence | `/jira` / `/confluence` | issues vs pages; code-diff→page = `/sync-confluence` (exists) |
| Stakeholder package / end-user manual | `/export` / `/userguide` | snapshot vs manual |
| Meeting minutes / quick capture | `/meeting` / `/inbox` | structured vs raw |
| Doc quality review / vault status | `/doc-review` / `/dashboard` | findings vs overview |
| **Anything visual** | **`/diagram`** | the two routers cross-reference, never overlap |

## The 2 questions you may ask (pick only the relevant ones)

1. **Altitude/stage — where are you in the lifecycle?** → exploring (brainstorm) · defining the business/product (urd/brd/prd-epic/prd/roadmap) · specifying the system (srs/usecase/userstory/ac) · designing screens (user-flow/wireframes) · verifying (test-*/gap) · delivering (jira/confluence/export/userguide).
2. **Scope or source — whole product or one feature? From your head, from legacy code/docs, or from a 3rd-party API?** → whole product = `/prd`/`/roadmap`; one feature = the per-feature skills; legacy source = `/reverse-doc`; 3rd-party API = the `/api-*` chain.

## Approach

1. **Parse the need** from the arg or the conversation. Note any `--feature`, a quoted description, an `@file`, or an existing doc path.
2. **Match the routing table.** If exactly one row fits → skip to step 4.
3. **Ambiguous (2-3 candidates)?** Ask the **single most decisive** question above (at most 2 questions total, batched). Do NOT ask if the table already decides.
4. **Check status in `doc-selection.md`.** Row is `✓` → announce + delegate: print one line — `→ /<skill> <inferred args> (because <one-line reason>)` — then **RUN that skill** with the description/args carried through. With `--recommend-only`, stop after the announcement. Row is `planned (wave N)` → say "「/<skill>」 lands in wave N — closest available today: /<alternative>" and stop.
5. **If the need is a picture** (flow, states, data model, architecture) → hand off to **`/diagram`** with the description carried through.

## Examples

- `/ba "I have an idea for a loyalty points feature"` → **`/brainstorm`** (raw idea). Run `/brainstorm "loyalty points" --feature loyalty-points`.
- `/ba "write the business case for checkout v2"` → **`/brd`** (objectives/ROI altitude).
- `/ba "spec out exactly what the system must do for refunds"` → **`/srs`** (system-shall).
- `/ba "PRD"` → ask Q2 (whole product → `/prd`; one feature → `/prd-epic`).
- `/ba "what should we build first next quarter"` → **`/roadmap`**.
- `/ba "show how the login flow works"` → **`/diagram`** (visual need — hand off).
- `/ba "user stories for the payment feature"` → **`/userstory payment`** (needs `srs/payment-spec.md`; without it the skill routes you to `/srs` first).
- `/ba "wireframes for checkout"` → **`/wireframe-ascii checkout`** (needs `srs/checkout-userflow.md` `stage: approved`; without it the skill routes you to `/user-flow` first).

## Gotchas

- **Don't over-ask** — if the table decides in one row, run the skill with zero questions.
- **No `planned` rows remain** — the matrix is fully shipped; if you see a `planned` row it's a drift bug (kit-lint catches it).
- **Never route to a planned skill** — check the status column; recommending vaporware wastes the user's time.
- **Keep in sync** — when a document skill is added/removed, update this table AND `doc-selection.md` together (flip `planned` → `✓` in the landing PR).
- **You are not a writer** — never draft a document yourself; always delegate.
- **No project context yet?** The Context block above shows whether a `/discover` profile exists. If absent, suggest `/discover` first — it gives every later skill the shared domain brief (actors, glossary, rules) so they stop re-asking.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/doc-selection.md (source of truth — full decision matrix + status column + disambiguation)
- @../../rules/project-context.md (the /discover artifact + loader — nudge /discover when no profile)
- @../../rules/diagram-selection.md (the diagram-side matrix — hand visual needs to `/diagram`)
- @../../rules/feature-bootstrap.md
