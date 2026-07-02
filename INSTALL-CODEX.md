# Porting dev-diagram-kit to Codex CLI

**English** · [Tiếng Việt](INSTALL-CODEX.vi.md)

> Bring the 14 skills (12 diagramming + `/scan-project` + `/sync-confluence`, originally written for Claude Code) over to **Codex CLI**. Codex reads the `.codex/` directory at the project root (parallel to Claude Code's `.claude/`) and the base `AGENTS.md` file. Contents: (A) Codex structure, (B) Claude Code → Codex mapping, (C) copy-paste prompt in `PROMPT-CODEX.md`.
>
> ⚠️ **`/sync-confluence` depends on the Atlassian MCP:** this skill does not use a render engine; it calls the Atlassian MCP (`updateConfluencePage`...). It only runs if Codex has an **equivalent Atlassian MCP** configured + authenticated; if your Codex build lacks this MCP → still copy SKILL.md but the skill will not work, **skip** it.

---

## A. How Codex reads configuration

| Type | Claude Code | Codex CLI |
|---|---|---|
| Skills | `.claude/skills/{name}/SKILL.md` | `.codex/skills/{name}/SKILL.md` |
| Rules | `.claude/rules/*.md` | `.codex/rules/*.md` |
| Agents | `.claude/agents/{name}.md` (Markdown + frontmatter) | `.codex/agents/{name}.toml` (`description` + `developer_instructions`) |
| Scripts | `.claude/scripts/*.mjs` (`mermaid-verify.mjs`, `doctor.sh`) | `.codex/scripts/*` (kept as-is, Node/bash) |
| Templates | `.claude/templates/*.md` (renamed from `_templates/`) | `.codex/templates/*.md` |
| Base file | `CLAUDE.md` | `AGENTS.md` |

> **The copy source lives at the ROOT of this package's repo**: `skills/` (14 skills), `agents/`, `rules/`, `scripts/`, `templates/`. (The old `claude-code/...` tree has been removed — no longer referenced.)

The main difference: **skills/rules/scripts stay almost unchanged**; only the **agent** changes format (Markdown → TOML). The engines (D2 `render.sh`, PlantUML `plantuml_encode.py`, the BPMN engine, `mermaid-verify.mjs`) are engine-independent scripts and run exactly the same.

---

## B. Detailed mapping

### B.1 — Skills (unchanged)

```bash
mkdir -p <project>/.codex/skills <project>/.codex/templates
cp -R skills/.       <project>/.codex/skills/       # 14 skills (including system-design, scan-project, sync-confluence)
cp    templates/*.md <project>/.codex/templates/    # diagram file skeletons
```

> `templates/diagram-*.md` + `usecase-index.md` are referenced by `/sequence /activity /state /erd /bpmn /usecase-diagram` (`@../../templates/...`). Copy them all, otherwise the skills lack their file skeletons. (Templates now live in `.codex/templates/`, no longer in `_templates/` at the project root.)

Claude Code's SKILL.md frontmatter (`allowed-tools`, `user-invocable`, `argument-hint`, `context`) — Codex mainly uses `name` + `description` to trigger. Codex ignores the extra fields, so you **don't need to delete them**, but do review: if Codex reports a frontmatter parse error, keep only `name` + `description` and move the parameter syntax into a "How to call" section in the body.

### B.2 — Rules (unchanged)

```bash
mkdir -p <project>/.codex/rules
cp rules/*.md  <project>/.codex/rules/
```

Fix references in SKILL.md if they point to `@.claude/rules/...` → `.codex/rules/...`. (Or leave them relative as `rules/...` if Codex can resolve that — test it.)

### B.3 — Scripts / engine (unchanged)

```bash
mkdir -p <project>/.codex/scripts
cp scripts/*  <project>/.codex/scripts/   # mermaid-verify.mjs + doctor.sh
```

The engines live inside each skill (`bpmn/engine/`, `d2-activity/render.sh`, `usecase-diagram/` + `activity-swimlane/` `plantuml_encode.py`) — already copied along with B.1. Remember to run `npm install` in `.codex/skills/bpmn/engine/` once.

> **IMPORTANT — SKILL.md calls scripts/engines via the dual-mode token** `${CLAUDE_PLUGIN_ROOT:-.claude}/...`, e.g. `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"`, `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs"`. Codex does NOT set `CLAUDE_PLUGIN_ROOT` → you must rewrite **both the `${CLAUDE_PLUGIN_ROOT:-.claude}/` token AND every `.claude/` string** to `.codex/` (becoming `.codex/scripts/mermaid-verify.mjs`, `.codex/skills/d2-activity/render.sh`...).
>
> `/scan-project` **reuses exactly those shared paths** — it calls `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"` and `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/system-design/resources/c4-export-template.html"` → the same rewrite rule above covers it, no special handling needed.
>
> `/sync-confluence` does **not** call any script/engine — it uses the **Atlassian MCP** (`getAccessibleAtlassianResources`, `getConfluencePage`, `updateConfluencePage`...). The MCP is not ported by path like a script: it only runs if Codex has an equivalent authenticated Atlassian MCP. If not → skip this skill (see the caveat at the top of the file).

### B.4 — Agents (change Markdown → TOML)

The `diagram-reviewer` agent needs to be converted to `.toml`:

```toml
# .codex/agents/diagram-reviewer.toml
description = '<copy the description line from diagram-reviewer.md frontmatter>'
developer_instructions = """
<copy the ENTIRE body content of diagram-reviewer.md here>
"""
```

The review content stays the same, only the shell changes.

---

## C. Items to handle by hand

- **Paths in SKILL.md:** review every `.claude/` string **AND the `${CLAUDE_PLUGIN_ROOT:-.claude}/` token** → `.codex/` (scripts, render.sh, engine). This is the most commonly missed spot. `/scan-project` shares these paths → covered by the same rewrite.
- **BPMN engine:** `npm install` in `.codex/skills/bpmn/engine/`.
- **`/sync-confluence` (Atlassian MCP):** there is no script to rewrite; it only runs if Codex has an equivalent authenticated Atlassian MCP. If your Codex build does not support this MCP → skip the skill (copying SKILL.md is fine but it won't work).
- **Test each engine:** run one skill per engine (Mermaid / PlantUML / D2 / BPMN / DBML) and confirm render + compile-check work.

---

## D. Automated prompt

No need to do each step by hand — open the project in Codex CLI, **open `PROMPT-CODEX.md` and paste the entire prompt in it into the chat**. Codex will copy + convert the Claude Code skill set into the `.codex/` directory correctly.

---

## E. Post-port checklist

- [ ] `.codex/skills/` has all 14 skills (including `system-design`, `scan-project`, `sync-confluence`).
- [ ] `.codex/templates/` has `diagram-*.md` + `usecase-index.md`.
- [ ] `.codex/rules/` has the rules (approval-gate, ba-conventions, diagram-selection, feature-bootstrap, naming-conventions, language, atlassian-sync...).
- [ ] `.codex/scripts/mermaid-verify.mjs` present; SKILL.md has rewritten **both `.claude/` and the `${CLAUDE_PLUGIN_ROOT:-.claude}/` token** → `.codex/` (including the shared paths that `/scan-project` calls).
- [ ] The `diagram-reviewer` agent has become `.codex/agents/diagram-reviewer.toml`.
- [ ] `npm install` done in `.codex/skills/bpmn/engine/`.
- [ ] `/sync-confluence`: confirm Codex has an equivalent (authenticated) Atlassian MCP — if not, mark this skill "skip".
- [ ] Run one skill per engine → render OK, compile-check OK.
