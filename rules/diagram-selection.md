---
paths:
  - ".claude/skills/sequence/**"
  - ".claude/skills/activity/**"
  - ".claude/skills/activity-swimlane/**"
  - ".claude/skills/d2-activity/**"
  - ".claude/skills/d2-erd/**"
  - ".claude/skills/d2-architect/**"
  - ".claude/skills/system-design/**"
  - ".claude/skills/scan-project/**"
  - ".claude/skills/state/**"
  - ".claude/skills/erd/**"
  - ".claude/skills/dbdiagram/**"
  - ".claude/skills/bpmn/**"
  - ".claude/skills/usecase-diagram/**"
  - ".claude/skills/dfd/**"
  - ".claude/skills/mindmap/**"
  - ".claude/skills/journey/**"
  - ".claude/skills/timeline/**"
  - ".claude/skills/code-flow/**"
  - ".claude/skills/diagram/**"
  - ".claude/skills/ba/**"
  - ".claude/skills/gallery/**"
  - ".claude/skills/orgchart/**"
  - ".claude/skills/drawio-aws/**"
  - ".claude/skills/drawio-azure/**"
  - ".claude/skills/drawio-gcp/**"
  - ".claude/skills/drawio-databricks/**"
  - ".claude/skills/drawio-sequence/**"
  - "docs/**/srs/*.md"
---

# Diagram Selection — Which diagram to use when

> Guide for IT-BAs: pick the right diagram type for each situation. Applies when writing `/srs`, `/brainstorm`, or when the user asks "draw a diagram for X".

## Document or diagram? (level-1 fork)

- Producing a **picture** (time-ordered calls, states, processes, data models, architecture) → this file (router `/diagram`).
- Producing **prose / tables / specs / tests / sync to external tools** (BRD, PRD, SRS, use cases, user stories, test cases, CR, Jira/Confluence…) → `rules/doc-selection.md` (router `/ba`).
- **Both** — a doc that embeds diagrams: the doc skill orchestrates and calls the diagram skills (e.g. `/srs` offers `/sequence` `/state` `/erd` after the spec).

## Decision matrix

| Business situation | Diagram type | Skill | Output file (1 fixed) | Reason |
|---|---|---|---|---|
| Multi-actor interaction over time (login, payment, webhook, OAuth callback) | **Sequence** | `/sequence` | `docs/{feature}/srs/{feature}-flows.md` (append section) | Clear time axis + messages between actors |
| Entity with many states + transitions (Account: unverified → verified → locked) | **State** | `/state` | `docs/{feature}/srs/{feature}-states.md` (append section per entity) | Forces you to think about every transition + trigger |
| **DEFAULT for multi-role business processes** (many decisions/lanes, cross-interactions — refund, onboarding, multi-level approval) | **Activity swimlane (PlantUML)** ⭐ | `/activity-swimlane` | `docs/{feature}/srs/{feature}-{slug}-swimlane.svg` + section embedded in `flows.md` | `\|Lane\|` keeps lanes in fixed straight columns, nodes jump lanes by actor — a REAL swimlane. Mermaid subgraphs skew, D2/ELK stretch lanes into "spaghetti" with many cross-edges. **This is the default choice for multi-role activity.** |
| **Simple 1-2 role flow** (little or no cross-lane) AND needs **inline auto-render** on GitHub/Obsidian (not an embedded image) | **Activity / Flowchart (Mermaid)** | `/activity` | `docs/{feature}/srs/{feature}-flows.md` (same file as sequence) | Embed the ` ```mermaid ` code directly in MD, GitHub/Obsidian renders it. Fits ONLY compact flows — with many lanes/cross-edges the subgraph skews, use `/activity-swimlane`. |
| Activity needs a **nice STANDALONE image** without a real swimlane (many branches, for stakeholders to view/export) | **Activity / Flowchart (D2)** | `/d2-activity` | `docs/{feature}/d2/{slug}.svg` (standalone) | ELK layout markedly tidier than Mermaid: right-angle edges, no overlap. But lanes skew with many cross-edges → multi-role flows with heavy interaction still prefer `/activity-swimlane`. |
| Multi-role process needing the OMG STANDARD or import into a BPM tool (Camunda/Bizagi) — onboarding, content approval, multi-department approval | **BPMN 2.0** | `/bpmn` | `docs/{feature}/bpmn/{process}.bpmn` + `_viewer.html` | Standard notation (◇gateway ○event \|lane\|), the `.bpmn` file imports into a workflow engine |
| High-level scope: actors + use cases (stakeholder kickoff, system boundary), package grouping when many UCs | **Use Case diagram (PlantUML)** | `/usecase-diagram` | `docs/{feature}/usecases/{feature}-usecase-diagram.puml` + `.svg` (image + Actors/Relationships table embedded into `{feature}-usecase-index.md`, no separate `.md` wrapper anymore) | Native `actor`/`usecase`/`package`, more UML-standard than the old Mermaid workaround |
| Data model + relationships — needs **inline embedding** on GitHub/Obsidian | **ER diagram (Mermaid)** | `/erd` | `docs/{feature}/srs/{feature}-erd.md` | Entity + attributes + cardinality, embedded directly in MD |
| Data model — needs a **nice STANDALONE image** (clear PK/FK, many entities, for stakeholders/export) | **ER diagram (D2)** | `/d2-erd` | `docs/{feature}/d2-erd/{feature}.svg` (standalone) | `sql_table` bold header + right-aligned PK/FK + business-labeled relationships; nicer than Mermaid `erDiagram` |
| Data model — needs **dev handoff / SQL export / dbdocs** (real DB types, enum, index) | **Schema (DBML)** | `/dbdiagram` | `docs/{feature}/dbdiagram/{feature}.dbml` (+ `.sql`) | Closest layer to dev: DBML imports into dbdiagram.io/dbdocs.io, `dbml2sql` exports real SQL. Enum/index/default are first-class (Mermaid/D2 lack them) |
| **System architecture — 1 quick context picture** (nested component/service/DB/external service, single level, dropped into a doc) | **Architecture (D2)** | `/d2-architect` | `docs/{feature}/d2-architect/{slug}.svg` or `_shared/` | Nested container + cylinder/person shapes; fast, single image |
| **Multi-level C4 system design** (Context → Container → Component, telling the system story by zoom, needs a stakeholder/slide presentation) | **System Design (C4, D2 + HTML)** | `/system-design` | `docs/{feature}/system-design/` (multiple `.d2/.svg` per level + `{feature}-system-design.html`) or `_shared/` | Standard layered C4 + dark-theme HTML exporting PNG/PDF; far better than a single image when the system is large / needs presenting |
| **Where does the DATA move** (external entities ↔ processes ↔ data stores — "what data flows where, which store holds it") | **Data Flow Diagram (DFD, D2)** | `/dfd` | `docs/{feature}/dfd/{slug}-dfd-l0.svg` + `-l1.svg` | L0 context + L1 exploded; the DATA view, orthogonal to C4 (structure) and sequence (time) |
| **Decompose scope/ideas into a tree** (discovery, before the SRS — areas + sub-items, no actors) | **Mindmap (Mermaid)** | `/mindmap` | `docs/{feature}/srs/{feature}-scope.md` (append section) | Pure scope/idea tree; no actors (unlike a use-case diagram) |
| **User experience over time + emotion** (steps per touchpoint + satisfaction 1-5 + actor) | **Journey map (Mermaid)** | `/journey` | `docs/{feature}/srs/{feature}-journey.md` (append section) | Experience + pain points (low ratings); complements use case (UC = function) |
| **Roadmap / milestones over time** (PM-light, NOT Gantt task-dependency) | **Timeline (Mermaid)** | `/timeline` | `docs/{feature}/{feature}-timeline.md` (or `_shared/`) | Milestones grouped by period; deliberately not a Gantt |
| **Who reports to whom** (org / reporting hierarchy, grouped by team — kickoff, stakeholder analysis) | **Org chart (D2)** | `/orgchart` | `docs/{feature}/orgchart/{slug}-orgchart.svg` (or `_shared/`) | Reporting tree with `shape: person`; NOT a RACI or power/interest map |
| **Trace ONE function/module in code → a flow** (sequence/activity/state) with `file:line` provenance | **Code-flow** | `/code-flow` | `docs/{feature}/code-flow/{slug}-flow.md` | Reads code for a SINGLE target's behavior; the targeted sibling of `/scan-project` (whole codebase) |
| **Cloud architecture with REAL cloud stencils** (AWS/Azure/GCP/Databricks services shown with their official icons, validated against a ground-truth stencil catalog — for an arch review / Well-Architected discussion) | **Cloud architecture (draw.io)** | `/drawio-aws` `/drawio-azure` `/drawio-gcp` `/drawio-databricks` | `docs/{feature}/drawio/{slug}.drawio` (+ optional `.svg`) | Cloud-brand-accurate icons (mxgraph.*), not generic boxes; `.drawio` opens in draw.io app/web/VS Code. Differs from `/system-design`/`/d2-architect` (C4 logical, D2, generic shapes). |
| **UML sequence as a standalone, editable draw.io file** (lifelines × time-ordered messages: sync / return / async / self-call — a design-handoff artifact devs keep editing) | **UML Sequence (draw.io)** | `/drawio-sequence` | `docs/{feature}/drawio/{slug}.drawio` (+ optional `.svg`) | Same time-ordered story as `/sequence`, but standalone + editable in draw.io app/web/VS Code; brand-neutral UML. Sequence that lives inline in the SRS stays `/sequence` (Mermaid). |

## Abstraction level — DON'T mix diagrams with UC

**Use Case (UC) = business black-box** (actor goal + expected result + numbered steps). Opening a UC means reading *business prose*, NOT technical detail.

**Sequence/State = technical white-box** (component calls, internal state). Mixing into a UC → business stakeholders get lost, devs still have to jump files.

→ **Sequence + State do NOT embed into UC.** Keep them separately in `srs/{feature}-flows.md` (sequence) and `srs/{feature}-states.md` (state). UC links one-way down to screens (Section f); flow/state link back up to the UC (metadata "Related UC").

**Activity** is the only exception allowed to be inlined in UC Section e — because activity is at the same business abstraction level (it describes a business process, not component calls). By default UC Section e is still skipped; only fill it when the process has ≥3 decisions/parallels.

## Which diagram to use when (detailed)

### Sequence diagram — `/sequence`

**Use when:**
- ≥2 actors interacting over time (user, backend, third-party).
- You care about "who calls whom, what response, in what order".
- There's async / callback / webhook.
- The flow has error-path branches (alt/opt).

**Don't use when:**
- Only 1 actor (an activity diagram fits better).
- You need to show an entity's state at each moment (draw a state diagram).
- High-level scope (draw a use case diagram).

### State diagram — `/state`

**Use when:**
- An entity with ≥3 states (Account, Order, Subscription, Session, Ticket).
- Specific transition rules (trigger + condition).
- Invalid transitions to document (e.g. "no going back from `paid` to `pending`").
- The state-machine table in brainstorm Section 6.3 is already complex (>5 rows) → upgrade to a visual state diagram.

**Don't use when:**
- Entity with only 2 states (on/off) — a table is enough, no diagram needed.
- You care about interaction rather than state (draw a sequence).

### Activity — 3 engine choices (pick by number of roles + embedding need)

> Same "activity diagram" but 3 engines with DIFFERENT positioning. **The default for multi-role business processes is `/activity-swimlane` (PlantUML)** — a real swimlane. Use Mermaid `/activity` only for compact flows that need inline embedding.

#### Activity swimlane (PlantUML) — `/activity-swimlane` ⭐ DEFAULT for multi-role

**Use when (this is the default choice for multi-role activity):**
- The process has **≥2 roles/lanes** doing different steps (Customer/System/Agent/Manager...) — you need to clearly see "who does which step".
- Many **cross-lane interactions** (steps jumping back and forth between roles) — this is where Mermaid subgraphs skew, D2 stretches lanes into "spaghetti", while PlantUML `|Lane|` keeps lanes in fixed straight columns.
- Business process with many decision branches (≥3 if/else) + loops (retry, polling) in a multi-role context.
- Section 6.1 Decision Points in brainstorm has ≥5 decisions across multiple roles → use swimlane.

**Don't use when:**
- Simple linear flow (numbered steps suffice) or just 1 role with no cross-lane + needs inline embedding → `/activity` Mermaid.
- Need the OMG standard / import into Camunda/Bizagi → `/bpmn`.
- Sensitive content (rendering goes through plantuml.com) → consider `/activity` locally.

#### Activity / Flowchart (Mermaid) — `/activity` (secondary — compact flow + inline embedding)

**Use when (narrowed scope):**
- **Simple 1-2 role flow**, little or no cross-lane interaction.
- AND needs **inline auto-render** directly in MD on GitHub/Obsidian (don't want to embed an `.svg` image like PlantUML/D2).
- Quick illustration in BA docs, no real swimlane needed.

**Don't use when:**
- Multi-role process with many cross-lanes → subgraph skews, use `/activity-swimlane`.
- Simple linear flow (a sequence or numbered steps suffice).
- Async multi-actor interaction over time (draw a sequence).

#### Standalone nice activity (D2) — `/d2-activity`

**Use when:** you need a nice image to export / for stakeholders to view, ELK layout with non-overlapping right-angle edges, a real swimlane NOT required. Lanes with many cross-edges still prefer `/activity-swimlane` (D2 stretches lanes far apart).

### BPMN 2.0 — `/bpmn`

**Use when:**
- **Multi-role** process (≥2 lanes: Author/Reviewer/System, multiple departments) needing to clearly show "who does which step".
- Need **OMG standard notation** — gateway ◇, event ○, message flow — because stakeholders/partners are used to reading BPMN.
- Need a file that **imports into BPM tools** (Camunda Modeler, Bizagi, Signavio, draw.io) to run a workflow engine or edit further.
- Complex approval/onboarding/content-approval process, many branches + loop-backs.

**Don't use when:**
- Multi-role process but only to describe the business in the SRS (no need to import a workflow engine) → use `/activity-swimlane` (a real PlantUML swimlane, lighter, no XML/engine needed).
- Compact flow needing inline embedding → `/activity` (Mermaid).
- Async interaction over time → `/sequence`.

**`/activity-swimlane` (PlantUML) vs `/bpmn` (OMG) — quick pick (both are multi-role swimlanes):**

| | `/activity-swimlane` | `/bpmn` |
|---|---|---|
| Engine | PlantUML `\|Lane\|` (renders via plantuml.com) | BPMN 2.0 XML (bpmn-js + auto-layout) |
| Swimlane | Real, lanes in straight columns | Real, OMG-standard pool/lane |
| Output | `.puml`+`.svg` in `srs/` + image embedded in `flows.md` | `bpmn/{process}.bpmn` + `_viewer.html` |
| Notation | activity UML (◇ decision, ○ start/end) | true OMG standard (◇gateway ○event message flow) |
| Import Camunda/Bizagi | ✗ | ✓ (.bpmn file) |
| Drag-and-drop edit | ✗ (edit .puml text) | ✓ (bpmn-js editor) |
| When | describe multi-role business in BA docs, no engine needed | need OMG standard / import into BPM tools / drag-and-drop editing |

→ Everyday multi-role business description → `/activity-swimlane` (light, no XML/engine needed). Only move to `/bpmn` when you genuinely need the OMG standard, workflow-engine import, or a drag-and-drop editor.

### Use case diagram — `/usecase-diagram`

**Use when:**
- Feature kickoff, need to show "who does what with the system" in one image.
- Non-technical stakeholders need a scope overview.
- Feature with ≥3 actors + ≥3 use cases — a text table is less effective than a visual.
- Need to show `<<include>>` / `<<extend>>` relationships between use cases.

**Don't use when:**
- Only 1 actor + 1 use case (overkill).
- Need the detailed flow of a specific use case (draw a sequence or activity).

### ERD — `/erd`

**Use when:**
- ≥2 entities with relationships.
- Need to show cardinality (1:1, 1:N, N:N).
- Data model to share with dev/architect.

**Don't use when:**
- Only 1 entity (an attributes table is enough).
- You care about behavior rather than data (draw state/sequence).

### Data model — 3 choices (pick by purpose + closeness to dev)

> Same "data model" but 3 layers: `/erd` (Mermaid, BA-readable, inline embed) → `/d2-erd` (D2, nice standalone image) → `/dbdiagram` (DBML, closest to dev, SQL export). Pick by *who views it + what they do with it*.

| | `/erd` | `/d2-erd` | `/dbdiagram` |
|---|---|---|---|
| Who views | BA/stakeholder in docs | stakeholder, nice export | **dev/DBA, handoff** |
| Type | compact (`string`/`date`) | compact business | **real DB types** (`uuid`/`varchar`) |
| Enum/index/default | ✗ | ✗ | **✓ first-class** |
| Export SQL | ✗ | ✗ | **✓ (`dbml2sql`)** |
| View image | IDE/Obsidian inline | open `.svg` | dbdiagram.io / dbdocs.io |

→ Embed into a BA-readable doc → `/erd`. Need a nice image for slide/export → `/d2-erd`. Need to **hand off the schema to dev, export SQL, or dbdocs** (many enums/indexes) → `/dbdiagram`.

### Architecture / system design — `/d2-architect` vs `/system-design`

> Same "draw architecture" but 2 positionings: `/d2-architect` = **1 quick context image** (single level, dropped into a doc). `/system-design` = **multi-level C4** (zoom Context→Container→Component) + **an HTML presentation** (export PNG/PDF). Pick by *depth + presentation purpose*.

| | `/d2-architect` | `/system-design` |
|---|---|---|
| Levels | 1 (context) | 2-3 (C4: Context / Container / Component) |
| Method | freely nested containers | standard C4 — each level one zoom question |
| Output | `.d2` + `.svg` | multiple `.d2/.svg` per level **+ `.html` presentation** (Copy/PNG/PDF) |
| View | open `.svg` inline in the doc | open the dark-theme `.html` for stakeholders/slides |
| When | need a quick compact image | large system needing a multi-level story, or a nice export |

**Use `/system-design` when:**
- Need to separate **"where the system sits"** (Context) from **"which runnable blocks it contains"** (Container) — feature/system large enough that a single combined image gets messy.
- Need a **presentation** for stakeholders/slides (dark-theme, one-button PNG/PDF export).
- Want to zoom into a specific container (`--component`) to discuss details with dev/architect.

**Don't use when:** you only need one context image to drop into the SRS/docs → `/d2-architect` (light, fast). Still do NOT draw infra (port/replica/VPC) — both stop at the business/logic level.

### Data Flow Diagram — `/dfd`
**Use when:** you need to show WHERE the data moves — external entities ↔ processes ↔ data stores ("which process transforms it, which store holds it"). Two levels: L0 context (1 process = the system) + L1 exploded.
**Don't use when:** you want structure/nesting of components → `/system-design`; call order over time → `/sequence`; the data model (entity + attributes) → `/erd`. DFD is the DATA view — it complements C4 (structure), it does not replace it.

### Mindmap — `/mindmap`
**Use when:** decomposing scope/ideas into a tree at discovery, before the SRS (areas + sub-items, no actors).
**Don't use when:** scoping actors + functions → `/usecase-diagram`; a multi-role process → `/activity-swimlane`.

### Journey map — `/journey`
**Use when:** mapping the user's experience across touchpoints with a satisfaction rating 1-5 (surface the pain points — don't rate everything 5).
**Don't use when:** you need the business process control-flow → `/activity` / `/activity-swimlane`; actor + function scope → `/usecase-diagram`.

### Timeline — `/timeline`
**Use when:** milestones over periods (roadmap). PM-light — NOT a Gantt (no task bars / dependencies).
**Don't use when:** you need Gantt-style dependency planning — out of scope by design.

### Org chart — `/orgchart`
**Use when:** you need the reporting hierarchy — who reports to whom, grouped by team (kickoff, stakeholder analysis).
**Don't use when:** you need a power/interest 2×2 (a separate Mermaid `quadrantChart`), a RACI matrix, or "who does which step" (`/activity-swimlane`).

### Reverse-engineer from existing code — `/scan-project`

**Use when:** you already have a **codebase (brownfield)** and want to AUTO-GENERATE the architecture diagram set (C4 overview + module map + relationships + ERD + sequence) by **reading the code**, instead of hand-drawing from a description. Scan → plan (HARD STOP to confirm) → generate the whole set into `docs/_shared/architecture/`, with provenance + confidence.

**Different from the other skills:** every other diagram skill draws from **description/interview/spec**; `/scan-project` draws from **actual source code**. It *reuses* the recipes of `/system-design`, `/d2-architect`, `/d2-erd`, `/sequence` to render.

**Don't use when:** you only need a single diagram for a feature being designed (no code yet) → use the corresponding diagram skill.

### Trace one function/module in code — `/code-flow`
**Use when:** you have code and want a FLOW diagram (sequence/activity/state) for ONE specific function/method/module — read the code, trace its behavior, render with `file:line` provenance.
**Different from `/scan-project`:** scan-project draws the WHOLE-codebase architecture set (C4/modules/ERD); code-flow draws ONE target's behavior. Use code-flow to explain "how does this function work"; use scan-project for "what's the architecture of this project".

### Cloud architecture (draw.io) — `/drawio-aws` `/drawio-azure` `/drawio-gcp` `/drawio-databricks`

**Use when:** the diagram must show actual cloud services with their **official icons** (AWS S3/Lambda/DynamoDB, Azure AKS/Cosmos DB, GCP GKE/Cloud SQL, Databricks Delta/Unity Catalog) — e.g. for a cloud-architecture review, a Well-Architected discussion, or a deck stakeholders recognize by brand. Output is a `.drawio` file; stencils are validated against a ground-truth catalog (no hallucinated icons).

**Don't use when:**
- You only need a generic **logical** architecture (boxes, not brand icons) → `/system-design` (C4, D2) or `/d2-architect` (1-level context). Those are lighter and render to SVG inline.
- azure/gcp catalogs aren't downloaded yet (they're large, gitignored) → run `scripts/drawio-catalog-ensure.sh` first, or use `/drawio-aws`/`/drawio-databricks` (ship in-repo).

**`/system-design` (C4/D2) vs `/drawio-*` — quick pick (both are architecture):**

| | `/system-design` / `/d2-architect` | `/drawio-aws` … `/drawio-databricks` |
|---|---|---|
| Shapes | generic logical boxes (D2) | **official cloud-brand icons** (mxgraph.*) |
| Output | `.d2`/`.svg` (+ HTML for C4) | `.drawio` (+ optional `.svg`) |
| Validation | compile + diagram-validate lint | compile + **stencil catalog** + Well-Architected + geometry audits |
| When | logical C4 / context story, brand-agnostic | cloud-brand-accurate, arch review / Well-Architected |

→ Need a logical "what blocks + who calls whom" story → `/system-design`. Need stakeholders to recognize each cloud service by its real icon → `/drawio-*`.

### UML sequence (draw.io) — `/drawio-sequence`

**Use when:** you want the time-ordered call story (who calls whom, in order — sync calls, returns, async signals, self-calls) as a **standalone `.drawio` artifact** the team can open and keep editing in draw.io app/web/VS Code — e.g. a design-handoff diagram.

**Don't use when:** the sequence should live inline in the SRS/flows doc → `/sequence` (Mermaid renders directly on GitHub/Obsidian). For architecture (structure, not call order) → `/d2-architect`, `/system-design`, or the cloud `/drawio-*` skills.

## Combining multiple diagrams for one feature

A complex feature often needs **multiple complementary diagrams**:

| Example feature | Diagram set |
|---|---|
| Authentication (login + signup + OAuth + verify) | Use case (overview) + Sequence (per flow) + State (Account lifecycle) |
| Payment / Checkout | Use case + Sequence (payment flow) + Activity-swimlane (multi-role refund workflow) + State (Order status) + ERD (Order/Transaction/Refund) |
| Approval workflow | Use case + Activity-swimlane (multi-level approval workflow) + State (Request status) |
| Notification system | Use case + Sequence (delivery) + State (Notification status) |

**Default in the SRS `flows.md`:** only draw the diagrams you truly need. Don't draw a diagram for every flow — the principle is "diagrams serve communication, not showing off".

## Mermaid native support

| Diagram | Mermaid syntax | Renders OK in IDE/Obsidian/GitHub? |
|---|---|---|
| Sequence | `sequenceDiagram` | ✓ |
| State | `stateDiagram-v2` | ✓ |
| Activity / Flowchart | `flowchart TB` / `flowchart LR` | ✓ |
| **Use case** | **NOT Mermaid** | PlantUML native (`actor`/`usecase`/`package`) since 2026-07-11 — before that, a Mermaid `flowchart` workaround. Renders via the `plantuml.com` server (`.svg`), doesn't render directly in Obsidian/GitHub (needs a plugin, like D2). |
| ERD | `erDiagram` | ✓ |
| **BPMN** | **NOT Mermaid** | Full XML (semantic + BPMNDiagram swimlane). Renders via bpmn-js in `_viewer.html` (double-click). Doesn't render in Obsidian/GitHub. |

Every diagram skill uses mermaid (except `/bpmn`); **skip L3 iterate** (chat doesn't render — review from the rendered file/viewer).

## Mermaid syntax safety (CRITICAL — avoid parse errors)

The Mermaid parser is strict about certain characters in a node label. A violation → the whole diagram file crashes on render (HTML/PDF/DOCX export breaks the entire block). Rules when composing a label:

### Flowchart (`flowchart TD/LR`)
- **FORBID a double-quote `"..."` inside a shape `[...]`, `([...])`, `{...}`, `{{...}}`**. Wrapping the whole label in `"..."` is OK (escape), but a nested `"` fails.
- Safe approach: drop the quotes, use bare unquoted words `Start([User click Unlink Google])`. To emphasize → markdown `**bold**` does NOT work; use HTML `<b>...</b>` inside the label instead.
- Newline: use `<br/>` (HTML), NOT `\n`.
- **Do NOT use the HTML entities `&amp;` `&lt;` `&gt;` in a label** — mermaid.live/verifier may swallow them, but many renderers (GitHub/Obsidian) report "Invalid mermaid syntax". Replace `&amp;` → the word "and", `<`/`>` → "less than"/"greater than" or drop them. A bare `&` should also be avoided in a label.
- The characters `()`, `[]`, `{}` in a label → escape with `#40;` `#41;` `#91;` `#93;` `#123;` `#125;` or rewrite without them.
- A `:` at the end of a label is OK; `;` at the end of a sentence OK; `,` OK.

### Sequence (`sequenceDiagram`)
- Message text after `:` is free — `A->>B: Log in "with Google"` is OK (the sequence parser is more lenient than flowchart).
- `Note over`, `alt/else/opt/loop` blocks — free text after `:`.

### State (`stateDiagram-v2`)
- Transition label after `:` is free — `A --> B: Click verify link while still valid` is OK.
- Do NOT use `"..."` around a state name (e.g. `state "Locked Account" as Locked` only when an alias is needed).

### ERD (`erDiagram`)
- Relationship label `||--o{` is required inside `"..."` — `ACCOUNT ||--o{ SESSION : "has many sessions"`.
- Attribute comments in an entity block use `"..."` — `string email PK "unique, primary key"`.

### When in doubt
- Try reducing the label to plain unquoted text → render first → enhance later.
- Skills `/sequence` `/activity` `/state` `/erd` `/srs` MUST follow the above rules when generating mermaid. If the user requests a complex label → suggest reformulating.

## One-line summary

> **Time-based → Sequence. State-based → State. Multi-role process → Activity-swimlane (PlantUML). Compact process needing inline embed → Activity (Mermaid). Scope-based → Use Case. Data-based → ERD. OMG-standard/BPM-import → BPMN. Data-flow (where data moves) → DFD. Decompose scope → Mindmap. Experience + emotion → Journey. Milestones (PM-light) → Timeline. Reporting hierarchy → Org chart. One function in code → Code-flow. Whole codebase → Scan-project. Cloud architecture with real cloud icons → /drawio-aws|azure|gcp|databricks. Sequence as an editable .drawio → /drawio-sequence. Not sure which → `/diagram`.**
