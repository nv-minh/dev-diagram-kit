# 05 — FAQ & troubleshooting

**English** · [Tiếng Việt](../huong-dan/05-cau-hoi-thuong-gap.md)

---

## Installation & environment

**Q: I only want to use `/sequence` — do I have to install everything?**
No. Install just the engine for the skill you use. `/sequence /activity /state /erd` only need Mermaid (Node + mmdc + Chrome). See the table in `01-install-tools.md`.

**Q: `mmdc` says it can't find Chrome.**
Install Chrome for headless use: `npx puppeteer browsers install chrome`, then set `export PUPPETEER_EXECUTABLE_PATH="/path/Google Chrome for Testing"`. The `mermaid-verify.ts` script auto-looks in `~/.puppeteer-cache`.

**Q: `d2: command not found`.**
Install: `curl -fsSL https://d2lang.com/install.sh | sh -s --`. D2 goes into `~/.local/bin` — make sure this folder is in `PATH` (`export PATH="$HOME/.local/bin:$PATH"`).

**Q: `/bpmn` says a module is missing.**
Run `npm install` in `.claude/skills/bpmn/engine/` (the package doesn't include `node_modules`). Needed once. If installed via the **plugin** or **`./install.sh`**, this step already ran automatically — only run it by hand if it reports missing.

**Q: `/dbdiagram` says `dbml2sql` isn't available.**
`npm install -g @dbml/cli`.

**Q: `/sync-confluence` says Atlassian MCP isn't set up.**
This skill writes via **Atlassian MCP**, not a render tool. Type `/mcp` → choose Atlassian (Rovo) → complete OAuth, and make sure the account has **write** permission on the target page. See `01-install-tools.md` Section 7 + `rules/atlassian-sync.md`.

---

## Bilingual EN/VI

**Q: Does the output come out in Vietnamese or English?**
It automatically follows the language you type in: an English description → diagram labels + questions + report in English; Vietnamese → VI. Force it with `--lang en|vi`. Engine syntax keywords (Mermaid/D2/PlantUML/BPMN/DBML) and real technical identifiers (table/service/endpoint) **always** stay in English. Details: `rules/language.md`.

**Q: Can I change the language when re-running on an existing file?**
Update mode defaults to the **existing file's language** for consistency. To change it → add an explicit `--lang`.

---

## Rendering & display

**Q: The .md file has mermaid but I don't see the picture.**
Open it with VS Code (with the Mermaid extension), Obsidian, or view it on GitHub — they auto-render it. Claude Code's chat does **not** render mermaid (only shows the code) — that's why the skill writes it to a file for you to view from an IDE, and self-checks by compiling instead of making you eyeball it.

**Q: PlantUML renders an image but I'm worried about sensitive content.**
`/activity-swimlane` and `/usecase-diagram` send diagram content to `plantuml.com` to render. Sensitive business content → install PlantUML + Java locally and edit `render.sh` to point to an internal server, or use Mermaid/D2 (render offline).

**Q: The BPMN editor HTML opens blank.**
The editor loads bpmn-js via CDN (unpkg) — needs internet when opening. No network → import the `.bpmn` file into Camunda Modeler / draw.io (offline). The `.bpmn` file already contains the diagram coordinates.

**Q: D2 only produces SVG, no PNG.**
PNG needs Chrome. No Chrome → you still get SVG (opening it in a browser is enough). Want PNG: install Chrome then re-run with `--png`.

---

## Choosing a skill

**Q: My process has multiple roles — `/activity` or `/activity-swimlane`?**
Multiple roles + lots of cross interaction → **`/activity-swimlane`** (real swimlane). `/activity` (Mermaid) only suits a compact flow with 1-2 roles that needs inline embedding. See `02-which-skill.md`.

**Q: What's the difference between `/activity-swimlane` and `/bpmn`?**
Both are multi-role swimlanes. `/activity-swimlane` is lightweight, for business description in BA documents. `/bpmn` is for when you need the **OMG standard** or **import into Camunda/Bizagi** (a .bpmn file that runs on a workflow engine).

**Q: `/erd`, `/d2-erd`, `/dbdiagram` — 3 data-model skills?**
Three levels of detail: `/erd` (BA reads it, embedded inline) → `/d2-erd` (nice-looking standalone image) → `/dbdiagram` (closest to dev, has enum/index, SQL export). Choose based on *who's reading + what they'll do*.

**Q: What's the difference between `/scan-project` and `/system-design`?**
Different sources: `/system-design` draws **from a description/interview** (a feature not yet/still being designed); `/scan-project` **reads the CODE** of an existing project (brownfield) to reverse-engineer **the whole set** (C4 + modules + relationships + ERD + sequence) into `docs/_shared/architecture/`. Already have a codebase → `/scan-project`; designing something new from scratch → `/system-design`.

**Q: Does `/sync-confluence` modify code?**
No. It's **read-only** on the code/vault side — it only reads `git diff` or the conversation then updates the **Confluence page** in place (with preview + confirmation). It doesn't write any file in `docs/`.

---

## Skill behavior

**Q: The skill re-asks something I already wrote in the description.**
This shouldn't happen (the no re-ask rule). If it does, point out "I already said this above" — the skill will skip it. Report it if it keeps happening.

**Q: The skill asks me for a DB table name / endpoint — is that a problem?**
No. The kit serves **devs doing BA work**, so for **technical diagrams** (`/erd` `/dbdiagram` `/sequence` · C4 Container · `/scan-project`) the skill **may** use/ask for real technical detail (column/endpoint/schema/framework) — the old rule banning this has been dropped (`rules/ba-conventions.md` Section 3). Only for **business-communication diagrams** (use case, business activity, C4 Context) does the skill keep plain language, at the right altitude for the reader.

**Q: The skill writes a file without asking me.**
Not allowed. Every skill goes through L1 (preview) before writing. If you see it writing silently → it may be running in a non-interactive environment (fork) — run the skill in a normal Claude Code chat session.

**Q: The feature doesn't exist yet — can the skill still create it?**
Yes. A diagram skill is an "entry point" — it derives the slug + asks about scope + creates `docs/{slug}/`. No need to run another skill first.

---

## Still stuck?

- Compare your output against `example/atlas-re/` (the correct sample).
- Read `explain-skills/<skill>.md` to understand what the skill does (in business language).
- Read the original SKILL.md in `skills/<skill>/` (technical detail for the AI).
