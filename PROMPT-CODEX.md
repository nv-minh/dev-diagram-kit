# Prompt to install dev-diagram-kit into Codex CLI

**English** · [Tiếng Việt](PROMPT-CODEX.vi.md)

> **How to use:** open this package's directory inside your project (or copy the package into the project) → open Codex CLI at the project → copy the ENTIRE prompt block below → paste it into the chat → send. Codex will copy + convert the skills itself. To understand the mechanism, see `INSTALL-CODEX.md`.

---

````text
This is the dev-diagram-kit, 14 skills for devs doing BA work (12 diagramming skills + /scan-project
+ /sync-confluence), originally written for Claude Code.
You are Codex CLI. COPY the Claude Code skill set found in the package directory
"dev-diagram-kit/" into this project's .codex/ and CONVERT the structure, paths and
mechanisms to be compatible with Codex.

SOURCE (read before you start) — the canonical tree now lives at the repo ROOT (the old claude-code/ tree is gone):
- 14 skills:  dev-diagram-kit/skills/
              (sequence, activity, activity-swimlane, bpmn, erd, state,
               usecase-diagram, d2-activity, d2-erd, d2-architect, system-design, dbdiagram,
               scan-project, sync-confluence)
- Rules:      dev-diagram-kit/rules/*.md
- Agent:      dev-diagram-kit/agents/diagram-reviewer.md
- Script:     dev-diagram-kit/scripts/  (mermaid-verify.mjs + doctor.sh)
- Templates:  dev-diagram-kit/templates/*.md  (renamed from _templates/)
- Sample:     dev-diagram-kit/example/food-delivery/  (what correct output looks like;
              the example uses 11/12 skills, not yet system-design)

STEPS:

1. Copy skills + templates AS-IS:
   cp -R dev-diagram-kit/skills/.       .codex/skills/
   cp    dev-diagram-kit/templates/*.md .codex/templates/
   (create .codex/skills/ and .codex/templates/ if they don't exist; templates diagram-*.md + usecase-index.md
    are referenced by /sequence /activity /state /erd /bpmn /usecase-diagram via @../../templates/;
    no more _templates/ at the project root)

2. Copy rules AS-IS:
   cp dev-diagram-kit/rules/*.md  .codex/rules/

3. Copy the script:
   cp dev-diagram-kit/scripts/*  .codex/scripts/   (mermaid-verify.mjs + doctor.sh)

4. FIX PATHS in every SKILL.md: change BOTH the token "${CLAUDE_PLUGIN_ROOT:-.claude}/" AND every
   ".claude/" string to ".codex/" (Codex does NOT set CLAUDE_PLUGIN_ROOT, so the token must be rewritten).
   (in particular: node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs" → node .codex/scripts/mermaid-verify.mjs;
    "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" → .codex/skills/d2-activity/render.sh;
    "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs" → .codex/skills/bpmn/engine/bpmn-build.mjs).
   scan-project REUSES exactly those shared paths (render.sh, mermaid-verify.mjs,
   skills/system-design/resources/c4-export-template.html) → the same rewrite rule covers it.
   If Codex reports a SKILL.md frontmatter parse error, keep only name + description and
   move the parameter syntax (argument-hint) into a "How to call" section in the body.

4b. sync-confluence does NOT call any script/engine — it uses the ATLASSIAN MCP (updateConfluencePage...),
   with no path to rewrite. It only runs if Codex has an equivalent Atlassian MCP configured + authenticated.
   If this Codex build does not support that MCP → still copy SKILL.md but SKIP the skill (note it in the report).

5. CONVERT THE REVIEW AGENT to TOML:
   - Create .codex/agents/diagram-reviewer.toml with:
       description = '<the description line from diagram-reviewer.md frontmatter>'
       developer_instructions = """<the entire body of diagram-reviewer.md>"""

6. INSTALL the BPMN engine dependencies (once):
   cd .codex/skills/bpmn/engine && npm install

CONSTRAINTS:
- Do NOT change the skills' business logic (ask/choose detail at the right altitude for the reader — the kit serves
  devs doing BA, real technical detail IS allowed; L1/L2 approval gate; compile-check/validate/semcheck
  before reporting done; keep the bilingual EN/VI behavior per rules/language.md).
- The render engines (Mermaid mmdc, PlantUML plantuml.com, D2 binary, BPMN engine, dbml2sql)
  must be installed on the machine — if any is missing, tell me the install command (see huong-dan/01-cai-dat-cong-cu.md).
  scan-project needs d2 + mmdc; sync-confluence needs the Atlassian MCP (not a render engine).

REPORT after you finish:
1. The .codex/ directory tree you created.
2. The list of paths you fixed (both ".claude/" AND the token "${CLAUDE_PLUGIN_ROOT:-.claude}/" → .codex/).
3. Which engines are not installed on this machine + their install commands; whether sync-confluence has an Atlassian MCP or must be skipped.
Then run a test: /usecase-diagram --feature food-delivery (or one Mermaid skill) and confirm the
skill STOPS at the L1 plan before writing, does not silently write on its own.
````
