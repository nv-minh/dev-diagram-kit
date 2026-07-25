---
name: diagram
description: Router — describe what you want to show, and this picks the right diagram skill for you (asks at most 2 clarifying questions, then runs it). Use when you're unsure which of the kit's diagrams fits. Trigger with `/diagram "<what you want to show>"` or just describe the need. Source of truth: `rules/diagram-selection.md`.
allowed-tools: Read, Glob, Grep
user-invocable: true
argument-hint: "\"<what you want to show>\" [--recommend-only]"
---

# /diagram — Which diagram should I use? (router)

> You describe a need → this skill asks **at most 2** disambiguating questions → picks the right diagram skill → **runs it** with the inferred args. Solves "there are 19 diagram skills, which one?". The decision matrix that backs this lives in `@../../rules/diagram-selection.md` (source of truth — keep them in sync when a skill is added/removed).

## Goal

Map a natural-language need → exactly ONE diagram skill, then delegate to it. Do NOT draw anything yourself — you decide + hand off.

## Constraints

- **Decide, don't draw.** Output the chosen skill + the command, then RUN that skill (unless `--recommend-only`). Do not invent a 20th diagram type.
- **At most 2 questions** — only when the need is genuinely ambiguous between 2-3 candidates. If one skill clearly fits → ask nothing, just run it.
- **Mirror `diagram-selection.md`** — the routing table below is a condensed copy; the rule is the source of truth. If they disagree, the rule wins.
- **Pass context through** — when you delegate, carry the user's description + any answers into the target skill's args (e.g. `--feature`, the quoted description).

## Routing table (condensed — full version in `diagram-selection.md`)

| The user wants to show… | Skill | Key disambiguator |
|---|---|---|
| Who calls whom, **over time** (login, checkout, webhook, error path) | `/sequence` | a time-ordered call chain |
| An entity's **states + transitions** (Order: pending→paid→cancelled) | `/state` | a status lifecycle |
| **Multi-role business process** (who does which step, many decisions) | `/activity-swimlane` ⭐ default | ≥2 roles/lanes |
| Compact 1-2 role flow, **inline** in a doc | `/activity` | needs GitHub/Obsidian inline render |
| Nice **standalone** activity image (no real swimlane) | `/d2-activity` | for stakeholders/export |
| **OMG standard** / import into Camunda/Bizagi | `/bpmn` | needs `.bpmn` / workflow engine |
| **Scope**: actors + use cases (kickoff, system boundary) | `/usecase-diagram` | who + what functions |
| **Where data moves** (entities ↔ processes ↔ stores) | `/dfd` | the DATA view |
| **Decompose scope/ideas** into a tree (discovery) | `/mindmap` | a scope tree, no actors |
| **User experience** over touchpoints + emotion | `/journey` | steps + satisfaction |
| **Roadmap / milestones** over time (PM-light, no Gantt) | `/timeline` | milestones by period |
| **Data model** — inline in a doc | `/erd` | Mermaid, BA-readable |
| **Data model** — nice standalone image | `/d2-erd` | D2, pretty |
| **Data model** — dev handoff / SQL export | `/dbdiagram` | DBML, real types |
| **Architecture** — 1 quick context image | `/d2-architect` | single level |
| **Architecture** — multi-level C4 + presentation | `/system-design` | Context→Container→Component + HTML |
| **One function/module's behavior** read from CODE | `/code-flow` | single target, with `file:line` |
| **Whole-codebase** architecture set read from CODE | `/scan-project` | whole project |

## The 2 questions you may ask (pick only the relevant ones)

1. **Source — description/spec, or existing code?** → code + one target = `/code-flow`; code + whole project = `/scan-project`; else the matching diagram skill.
2. **Output shape — inline in a doc, or a standalone image for stakeholders?** → inline = Mermaid family (`/activity`,`/erd`,`/sequence`,`/state`,`/mindmap`,`/journey`,`/timeline`); standalone/export = D2 family (`/d2-activity`,`/d2-erd`,`/dfd`,`/d2-architect`,`/system-design`).
3. *(only if still tied)* **View — control-flow (who does what), data-flow (where data moves), or structure (how blocks nest)?** → control-flow = activity/sequence/state; data-flow = `/dfd`; structure = `/system-design`/`/d2-architect`.

## Approach

1. **Parse the need** from the arg or the conversation. Note any `--feature`, a quoted description, an `@file`, or a code path/symbol.
2. **Match the routing table.** If exactly one row fits → skip to step 4.
3. **Ambiguous (2-3 candidates)?** Ask the **single most decisive** question above (at most 2 questions total, batched). Do NOT ask if the table already decides.
4. **Announce + delegate:** print one line — `→ /<skill> <inferred args> (because <one-line reason>)` — then **RUN that skill** with the description/args carried through. With `--recommend-only`, stop after the announcement (let the user run it).
5. **If nothing fits** (the need isn't a diagram — e.g. pure prose spec, or deployment/infra) → say so in one line + suggest the closest skill or `/srs`.

## Examples

- `/diagram "show how the login + OAuth callback flow works"` → **`/sequence`** (time-ordered call chain). Run `/sequence "login + OAuth callback" --feature <slug>`.
- `/diagram "who does what in the refund process, 3 departments"` → **`/activity-swimlane`** (multi-role). 
- `/diagram "where does the order data go, which DB holds it"` → **`/dfd`** (data-flow view).
- `/diagram "break the product scope into a tree before writing the SRS"` → **`/mindmap`**.
- `/diagram "the first-time buyer experience, where they get frustrated"` → **`/journey`**.
- `/diagram "how does placeOrder() in src/orders work"` → **`/code-flow`** (one function in code).
- `/diagram "the whole architecture of this repo"` → **`/scan-project`** (whole codebase).
- `/diagram "data model, hand off to dev with SQL"` → **`/dbdiagram`**.

## Gotchas

- **Don't over-ask** — if the table decides in one row, run the skill with zero questions.
- **Inline vs standalone is the most useful disambiguator** — many "which activity/ERD?" questions collapse to "do you want it inline in the doc, or a pretty export image?".
- **Keep in sync** — when a diagram skill is added/removed, update this table AND `diagram-selection.md` together.
- **You are not a renderer** — never emit a diagram yourself; always delegate.

## References

- @../../rules/diagram-selection.md (source of truth — full decision matrix + "when to use" per type)
- @../../rules/feature-bootstrap.md
