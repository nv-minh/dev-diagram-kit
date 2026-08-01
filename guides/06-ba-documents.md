# 06 — BA documents guide

**English** · [Tiếng Việt](../huong-dan/06-tai-lieu-ba.md)

> Each document skill: call syntax, what to prepare, what it asks, where the output goes, an example (compare with `example/atlas-re/`). Everything follows the **approval gate** (preview before writing) and every generated doc passes **`doc-validate`** (frontmatter, IDs, links) before the skill reports done. Diagram skills live in [03 — Per-skill guide](03-per-skill-guide.md). Later waves (spec, wireframes, API, testing, delivery) will extend this guide as they land — see the status column in `rules/doc-selection.md`.

Notation: `<slug>` = feature name in kebab-case (e.g. `atlas-re`). `"..."` = a business description in words.

---

## 1. `/ba` — the document router

**Syntax:** `/ba "<what you need>"` (or just describe the need)

**Use when:** you know you need a document but not which skill — it asks at most 2 questions (lifecycle stage · scope/source) and runs the right one. Skills from unlanded waves get a "coming in wave N" answer plus today's closest alternative.

---

## 2. `/brainstorm` — idea exploration

**Syntax:** `/brainstorm "<idea>" [--feature <slug>]`

**Use when:** you have a raw idea and nothing structured yet. This is the root of the discovery chain — its Open Questions cascade into every later doc.

**Prep:** none. A brand-new feature is fine — the skill derives the slug and creates the folder after your L1 approval.

**What it asks:** round 1 — the problem, who is affected, what success looks like; round 2 (optional) — an exploration angle you pick (what-if flips, persona role-play, scale stress).

**Output:** `docs/{slug}/brainstorms/{idea-slug}.md` — problem, users, sketch, decisions, out-of-scope, Open Questions.

**Example:** `/brainstorm "let cedents track claim approval status themselves"` → creates `docs/claim-tracking/brainstorms/self-service-status.md`, then suggests `/urd claim-tracking`.

---

## 3. `/urd` — User Requirements Document

**Syntax:** `/urd <feature>`

**Use when:** you need personas, context of use, and user needs pinned down before arguing about business value or system behavior.

**Prep:** a brainstorm helps (it's read automatically) but isn't required.

**What it asks:** who the personas are, their goals and frustrations, where/when they'd use this, needs per persona.

**Output:** `docs/{slug}/{slug}-urd.md` — mints `UN-{slug}-001…` needs, each with a source. These IDs are what the BRD's objectives must cover.

---

## 4. `/brd` — Business Requirements Document

**Syntax:** `/brd <feature>`

**Use when:** you need the business case — objectives with measurable success criteria, scope, cost-benefit, risks.

**Prep:** the URD (read automatically). Without it the BRD still runs; the coverage column stays empty until `/urd` lands.

**What it asks:** why now, objectives + how each is measured, in/out of scope, cost/benefit items **with their basis** (no basis → it becomes an OQ, never an invented number), risks.

**Output:** `docs/{slug}/{slug}-brd.md` — mints `BO-{slug}-01…`. Section names are fixed (the OQ cascade greps them).

---

## 5. `/prd-epic` — feature PRD

**Syntax:** `/prd-epic <feature>`

**Use when:** the business case is agreed and you need to decide WHAT to build — capabilities prioritized P0/P1/P2.

**Prep:** the BRD (read automatically).

**What it asks:** what must be true at launch (P0 probe), nice-to-haves, explicit non-goals, sequencing constraints.

**Output:** `docs/{slug}/{slug}-prd.md` — mints `CAP-{slug}-01…` covering the BOs. P0 means "the feature is pointless without it" — the skill challenges P0 inflation.

---

## 6. `/srs` — Software Requirements Specification

**Syntax:** `/srs <feature> [--section <n>]`

**Use when:** you need precise, testable system behavior — the source every downstream skill (stories, tests, diagrams) consumes.

**Prep:** the PRD (read automatically). The whole upstream chain reduces what the skill has to ask.

**What it asks:** actors + system boundary, then per capability: trigger, observable outcome, failure modes, rules, data touched.

**Output:** `docs/{slug}/srs/{slug}-spec.md` — Section 2 FRs ("the system shall … when …"), Section 3 NFRs (with measures), Section 4 Business Rules, Section 5 Error Matrix. Mints `FR-/NFR-/BR-/E-{slug}-NNN`. Afterwards it offers the diagram menu (`/sequence`, `/state`, `/erd`, …).

**Tip:** the Error Matrix is where the spec earns its keep — a 12-FR spec with 1 error row is under-specified.

---

## 7. `/prd` — product PRD (singleton)

**Syntax:** `/prd [--update]`

**Use when:** defining the WHOLE product — pitch, problem, users, themes, the Feature Map, metrics. Once per product, updated in place. "PRD for the checkout feature" → `/prd-epic checkout` instead.

**Output:** `docs/_product/prd.md`. The Feature Map is where feature slugs are born.

---

## 8. `/roadmap` — prioritized plan (singleton)

**Syntax:** `/roadmap [--format now-next-later|quarter]`

**Use when:** sequencing the Feature Map — RICE-lite scores (every score needs a stated basis), a Now/Next/Later plan with deviation notes, a typed dependency map.

**Output:** `docs/_product/roadmap.md`. Reads the product PRD one-way; re-run it to sync after Feature Map changes. Visual milestones for stakeholders → `/timeline` (a diagram skill).

---

## General notes

- **The chain order matters but isn't mandatory** — each skill runs standalone (group A creates the feature; missing upstream docs = soft notes, not failures). The chain is where the IDs get their meaning: UN → BO → CAP → FR.
- **Open Questions cascade** — an unresolved OQ reappears downstream until answered (`rules/resolve-oqs.md`). No skill invents an answer to close a gap.
- **Update mode** — re-running any skill on an existing doc shows an L2 diff; IDs are never renumbered.
- **Big docs get a reviewer** — past complexity thresholds (e.g. SRS ≥15 FRs), `@doc-reviewer` checks coverage, fabrication, and altitude before the skill reports done.
