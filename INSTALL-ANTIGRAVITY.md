# Porting dev-diagram-kit to Google Antigravity IDE

**English** · [Tiếng Việt](INSTALL-ANTIGRAVITY.vi.md)

> Bring the 14 skills (12 diagramming + `/scan-project` + `/sync-confluence`, originally written for Claude Code) over to **Google Antigravity IDE**. Contents: (A) Antigravity configuration structure, (B) Claude Code → Antigravity mapping, (C) copy-paste prompt in `PROMPT-ANTIGRAVITY.md`.
>
> Updated against the Antigravity documentation as of ~06/2026. Paths may change between releases — always cross-check the actual directory tree in the IDE (see warning A.3).
>
> ⚠️ **`/sync-confluence` depends on the Atlassian MCP:** this skill does not use a render engine; it calls the Atlassian MCP (`updateConfluencePage`...). It only runs if Antigravity has an **equivalent Atlassian MCP** configured + authenticated; if not → still copy SKILL.md but the skill will not work, **skip** it.

---

## A. How Antigravity is configured

### A.1 — Locations (workspace / project scope)

| Type | Path | Role |
|---|---|---|
| **Skills** | `<project-root>/.agents/skills/{name}/SKILL.md` | The agent "handbook" loaded when relevant. Equivalent to a Claude Code skill. |
| **Rules** | `<project-root>/.agents/rules/*.md` | Like a system instruction — always applied. |
| **Workflows** | `<project-root>/.agent/workflows/*.md` | Saved prompts, invoked with `/<name>` in chat. |
| **AGENTS.md** | `<project-root>/AGENTS.md` | Shared foundation (Antigravity + Cursor + Claude Code all read it). |

### A.2 — Global scope (all projects)

| Type | Path |
|---|---|
| Skills | `~/.gemini/config/skills/` |
| Rules | `~/.gemini/GEMINI.md` |

### A.3 — ⚠️ Directory-name warning (`.agent` vs `.agents`)

The easiest place to go wrong — doc sources mix the singular and plural:
- **Skills/Rules:** most use **`.agents/`** (plural).
- **Workflows:** some sources say `.agent/workflows/`, others `.agents/workflows/`; Antigravity also lets you create workflows via the UI.

👉 **Before copying, create one empty test skill via Antigravity's UI/command to see what directory name it produces.** Use exactly that name. The instructions below default to `.agents/`.

### A.4 — Antigravity's SKILL.md

Minimal frontmatter:
```yaml
---
name: sequence
description: <a SEMANTIC trigger phrase, the more specific the more reliably it activates correctly>
---
```
- `description` is **required** and is the "trigger phrase" — a specific description ("Draw a sequence diagram for a login/payment/webhook flow, export the Mermaid into srs/flows.md") is what gets it loaded correctly.
- Activated via natural language; if you want to type `/sequence`, additionally create a thin Workflow (B.4).

---

## B. Claude Code → Antigravity mapping

| Claude Code component | In the package | → Antigravity |
|---|---|---|
| `.claude/skills/{name}/SKILL.md` | `skills/` (14 skills, including `system-design`, `scan-project`, `sync-confluence`) | `.agents/skills/{name}/SKILL.md` (edit frontmatter, B.1) |
| `.claude/agents/diagram-reviewer.md` | `agents/` | embed inline into the skill (B.2) or an Antigravity 2.0 subagent |
| `.claude/rules/*.md` | `rules/` | `.agents/rules/*.md` (keep content) |
| `.claude/scripts/mermaid-verify.mjs` | `scripts/` (+ `doctor.sh`) | `.agents/skills/_shared/mermaid-verify.mjs` (or next to the skill using it) |
| `.claude/templates/*.md` | `templates/` (renamed from `_templates/`) | `.agents/templates/` (so `@../../templates/` in SKILL.md resolves) |
| engine (render.sh, plantuml_encode.py, bpmn/engine/) | inside each skill | keep in `.agents/skills/{name}/` |

> **The copy source lives at the ROOT of this package's repo**: `skills/ agents/ rules/ scripts/ templates/`. The old `claude-code/...` tree has been removed — no longer referenced.

### B.1 — SKILL.md frontmatter

- **Keep:** `name`, `description`.
- **Drop:** `allowed-tools`, `user-invocable`, `context`, `argument-hint`.
- The parameter syntax (`/sequence "<desc>" --feature <slug>`) → move into a "How to call" section in the body.

### B.2 — Review agent (`diagram-reviewer`)

Claude Code spawns it via the Task tool; Antigravity has no exact equivalent. Two ways:
1. **Inline (recommended when first porting):** embed the content of `diagram-reviewer.md` as a "Diagram self-review criteria" section in the SKILL.md of `/sequence` + `/activity`, so the agent checks coverage itself (missing actor/lane, skipped error branch, dead-end) before reporting done.
2. **Subagent (Antigravity 2.0):** if your build supports subagents, split it into a subagent and call it as a step.

### B.3 — Script/engine paths in SKILL.md

SKILL.md calls scripts/engines via the **dual-mode** token `${CLAUDE_PLUGIN_ROOT:-.claude}/...` (e.g. `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"`, `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs"`). Antigravity does NOT set `CLAUDE_PLUGIN_ROOT` → review and change **both the `${CLAUDE_PLUGIN_ROOT:-.claude}/` token AND every `.claude/` string** to match the new location in `.agents/`. The `@../../rules/...` reference → drop it (rules in `.agents/rules/` are auto-loaded) or fix the path.

`/scan-project` reuses exactly those shared paths (`skills/d2-activity/render.sh`, `scripts/mermaid-verify.mjs`, `skills/system-design/resources/c4-export-template.html`) → the same rewrite rule covers it. `/sync-confluence` does **not** call any script/engine — it uses the **Atlassian MCP**, with no path to rewrite; it only runs if Antigravity has an equivalent authenticated Atlassian MCP (if not → skip, see the caveat at the top of the file).

### B.4 — (Optional) The `/sequence`, `/erd`... commands

If you want to type commands like Claude Code: create a thin Workflow `.agent/workflows/{name}.md` (frontmatter with `description`) pointing to the skill.

---

## C. Points to note

- **The render engines still need to be installed on the machine** (mmdc, d2, dbml2sql, bpmn engine npm install) — Antigravity only replaces the AI orchestration layer, not the engines. See `huong-dan/01-cai-dat-cong-cu.md`. `/scan-project` needs `d2` + `mmdc`.
- **PlantUML** (`/activity-swimlane`, `/usecase-diagram`) renders via the internet — kept as-is.
- **`/sync-confluence` (Atlassian MCP):** not a render engine but an MCP tool. It only works if Antigravity has an equivalent authenticated Atlassian MCP; if not → skip this skill.

---

## D. Automated prompt

No need to do each step by hand — open this package in Antigravity IDE, **open `PROMPT-ANTIGRAVITY.md` and paste the entire prompt in it into the agent chat**. The AI will copy + convert the Claude Code skill set to the Antigravity IDE standard (the prompt already instructs the agent to follow the latest Antigravity docs ~06/2026).

---

## E. Post-port checklist

- [ ] `.agents/skills/` has all 14 skills (including `system-design`, `scan-project`, `sync-confluence`), frontmatter reduced to `name` + `description`.
- [ ] `.agents/rules/` has the rules (including `language.md` + `atlassian-sync.md`); `.agents/templates/` has `diagram-*.md` + `usecase-index.md`.
- [ ] Script/engine paths in SKILL.md point to the correct `.agents/` location — changed **both `.claude/` and the `${CLAUDE_PLUGIN_ROOT:-.claude}/` token** (including the shared paths that `/scan-project` calls).
- [ ] The `diagram-reviewer` criteria are inline in `/sequence` + `/activity` (or a subagent).
- [ ] Engines installed (mmdc/d2/dbml2sql/bpmn npm install).
- [ ] `/sync-confluence`: confirm Antigravity has an equivalent (authenticated) Atlassian MCP — if not, mark this skill "skip".
- [ ] Run one skill per engine → render OK.

---

## References (Antigravity, as of ~06/2026)

- [Getting Started with Google Antigravity — Codelabs](https://codelabs.developers.google.com/getting-started-google-antigravity)
- [Authoring Antigravity Skills — Codelabs](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)
- [Antigravity Docs — Skills](https://antigravity.google/docs/skills) · [Rules & Workflows](https://antigravity.google/docs/rules-workflows)
