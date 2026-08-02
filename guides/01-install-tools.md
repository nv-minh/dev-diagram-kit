# 01 — Install render tools (by engine)

**English** · [Tiếng Việt](../huong-dan/01-cai-dat-cong-cu.md)

> Each skill group uses a different render engine. Only install what you need. The table below shows which skill needs what.

| Engine | Skill | Required | Needs internet? |
|---|---|---|---|
| **Mermaid** | `/sequence` `/activity` `/state` `/erd` | Node ≥18, `@mermaid-js/mermaid-cli` (mmdc), Chrome | No (once installed) |
| **PlantUML** | `/activity-swimlane` `/usecase-diagram` | Python 3 (encode), curl | **Yes** (renders via plantuml.com) |
| **D2** | `/d2-activity` `/d2-erd` `/d2-architect` `/system-design` `/scan-project` | `d2` binary; Chrome (if you want PNG) | No |
| **BPMN** | `/bpmn` | Node ≥18 + `npm install` inside the engine; browser to open the editor | Only when opening the HTML editor (bpmn-js via CDN) |
| **DBML** | `/dbdiagram` | `@dbml/cli` (Node) | No |
| **Atlassian MCP** | `/sync-confluence` | Authenticated Atlassian MCP (Rovo) (`/mcp`) + write permission on the page — **not** a render tool | **Yes** (calls Confluence) |

> `/scan-project` uses **D2** for most diagrams **and Mermaid** (`mmdc`) for the main-flow sequence — you need both engines if you want the full set.

---

## 1. Node.js (foundation for Mermaid, BPMN, DBML)

Needs Node ≥18 (≥20 recommended). Check:
```bash
node --version
```
Don't have it → install via [nodejs.org](https://nodejs.org) or `nvm`.

---

## 2. Mermaid CLI (`mmdc`) — for `/sequence /activity /state /erd`

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc --version   # check
```

Mermaid CLI needs **Chrome** to render. If your machine doesn't have Chrome for headless use:
```bash
npx puppeteer browsers install chrome
```
Note the Chrome path if `mmdc` reports it's missing — set the environment variable:
```bash
export PUPPETEER_EXECUTABLE_PATH="/path/to/Google Chrome for Testing"
```

> The skill calls `mermaid-verify.ts` (in `.claude/scripts/`, run via `tsrun.sh`) to **compile-check** every Mermaid block after writing — catching syntax errors before reporting "done". The script auto-finds Chrome; if it fails, set `PUPPETEER_EXECUTABLE_PATH`.

---

## 3. D2 — for `/d2-activity /d2-erd /d2-architect /system-design /scan-project`

```bash
curl -fsSL https://d2lang.com/install.sh | sh -s --
d2 --version   # check
```
D2 installs to `~/.local/bin/d2` by default. Make sure this folder is in your `PATH`.

- SVG rendering **doesn't need internet**.
- PNG needs Chrome (the `render.sh` script auto-finds Chrome at `~/.puppeteer-cache` or `google-chrome`/`chromium`). No Chrome → you still get SVG (openable in a browser).

> All 5 D2 skills (including `/system-design`'s C4 and `/scan-project`) share the same `render.sh` located at `.claude/skills/d2-activity/render.sh`. The skill calls it itself — you don't need to remember the d2/Chrome path. `/scan-project` also calls Mermaid for the main-flow sequence (see Section 2).

---

## 4. PlantUML — for `/activity-swimlane /usecase-diagram`

**No need to install Java/plantuml.jar.** The skill encodes the diagram then calls the public `plantuml.com` server to get an `.svg`. You only need:
```bash
python3 --version   # for the plantuml_encode.py script
curl --version      # to call the server
```

> ⚠️ **Privacy note:** diagram content (actor names, step names) is **sent over the internet** to plantuml.com on every render. If your business content is sensitive → install PlantUML + Java locally and edit `render.sh` to point to an internal server, or use another engine (Mermaid/D2 render offline).

---

## 5. BPMN — for `/bpmn`

The BPMN engine needs its dependency installed **once**. If installed via the **plugin** or **`./install.sh`**, this step runs **automatically** (plugin via the SessionStart hook; `install.sh` already calls `npm install`). Install manually when needed:
```bash
cd <workspace>/.claude/skills/bpmn/engine
npm install
```
> The shared package does **not include `node_modules`** (~11MB heavy) — you run `npm install` to fetch it. `package.json` + `package-lock.json` are included.

The skill then runs the engine itself. To view BPMN:
- Open `docs/{feature}/bpmn/{feature}-bpmn-editor.html` in a browser (drag-and-drop editing like bpmn.io — needs internet since bpmn-js loads via CDN).
- Or import the `.bpmn` file into Camunda Modeler / Bizagi / draw.io (offline).

---

## 6. DBML — for `/dbdiagram`

```bash
npm install -g @dbml/cli
dbml2sql --version   # check
```
The skill validates DBML by exporting SQL: `dbml2sql {feature}.dbml --postgres`. Failure = invalid DBML syntax.

To view the diagram: paste the `.dbml` into [dbdiagram.io](https://dbdiagram.io) or publish to [dbdocs.io](https://dbdocs.io). The `.sql` file imports directly into PostgreSQL.

---

## 7. Atlassian MCP — for `/sync-confluence`

`/sync-confluence` **doesn't need a render tool** — it writes straight to Confluence via **Atlassian MCP** (no binary to install, no `npm install`). Conditions:

1. **Connect + authenticate Atlassian MCP** in Claude Code: type `/mcp` → choose Atlassian (Rovo) → complete OAuth.
2. The account has **read + write** permission on the target Confluence page (the skill edits in place, so it needs write access).

Quick check: type `/mcp` and confirm the Atlassian server shows as connected. Not authenticated → `/sync-confluence` will stop and remind you to run `/mcp` first. For safe sync conventions (preview + confirmation, drift detection) see `rules/atlassian-sync.md`.

---

## Quick checklist after installing

**Leanest way:** run `scripts/doctor.sh` (already copied to `.claude/scripts/doctor.sh` on install) — it health-checks all render tools and prints ✅/❌ + how to install each one:
```bash
bash .claude/scripts/doctor.sh
```

Or check each tool by hand:
```bash
node --version            # ≥18
mmdc --version            # Mermaid (if using /sequence /activity /state /erd)
d2 --version              # D2 (if using /d2-activity /d2-erd /d2-architect /system-design /scan-project)
python3 --version         # PlantUML encode (if using /activity-swimlane /usecase-diagram)
dbml2sql --version        # DBML (if using /dbdiagram)
```

Only the line matching the skill you plan to use needs to run OK.
