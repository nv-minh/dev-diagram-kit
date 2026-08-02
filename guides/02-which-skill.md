# 02 — Which skill to use? (decision tree)

**English** · [Tiếng Việt](../huong-dan/02-chon-skill-nao.md)

> 64 skills sounds like a lot, but picking the right one is quick if you ask the right question — or just run `/ba` / `/diagram`. This is the condensed version; the full versions are `explain-skills/diagram-selection.md` (diagrams) and `rules/doc-selection.md` (documents).

---

## First fork: document or diagram?

- **A document** — prose, tables, specs, tests, sync (brainstorm, URD, BRD, PRD, SRS, roadmap…) → the document tree below, or just run **`/ba "<what you need>"`**.
- **A picture** — flows, states, data models, architecture → the diagram tree below, or run **`/diagram "<what you want to show>"`**.

## The 30-second document tree

**Where are you in the lifecycle?**

- **A raw idea, nothing structured** → **`/brainstorm "<idea>"`**
- **Who the users are + what they need** → **`/urd <feature>`**
- **The business case (objectives, ROI, risks)** → **`/brd <feature>`**
- **What we'll build for ONE feature (P0/P1/P2)** → **`/prd-epic <feature>`**
- **Precise system behavior (FRs, rules, errors)** → **`/srs <feature>`**
- **The WHOLE product, once** → **`/prd`** · **prioritize it** → **`/roadmap`**
- **Spec / UI / API / test / delivery** (use cases, stories, ACs, wireframes, API chain, tests, Jira/Confluence, export…) — run **`/ba "<what you need>"`**, or see the matrix in `rules/doc-selection.md`. Each document skill has a **simulated session** at `skills/<skill>/references/example-session.md` — full index in [06 — BA documents](06-ba-documents.md) · [07 — API & delivery](07-api-and-delivery.md).

## The 30-second diagram tree

**What do you want to show?**

- **Who calls whom, in chronological order** (login, payment, webhook, external API calls)
  → **`/sequence`**

- **An object with multiple states + transitions** (Order: pending → paid → shipping → completed)
  → **`/state`**

- **A process with multiple steps + decision branches**
  - Multiple roles doing different steps, lots of cross-role interaction → **`/activity-swimlane`** ⭐ (real swimlane)
  - Needs OMG standard / import into Camunda-Bizagi → **`/bpmn`**
  - 1-2 roles, simple, want it embedded directly in the .md file (GitHub/Obsidian auto-render) → **`/activity`**
  - Many branches, want a **nice-looking** standalone image (slide/export), don't need a real swimlane → **`/d2-activity`**

- **Data model (tables + relationships)**
  - For a BA to read in a document, embedded inline → **`/erd`**
  - Nice-looking standalone image (clear PK/FK, for slides) → **`/d2-erd`**
  - Handoff to dev / export SQL / dbdocs (has enums, indexes, real DB types) → **`/dbdiagram`**

- **System scope — which actor can do which use case**
  → **`/usecase-diagram`**

- **Architecture / system design**
  - Need a **quick single context picture** (app, service, DB, nested external services) → **`/d2-architect`**
  - Need **multi-level C4 design** (System Context → Container → Component) + an HTML presentation (PNG/PDF export) → **`/system-design`**

---

## 2 extended skills (don't draw from a description — for devs doing BA work)

These 2 skills differ from the whole group above: they do **not** draw from a description you type.

- **Already have a codebase (brownfield), want to auto-generate a FULL SET of architecture diagrams from CODE** (C4 + module map + relationships + ERD + main-flow sequence)
  → **`/scan-project`** — reverse-engineers by **reading source code** (unlike `/system-design`/`/d2-architect`, which draw from a description/interview). 2 phases: scan → plan (HARD STOP for confirmation) → generate. Needs `d2`. Fixed output at `docs/_shared/architecture/`.

- **Code or a decision just changed, want to update a Confluence page to match**
  → **`/sync-confluence`** — syncs **a git diff or conversation → Confluence**, edits **in place** (only the relevant section, keeping macros/tables), **always previews + confirms before writing**. Needs an authenticated **Atlassian MCP** (`/mcp`).

---

## Comparison table for 3 easily-confused families

### The "process" family (4 skills that all draw flows)

| | Engine | Real swimlane? | Embeds inline? | Imports into BPM tool? | When |
|---|---|---|---|---|---|
| `/activity` | Mermaid | ✗ (fake subgraph) | ✓ | ✗ | Compact flow, want it shown directly in .md |
| `/d2-activity` | D2 | ✗ | ✗ | ✗ | Nice-looking standalone image, many branches |
| `/activity-swimlane` ⭐ | PlantUML | ✓ | ✗ (embeds image) | ✗ | **Default for multi-role** |
| `/bpmn` | OMG engine | ✓ (pool/lane) | ✗ | ✓ | Needs OMG standard / Camunda |

### The "data" family (3 skills that all draw data models)

| | Engine | Who reads it | Enum/index | Export SQL |
|---|---|---|---|---|
| `/erd` | Mermaid | BA in a document | ✗ | ✗ |
| `/d2-erd` | D2 | Nice slide/export | ✗ | ✗ |
| `/dbdiagram` | DBML | **Dev/DBA** | ✓ | ✓ (`dbml2sql`) |

### The "architecture" family (2 skills that both draw systems)

| | Engine | Number of levels | Output | When |
|---|---|---|---|---|
| `/d2-architect` | D2 | 1 (single context picture) | `.d2` + `.svg` | Need a quick architecture picture to drop into a doc |
| `/system-design` | D2 | 2-3 (C4: Context / Container / Component) | multiple `.d2/.svg` per level **+ an HTML presentation** (PNG/PDF export) | Telling a multi-level system story for stakeholders/slides |

### Use case: diagram vs text

- **`/usecase-diagram`** = an overview picture (actor + use case + include/extend). Included in this package.
- **`/usecase`** (a text skill, NOT included in this package) = writes out each use case in detail as prose. If needed, get it from the full DIAGRAM-KIT package.

---

## Tip: a feature usually needs several diagrams

See `example/atlas-re/` — the same reinsurance underwriting platform drawn with:

- `/sequence` (submission → quote → bind)
- `/activity` + `/activity-swimlane` + `/bpmn` (the claim-handling process, 3 ways of presenting it)
- `/state` (Contract + Claim lifecycle)
- `/erd` + `/d2-erd` + `/dbdiagram` (the same data model, 3 levels of detail)
- `/usecase-diagram` (system scope)
- `/d2-architect` (architecture)

→ Don't draw every diagram for every flow. Principle: **diagrams serve communication, not showing off.** Draw whichever helps the reader understand fastest.
