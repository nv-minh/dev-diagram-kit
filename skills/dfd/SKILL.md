---
name: dfd
description: Use when you need a Data Flow Diagram (DFD) — Level 0 context + Level 1 exploded — showing WHERE data moves between external entities, processes, and data stores. Trigger with `/dfd --feature <slug>`. DFD is the DATA view; differs from `/system-design` (structure) and `/sequence` (time). Same D2 family as `/d2-activity`, `/d2-erd`, `/d2-architect`.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>]"
---

# /dfd — Data Flow Diagram L0 + L1 (D2)

> D2 skill family: `/d2-activity` (flow) · `/d2-erd` (data model) · `/d2-architect` (architecture) · `/dfd` (this — data flow). All share `render.sh` at `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`.

## Goal

Draw a **Data Flow Diagram** — the view that answers *"where does the data go, which process touches it, which store holds it"* — as **two levels**:

1. **L0 (Context)** — one process = the whole system, surrounded by **external entities** + the data flowing in/out.
2. **L1 (Level 1)** — explode that one process into **2-5 numbered processes** + **data stores**, with data labeled on every edge.

Output in `docs/{feature}/dfd/`:
- `{slug}-dfd-l0.d2` + `.svg`
- `{slug}-dfd-l1.d2` + `.svg`
- `{slug}-dfd-index.md` (metadata + element table)

## Why DFD (and not the others)?

| Question you're answering | Use |
|---|---|
| Where does the **data** move / which store holds it / which process transforms it? | **`/dfd` (this)** |
| How are the **blocks/components** structured + nested? | `/system-design` / `/d2-architect` |
| Who calls whom, **in what order over time**? | `/sequence` |
| What's the **data model** (entity + attributes + cardinality)? | `/erd` / `/d2-erd` |

A DFD is orthogonal: it can sit **alongside** `/system-design` (C4 = structure, DFD = data) to give the full picture.

## Constraints

- **Fixed output** `docs/{feature}/dfd/{slug}-dfd-l0.d2/.svg` + `-l1.d2/.svg`. Do NOT write into `srs/`.
- **`--feature` optional** — auto-detect from context; files already exist → enter update mode automatically. **Feature does not exist + a data-flow description → auto-derive slug + create** (entry point, `feature-bootstrap.md` group A).
- **AI writes the source, NO coordinates** — ELK handles layout (shared `render.sh`).
- **Compile must PASS** before reporting done; **review the image yourself** (accuracy).
- **L1 approval** before Write — BA-friendly prose (entities + processes + stores), do NOT dump the source.
- **NO L3 iterate** — review from the `.svg`.
- **Right altitude** — business/logical processes + stores. Do NOT draw infra (port/replica/VPC); do NOT turn this into an ERD (no attributes/columns — `/erd` does that). A data store is "Orders", not a table with columns.
- **Bilingual (mirror input — @../../rules/language.md)** for data-flow labels; identifiers follow the source if present.
- **Theme** — apply the pastel tokens from `@../../rules/diagram-style.md` (Person=blue, Process=green, Data store=purple, External=gray dashed).
- **Idempotent** — re-run → update mode (L2 diff), no refusal.

## Inputs

```
/dfd --feature <slug>            # read srs/{feature}-erd.md / spec / brainstorm as the source
/dfd "<data flow description>"   # feature doesn't exist → derive slug + interview + create
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with ERD (good source for data stores): !`for d in docs/*/srs/*-erd.md docs/*/d2-erd/*.d2; do [ -f "$d" ] && dirname "$d" | xargs dirname | xargs basename; done 2>/dev/null | sort -u | head -10`
d2 installed: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## How to build (step-by-step)

### Step 1 — Gather the data-flow facts (by priority)

Read by priority → extract:
1. `docs/{feature}/srs/{feature}-erd.md` (or `d2-erd/*.d2`) → candidate **data stores** (the entities become stores).
2. `docs/{feature}/srs/{feature}-spec.md` (Business Rules + functional requirements) → **processes** + the data each transforms.
3. `docs/{feature}/brainstorms/*.md` → external actors/entities + flows.
4. None → interview EXACTLY the scope the DFD needs (one batched business-language pass, no DB detail): the **external entities** (people/orgs/systems outside, who give/receive data) · the **processes** (what happens to the data, numbered 1.0, 1.1...) · the **data stores** (where data rests) · the **data** that flows on each arrow.

Fact-list (coverage checklist): every external entity · every process (L1) · every data store · every data flow (source → target + the data label).

### Step 2 — DFD notation in D2 (Gane-Sarson flavor via shapes)

| DFD element | D2 shape | Style (pastels from `diagram-style.md`) |
|---|---|---|
| **External entity** (Customer, Supplier, Payment gateway) | `shape: rectangle` | `style.fill: "#EEF1F4"; style.stroke-dash: 3` (gray dashed = "outside") |
| **Process** (numbered 1.0, 1.1, 2.0) | `shape: rectangle; style.border-radius: 10` | `style.fill: "#E6F4EA"` (green) |
| **Data store** (D1 Orders, D2 Customers) | `shape: cylinder` | `style.fill: "#F1EAFB"` (purple) |
| **Data flow** = an edge | `A -> B: "the data that moves"` | label = the DATA, not the action |

**Rules:** every edge label is the **data** moving (`"order"`, `"payment result"`, `"invoice"`), NOT the action ("send"). Number processes (`1.0`, `1.1`). Number stores (`D1`, `D2`). Keep L1 to 3-6 processes — more → go deeper (L2) or split. QUOTE labels containing `( ) / | :`.

### Step 3 — Formula: L0 context (one process = the system)

```ini
direction: right

Customer: "Customer" { shape: rectangle; style.fill: "#EEF1F4"; style.stroke-dash: 3 }
Gateway: "Payment gateway" { shape: rectangle; style.fill: "#EEF1F4"; style.stroke-dash: 3 }
System: "1.0 Order system" { shape: rectangle; style.border-radius: 10; style.fill: "#E6F4EA"; style.bold: true }

Customer -> System: "order"
System -> Customer: "confirmation"
System -> Gateway: "payment request"
Gateway -> System: "payment result"
```

### Step 4 — Formula: L1 exploded (processes + stores)

```ini
direction: right

Customer: "Customer" { shape: rectangle; style.fill: "#EEF1F4"; style.stroke-dash: 3 }
Gateway: "Payment gateway" { shape: rectangle; style.fill: "#EEF1F4"; style.stroke-dash: 3 }

P1: "1.1 Capture order"   { shape: rectangle; style.border-radius: 10; style.fill: "#E6F4EA" }
P2: "1.2 Process payment" { shape: rectangle; style.border-radius: 10; style.fill: "#E6F4EA" }
P3: "1.3 Fulfill order"   { shape: rectangle; style.border-radius: 10; style.fill: "#E6F4EA" }

D1: "D1 Orders"    { shape: cylinder; style.fill: "#F1EAFB" }
D2: "D2 Customers" { shape: cylinder; style.fill: "#F1EAFB" }

Customer -> P1: "order"
P1 -> D1: "order record"
D1 -> P2: "pending order"
P2 -> Gateway: "payment request"
Gateway -> P2: "payment result"
P2 -> D1: "payment status"
D1 -> P3: "paid order"
D2 -> P1: "customer profile"
P3 -> Customer: "confirmation"
```

### Step 5 — Render + verify

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/dfd/{slug}-dfd-l0.d2
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/dfd/{slug}-dfd-l1.d2
# compile fail → usually a missing quote on a label with ( ) | / : → fix, re-render.
```

## L1 plan preview (BA-friendly)

> I'll draw the Data Flow Diagram for **{feature}** at `docs/{feature}/dfd/` (L0 context + L1 exploded, + `.svg` each):
>
> **External entities ({N}):** {Customer, Payment gateway...}
> **Processes ({M}):** {1.1 Capture order · 1.2 Process payment · 1.3 Fulfill order}
> **Data stores ({K}):** {D1 Orders · D2 Customers}
>
> Source: {srs/{feature}-erd.md | spec | you provide}.
> Logged: activity log "added {feature} DFD L0+L1".
> Apply? (Y / edit)

## Output report

```
✅ DFD: docs/{feature}/dfd/{slug}-dfd-l0.svg + {slug}-dfd-l1.svg
   External entities: {N} | Processes: {M} | Data stores: {K} | D2 compile: OK

Open the .svg files in browser/IDE/Obsidian to view.
Need changes? /dfd --feature {feature} (the skill enters update mode automatically).
```

## Gotchas

- **d2 not installed** → stop, print 1 install line.
- **Edge label = DATA, not action** — `"order"`, not `"sends order"`. The arrow direction already says "flows to".
- **QUOTE labels** with `( ) | / :` — `"1.2 Process payment (card)"`, `"pending | paid"`.
- **A data store is NOT an ERD entity** — no columns/attributes here; that's `/erd`. A store is just "D1 Orders".
- **L1 too big** (>6 processes) → split into a deeper level (L2 of one sub-process) or narrow the scope.
- **Balanced decomposition** — every flow crossing the L0 boundary must appear in L1 (no data appears/disappears between levels).
- **Update mode** → Read the old sources, L2 diff, re-render after user Y.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/diagram-style.md
- @./references/example-dfd.d2
- @../../skills/d2-activity/render.sh (shared D2 renderer)
