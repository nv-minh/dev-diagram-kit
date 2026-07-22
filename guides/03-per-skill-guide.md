# 03 — Per-skill guide

**English** · [Tiếng Việt](../huong-dan/03-huong-dan-tung-skill.md)

> Each skill: call syntax, what to prepare, what it asks, where the output goes, a real example (compare with `example/food-delivery/`). All skills follow the **approval gate** — preview before writing.

Notation: `<slug>` = feature name in kebab-case (e.g. `food-delivery`). `"..."` = business description in words.

---

## 1. `/sequence` — Sequence diagram (Mermaid)

**Syntax:** `/sequence "<description>" --feature <slug>`

**Use when:** ≥2 roles interacting over time — who calls whom, what response, any webhook/callback, any error branch (alt/else).

**Prep:** not required. If `srs/{slug}-spec.md` exists the skill reads it for accuracy; without it, it still runs (asks to fill gaps).

**What the skill asks:** which actors are involved · message order · error/alt branches.

**Output:** `docs/{slug}/srs/{slug}-flows.md` — one section per flow, inline Mermaid `sequenceDiagram`. Auto compile-checked via `mermaid-verify.mjs`.

**Example:**
```
/sequence "Customer confirms the order; the system calls the payment gateway; if payment succeeds
then send the order to the restaurant, the restaurant confirms or declines; declining triggers a refund" --feature food-delivery
```
→ Compare with: `example/food-delivery/srs/food-delivery-flows.md` (2 sequences) + `_rendered/sequence-*.png`.

**Tip:** solid arrow `->>` = synchronous call, dashed arrow `-->>` = response/internal. Branches use `alt/else`.

---

## 2. `/activity` — Activity / flowchart (Mermaid)

**Syntax:** `/activity "<process description>" --feature <slug>`

**Use when:** a process with decision branches, **1-2 roles**, want it **embedded directly** in the .md so GitHub/Obsidian auto-render it. Many roles crossing lanes → use `/activity-swimlane`.

**What the skill asks:** sequential steps · decision points (question + branches) · loops if any.

**Output:** the same file `docs/{slug}/srs/{slug}-flows.md` (adds a flowchart section). Auto compile-checked.

**Example:**
```
/activity "Process an order from placement to completion: check payment, send to restaurant,
assign shipper, deliver, handle COD" --feature food-delivery
```
→ Compare with: the "Flow: End-to-end order processing" section + `_rendered/activity-order-flowchart.png`.

---

## 3. `/activity-swimlane` ⭐ — Real activity swimlane (PlantUML)

**Syntax:** `/activity-swimlane "<process description>" --feature <slug>`

**Use when:** **default for multi-role processes** — each role gets its own straight-column lane, nodes jump lanes according to who performs them. This is the clearest diagram type when there's a lot of cross-role interaction (Customer/System/Restaurant/Shipper/Support...).

**Needs internet** (renders via plantuml.com — see the privacy note in `01-install-tools.md`).

**What the skill asks:** roles/lanes (who does which step) · the steps · decision points · loops (retry/polling).

**Output:** `docs/{slug}/srs/{slug}-{name}-swimlane.puml` + `.svg`, image embedded into `flows.md`.

**Example:**
```
/activity-swimlane "Coordinate a food order: customer orders, the system calculates the total and calls payment,
the restaurant confirms, the system assigns a shipper, the shipper delivers; exceptions: payment fails,
restaurant declines, no shippers available, delivery fails and routes to support" --feature food-delivery
```
→ Compare with: `example/food-delivery/activity-swimlane/*.puml/.svg/.png` — **5 real lanes**.

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
/bpmn "End-to-end food ordering & delivery process, 4 roles Customer/System/Restaurant/Shipper,
including COD branch, payment failure, restaurant decline, no shippers available, delivery failure" --feature food-delivery
```
→ Compare with: `example/food-delivery/bpmn/order-fulfillment.ir.json` → `.bpmn`. Open the HTML editor to view/edit.

---

## 5. `/state` — State diagram (Mermaid)

**Syntax:** `/state <Entity> --feature <slug>`

**Use when:** an entity with ≥3 states + transition rules (trigger/condition), needing forbidden transitions documented too.

**What the skill asks:** which entity · the states · the trigger for each transition · forbidden transitions.

**Output:** `docs/{slug}/srs/{slug}-states.md` — one `## State: {Entity}` section per entity, Mermaid `stateDiagram-v2`.

**Example:**
```
/state Order --feature food-delivery
```
→ Compare with: `example/food-delivery/srs/food-delivery-states.md` (Order: 11 states + Payment: 7 states) + `_rendered/state-*.png`.

---

## 6. `/erd` — ERD embedded inline (Mermaid)

**Syntax:** `/erd --feature <slug>`

**Use when:** a data model for a BA to read in a document, embedded directly in the .md. Compact types (`string`/`int`/`date`).

**What the skill asks:** entities · business attributes per entity · relationships (cardinality 1:1 / 1:N / N:N).

**Output:** `docs/{slug}/srs/{slug}-erd.md` — Mermaid `erDiagram`. Auto compile-checked.

**Example:** `/erd --feature food-delivery` → `example/food-delivery/srs/food-delivery-erd.md` + `_rendered/erd-mermaid.png`.

---

## 7. `/d2-erd` — Nice-looking standalone ERD (D2)

**Syntax:** `/d2-erd --feature <slug>`

**Use when:** need a **nice-looking** image for slide/export — bold `sql_table` headers, PK/FK right-aligned, ELK layout tidier than Mermaid's.

**Needs:** `d2` binary.

**Output:** `docs/{slug}/d2-erd/{slug}.d2` + `.svg` (+ `.png` if Chrome is available). Renders via `.claude/skills/d2-activity/render.sh` (shared).

**Example:** `/d2-erd --feature food-delivery` → `example/food-delivery/d2-erd/food-delivery.svg/.png`.

---

## 8. `/dbdiagram` — DBML schema + SQL export

**Syntax:** `/dbdiagram --feature <slug>`

**Use when:** **handoff to dev / export SQL / dbdocs** — the level closest to dev among the ERD family. Real DB types (`uuid`/`varchar`), enums, indexes, defaults are first-class.

**Needs:** `@dbml/cli`.

**What the skill asks:** entities + business data types · enums · important indexes · relationships.

**Output:** `docs/{slug}/dbdiagram/{slug}.dbml` (source) + `.sql` (PostgreSQL export, auto-validated). Import into dbdiagram.io/dbdocs.io.

**Example:** `/dbdiagram --feature food-delivery` → `example/food-delivery/dbdiagram/food-delivery.dbml` + `.sql` (has 4 enums + indexes).

---

## 9. `/d2-activity` — Nice-looking standalone activity (D2)

**Syntax:** `/d2-activity "<process description>" --feature <slug>`

**Use when:** a flow with many branches needs a **nice-looking** standalone image (export/slide), no real swimlane needed. ELK layout: right-angle lines, less overlap.

**Needs:** `d2` binary.

**Output:** `docs/{slug}/d2-activity/{slug}.d2` + `.svg`/`.png`.

**Example:** `/d2-activity "End-to-end order processing" --feature food-delivery` → `example/food-delivery/d2-activity/food-delivery.svg`.

---

## 10. `/d2-architect` — System architecture diagram (D2)

**Syntax:** `/d2-architect --feature <slug>` (or `/d2-architect "<system description>"`)

**Use when:** an architecture picture — component/service/DB/nested external services. Mermaid doesn't draw this type nicely.

**Needs:** `d2` binary.

**What the skill asks:** the logical blocks · services · external services (payment gateway, maps, push) · call flows between them.

**Output:** `docs/{slug}/d2-architect/{slug}.d2` + `.svg`/`.png`.

**Example:** `/d2-architect --feature food-delivery` → `example/food-delivery/d2-architect/food-delivery.svg` (client apps → gateway → services + DB + queue → external services).

---

## 11. `/usecase-diagram` — Use case diagram (PlantUML)

**Syntax:** `/usecase-diagram --feature <slug>`

**Use when:** kicking off a feature, showing **system scope** — which actor can do which use case, `<<include>>`/`<<extend>>` relationships. A system boundary is required.

**Needs internet** (renders via plantuml.com).

**Prep:** if `srs/{slug}-spec.md` OR `usecases/{slug}-usecase-index.md` exists, the skill extracts use cases from it; without it, it asks.

**Output:** `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg`, image + Actors/Relationships table embedded into `{slug}-usecase-index.md`.

**Example:** `/usecase-diagram --feature food-delivery` → `example/food-delivery/usecases/food-delivery-usecase-diagram.svg` (5 actors, 9 use cases, include/extend).

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
/system-design --feature food-delivery
/system-design --feature food-delivery --component order-service
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

## General notes for every skill

- **Feature doesn't exist yet?** A diagram skill is an "entry point" — it derives the slug + asks about scope + creates the `docs/{slug}/` folder (see `rules/feature-bootstrap.md`). No dead end.
- **The kit serves devs doing BA work** — skills ask/choose details at the **right altitude for the reader**: business-communication diagrams (use case, business activity, C4 Context) use plain language; technical diagrams (ERD, DBML, sequence, C4 Container, `/scan-project`) **may use real technical detail** (column/endpoint/schema/framework) — no longer forbidden as in the old rule. See `rules/ba-conventions.md` Section 3.
- **Never writes files silently.** Always previews the plan (L1); an existing file gets a diff review (L2). You type `Y` before it writes.
- **Self-checks.** Mermaid compile-check; D2/DBML CLI validation; BPMN semcheck. Errors → the skill fixes them, never reports "done" with a broken diagram.
