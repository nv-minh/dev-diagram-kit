# 03 — Per-skill guide (diagrams)

**English** · [Tiếng Việt](../huong-dan/03-huong-dan-tung-skill.md)

> Document skills (the `/brainstorm → /srs` chain, and later waves) live in [06 — BA documents](06-ba-documents.md).

> Each skill: call syntax, what to prepare, what it asks, where the output goes, a real example (compare with `example/atlas-re/`). All skills follow the **approval gate** — preview before writing.

Notation: `<slug>` = feature name in kebab-case (e.g. `atlas-re`). `"..."` = business description in words.

---

## 1. `/sequence` — Sequence diagram (Mermaid)

**Syntax:** `/sequence "<description>" --feature <slug>`

**Use when:** ≥2 roles interacting over time — who calls whom, what response, any webhook/callback, any error branch (alt/else).

**Prep:** not required. If `srs/{slug}-spec.md` exists the skill reads it for accuracy; without it, it still runs (asks to fill gaps).

**What the skill asks:** which actors are involved · message order · error/alt branches.

**Output:** `docs/{slug}/srs/{slug}-flows.md` — one section per flow, inline Mermaid `sequenceDiagram`. Auto compile-checked via `mermaid-verify.ts`.

**Example:**
```
/sequence "Underwriter creates a submission, the pricing engine rates it, the contract is bound;
if pricing fails the submission is declined" --feature atlas-re
```
→ Compare with: `example/atlas-re/srs/atlas-re-flows.md` (submission → quote → bind sequence).

**Tip:** solid arrow `->>` = synchronous call, dashed arrow `-->>` = response/internal. Branches use `alt/else`.

---

## 2. `/activity` — Activity / flowchart (Mermaid)

**Syntax:** `/activity "<process description>" --feature <slug>`

**Use when:** a process with decision branches, **1-2 roles**, want it **embedded directly** in the .md so GitHub/Obsidian auto-render it. Many roles crossing lanes → use `/activity-swimlane`.

**What the skill asks:** sequential steps · decision points (question + branches) · loops if any.

**Output:** the same file `docs/{slug}/srs/{slug}-flows.md` (adds a flowchart section). Auto compile-checked.

**Example:**
```
/activity "Handle a claim end-to-end: validate coverage, register, investigate, approve payment,
settle; if not covered, decline" --feature atlas-re
```
→ Compare with: the "Claim registration" activity section in `example/atlas-re/srs/atlas-re-flows.md`.

---

## 3. `/activity-swimlane` ⭐ — Real activity swimlane (PlantUML)

**Syntax:** `/activity-swimlane "<process description>" --feature <slug>`

**Use when:** **default for multi-role processes** — each role gets its own straight-column lane, nodes jump lanes according to who performs them. This is the clearest diagram type when there's a lot of cross-role interaction (Underwriter/Broker/Claims/Finance...).

**Needs internet** (renders via plantuml.com — see the privacy note in `01-install-tools.md`).

**What the skill asks:** roles/lanes (who does which step) · the steps · decision points · loops (retry/polling).

**Output:** `docs/{slug}/srs/{slug}-{name}-swimlane.puml` + `.svg`, image embedded into `flows.md`.

**Example:**
```
/activity-swimlane "Claim approval: Claims handler registers the claim, Underwriter validates coverage,
Claims requests payment, Finance approves and pays, Claims closes; exceptions: not covered → decline,
payment rejected" --feature atlas-re
```
→ Compare with: `example/atlas-re/activity-swimlane/atlas-re-claim-approval-swimlane.svg` — **3 real lanes**.

---

## 4. `/bpmn` — Standard OMG BPMN 2.0

**Syntax:** `/bpmn "<process description>" --feature <slug>`

**Use when:** a multi-role process needs **standard OMG notation** (gateway ◇, event ○, message flow) or **import into a BPM tool** (Camunda, Bizagi, Signavio, draw.io).

**Needs:** `npm install` in `.claude/skills/bpmn/engine/` (once).

**How it works (2 layers):** the AI reads the description → generates a **business IR JSON** (`{process}.ir.json` + `.src.json`) → the engine checks coverage (semcheck: enough actors/branches/errors?) → the engine auto-lays-out the swimlanes → exports `.bpmn` (standard XML) + an HTML editor. **The AI does not write XML/coordinates** — it only generates a correct business IR.

**What the skill asks:** lanes (roles) · the steps · gateways (branch points) · outcomes + error path.

**Output:** `docs/{slug}/bpmn/{process}.bpmn` + `{slug}-bpmn-editor.html`.

**Example:**
```
/bpmn "End-to-end claim approval, 3 roles Claims handler/Underwriter/Finance,
including the coverage check branch, payment approval branch, decline and rejection paths" --feature atlas-re
```
→ Compare with: `example/atlas-re/bpmn/claim-approval.ir.json` → `.bpmn`. Open the HTML editor to view/edit.

---

## 5. `/state` — State diagram (Mermaid)

**Syntax:** `/state <Entity> --feature <slug>`

**Use when:** an entity with ≥3 states + transition rules (trigger/condition), needing forbidden transitions documented too.

**What the skill asks:** which entity · the states · the trigger for each transition · forbidden transitions.

**Output:** `docs/{slug}/srs/{slug}-states.md` — one `## State: {Entity}` section per entity, Mermaid `stateDiagram-v2`.

**Example:**
```
/state Contract --feature atlas-re
```
→ Compare with: `example/atlas-re/srs/atlas-re-states.md` (Contract + Claim state machines).

---

## 6. `/erd` — ERD embedded inline (Mermaid)

**Syntax:** `/erd --feature <slug>`

**Use when:** a data model for a BA to read in a document, embedded directly in the .md. Compact types (`string`/`int`/`date`).

**What the skill asks:** entities · business attributes per entity · relationships (cardinality 1:1 / 1:N / N:N).

**Output:** `docs/{slug}/srs/{slug}-erd.md` — Mermaid `erDiagram`. Auto compile-checked.

**Example:** `/erd --feature atlas-re` → `example/atlas-re/srs/atlas-re-erd.md`.

---

## 7. `/d2-erd` — Nice-looking standalone ERD (D2)

**Syntax:** `/d2-erd --feature <slug>`

**Use when:** need a **nice-looking** image for slide/export — bold `sql_table` headers, PK/FK right-aligned, ELK layout tidier than Mermaid's.

**Needs:** `d2` binary.

**Output:** `docs/{slug}/d2-erd/{slug}.d2` + `.svg` (+ `.png` if Chrome is available). Renders via `.claude/skills/d2-activity/render.sh` (shared).

**Example:** `/d2-erd --feature atlas-re` → `example/atlas-re/d2-erd/atlas-re.svg`.

---

## 8. `/dbdiagram` — DBML schema + SQL export

**Syntax:** `/dbdiagram --feature <slug>`

**Use when:** **handoff to dev / export SQL / dbdocs** — the level closest to dev among the ERD family. Real DB types (`uuid`/`varchar`), enums, indexes, defaults are first-class.

**Needs:** `@dbml/cli`.

**What the skill asks:** entities + business data types · enums · important indexes · relationships.

**Output:** `docs/{slug}/dbdiagram/{slug}.dbml` (source) + `.sql` (PostgreSQL export, auto-validated). Import into dbdiagram.io/dbdocs.io.

**Example:** `/dbdiagram --feature atlas-re` → `example/atlas-re/dbdiagram/atlas-re.dbml` (5 enums + indexes).

---

## 9. `/d2-activity` — Nice-looking standalone activity (D2)

**Syntax:** `/d2-activity "<process description>" --feature <slug>`

**Use when:** a flow with many branches needs a **nice-looking** standalone image (export/slide), no real swimlane needed. ELK layout: right-angle lines, less overlap.

**Needs:** `d2` binary.

**Output:** `docs/{slug}/d2-activity/{slug}.d2` + `.svg`/`.png`.

**Example:** `/d2-activity "Claim handling with reopen branch" --feature atlas-re` → `example/atlas-re/d2-activity/atlas-re.svg`.

---

## 10. `/d2-architect` — System architecture diagram (D2)

**Syntax:** `/d2-architect --feature <slug>` (or `/d2-architect "<system description>"`)

**Use when:** an architecture picture — component/service/DB/nested external services. Mermaid doesn't draw this type nicely.

**Needs:** `d2` binary.

**What the skill asks:** the logical blocks · services · external services (payment gateway, maps, push) · call flows between them.

**Output:** `docs/{slug}/d2-architect/{slug}.d2` + `.svg`/`.png`.

**Example:** `/d2-architect --feature atlas-re` → `example/atlas-re/d2-architect/atlas-re.svg` (client apps → gateway → services + DB + queue → external services).

---

## 11. `/usecase-diagram` — Use case diagram (PlantUML)

**Syntax:** `/usecase-diagram --feature <slug>`

**Use when:** kicking off a feature, showing **system scope** — which actor can do which use case, `<<include>>`/`<<extend>>` relationships. A system boundary is required.

**Needs internet** (renders via plantuml.com).

**Prep:** if `srs/{slug}-spec.md` OR `usecases/{slug}-usecase-index.md` exists, the skill extracts use cases from it; without it, it asks.

**Output:** `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg`, image + Actors/Relationships table embedded into `{slug}-usecase-index.md`.

**Example:** `/usecase-diagram --feature atlas-re` → `example/atlas-re/usecases/atlas-re-usecase-diagram.svg` (4 actors, 6 use cases, include/extend).

---

## 12. `/system-design` — C4 system design (D2 + HTML presentation)

**Syntax:** `/system-design --feature <slug>` or `/system-design "<system description>"` `[--component <container>]`

**Use when:** need to **tell a multi-level system story** using the C4 model — zooming gradually from System Context → Container → Component — for stakeholders/architects, with a nice presentation to present/export. Different from `/d2-architect` (only **1 single-level context picture**): `/system-design` produces **multi-level C4 layers** + exports an **HTML** dark-theme presentation (PNG/PDF export).

**Needs:** `d2` binary (shares `render.sh` with the `/d2-*` family).

**What the skill asks:** who the system serves (users/roles) · which external systems it calls · the apps/services/data stores inside + the main flows between them · (if drawing L3) the components inside 1 chosen container.

**Output:** in `docs/{feature}/system-design/` (or `docs/_shared/system-design/` if it's a whole-system architecture not tied to a feature):
- `{slug}-context.d2` + `.svg` — C4 L1 System Context.
- `{slug}-container.d2` + `.svg` — C4 L2 Container.
- `{slug}-component-{container}.d2` + `.svg` — C4 L3 (only with `--component <container>`).
- `{feature}-system-design.html` — dark-theme presentation combining the levels + a Copy-PNG/PNG/PDF export toolbar.
- `{feature}-system-design-index.md` — metadata + level table.

By default draws **L1 Context + L2 Container**; L3 Component is only drawn with `--component <container>` (or an explicit request). Every level must PASS compilation before reporting done.

**Example:**
```
/system-design --feature atlas-re
/system-design --feature atlas-re --component order-service
```

---

## 13. `/scan-project` — Scan brownfield → architecture diagram set (D2 + Mermaid)

**Syntax:** `/scan-project [path] [--focus <dir>] [--module <name>] [--lang en|vi]`

**Use when:** you already have an **existing (brownfield) codebase** and want to **auto-generate the architecture diagram set from CODE** — no manual description. This is a skill for **devs doing BA work**: unlike every other skill (which draw from a description/interview), this one **reads source code** to reverse-engineer. It's fine to use real technical details (service/table/endpoint names) here — that's the scan's strength.

**Needs:** `d2` binary (shares `render.sh` with the `/d2-*` family and `/system-design`) + Node/`mmdc` for the Mermaid sequence. Run inside the repo (git preferred).

**Prep:** not required. If README/docs/ADR exist the skill cross-checks them (favoring **code** on conflicts, noting discrepancies). Large codebase → use `--focus <dir>` to scan one area deeply.

**How it works (2 phases — HARD STOP in the middle):**
1. **Phase 1 — scan:** reads the manifest (stack/framework), spawns a subagent to scan modules + relationships + data model + main flows + external systems → writes `scan-plan.md` (list of modules + proposed diagrams to tick + gaps) → **WAITS for your confirmation** (`Y` / drop a diagram / add more).
2. **Phase 2 — generate:** only after you confirm does it generate + render + compile-check each diagram.

**Output:** fixed at `docs/_shared/architecture/` (architecture is cross-feature):
- `{proj}-context.d2/.svg` + `{proj}-container.d2/.svg` — C4 overview.
- `{proj}-modules.d2/.svg` — module map + relationships (marks circular ones).
- `{proj}-module-{name}.d2/.svg` — detail for 1 module (per `--module` or the top-N largest modules).
- `{proj}-erd.d2/.svg` — ERD from schema/ORM/migrations (skipped if no schema).
- `{proj}-flows.md` — 2-3 main-flow sequences (Mermaid).
- `{proj}-architecture-index.md` (+ optionally `{proj}-architecture.html` presentation deck). Each element is tagged with **confidence** (✅ read with certainty / 🔵 inferred / 🟡 guessed) + **provenance** (which file it came from).

**Example:**
```
/scan-project                       # scan the project in the current folder
/scan-project ./services/api --focus src
/scan-project --module payment      # only (re)draw detail for 1 module
```

**Tip:** running it again is **update mode** (L2 diff per file). Where it can't read something → the skill marks 🟡 + asks, never invents. Does NOT draw deployment (port/replica/CI) — that's the wrong altitude.

---

## 14. `/sync-confluence` — Sync code/conversation → Confluence (edits in place)

**Syntax:** `/sync-confluence confluence:<url> [--from <git-range>] [--preview] [--lang en|vi]`

**Use when:** **code just changed** OR something was **just decided** in conversation, and you need to **update a Confluence page to match** — editing **the right section, in place**, keeping the rest + macros/tables intact. A skill for **devs doing BA work**.

**Requires (prerequisite):** **Atlassian MCP authenticated** (`/mcp` → choose Atlassian/Rovo) + **write** permission on the target page. This is **not** a render tool — if MCP isn't authenticated the skill stops and reports how to fix it. See `01-install-tools.md` Section 7.

**2 modes (auto-detected from context):**
- **code** (has `--from`, or context is "code was just changed"): analyzes `git diff <range>` → extracts changes affecting docs (API/endpoint, field/schema, flow, business rule, config). Ignores pure refactor/formatting.
- **conversation** (no `--from`): extracts decisions/specs just settled in the current conversation.

**Always previews + confirms before writing** — writing to Confluence is an **irreversible** side effect (no git rollback). `--preview` = dry-run: only prints the diff, STOPS, doesn't write.

**Output:** updates the Confluence page **in place** (`updateConfluencePage`, with a `versionMessage`) + (optionally) an audit footer comment + state at `.claude/state/atlassian/sync-state.yaml` (hash/watermark to detect pages changed outside the kit). Does **NOT** write any diagram file into `docs/`.

**Example:**
```
/sync-confluence confluence:https://your.atlassian.net/wiki/spaces/ENG/pages/12345/Spec
/sync-confluence confluence:<url> --from HEAD~5..HEAD
/sync-confluence confluence:<url> --preview
```

**Tip:** if the page changed since the last sync → the skill warns of a conflict before overwriting. If no matching section is found → the skill proposes a new section, asks where to place it, doesn't force it in. Full conventions: `rules/atlassian-sync.md`.

---

## 15. `/mindmap` — Scope / idea decomposition tree (Mermaid)

**Syntax:** `/mindmap "<topic>" [--feature <slug>]`

**Use when:** decomposing scope/requirements/ideas into a tree (discovery phase, before the SRS). A pure scope/idea tree — no actors (actors + functions → `/usecase-diagram`).

**What the skill asks:** the main areas/domains · 2-4 items under each (auto-detected from `brainstorms/*.md` if present).

**Output:** `docs/{slug}/srs/{slug}-scope.md` — one `## Scope: {Topic}` section per mindmap, Mermaid `mindmap`. Auto compile-checked.

**Example:**
```
/mindmap "Reinsurance submission scope: intake, pricing, binding, reporting" --feature atlas-re
```

**Tip:** keep the tree ≤3 levels deep — deeper renders messily; collapse deep leaves into one node. Re-running the same topic = update mode.

---

## 16. `/journey` — User journey map (Mermaid)

**Syntax:** `/journey "<experience>" [--feature <slug>]`

**Use when:** mapping the user's experience over time, step by step, each step with a **satisfaction rating 1-5** and the actor(s). Experience + emotion across touchpoints — complements `/usecase-diagram` (function) and `/activity` (process).

**What the skill asks:** persona (whose journey) · phases/touchpoints in order · the step in each phase · satisfaction (1-5) · actors per step.

**Output:** `docs/{slug}/srs/{slug}-journey.md` — one `## Journey: {Name}` section, Mermaid `journey`. Auto compile-checked; the report calls out the pain steps (rating ≤2).

**Example:**
```
/journey "First-time broker submitting a risk: search, submit, wait for quote, bind" --feature atlas-re
```

**Tip:** the rating is the value of this diagram — never put 5 everywhere; the low ratings surface the pain points that link to improvements.

---

## 17. `/timeline` — Roadmap / milestone timeline (Mermaid)

**Syntax:** `/timeline "<subject>" [--feature <slug>] [--shared]`

**Use when:** a roadmap of milestones grouped by period (quarter/year/phase) — PM-light. **Not a Gantt**: no task bars, no dependencies, no critical path (deliberately out of scope).

**What the skill asks:** the periods in order · 1-3 milestones per period + a short note each (it won't invent dates).

**Output:** `docs/{slug}/{slug}-timeline.md` (or `docs/_shared/_shared-timeline.md` with `--shared` for a cross-feature roadmap) — Mermaid `timeline`. Auto compile-checked.

**Example:**
```
/timeline "Atlas-RE rollout" --feature atlas-re
```

**Tip:** keep period labels short (`2026 Q1`, `Phase 1`) — a long label breaks the column layout. `Milestone : note` — colon-space separates milestone from note.

---

## 18. `/orgchart` — Org / reporting-hierarchy chart (D2)

**Syntax:** `/orgchart [--feature <slug>] [--shared] [--stakeholder]`

**Use when:** kickoff or stakeholder analysis — who reports to whom, grouped by team/department. It's the reporting tree, NOT a RACI or a process ("who does which step" → `/activity-swimlane`).

**Needs:** `d2` binary (shares `render.sh` with the `/d2-*` family).

**What the skill asks:** the head (top of the tree) · people/roles + titles · who each reports to · optional team/department grouping.

**Output:** `docs/{slug}/orgchart/{slug}-orgchart.d2` + `.svg` (or `docs/_shared/orgchart/` with `--shared`). With `--stakeholder`: also `{slug}-stakeholder.md` — a power/interest map (Mermaid `quadrantChart`) with an engagement strategy per quadrant.

**Example:**
```
/orgchart --feature atlas-re --stakeholder
```

**Tip:** cross-team (dotted-line) reporting → the edge gets the label `dotted-line` + a dashed stroke. >15 people → split by department.

---

## 19. `/dfd` — Data Flow Diagram L0 + L1 (D2)

**Syntax:** `/dfd [--feature <slug>]` (or `/dfd "<data flow description>"`)

**Use when:** answering "where does the data go, which process touches it, which store holds it" — the DATA view, orthogonal to `/system-design` (structure) and `/sequence` (time). Draws 2 levels: L0 context (1 process = the whole system + external entities) and L1 exploded (2-5 numbered processes + data stores).

**Needs:** `d2` binary. Reads `srs/{slug}-erd.md`/spec/brainstorm as the source if present.

**What the skill asks:** external entities · processes (numbered 1.0, 1.1…) · data stores (D1, D2…) · the data on each arrow.

**Output:** `docs/{slug}/dfd/{slug}-dfd-l0.d2/.svg` + `{slug}-dfd-l1.d2/.svg` + `{slug}-dfd-index.md`.

**Example:**
```
/dfd --feature atlas-re
```

**Tip:** every edge label is the DATA moving ("order", "payment result"), not the action ("send"). A data store is just "D1 Orders" — no columns; columns belong to `/erd`.

---

## 20. `/code-flow` — Trace one function/module in code → flow diagram

**Syntax:** `/code-flow <path-or-symbol> [--as sequence|activity|state] [--feature <slug>]`

**Use when:** you want a flow diagram of ONE specific function/module in EXISTING code — the skill reads the code (via a read-only subagent), traces the call chain/branches/states, and auto-picks the diagram type (sequence by default). The targeted sibling of `/scan-project` (whole-codebase set).

**How it works (2 phases — HARD STOP in the middle):** Phase 1 trace (read-only, returns findings + `file:line` evidence) → L1 preview → you confirm → Phase 2 renders the Mermaid diagram.

**Output:** `docs/{slug}/code-flow/{slug}-flow.md` — the diagram + a **Code provenance** table (element → `file:line` → ✅ read / 🔵 inferred). Auto compile-checked.

**Example:**
```
/code-flow src/orders/placeOrder.ts
/code-flow OrderService.placeOrder --as state
```

**Tip:** traces 1 level of calls by default (deeper calls noted as "→ name"); what it can't read is marked 🔵 "needs confirmation" — never invented.

---

## 21. `/drawio-aws` · `/drawio-azure` · `/drawio-gcp` · `/drawio-databricks` — Cloud architecture in draw.io (real stencils)

**Syntax:** `/drawio-aws "<architecture>" [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence]` (same for `-azure`/`-gcp`/`-databricks`)

**Use when:** the architecture diagram must show the ACTUAL cloud services with their official icons (AWS/Azure/GCP/Databricks stencils) — e.g. an architecture review. Just a generic logical picture → `/system-design`/`/d2-architect`.

**Needs:** the aws + databricks catalogs ship in-repo; **azure/gcp need a one-time download**: `bash scripts/drawio-catalog-ensure.sh azure` (or `gcp`). **PNG/SVG export needs the draw.io desktop app** — without it the `.drawio` is still the deliverable (opens in draw.io web / VS Code drawio extension).

**How it works:** stencils are resolved from a ground-truth catalog (`drawio-build search` — no hallucinated icons); the skill writes a `{slug}.src.ts` build-script (topology only, no coordinates) → the engine lays out + validates (hard gate: stencils exist, nesting order, Well-Architected advice) → emits `{slug}.drawio`.

**Output:** `docs/{slug}/drawio/{slug}.src.ts` + `{slug}.drawio` (+ `.svg` if the desktop app is present).

**Example:**
```
/drawio-aws "serverless image pipeline: S3 upload → Lambda → DynamoDB" --feature atlas-re
```
→ Compare with: `example/atlas-re/drawio/atlas-re-aws.drawio` (+ the azure/gcp/databricks variants).

**Tip:** validator warnings (e.g. a DB in a public subnet) are Well-Architected advice, not errors — read them.

---

## 22. `/drawio-sequence` — UML sequence diagram in draw.io

**Syntax:** `/drawio-sequence "<flow description>" [--feature <slug>]`

**Use when:** a sequence needs to be a standalone, **editable `.drawio`** with real UML lifelines (design handoff, devs keep editing) — vs `/sequence` (Mermaid, inline in Markdown). Sync calls, returns (`reply`), async signals, self-calls.

**How it works:** you declare participants (left→right in call order; `actor: true` = stick figure) + an ordered message list; `renderSequence` computes every coordinate — straight horizontal arrows, no hand layout.

**Output:** `docs/{slug}/drawio/{slug}.src.ts` + `{slug}.drawio` (+ `.svg` if the draw.io desktop app is present — otherwise open in draw.io web / VS Code).

**Example:**
```
/drawio-sequence "Broker submits a risk → API → pricing service rates → async event to reporting;
API returns the quote" --feature atlas-re
```
→ Compare with: `example/atlas-re/drawio/atlas-re-sequence.drawio`.

**Tip:** solid+filled = sync call, dashed+open = reply, solid+open = async. One main scenario per diagram — split alternates into a second `.drawio`. No activation bars yet (v1).

---

## 23. `/diagram` + `/gallery` — The router + the one-file deck

**`/diagram` syntax:** `/diagram "<what you want to show>" [--recommend-only]`

**Use when:** you're unsure which of the ~20 diagram skills fits. Describe the need → the router asks **at most 2** disambiguating questions (source: description or code? · inline vs standalone image?) → prints `→ /<skill> <args> (reason)` and **runs that skill**. `--recommend-only` = stop after the recommendation. Source of truth: `rules/diagram-selection.md`.

**`/gallery` syntax:** `/gallery --feature <slug> [--out path.html]`

**Use when:** handing a stakeholder ONE self-contained HTML that collects every diagram of a feature — one tab per diagram type (Architecture / Data model / Process / …), dark theme, Copy/PNG/PDF export toolbar. Opens by double-click, no server.

**Output:** `/diagram` writes nothing itself (it delegates); `/gallery` → `docs/{slug}/{slug}-gallery.html` (inlines every `.svg`; Mermaid blocks rendered via `mmdc` if installed, else skipped).

**Example:**
```
/diagram "where does the order data go, which DB holds it"   # → routes to /dfd
/gallery --feature atlas-re
```

**Tip:** rebuild the gallery after adding diagrams (idempotent — re-run overwrites). No `mmdc` → inline Mermaid diagrams are skipped while the D2/PlantUML/BPMN SVGs are still included.

---

## General notes for every skill

- **Feature doesn't exist yet?** A diagram skill is an "entry point" — it derives the slug + asks about scope + creates the `docs/{slug}/` folder (see `rules/feature-bootstrap.md`). No dead end.
- **The kit serves devs doing BA work** — skills ask/choose details at the **right altitude for the reader**: business-communication diagrams (use case, business activity, C4 Context) use plain language; technical diagrams (ERD, DBML, sequence, C4 Container, `/scan-project`) **may use real technical detail** (column/endpoint/schema/framework) — no longer forbidden as in the old rule. See `rules/ba-conventions.md` Section 3.
- **Never writes files silently.** Always previews the plan (L1); an existing file gets a diff review (L2). You type `Y` before it writes.
- **Self-checks.** Mermaid compile-check; D2/DBML CLI validation; BPMN semcheck. Errors → the skill fixes them, never reports "done" with a broken diagram.
