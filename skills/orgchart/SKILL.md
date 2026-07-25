---
name: orgchart
description: Use when you need an organization / reporting-hierarchy chart (who reports to whom, grouped by team/department) — for kickoff or stakeholder analysis. Trigger with `/orgchart --feature <slug>` (or `--shared` for a project-wide org). D2 skill family, like `/d2-architect`.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>] [--shared]"
---

# /orgchart — Organization / Reporting-Hierarchy Chart (D2)

> D2 skill family: `/d2-activity` · `/d2-erd` · `/d2-architect` · `/dfd` · `/orgchart` (this). All share `render.sh` at `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`.

## Goal

Draw an **org chart** — people/roles + their reporting lines, optionally grouped into teams/departments — using D2 `shape: person` + edges labelled `reports to`. Output in `docs/{feature}/orgchart/` (or `docs/_shared/orgchart/` with `--shared` for a project-wide org):

1. `{slug}-orgchart.d2` — D2 source (git-tracked).
2. `{slug}-orgchart.svg` — pre-rendered.

## Why D2 (and what this is NOT)

- D2 `direction: down` + `shape: person` gives a clean top-down reporting tree; ELK stacks the levels neatly.
- This is the **reporting hierarchy** ("who reports to whom"). It is NOT a **stakeholder power/interest map** (a 2×2 matrix) — that is a different artifact; if needed, draw it separately (Mermaid `quadrantChart`), do not force it into this tree.
- It is NOT a process/flow diagram → use `/activity-swimlane` for "who does which step".

## Constraints

- **Fixed output** `docs/{feature}/orgchart/{slug}-orgchart.d2` + `.svg` (or `--shared` → `docs/_shared/orgchart/`).
- **`--feature` optional** — auto-detect; file exists → update mode automatically. **Feature does not exist + an org description → auto-derive slug + create** (entry point, `feature-bootstrap.md` group A).
- **AI writes the source, NO coordinates** — ELK handles layout (shared `render.sh`).
- **Compile must PASS** before reporting done; **review the image yourself** (accuracy).
- **L1 approval** before Write — BA-friendly prose (headcount + teams + reporting lines), do NOT dump the source.
- **NO L3 iterate** — review from the `.svg`.
- **Right altitude** — people/roles + reporting + teams. Do NOT draw a RACI matrix or a process flow here.
- **Bilingual (mirror input — @../../rules/language.md)** for role/team labels; real names kept AS-IS.
- **Theme** — apply the pastel tokens from `@../../rules/diagram-style.md` (Person = blue, highlight the head with cream yellow).
- **Idempotent** — re-run → update mode (L2 diff).

## Inputs

```
/orgchart --feature <slug>            # read brainstorm/spec stakeholder section, or interview
/orgchart "<org description>"         # feature doesn't exist → derive slug + interview + create
/orgchart --shared                    # project-wide org → docs/_shared/orgchart/
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
d2 installed: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## How to build (step-by-step)

### Step 1 — Gather the org facts (by priority)

Read by priority → extract:
1. `docs/{feature}/brainstorms/*.md` stakeholder/kickoff section → people + roles + reporting + teams.
2. `docs/{feature}/srs/{feature}-spec.md` (stakeholders/roles list) → roles.
3. None → interview EXACTLY the scope the org chart needs (one batched pass): the **head** (top of the tree) · the **people/roles** and their **titles** · the **reporting line** of each (who they report to) · optional **team/department** grouping. Do NOT invent people.

Fact-list (coverage checklist): every person/role + their manager + their team.

### Step 2 — D2 formula (reporting tree)

```ini
direction: down

CEO: "CEO\nEdward Ngo" { shape: person; style.fill: "#FFF4E5" }   # highlight the head (cream)

Engineering: "Engineering" {   # team = a container grouping its members
  CTO: "CTO\nAlice" { shape: person; style.fill: "#E8F0FE" }
  Backend: "Backend Lead\nBob" { shape: person; style.fill: "#E8F0FE" }
  Frontend: "Frontend Lead\nCarol" { shape: person; style.fill: "#E8F0FE" }
}

Business: "Business" {
  CMO: "CMO\nDan" { shape: person; style.fill: "#E8F0FE" }
  CFO: "CFO\nEve" { shape: person; style.fill: "#E8F0FE" }
}

# Reporting lines (edge = "reports to"). Reference the team's child via a dot.
CEO -> Engineering.CTO: reports to
CEO -> Business.CMO: reports to
CEO -> Business.CFO: reports to
Engineering.CTO -> Engineering.Backend: reports to
Engineering.CTO -> Engineering.Frontend: reports to
```

**Rules:**
- 1 person = 1 `shape: person`; the title + name can be split with `\n`.
- Highlight only the **head** with cream `#FFF4E5`; everyone else gets the person pastel `#E8F0FE`.
- Group people into **team containers** (`Team: "Team" { ... }`) when there are ≥3 people on the same side — keeps the tree tidy. Reference a member as `Team.Member`.
- Reporting edge label = `reports to` (one convention, don't vary it). `direction: down` so the head is on top.
- QUOTE labels containing `( ) / | :`.

### Step 3 — Render + verify

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/orgchart/{slug}-orgchart.d2
# compile fail → usually a missing quote on a label with ( ) | / : → fix, re-render.
```

## L1 plan preview (BA-friendly)

> I'll draw the org chart for **{feature|project}** at `docs/{feature}/orgchart/{slug}-orgchart.d2` (+ `.svg`):
>
> **Head:** {CEO / project lead}
> **People ({N}):** {list}
> **Teams ({M}):** {Engineering, Business...}
>
> Source: {brainstorm | spec | you provide}.
> Logged: activity log "added org chart".
> Apply? (Y / edit)

## Output report

```
✅ Org chart: docs/{feature}/orgchart/{slug}-orgchart.svg
   People: {N} | Teams: {M} | D2 compile: OK

Open the .svg in browser/IDE/Obsidian to view.
Need changes? /orgchart --feature {feature} (enters update mode automatically).
```

## Gotchas

- **d2 not installed** → stop, print 1 install line.
- **It's a reporting tree, not a RACI / process** — for "who does which step" use `/activity-swimlane`; for power/interest use a separate Mermaid `quadrantChart`.
- **`\n` for title + name** — `shape: person` shows the label as the person's body text; split with `\n`.
- **Team containers** — only group when ≥3 on a side; a 4-person flat org needs no containers.
- **Cross-team reporting** (dotted-line) → label the edge `dotted-line` and add `style.stroke-dash: 3` to that edge.
- **Big org** (>15 people) → split by department into separate charts, or narrow scope.
- **Update mode** → Read the old source, L2 diff, re-render after user Y.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/diagram-style.md
- @./references/example-orgchart.d2
- @../../skills/d2-activity/render.sh (shared D2 renderer)
