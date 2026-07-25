---
paths:
  - ".claude/skills/d2-activity/**"
  - ".claude/skills/d2-architect/**"
  - ".claude/skills/d2-erd/**"
  - ".claude/skills/dfd/**"
  - ".claude/skills/system-design/**"
  - ".claude/skills/sequence/**"
  - ".claude/skills/activity/**"
  - ".claude/skills/state/**"
  - ".claude/skills/erd/**"
  - ".claude/skills/mindmap/**"
  - ".claude/skills/journey/**"
  - ".claude/skills/timeline/**"
  - ".claude/skills/code-flow/**"
  - "docs/**/srs/*.md"
---

# Diagram style — shared theme for every diagram (D2 + Mermaid)

> Goal: **every diagram in the kit shares one tonal language** — the same semantic color means the same kind of thing across D2, Mermaid, and the HTML chrome. Source of truth for the **pastel fill per element type**; the HTML chrome (dark shell + badges) lives in `skills/system-design/resources/c4-palette.md`. Label *safety* rules (no nested quotes, no `&amp;`...) live in `diagram-selection.md` §"Mermaid syntax safety" — this rule does NOT repeat them.

## 1. Semantic color tokens (ONE table, both engines)

| Element type | Fill (pastel) | Stroke | Used for |
|---|---|---|---|
| Person / Actor | `#E8F0FE` | `#3B82F6` | Users, roles |
| Own system (in scope) | `#DCEEFB` (+ bold) | `#60A5FA` | The central system/L1 block |
| External system | `#EEF1F4` + **dashed** | `#94A3B8` | Out-of-our-control (Stripe, Google...) |
| Frontend / UI | `#E6F6FA` | `#22D3EE` | App the user touches |
| Backend / Process | `#E6F4EA` | `#34D399` | Logic / a DFD process / a service |
| Database / Data store | `#F1EAFB` | `#A78BFA` | Store of business data |
| Message bus / Queue | `#FFF1E6` | `#FB923C` | Kafka/RabbitMQ/SQS |
| Highlight (main element) | `#FFF4E5` | `#F59E0B` | The 1-2 elements in focus (cream yellow) |

**Rules:** 1-2 accent colors are enough — do not color everything. External systems ALWAYS dashed border + real name + one-phrase purpose. Do NOT draw infra (port/replica/VPC).

## 2. D2 — paste this header at the top of every `.d2`

D2 `--theme 1` (set by `render.sh`) gives a neutral base; declaring `style.fill`/`style.stroke` DIRECTLY on a shape overrides it → colors are always right.

```ini
vars: {
  # semantic pastels — reference, or paste the value straight onto a shape
  personFill:    "#E8F0FE";  personStroke:    "#3B82F6"
  ownFill:       "#DCEEFB";  externalFill:    "#EEF1F4"
  feFill:        "#E6F6FA";  beFill:          "#E6F4EA"
  dbFill:        "#F1EAFB";  busFill:         "#FFF1E6"
  highlightFill: "#FFF4E5"
}

# Person        -> shape: person;       style.fill: ${personFill};    style.stroke: ${personStroke}
# Process/BE    -> shape: rectangle;    style.fill: ${beFill};        style.stroke: "#34D399"
# Data store    -> shape: cylinder;     style.fill: ${dbFill};        style.stroke: "#A78BFA"
# External      -> style.fill: ${externalFill}; style.stroke-dash: 3; style.stroke: "#94A3B8"
```

**Shape per type:** Person=`person` · Data store=`cylinder` · Queue=`queue` · everything else=`rectangle` (a DFD process uses `rectangle` + `style.border-radius: 10` — see `/dfd`; D2 has no dedicated rounded-rectangle shape).

## 3. Mermaid — global init + per-type classDef

Mermaid's `themeVariables` are GLOBAL (one node color), so per-type coloring uses `classDef` + `class <node> <name>` (flowchart/activity/state). Apply the **same** tokens so a Mermaid activity and a D2 activity read alike.

**Global init** (top of every ` ```mermaid ` block) — neutral card + slate text on white:

```
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'JetBrains Mono, ui-monospace, monospace', 'primaryColor':'#F1F5F9', 'primaryTextColor':'#0F172A', 'primaryBorderColor':'#94A3B8', 'lineColor':'#64748B', 'background':'#FFFFFF'}}}%%
```

**Semantic classDef** (flowchart / state / activity — paste once per diagram, then `class NodeName person`):

```
classDef person    fill:#E8F0FE,stroke:#3B82F6,color:#1E3A8A
classDef frontend  fill:#E6F6FA,stroke:#22D3EE,color:#155E75
classDef backend   fill:#E6F4EA,stroke:#34D399,color:#064E3B
classDef data      fill:#F1EAFB,stroke:#A78BFA,color:#4C1D95
classDef external  fill:#EEF1F4,stroke:#94A3B8,color:#334155,stroke-dasharray:5 5
classDef highlight fill:#FFF4E5,stroke:#F59E0B,color:#78350F
```

> `mindmap` / `journey` / `timeline` / `sequenceDiagram` / `erDiagram` ignore `classDef` — for those, the global init above (font + neutral tone) is the only lever; do NOT force classDef syntax they reject.

## 4. Quick mapping (1 line)

> **Person = blue · Own system = light navy · External = gray dashed · Frontend = cyan · Backend/Process = green · Database = purple (cylinder) · Bus = orange (queue) · Highlight = cream yellow — same colors in D2 and Mermaid.**

## 5. Multi-board — D2 `layers` / `scenarios` (optional, advanced)

Several related boards in ONE `.d2` file (navigate by zoom instead of separate files) via `layers` (independent boards) or `scenarios` (variations of the same board):

```ini
layers: {
  Context: { Customer -> System: order }
  Container: { System.Web -> System.API: call }
}
```

**Rendering:** `d2 file.d2` emits **one `.svg` per board into a `<file>/` subfolder** (e.g. `mb/Context.svg`, `mb/Container.svg`) — there is **no root `<file>.svg`**. The shared `render.sh` is single-board; for a multi-board file invoke d2 directly (`d2 --layout elk --theme 1 file.d2`) and collect the SVGs from `<file>/`.

**The kit default stays one-file-per-board** (each board = one `.svg`, which the `/system-design` HTML deck and `/gallery` tabs expect). Use `layers`/`scenarios` only when you specifically want a single navigable source — do not switch existing skills to it.
