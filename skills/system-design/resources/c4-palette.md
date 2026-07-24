# C4 palette — map C4 element type → D2 style → Cocoon colors

> For `/system-design`. Goal: **colors that MEAN something** (the color reveals the element type), consistent with the `/d2-*` family (light pastel fill on a white background) and borrowing Cocoon AI's semantic color system for the HTML chrome.

## 1. D2 style by element type (used in `.d2` files)

Render via the shared `render.sh` (D2 `--theme 1` neutral). `style.fill`/`style.stroke` declared DIRECTLY on a shape override the theme → colors are always right. Light fill so black text reads clearly on the card's white background.

| C4 element type | D2 shape | `style.fill` | Note |
|---|---|---|---|
| **Person / Actor** (users, roles) | `person` | `"#E8F0FE"` (light blue) | Who uses the system |
| **Software System — in scope** (L1: the system you build) | rectangle | `"#DCEEFB"` + `style.bold: true` | The central L1 block |
| **External System** (external systems: Google, Stripe, SendGrid...) | rectangle | `"#EEF1F4"` (light gray) + `style.stroke-dash: 3` | Dashed border = "out of our control" |
| **Container — Web/Mobile app (frontend)** | rectangle | `"#E6F6FA"` (light cyan) | The app users interact with |
| **Container — API / Service (backend)** | rectangle | `"#E6F4EA"` (light green) | Handles business logic |
| **Container — Data store / Database** | `cylinder` | `"#F1EAFB"` (light purple) | 1 block for the whole business store |
| **Container — Message bus / Queue** | `queue` | `"#FFF1E6"` (light orange) | Kafka/RabbitMQ/SQS... |
| **Component (L3)** — a component inside a container | rectangle | `"#E6F4EA"` (lighter) | Highlight the main component with `"#FFF4E5"` |
| **Highlight the main element** | — | `"#FFF4E5"` (cream yellow) | Only 1-2 elements/diagram, don't over-color |

**Rules:** 1-2 accent colors are enough. QUOTE labels/names with special characters `() / | :`. External systems ALWAYS wrapped with a dashed border (`style.stroke-dash: 3`) + real name + a one-phrase purpose. Do NOT draw infra (port/replica/VPC) — see SKILL.md.

## 2. Cocoon semantic color system (reference for the HTML chrome / badge / card-dot)

> Source: the `architecture-diagram` skill of **Cocoon AI (MIT)**. Used for the dark shell of `c4-export-template.html` (level badge, card-dot). NOT required for the D2 SVG (D2 uses the pastels in Section 1).

| Type | Fill (rgba, dark background #020617) | Stroke |
|---|---|---|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan-400) |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald-400) |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet-400) |
| Cloud / External | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber-400) |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose-400) |
| Message bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange-400) |
| Generic / slate | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate-400) |

C4 level badges in the template: L1 Context = cyan `#22d3ee`, L2 Container = emerald `#34d399`, L3 Component = violet `#a78bfa`.

## 3. Quick mapping (remember in 1 line)

> **Person = blue · Own system = light navy · External = gray dashed border · Frontend = cyan · Backend = green · Database = purple (cylinder) · Bus = orange (queue) · Main highlight = cream yellow.**
