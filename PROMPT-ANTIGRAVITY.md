# Prompt to install dev-diagram-kit into Antigravity IDE

**English** · [Tiếng Việt](PROMPT-ANTIGRAVITY.vi.md)

> **How to use:** open this package's directory (`dev-diagram-kit/`) in Google Antigravity IDE → open the agent chat → copy the ENTIRE prompt block below → paste → send. The agent reads the files in the package itself, copies and moves the skills into the right place. To understand the mechanism, see `INSTALL-ANTIGRAVITY.md`.

---

````text
This is the dev-diagram-kit, 14 skills for devs doing BA work (12 diagramming skills + /scan-project
+ /sync-confluence), originally written for Claude Code.
You are an agent of the Google Antigravity IDE. Your task is to COPY this set over to Antigravity
and CONVERT it to the proper Antigravity standard, not install the Claude Code structure directly.

Follow the latest Antigravity docs around 06/2026 as you work:
antigravity.google/docs/skills, antigravity.google/docs/rules-workflows and the codelab
Authoring Antigravity Skills. If you can read the web, cross-check directly; if not, follow
INSTALL-ANTIGRAVITY.md in this package since the file has been updated to the docs around 06/2026.
Paths and formats may differ between Antigravity releases, so do not guess based on an old release.

══════════ STEP 0 — CHOOSE SCOPE AND VERIFY CONFIGURATION ══════════
BEFORE copying, ask me and wait for the answer: install for the current workspace or install globally for
all projects. Do not choose the scope on your own.

- Workspace: verify whether the actual config directory is .agents/ or .agent/.
- Global: use the global scope under ~/.gemini/ following exactly the structure the current
  Antigravity version supports.
- Check the docs, the existing workspace structure and the IDE's skill-creation screen/command.
- If still unsure, create one empty test skill via the UI or the official command, reload the IDE,
  confirm Antigravity has recognized the skill and record the actual path.
- Delete the test skill after verifying. Use exactly the verified path instead of every sample path
  below, then tell me the scope and config directory you chose.

Call the verified config directory CONFIG_DIR in the following steps.

══════════ STEP 1 — READ THE SOURCES IN THIS PACKAGE ══════════
Read the full source content before creating the target files:

The canonical tree now lives at the ROOT of this package's repo (the old claude-code/ tree is gone):
- 14 skills in skills/: sequence, activity, activity-swimlane, bpmn,
  erd, state, usecase-diagram, d2-activity, d2-erd, d2-architect, system-design, dbdiagram,
  scan-project (scan a codebase → an architecture diagram set, needs d2 + mmdc) and
  sync-confluence (sync code/conversation → Confluence via the Atlassian MCP).
- Rules in rules/*.md (including the bilingual language.md + atlassian-sync.md).
- Review agent in agents/diagram-reviewer.md.
- Script in scripts/ (mermaid-verify.mjs + doctor.sh).
- Templates in templates/*.md (renamed from _templates/).
- Sample in example/food-delivery/ to understand what correct output must look like
  (the example uses 11/12 skills, not yet system-design).
- Also read the engines, scripts and References that each SKILL.md points to before converting.

══════════ STEP 2 — CREATE THE 14 SKILLS FOR ANTIGRAVITY ══════════
For EACH skill, copy it into CONFIG_DIR/skills/{name}/SKILL.md following Antigravity's current
structure.

- Keep ALL of the business content: Goal, Constraints, the Phases, Gotchas and References.
- Convert the Claude Code-dependent parts to Antigravity's equivalent mechanism.
- Frontmatter keeps only name and description, unless the current Antigravity docs require another
  field; if so, add only the required field and note it in the report.
- Drop the Claude Code-only fields: allowed-tools, user-invocable, context and argument-hint.
- Move the old invocation syntax, e.g. /sequence "<desc>" --feature <slug>, into the How to call section.
- Copy each skill's engine along with it, including render.sh, plantuml_encode.py and bpmn/engine/, into the
  correct skill directory; fix every path in SKILL.md to match the new location.

The description is the trigger phrase that decides whether Antigravity recognizes and loads the skill
correctly. Write it specifically by diagram type, engine, input and where the output goes.

- Bad description: Helps with diagrams.
- Good description: Create a Mermaid sequence diagram from a BA business flow, confirm the plan
  before writing into the feature doc, and check the Mermaid syntax before finishing.

Do not use a generic description, do not let the 14 skills have nearly identical descriptions.

══════════ STEP 3 — SCRIPTS, TEMPLATES AND RULES ══════════
- Copy mermaid-verify.mjs (and doctor.sh) into CONFIG_DIR/skills/_shared/ or next to the skills that use it.
- Copy templates/*.md (diagram-*.md + usecase-index.md) into CONFIG_DIR/templates/ so the @../../templates/ reference in SKILL.md resolves (no more _templates/ at the project root).
- IMPORTANT: SKILL.md calls scripts/engines via the dual-mode token "${CLAUDE_PLUGIN_ROOT:-.claude}/..."
  (e.g. node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs";
   "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh";
   node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs").
  Antigravity does NOT set CLAUDE_PLUGIN_ROOT → rewrite BOTH the token "${CLAUDE_PLUGIN_ROOT:-.claude}/"
  AND every ".claude/" string to the correct target path in CONFIG_DIR.
  scan-project REUSES exactly those shared paths (render.sh, mermaid-verify.mjs,
  skills/system-design/resources/c4-export-template.html) → the same rewrite rule covers it.
- sync-confluence does NOT call any script/engine — it uses the ATLASSIAN MCP (updateConfluencePage...),
  with no path to rewrite. It only runs if Antigravity has an equivalent Atlassian MCP configured + authenticated;
  if not → still copy SKILL.md but SKIP the skill (note it in the report).
- Copy the rules into CONFIG_DIR/rules/ if the Antigravity version auto-loads rules there.
- If rules/workflows have a different mechanism per the current docs, use that mechanism instead and note it.
- Fix or drop the References sections in SKILL.md if they still point to old Claude Code paths.
- Do not leave any script, engine or reference still pointing to .claude/ or the token "${CLAUDE_PLUGIN_ROOT:-.claude}/" outside the source directory.

══════════ STEP 4 — CONVERT THE REVIEW AGENT ══════════
Claude Code calls @diagram-reviewer via the Task tool; Antigravity may not have the exact same mechanism.
Convert the review without losing the quality criteria.

- If Antigravity does not reliably support subagents, embed the relevant content from
  diagram-reviewer.md as a Diagram self-review criteria section in the SKILL.md of sequence and
  activity.
- The self-review must happen AFTER creating the diagram but BEFORE reporting done: check for missing
  actor/lane, skipped error or alt branch, dead-end, gateway with a missing branch and inconsistent flow.
- Use inline self-review when the diagram is simple, a short single flow, or the IDE does not support subagents.
- Use a subagent when Antigravity genuinely supports it, the diagram has many actors/lanes/branches, or an
  independent review is needed before finishing.
- If you use a subagent, pass it the diagram content, the specific review request and fix the errors found
  before reporting done; do not just claim you reviewed it.

══════════ STEP 5 — OPTIONAL WORKFLOW OR /<SKILL> COMMAND ══════════
If the Antigravity version supports workflows or slash commands, create a thin workflow for each skill
per the IDE's official path and format. A workflow only needs a clear description pointing to the
corresponding skill so the user can call /sequence, /erd, etc.

If the workspace does not use workflows or the current docs do not support this approach, skip this
step and clearly state how to activate via natural language. Do not create workflow files with a guessed structure.

══════════ STEP 6 — POST-INSTALL CHECK ══════════
Reload or restart Antigravity the way the current docs require, then check each
skill in the list of 14 skills (sync-confluence may be "skip" if the Atlassian MCP is missing).

- Open the Skills panel, command palette, skill-load log or the equivalent mechanism in the IDE.
- Confirm each skill is recognized by name and description, not just that the file exists.
- If a skill does not appear or is not activated by a matching sentence, fix the path, frontmatter or
  description and check again.
- Run a test skill: draw a use case diagram for the food-delivery feature.
- Confirm the agent STOPS at the L1 plan preview before writing files, does not silently write on its own.

══════════ UNCHANGEABLE CONSTRAINTS ══════════
- Keep the LOGIC: ask in business language, do not ask for DB column names, endpoints or frameworks.
- Keep the approval gate: preview the plan before writing files.
- Keep compile-check, validate or semcheck before reporting done; do NOT write a broken diagram.
- Bilingual EN/VI: the output follows the language the user types (force it with --lang en|vi), per rules/language.md;
  engine syntax keywords + real technical identifiers always stay English. The kit serves devs doing BA —
  ask/choose detail at the right altitude, real technical detail IS allowed (no longer banned like the old rule).
- Render engines like Mermaid mmdc, plantuml.com, the d2 binary, the bpmn engine npm install and dbml2sql
  must be on the machine. If any is missing, tell me the install command from huong-dan/01-cai-dat-cong-cu.md.
  scan-project needs d2 + mmdc; sync-confluence needs the Atlassian MCP (not a render engine) —
  without the MCP, skip that skill.

══════════ REPORT ══════════
After finishing, print:

1. The directory tree you created, using the actual verified paths.
2. The full list of 14 skills and Antigravity's recognition status for each skill
   (state clearly whether sync-confluence can run depending on the Atlassian MCP — if not, mark it "skip").
3. How to activate: natural language and /<skill> if a workflow exists.
4. What changed vs Claude Code: frontmatter, review agent, script/engine paths and workflows.
5. The result of the test use case diagram for food-delivery, confirming it stopped at L1 before writing files.
````
