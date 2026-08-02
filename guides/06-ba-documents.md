# 06 — BA documents guide

**English** · [Tiếng Việt](../huong-dan/06-tai-lieu-ba.md)

> Each document skill: call syntax, what to prepare, what it asks, where the output goes, an example (compare with `example/atlas-re/`). Everything follows the **approval gate** (preview before writing) and every generated doc passes **`doc-validate`** (frontmatter, IDs, links) before the skill reports done. Diagram skills live in [03 — Per-skill guide](03-per-skill-guide.md). Spec, wireframes, API, testing, and delivery skills are covered below and in [07 — API and delivery](07-api-and-delivery.md); the routing matrix is `rules/doc-selection.md`.

Notation: `<slug>` = feature name in kebab-case (e.g. `atlas-re`). `"..."` = a business description in words.

Each skill below links a **simulated session** — a realistic chat transcript (your prompts, the skill's questions, L1/L2 gates, and output excerpts). Sessions are grounded in the [`example/atlas-re/`](example/atlas-re/) artifacts where they exist.

| Skill | Simulated session | Committed example (if any) |
|---|---|---|
| `/discover` | [`skills/discover/references/example-session.md`](../skills/discover/references/example-session.md) | [`example/_shared/`](example/_shared/) (context set) |
| `/ba` | [`skills/ba/references/example-session.md`](../skills/ba/references/example-session.md) | router only |
| `/brainstorm` | [`skills/brainstorm/references/example-session.md`](../skills/brainstorm/references/example-session.md) | [`claim-approval-idea.md`](example/atlas-re/brainstorms/claim-approval-idea.md) |
| `/urd` | [`skills/urd/references/example-session.md`](../skills/urd/references/example-session.md) | [`atlas-re-urd.md`](example/atlas-re/atlas-re-urd.md) |
| `/brd` | [`skills/brd/references/example-session.md`](../skills/brd/references/example-session.md) | [`atlas-re-brd.md`](example/atlas-re/atlas-re-brd.md) |
| `/prd-epic` | [`skills/prd-epic/references/example-session.md`](../skills/prd-epic/references/example-session.md) | [`atlas-re-prd.md`](example/atlas-re/atlas-re-prd.md) |
| `/srs` | [`skills/srs/references/example-session.md`](../skills/srs/references/example-session.md) | [`atlas-re-spec.md`](example/atlas-re/srs/atlas-re-spec.md) |
| `/prd` | [`skills/prd/references/example-session.md`](../skills/prd/references/example-session.md) | singleton (`docs/_product/`) |
| `/roadmap` | [`skills/roadmap/references/example-session.md`](../skills/roadmap/references/example-session.md) | singleton (`docs/_product/`) |
| `/usecase` | [`skills/usecase/references/example-session.md`](../skills/usecase/references/example-session.md) | [`example/atlas-re/README.md`](example/atlas-re/README.md) |
| `/userstory` | [`skills/userstory/references/example-session.md`](../skills/userstory/references/example-session.md) | same |
| `/ac` | [`skills/ac/references/example-session.md`](../skills/ac/references/example-session.md) | same |
| `/user-flow` | [`skills/user-flow/references/example-session.md`](../skills/user-flow/references/example-session.md) | same |
| `/wireframe-ascii` | [`skills/wireframe-ascii/references/example-session.md`](../skills/wireframe-ascii/references/example-session.md) | same |
| `/wireframe-html` | [`skills/wireframe-html/references/example-session.md`](../skills/wireframe-html/references/example-session.md) | same |
| `/prototype-html` | [`skills/prototype-html/references/example-session.md`](../skills/prototype-html/references/example-session.md) | same |
| `/figma` | [`skills/figma/references/example-session.md`](../skills/figma/references/example-session.md) | external-write (no local artifact) |
| `/test-checklist` | [`skills/test-checklist/references/example-session.md`](../skills/test-checklist/references/example-session.md) | same |
| `/test-cases` | [`skills/test-cases/references/example-session.md`](../skills/test-cases/references/example-session.md) | same |
| `/gap` | [`skills/gap/references/example-session.md`](../skills/gap/references/example-session.md) | same |
| `/cr` | [`skills/cr/references/example-session.md`](../skills/cr/references/example-session.md) | same |
| `/reverse-doc` | [`skills/reverse-doc/references/example-session.md`](../skills/reverse-doc/references/example-session.md) | brownfield reconstruction |

API integration + delivery skills (15): [07 — API and delivery](07-api-and-delivery.md).

---

## `/discover` — learn the project once (run first)

**Syntax:** `/discover [--update] [--tier1-only]`

**Use when:** you've just opened a repo (or the shared context has gone stale). It deep-scans the code + docs, asks at most 5 business questions code can't answer, and writes a small, always-loaded **context brief** every later skill consumes — so they stop re-asking "what does this system do?" and stop inventing names.

**Prep:** none. Valid on an empty/greenfield vault too (interview-led).

**What it asks (≤5, one at a time):** business purpose & who pays · glossary collisions (business word ≠ code identifier) · business rules not visible in code · actor authority · the one gotcha.

**Output:** `docs/_shared/project-context.md` (Tier 1, ≤60 lines) + `docs/_shared/context/*.md` (Tier 2 depth). Every claim tagged ✅/🔵/🟡 + `file:path`. `--update` refreshes without re-asking answered questions and never overwrites your hand-edited sections.

**Simulated session:** [`example-session.md`](../skills/discover/references/example-session.md) · **Worked example:** [`example/_shared/`](example/_shared/) (distilled from `example/atlas-re/DOMAIN.md`).

**Differs from `/scan-project`:** `/scan-project` reverse-engineers **architecture diagrams** from code; `/discover` produces the **context brief** other skills read.

---

## 1. `/ba` — the document router

**Syntax:** `/ba "<what you need>"` (or just describe the need)

**Use when:** you know you need a document but not which skill — it asks at most 2 questions (lifecycle stage · scope/source) and runs the right one. Skills from unlanded waves get a "coming in wave N" answer plus today's closest alternative.

**Simulated session:** [`example-session.md`](../skills/ba/references/example-session.md)

---

## 2. `/brainstorm` — idea exploration

**Syntax:** `/brainstorm "<idea>" [--feature <slug>]`

**Use when:** you have a raw idea and nothing structured yet. This is the root of the discovery chain — its Open Questions cascade into every later doc.

**Prep:** none. A brand-new feature is fine — the skill derives the slug and creates the folder after your L1 approval.

**What it asks:** round 1 — the problem, who is affected, what success looks like; round 2 (optional) — an exploration angle you pick (what-if flips, persona role-play, scale stress).

**Output:** `docs/{slug}/brainstorms/{idea-slug}.md` — problem, users, sketch, decisions, out-of-scope, Open Questions.

**Example:** `/brainstorm "let cedents track claim approval status themselves"` → creates `docs/claim-tracking/brainstorms/self-service-status.md`, then suggests `/urd claim-tracking`.

**Simulated session:** [`example-session.md`](../skills/brainstorm/references/example-session.md)

---

## 3. `/urd` — User Requirements Document

**Syntax:** `/urd <feature>`

**Use when:** you need personas, context of use, and user needs pinned down before arguing about business value or system behavior.

**Prep:** a brainstorm helps (it's read automatically) but isn't required.

**What it asks:** who the personas are, their goals and frustrations, where/when they'd use this, needs per persona.

**Output:** `docs/{slug}/{slug}-urd.md` — mints `UN-{slug}-001…` needs, each with a source. These IDs are what the BRD's objectives must cover.

**Simulated session:** [`example-session.md`](../skills/urd/references/example-session.md)

---

## 4. `/brd` — Business Requirements Document

**Syntax:** `/brd <feature>`

**Use when:** you need the business case — objectives with measurable success criteria, scope, cost-benefit, risks.

**Prep:** the URD (read automatically). Without it the BRD still runs; the coverage column stays empty until `/urd` lands.

**What it asks:** why now, objectives + how each is measured, in/out of scope, cost/benefit items **with their basis** (no basis → it becomes an OQ, never an invented number), risks.

**Output:** `docs/{slug}/{slug}-brd.md` — mints `BO-{slug}-01…`. Section names are fixed (the OQ cascade greps them).

**Simulated session:** [`example-session.md`](../skills/brd/references/example-session.md)

---

## 5. `/prd-epic` — feature PRD

**Syntax:** `/prd-epic <feature>`

**Use when:** the business case is agreed and you need to decide WHAT to build — capabilities prioritized P0/P1/P2.

**Prep:** the BRD (read automatically).

**What it asks:** what must be true at launch (P0 probe), nice-to-haves, explicit non-goals, sequencing constraints.

**Output:** `docs/{slug}/{slug}-prd.md` — mints `CAP-{slug}-01…` covering the BOs. P0 means "the feature is pointless without it" — the skill challenges P0 inflation.

**Simulated session:** [`example-session.md`](../skills/prd-epic/references/example-session.md)

---

## 6. `/srs` — Software Requirements Specification

**Syntax:** `/srs <feature> [--section <n>]`

**Use when:** you need precise, testable system behavior — the source every downstream skill (stories, tests, diagrams) consumes.

**Prep:** the PRD (read automatically). The whole upstream chain reduces what the skill has to ask.

**What it asks:** actors + system boundary, then per capability: trigger, observable outcome, failure modes, rules, data touched.

**Output:** `docs/{slug}/srs/{slug}-spec.md` — Section 2 FRs ("the system shall … when …"), Section 3 NFRs (with measures), Section 4 Business Rules, Section 5 Error Matrix. Mints `FR-/NFR-/BR-/E-{slug}-NNN`. Afterwards it offers the diagram menu (`/sequence`, `/state`, `/erd`, …).

**Tip:** the Error Matrix is where the spec earns its keep — a 12-FR spec with 1 error row is under-specified.

**Simulated session:** [`example-session.md`](../skills/srs/references/example-session.md)

---

## 7. `/prd` — product PRD (singleton)

**Syntax:** `/prd [--update]`

**Use when:** defining the WHOLE product — pitch, problem, users, themes, the Feature Map, metrics. Once per product, updated in place. "PRD for the checkout feature" → `/prd-epic checkout` instead.

**Output:** `docs/_product/prd.md`. The Feature Map is where feature slugs are born.

**Simulated session:** [`example-session.md`](../skills/prd/references/example-session.md)

---

## 8. `/roadmap` — prioritized plan (singleton)

**Syntax:** `/roadmap [--format now-next-later|quarter]`

**Use when:** sequencing the Feature Map — RICE-lite scores (every score needs a stated basis), a Now/Next/Later plan with deviation notes, a typed dependency map.

**Output:** `docs/_product/roadmap.md`. Reads the product PRD one-way; re-run it to sync after Feature Map changes. Visual milestones for stakeholders → `/timeline` (a diagram skill).

**Simulated session:** [`example-session.md`](../skills/roadmap/references/example-session.md)

---

## 9. `/usecase` — fully-dressed use cases

**Syntax:** `/usecase <feature> ["<goal>"]`

**Use when:** you need the actor-goal narrative — who wants what, the numbered main success scenario, and every way it can go wrong (extensions). Two modes: **discovery** (no SRS yet — elicits and leaves FR columns empty; a normal BA elicitation flow) and **downstream** (SRS present — full UC↔FR↔Error traceability).

**Output:** `docs/{slug}/usecases/uc-{slug}.md` (prose only, zero frontmatter) + the `{slug}-usecase-index.md` whose `## Use cases` table IS the per-feature traceability matrix. The visual scope picture stays `/usecase-diagram`.

**Tip:** extensions are conditions at a step (`3a`), not "and then" steps; each cites its `E-` code or an OQ.

**Simulated session:** [`example-session.md`](../skills/usecase/references/example-session.md)

---

## 10. `/userstory` — INVEST backlog stories

**Syntax:** `/userstory <feature> [--from FR-...]`

**Use when:** the SRS exists and you need dev-ready backlog items. **Refuses without `srs/{slug}-spec.md`** — slicing without FRs would be invention.

**Output:** `docs/{slug}/userstories/us-{NNN}.md` per story (zero frontmatter) + `{slug}-story-index.md` — the single source of status, priority, and jira-key. Every story links ≥1 FR; the index maps coverage both ways.

**Tip:** if a story reads identically to its FR, the slice is wrong — the story adds persona intent and slice rationale.

**Simulated session:** [`example-session.md`](../skills/userstory/references/example-session.md)

---

## 11. `/ac` — acceptance criteria (in-place)

**Syntax:** `/ac <feature> [us-NNN]`

**Use when:** stories exist and need to be verifiable. Adds/refines Given-When-Then INSIDE each `us-{NNN}.md` — no new files, every change is an L2 diff.

**Coverage rule:** per story — happy path + one AC per linked `E-` code + one per `BR-` boundary (tested at/below/above the threshold). Unknown boundary values become OQs, never invented numbers.

**Tip:** one When per AC. "When the user logs in and approves and…" is a scenario — split it.

**Simulated session:** [`example-session.md`](../skills/ac/references/example-session.md)

---

## 12. `/user-flow` — screen navigation map

**Syntax:** `/user-flow <feature> ["<description>"]`

**Use when:** before any wireframe — this file IS the flow division (`flow-slug` + screens `[n]` per flow) that `ascii-wireframe/` and `html-wireframe/` (wave 3) read. Asks the device question (mobile/tablet/desktop) first.

**Output:** `docs/{slug}/srs/{slug}-userflow.md` — Mermaid flowchart per flow, screens numbered `[n]` (stable across re-runs), every error path landing somewhere. On approval it stamps `stage: approved` + a flow hash — wave-3 skills gate on it.

**Tip:** navigation, not process — lanes/roles belong to `/activity-swimlane`; this is what the user sees, screen to screen.

**Simulated session:** [`example-session.md`](../skills/user-flow/references/example-session.md)

---

## 13. `/wireframe-ascii` — ASCII wireframes (chat-reviewable)

**Syntax:** `/wireframe-ascii <feature> [--flow <slug>]`

**Use when:** you want to sketch screens and iterate the layout right in chat. **Needs `srs/{slug}-userflow.md` with `stage: approved`** — refuses otherwise (route `/user-flow`). Asks the device first (pre-suggested from `primary_device`).

**Output:** `docs/{slug}/ascii-wireframe/{flow}.md` (zero frontmatter) — one ASCII frame per screen `[n]` + the 5-column description table (`# / Items / Control type / Data type / Description`). Updates `{slug}-wireframe-index.md` (screen metadata + per-screen purpose).

**Tip:** the description table is the real deliverable; 6 layers per element, sourced from the SRS/UC (cite FR/BR/E-), never fabricated — gaps get asked one at a time.

**Simulated session:** [`example-session.md`](../skills/wireframe-ascii/references/example-session.md)

---

## 14. `/wireframe-html` — B&W static HTML wireframes

**Syntax:** `/wireframe-html <feature> [--flow <slug>]`

**Use when:** chat ASCII isn't enough and you want device-width frames in a browser. Same gate as ASCII (needs the approved user flow); reuses ASCII content 1:1 — fidelity, not redesign.

**Output:** `docs/{slug}/html-wireframe/{flow}.html` per flow (B&W, no JS/color, screens `id="s{n}"`) + the entry `{slug}-wireframe.html` (sidebar TOC + flow map + iframes) + `{slug}-wireframe-html-index.md`. Double-click the entry to navigate all flows.

**Simulated session:** [`example-session.md`](../skills/wireframe-html/references/example-session.md)

---

## 15. `/prototype-html` — clickable prototype

**Syntax:** `/prototype-html <feature>`

**Use when:** you need to prove the navigation works — a click-through demo. Needs the wireframes (ASCII or HTML).

**Output:** one self-contained `docs/{slug}/html-design/{slug}-prototype.html` — every `Nav →` edge becomes a working link to `#s{n}`. Broken links are BLOCKING. Sets the `HTML prototype` column in the wireframe index.

**Simulated session:** [`example-session.md`](../skills/prototype-html/references/example-session.md)

---

## 16. `/figma` — push wireframes to Figma

**Syntax:** `/figma <feature> [--flow <slug>]`

**Use when:** the team works in Figma and you want the wireframes there as frames. **External-write hard gate** — previews every frame + target, needs an explicit Y; stops if the Figma MCP isn't authenticated.

**Output:** no local file — Figma frames; the URLs go into the `Figma` column of `{slug}-wireframe-index.md`. Content mirrors the wireframes (same `[n]`); never invents a URL.

**Simulated session:** [`example-session.md`](../skills/figma/references/example-session.md)

---

## 17. `/test-checklist` — test coverage outline

**Syntax:** `/test-checklist <feature>`

**Use when:** the SRS exists and you need a categorized outline of what to test — functional / boundary / error / non-functional. **Needs `srs/{slug}-spec.md`** (refuses without it).

**Output:** `docs/{slug}/test/checklist/{slug}-checklist-index.md` — `CHK-{NNN}` rows, each `Covers` an AC/FR/E, classified by layer. The `TC` column starts empty (filled by `/test-cases`).

**Tip:** one boundary `CHK-` per threshold (the at/below/above split happens at the case level); every `E-` code gets at least one row.

**Simulated session:** [`example-session.md`](../skills/test-checklist/references/example-session.md)

---

## 18. `/test-cases` — full test cases

**Syntax:** `/test-cases <feature> [--chk CHK-...]`

**Use when:** the checklist exists and you need executable cases. **Refuses without a checklist** — the canonical group-B refusal (route `/test-checklist`).

**Output:** `docs/{slug}/test/testcases/{slug}-testcase-index.md` — `TC-{NNN}` rows (steps / test data / expected), each `Expands CHK` links back. Back-fills the checklist's `TC` column. Boundary rows expand to the at/below/above triple; error rows to one TC per `E-`.

**Simulated session:** [`example-session.md`](../skills/test-cases/references/example-session.md)

---

## 19. `/gap` — cross-doc traceability matrix

**Syntax:** `/gap [--feature <slug>]`

**Use when:** you want proof the chain is complete — which FRs have no use case/story, which stories lack ACs, which error codes are documented but never tested, orphan docs, stale links. **Read-only** except for the one report it writes.

**Output:** `docs/_shared/traceability.md` — findings by rule (UN-without-BO … AC-without-CHK/TC, E-uncited, orphans, stale, CR-apply gaps). Points each gap at its owning skill to fix it.

**Tip:** the E-uncited finding is the sneaky high-value one — documented errors nobody handles.

**Simulated session:** [`example-session.md`](../skills/gap/references/example-session.md)

---

## 20. `/cr` — change request (record + apply)

**Syntax:** `/cr "<change>"` then `/cr --apply CR-{date}-{NNN}`

**Use when:** scope changes mid-flight and you need to record the impact + apply it safely. **Record first** (Impact Matrix citing real IDs + Rollback plan, no doc edits), **apply second** (per-doc L2 diffs in dependency order via `@change-tracker`).

**Output:** `docs/cr/CR-{YYYYMMDD}-{NNN}.md` — self-contained (Impact + Detailed Impact + Rollback live inside it). A target doc that changed since the CR was recorded → HARD STOP (re-assess).

**Tip:** apply ≠ record — a logged-but-not-applied CR is a normal pending state; never auto-apply.

**Simulated session:** [`example-session.md`](../skills/cr/references/example-session.md)

---

## 21. `/reverse-doc` — reconstruct from legacy sources

**Syntax:** `/reverse-doc <source-path...> [--feature <slug>]`

**Use when:** you inherited docx/pdf/images/code and need BA docs reconstructed from them. Source-driven (derives slugs from the sources), can create multiple features, **never overwrites** the official urd/brd/srs (sits alongside).

**Output:** `docs/{slug}/reverse-{slug}.md` (12-section framework + Section 0 provenance) + `docs/.reverse-plan.md` (HARD STOP before generating). Every claim tagged ✅/🔵/🟡; 🟡 → OQ.

**Tip:** confidence honesty is the whole skill — when unsure, drop a level; a reconstruction that looks more certain than its sources is dangerous.

**Simulated session:** [`example-session.md`](../skills/reverse-doc/references/example-session.md)

---

## General notes

- **The chain order matters but isn't mandatory** — each skill runs standalone (group A creates the feature; missing upstream docs = soft notes, not failures). The chain is where the IDs get their meaning: UN → BO → CAP → FR.
- **Open Questions cascade** — an unresolved OQ reappears downstream until answered (`rules/resolve-oqs.md`). No skill invents an answer to close a gap.
- **Update mode** — re-running any skill on an existing doc shows an L2 diff; IDs are never renumbered.
- **Big docs get a reviewer** — past complexity thresholds (e.g. SRS ≥15 FRs), `@doc-reviewer` checks coverage, fabrication, and altitude before the skill reports done.
