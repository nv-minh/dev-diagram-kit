---
name: system-design
description: Use when you need to draw a SYSTEM DESIGN following the multi-level C4 model (System Context → Container → Component) with D2, plus a dark-theme HTML presentation + PNG/PDF export for stakeholders. Trigger with `/system-design --feature <slug>` or `/system-design "<system description>"`. Differs from `/d2-architect` (just a single 1-level context picture) — this skill layers C4 (zoom Context→Container→Component) + publishes a polished HTML. Optional `--dynamic "<flow>"` adds a runtime view of one request flowing through the containers.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug> | \"<system description>\"] [--component <container>] [--dynamic \"<flow>\"] [--no-icons]"
---

# /system-design — System Design following C4 (D2 + HTML presentation)

> Architecture family: `/d2-architect` (a quick 1-level context picture) · `/system-design` (multi-level C4 + HTML export, this skill). Both render with D2 (shared `render.sh` in `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`).

## Goal

Draw a **system design following the [C4](https://c4model.com) model** — tell the system's story by **zooming in progressively**:

- **L1 System Context** — the system you build is one block; who uses it (users/roles) + which external systems it calls. Answers "who does this system serve, where does it stand in the surrounding world".
- **L2 Container** — "open the lid" of the system: the **apps / services / data stores** inside + the call flows between them + external systems. Answers "which runnable blocks make up the system, which block talks to which".
- **L3 Component** (optional, for one container chosen via `--component`) — what functional components are inside one container.
- **L4 Code** — OUT of scope (that is dev/architect work).

Output in `docs/{feature}/system-design/` (or `docs/_shared/system-design/` for whole-system architecture):

1. `{slug}-context.d2` + `.svg` — C4 L1.
2. `{slug}-container.d2` + `.svg` — C4 L2.
3. `{slug}-component-{container}.d2` + `.svg` — C4 L3 (only when the user needs it).
   * `{slug}-dynamic.d2` + `.svg` — **runtime view** (only with `--dynamic "<flow>"`): one request's path through the containers, numbered (C4-scoped; overlaps `/sequence`).
4. `{feature-or-shared}-system-design.html` — the **presentation** combining the levels: dark-theme + a Copy-PNG/PNG/PDF export toolbar (inherits the Cocoon AI design system, MIT — see NOTICE).
5. `{feature-or-shared}-system-design-index.md` — metadata + level table.

## C4 = storytelling by zooming, NOT a deployment diagram

A skill for the **dev-as-BA** — draw at the **logical architecture level** to align understanding with stakeholders + architect. Draw at the level of **"what blocks the system has, who it calls, where the main data flows"** at each zoom level — enough to align understanding before the architect dives into detail. **Do NOT draw**: pods/replicas, load balancer config, VPC/subnet, port, container image, algorithm. Need that level → architect's job, out of scope (like `/d2-architect`).

**How it differs from `/d2-architect` (read carefully to avoid overlap):**

| | `/d2-architect` | `/system-design` |
|---|---|---|
| Number of levels | **1** (context picture) | **2-3** (C4: Context / Container / Component) |
| Method | free-form (nested containers) | **standard C4** (disciplined zoom, one question per level) |
| Output | `.d2` + `.svg` | multiple `.d2/.svg` by level **+ HTML presentation** (PNG/PDF export) |
| When | need a quick single context picture to drop into a doc | need to **tell the system's story at multiple levels** for stakeholders/slides, or a large feature needing Context + Container kept separate |

→ Just need a single compact picture → `/d2-architect`. Need C4 layering + a polished presentation → `/system-design`.

## Constraints

- **Fixed output** in `docs/{feature}/system-design/` (or `docs/_shared/system-design/` if cross-feature). Files per the pattern in Goal.
- **`--feature` optional** — auto-detect from context; a WHOLE-architecture description with no `--feature` → `_shared/system-design/` (escape hatch). Feature does not exist but you want to attach it specifically → derive slug + create (entry point, `feature-bootstrap.md` group A). File already exists → enter update mode (L2 diff), no flag needed.
- **The AI writes the .d2 source, NO coordinates** — ELK handles layout.
- **Render via the shared `render.sh`** (`${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh`). Do NOT call d2/Chrome directly.
- **Compile EVERY level to PASS** before reporting done.
- **Self-review the image** (accuracy): if Chrome is available, render `--png` for each level then Read the image to check overlap/overlapping edges/wrong labels + C4-level consistency before reporting; no Chrome → carefully review the source + `.svg`.
- **The HTML is built from the bundled template** (`resources/c4-export-template.html`) — inline the `<svg>` content of each level, do NOT hand-draw SVG, do NOT edit the 2 CDN scripts (keep the SRI hashes).
- **L1 approval** before Write — BA-friendly prose (describe the levels + blocks + external systems + main flow), do NOT dump the source.
- **NO L3 iteration** — review from `.svg`/`.html`.
- **Do NOT ask/draw infra detail** (port/replica/VPC) — see the "C4 = zoom" section above. Colors per `resources/c4-palette.md`.
- **Tech icons (optional, per @../../rules/icon-map.md)** — infra/tech/external nodes attach `icon:` from `"${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh"`; auto when the tech matches, `--no-icons` disables; tech nodes only (right altitude). Base64-embedded icons → **flow automatically into the HTML + PNG/PDF export** (no template edit).
- **Bilingual (mirror input — @../../rules/language.md)** flow labels + block names; service/external-system names kept per the real system.
- **Per `diagram-selection.md`** — `/system-design` for multi-level C4 system design; a quick context picture → `/d2-architect`; business flows → `/d2-activity`; data model → `/d2-erd`.
- **Idempotent** — 1 slug = 1 file set; re-run → update mode (L2 diff per changed level).
- **Dynamic view overlaps `/sequence`** — `--dynamic` shows one runtime flow *inside* the C4 container picture. If you only need the call sequence (not the container structure), use `/sequence` instead.

## Inputs

```
/system-design --feature <slug>                    # design in the context of one feature
/system-design "<system description>"              # whole architecture → docs/_shared/system-design/
/system-design --feature <slug> --component <name> # add/update the L3 level for one container
/system-design --feature <slug> --dynamic "<flow>" # add a runtime view: one request path through the containers (numbered)
/system-design "<description>" --feature <new-slug> # feature does not exist → derive/use slug + interview + create (entry point)
```

By default draws **L1 Context + L2 Container**. L3 Component is drawn only with `--component <container>` (or an explicit user request).

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Has system-overview (good source): !`test -f docs/_shared/system-overview.md && echo "✅ docs/_shared/system-overview.md" || echo "(not present — /update-overview system)"`
d2 installed?: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || (command -v d2 >/dev/null && echo "✅ $(d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --")`

## Flow runtime

```
User calls /system-design [--feature X | "<description>"] [--component C]
   │  d2 not installed? → stop, guide install
   │  ┌─ Resolve the write target (feature-bootstrap.md group A + _shared escape hatch):
   │  │  • WHOLE architecture (whole-system description, no --feature) → docs/_shared/system-design/
   │  │  • Attach a specific feature that does not exist → derive/use slug, confirm at L1, create on Write.
   │  │  • ambiguous 1-word odd-slug → ask "new feature, typo, or whole architecture?" (list features).
   │  ▼
1. Read sources by priority: docs/_shared/system-overview.md → docs/X/srs/{feature}-spec.md + flows.md
   (external service, container mentions) → NO source yet: interview to EXACTLY the C4 SCOPE
   (feature-bootstrap.md group A) in business-language, do NOT ask about port/VPC:
   • L1: what the system does · who uses it (roles) · which external systems it calls (name + purpose).
   • L2: the runnable apps/services · business data stores · the main call flows between them.
   • L3 (if --component): what functional components are in that container.
   No-re-ask existing sources. Ambiguous even with a source → ask clarifying, do NOT invent flows/external systems.
   ▼
2. Break down by C4: [L1] actor + system + external → [L2] container + store + edge →
   [L3 optional] component in one container.
   ▼
3. Write the .d2 source for each level (formula below + colors per c4-palette.md).
   ▼
4. L1 plan preview (prose: which levels to draw, K L2 blocks, M external systems). User Y → continue.
   ▼
5. Write each {slug}-{level}.d2 → render.sh → .svg (compile fail → fix, at most 2 times/level).
   ▼
6. Build {feature-or-shared}-system-design.html from the template: inline the <svg> of each level + fill in
   header/subtitle/3 summary cards/footer. Level not drawn → delete that .c4-level block.
   ▼
7. Update {feature-or-shared}-system-design-index.md (env note → activity.log). Tell the user to open the .html/.svg.
```

## How to build (step-by-step)

### Step 1 — Skeleton `system-design/` if not present

`{feature-or-shared}-system-design-index.md` (type `system-design-index`): standard frontmatter + level table (level / file / main blocks / updated) + link to the `.html`. Lifecycle inherits `srs/{feature}-spec.md` (or standalone if `_shared/`).

### Step 2 — Formula for writing the .d2 source by level

Colors from `resources/c4-palette.md` (person=blue, own system=light navy, external system=gray dashed border, frontend=cyan, backend=green, DB=purple cylinder, bus=orange queue).

**L1 System Context** (`{slug}-context.d2`) — see `references/example-c4-context.d2`:
```
direction: right
Khach: Customer { shape: person; style.fill: "#E8F0FE" }
Payment: Payment System { style.fill: "#DCEEFB"; style.bold: true }
Gateway: "Payment Gateway (Momo / VNPay)" { style.fill: "#EEF1F4"; style.stroke-dash: 3 }
Khach -> Payment: "Place order, pay"
Payment -> Gateway: "Send payment request"
```

**L2 Container** (`{slug}-container.d2`) — see `references/example-c4-container.d2`: own system = 1 container nesting the apps/services/data stores; external systems outside (dashed border):
```
direction: right
Payment: Payment System {
  Web: "Web / Mobile App" { style.fill: "#E6F6FA" }
  API: "Payment API" { style.fill: "#E6F4EA" }
  DB: "Transaction DB" { shape: cylinder; style.fill: "#F1EAFB" }
}
Gateway: "Payment Gateway" { style.fill: "#EEF1F4"; style.stroke-dash: 3 }
Payment.API -> Payment.DB: "Write transaction"
Payment.API -> Gateway: "Create payment request"
```

**L3 Component** (`{slug}-component-{container}.d2`, only with `--component`): "open the lid" of one container → the functional components inside + dependencies.

**Dynamic (runtime) view** (`{slug}-dynamic.d2`, only with `--dynamic "<flow>"`) — see `references/example-c4-dynamic.d2`: a **runtime scenario** = one request flowing across the L2 containers, edges numbered in call order. Reuse the L2 container shapes (same colors) + number every edge so the runtime order is unambiguous:
```
direction: right
Web: "Web / Mobile App" { style.fill: "#E6F6FA" }
API: "Payment API" { style.fill: "#E6F4EA" }
DB: "Transaction DB" { shape: cylinder; style.fill: "#F1EAFB" }
Gateway: "Payment Gateway" { style.fill: "#EEF1F4"; style.stroke-dash: 3 }

Web -> API: "1. submit order"
API -> DB: "2. write intent"
API -> Gateway: "3. charge"
Gateway -> API: "4. result"
API -> DB: "5. update status"
API -> Web: "6. confirm"
```
One flow per dynamic view — a second flow → a second `--dynamic`.

**General rules:** nest containers via `{}`, reference children via a dot `Payment.API`. QUOTE labels with special characters `() / | :`. External systems ALWAYS `style.stroke-dash: 3` + real name + a one-phrase purpose. NO coordinates, NO infra. Nesting >3 levels → split some out. **Tech icons:** infra/tech/external nodes → `icon:` from `"${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh"` (per @../../rules/icon-map.md; auto when matched, `--no-icons` disables).

### Step 3 — Render + verify each level

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/system-design/{slug}-context.d2
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/system-design/{slug}-container.d2
# compile fail → usually a missing quote on a label with special characters → fix, re-render (at most 2 times/level).
```

### Step 4 — Build the HTML presentation

1. Copy the template: `cp "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/system-design/resources/c4-export-template.html" docs/{feature}/system-design/{feature-or-shared}-system-design.html`.
2. For each level with an `.svg`: read the `.svg` file, take the `<svg ...>...</svg>` part, paste it over the marker `<!-- INJECT:context-svg -->` / `<!-- INJECT:container-svg -->` / `<!-- INJECT:component-svg -->`.
3. Level NOT drawn (e.g. no L3 yet) → delete the corresponding `.c4-level` block.
4. Fill in `[SYSTEM NAME]`, `[Subtitle]`, the 3 summary cards (users+external / main containers / data+flow), footer (source + date).
5. **Do NOT** change the 2 CDN `<script>` tags (keep the SRI hashes) — see Gotchas.

## L1 plan preview (BA-friendly template)

> I'll draw the **{name} system design** following C4 at `docs/{...}/system-design/` (+ the `.html` presentation):
>
> **Levels drawn:** L1 System Context + L2 Container {+ L3 Component for «{container}» if any}.
> **Users ({A}):** {e.g. Customer}
> **External systems ({M}):** {e.g. Payment Gateway, Email Service}
> **Main containers ({K}):** {e.g. Web/Mobile, Payment API, Transaction DB, Worker}
> **Main flow:** {e.g. "Customer → API → Gateway → Worker → Email"}
>
> Source: {system-overview.md | srs/{feature}-spec.md | provided by you}.
> **Recorded:** activity log "{note}".
>
> Apply? (Y / edit)

## Output report

```
✅ System Design (C4): docs/{...}/system-design/
   Levels: Context + Container{ + Component: {container}}
   Users: {A} | Containers: {K} | External: {M}
   Presentation: {feature-or-shared}-system-design.html

Open the .html in a browser (dark-theme, ⋯ button → Copy/PNG/PDF) to present/export.
View each level: {slug}-context.svg / {slug}-container.svg.
Need changes? /system-design --feature {feature} (the skill enters update mode)
```

## Gotchas

- **d2 not installed** → stop, print a 1-line install (`curl -fsSL https://d2lang.com/install.sh | sh -s --`).
- **QUOTE labels with special characters** `/ | ( ) :` → forgetting means a compile fail (D2 gotcha #1).
- **Don't draw infra** — port/replica/LB/VPC are the deployment level, out of IT-BA scope. C4 stops at Container/Component.
- **One question per level** — L1 "where it stands in the world", L2 "which runnable blocks it has", L3 "what is inside one block". Don't cram containers into L1 or components into L2 (losing zoom discipline → clutter).
- **HTML: inline the SVG, do NOT hand-draw** — paste the `<svg>` content that D2 renders into the marker. **Do NOT edit the 2 CDN scripts / SRI hashes** (html2canvas + jsPDF) — a wrong hash → the browser blocks it, the export toolbar dies.
- **html2canvas + SVG**: if the PNG/PDF export is missing text, the D2 SVG probably uses `<foreignObject>` (html2canvas renders it unreliably). A C4 diagram with plain labels (no markdown/code) makes D2 use `<text>` — safe. On error → check whether the SVG has `<foreignObject>`.
- **The best source is system-overview.md** — if not present, suggest `/update-overview system` first.
- **Cross-feature** (whole-app architecture) → `docs/_shared/system-design/`, do NOT stuff it into one feature.
- **Update mode (slug already exists)** → Read the old source of each level, L2 diff, re-render + rebuild the HTML after the user's Y.
- **Overlaps with `/d2-architect`?** Just need a quick context picture → use `/d2-architect`. This skill is for multi-level C4 + presentation.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/icon-map.md (insert tech icons; resolver `scripts/icon-path.sh`)
- @../../rules/node-shapes.md (node type → D2 shape — gateway=hexagon, cache=stored_data, DB=cylinder, …; C4 containers otherwise stay rectangles)
- @./resources/c4-palette.md (C4 color map → D2)
- @./resources/c4-export-template.html (HTML presentation skeleton — PNG/PDF export)
- @./references/example-c4-context.d2 · @./references/example-c4-container.d2 · @./references/example-c4-dynamic.d2 (runtime view — only with `--dynamic`) · @./references/example-system-design.html
