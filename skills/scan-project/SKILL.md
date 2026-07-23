---
name: scan-project
description: Use when you need to reverse-engineer diagrams from an EXISTING (brownfield) codebase — scan the source (+ related docs) and auto-generate a full architecture diagram set (C4 overview, module map + relationships, per-module detail, ERD, key sequences). Use when you need to scan an existing project to auto-draw an architecture diagram set (overview, modules, module relationships, feature detail, ERD, key flows). Trigger with `/scan-project [path] [--focus <dir>] [--module <name>] [--lang en|vi]`. Differs from `/system-design` (draws from a description/interview) — this skill READS CODE.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "[path] [--focus <dir>] [--module <name>] [--lang en|vi] [--no-icons]"
---

# /scan-project — Scan brownfield codebase → architecture diagram set

> Reverse-engineering workflow: **read the source code** (+ docs if any) → build architecture understanding → generate a **full diagram set**. Reuses the render engine + formulas of the diagram family (`/system-design`, `/d2-architect`, `/d2-erd`, `/sequence`). This is a skill for the **dev-as-BA** — code is the primary input, NO business interview.

## Goal

From an existing (brownfield) project, automatically draw the **architecture diagram set** into `docs/_shared/architecture/`:

1. **C4 overview** — `{proj}-context.d2/.svg` (System Context) + `{proj}-container.d2/.svg` (Container: app/service/data store + external systems).
2. **Module map + relationships** — `{proj}-modules.d2/.svg` (modules + dependencies between them, circular ones flagged).
3. **Detail of a main module** — `{proj}-module-{name}.d2/.svg` (components inside a module; per `--module` or the top-N largest modules).
4. **ERD** — `{proj}-erd.d2/.svg` (from the detected schema/ORM/migration).
5. **Key-flow sequences** — `{proj}-flows.md` (2-3 important flows: main request path, job/webhook...).
6. **Index + gallery** — `{proj}-architecture-index.md` (metadata + diagram table + provenance) + optionally `{proj}-architecture.html` (presentation deck, dark-theme + PNG/PDF export).

Each element carries a **confidence** (✅ read for certain / 🔵 inferred / 🟡 guessed) + **provenance** (from which file/path) → the reader knows what is trustworthy.

## Not a deployment diagram; read code but at the right altitude

Draw at the **logical architecture level** (module/service/data store + relationships + key flows). Read code for the facts, but **do NOT draw** pod/replica/VPC/port/CI config (deployment — out of scope, like `/system-design`). Technical details (real service/table/endpoint names) ARE used — that is the strength of a scan (unlike drawing by hand from a description).

## Constraints

- **Fixed output** `docs/_shared/architecture/` (architecture is cross-feature). Files per the pattern in Goal.
- **2 mandatory phases, HARD STOP between them:** Phase 1 scan → `scan-plan.md` → **user confirms** (L1) → only then Phase 2 generates diagrams. Do NOT generate the whole set before confirmation.
- **Read code via a subagent** (Task) to keep the main context lean — the subagent RETURNS findings, the main thread synthesizes (do NOT let the subagent Write diagrams itself — per `approval-gate.md`).
- **Render via the shared scripts**: D2 `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`; Mermaid `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"`. Do NOT write a new renderer.
- **Compile EVERY diagram to PASS** before reporting done.
- **Provenance + confidence** on every inferred element. **Do NOT fabricate**: if it cannot be read, mark 🟡 + note "needs confirmation", do not make it up.
- **Auto-icon (per @../../rules/icon-map.md)** — tech detected from code (redis/postgres/kafka/aws-sdk/nginx/react...) → auto-attach `icon:` via `"${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh"` (this is where icons are most valuable — one glance reveals the stack). `--no-icons` to disable.
- **Bilingual (mirror input — @../../rules/language.md)** for labels + report; real technical identifiers (service/table/module) kept AS-IS from the code.
- **Idempotent** — re-run → update mode (L2 diff per file).
- **NO L3 iteration** — review from `.svg`/`.html`.

## Inputs

```
/scan-project                      # scan the project in the current directory (CLAUDE_PROJECT_DIR)
/scan-project <path>               # scan the project at the given path
/scan-project --focus <dir>        # limit deep scanning to one directory (large codebase)
/scan-project --module <name>      # only (re)draw the detail of one specific module
/scan-project --lang en            # force the output language
```

## Context (dynamic)

Root: !`echo "${CLAUDE_PROJECT_DIR:-$(pwd)}"`
Has git: !`git rev-parse --is-inside-work-tree 2>/dev/null && echo "✅" || echo "(not a git repo)"`
Detected manifest: !`ls package.json go.mod pom.xml build.gradle requirements.txt pyproject.toml Cargo.toml composer.json Gemfile 2>/dev/null | head`
Has docs: !`ls README* docs 2>/dev/null | head`
d2 installed?: !`(test -x "$HOME/.local/bin/d2" || command -v d2 >/dev/null) && echo "✅" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## Flow runtime

```
User calls /scan-project [path] [--focus/--module]
   │  d2 not installed? → stop, guide install.
   ▼
═══ PHASE 1 — SCAN + PLAN (ends with a HARD STOP) ═══
1. Identify the stack: read the manifest (package.json/go.mod/pom.xml/pyproject...) → language, framework, entry points.
   Unfamiliar/unclear framework → ask the user to confirm the stack (do NOT guess wildly).
2. Spawn 1-N subagents (Task) to scan by aspect (code-explorer/codebase-mapper pattern), each subagent RETURNS findings:
   • Structure & modules: top-level directories → modules + boundaries + responsibilities (from path/naming/README).
   • Inter-module dependencies: cross-module import/require → dependency edges + circular detection.
   • Data model: ORM entity / migration / *.sql / schema → tables + relationships (PK/FK).
   • Key flows: entry point (route/handler/controller/main/job) → call chain of 2-3 important flows.
   • External systems: SDK/client/env (DB, cache, queue, payment gateway, email, 3rd-party API).
   Large codebase → respect --focus; sample large directories, do NOT read everything.
3. Ingest docs if any (README/docs/ADR) → cross-check, prefer code on conflict (note the conflict).
4. Synthesize → Write `docs/_shared/architecture/scan-plan.md`: module list + proposed diagrams
   (tick to select) + gaps/questions + per-part confidence. → **HARD STOP**:
   print the summary + "Draw this set? (Y / drop a diagram / add / edit modules)". WAIT for the user.
   ▼  (user Y / edits)
═══ PHASE 2 — GENERATE (only after the user confirms) ═══
5. For each selected diagram, generate the source (formula from the corresponding skill + palette c4-palette.md):
   • context/container (.d2)  • modules (.d2)  • module-{name} (.d2)  • erd (.d2)  • flows (.md mermaid)
6. Render + verify each one (render.sh for D2, mermaid-verify for Mermaid). Fail → fix, at most 2 times/diagram.
7. Write the index `{proj}-architecture-index.md` (diagram table + provenance + confidence) + (optionally) the HTML gallery.
8. Output report: list files + 🟡 spots needing user confirmation. Tell them to open the index/gallery.
```

## How to build (step-by-step)

### Phase 1 — Scan (subagent detail)

Prompt for each subagent (Task): "Read-only. Scan `<root/focus>` for aspect <X>. Return: <findings table + file:line as evidence>. Do NOT edit files, do NOT draw." Gather the findings back to the main thread.

`scan-plan.md` (type `scan-plan`) skeleton:
```markdown
# {proj} — Architecture scan plan
> Root: {path} · Stack: {lang/framework} · Scan: {date}

## Detected modules ({N})
| Module | Responsibility | Source (path) | Confidence |
|---|---|---|---|

## Proposed diagrams (tick to select)
- [x] C4 overview (context + container)
- [x] Module map + relationships
- [x] ERD (from {schema source})   ← drop if there is no schema
- [x] Sequence: {flow 1}, {flow 2}
- [ ] Module detail: {largest module}

## Gaps / needs confirmation
- 🟡 {something uncertain} — ask the user
```

### Phase 2 — Generate (reuse formulas)

- **Context/Container**: the `/system-design` formula (see `skills/system-design/SKILL.md` Step 2 + `resources/c4-palette.md`). System = the project; external = detected external systems; container = real app/service/data store.
- **Auto-icon**: each infra/tech/external node detected in Phase 1 → resolve `ICON="$("${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh" <tech>)"` then attach `icon:` (unless `--no-icons`). Record in `scan-plan.md` which tech has an icon. D2 embeds base64 → flows into the HTML gallery too.
- **Module map**: D2 nested container / node + dependency edges (the `/d2-architect` formula). Circular → highlight + note.
- **Module detail**: "open the lid" of a module → main files/components + internal dependencies.
- **ERD**: the `/d2-erd` formula (`sql_table` PK/FK) from entities/migrations; column types use the real types (dev audience).
- **Sequence**: the `/sequence` formula (Mermaid) — actor/participant from the real call chain; obey Mermaid syntax-safety (`diagram-selection.md`).
- **HTML gallery** (optional): copy `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/system-design/resources/c4-export-template.html"`, inline the `.svg`s (one `.c4-level` block per diagram), fill in title/summary.

### Render + verify
```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/_shared/architecture/{proj}-context.d2
node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs" --file docs/_shared/architecture/{proj}-flows.md
```

## L1 plan preview (HARD STOP — template)

> Scanned **{proj}** ({stack}). Detected **{N} modules**, **{E} external systems**, **{T} tables** (if there is a schema).
> I propose drawing: C4 overview · Map of {N} modules + relationships · ERD ({T} tables) · Sequence «{flow1}», «{flow2}»{ · Module detail «{m}»}.
> Uncertain spots (🟡): {list}.
>
> Draw this set into `docs/_shared/architecture/`? (Y / drop {diagram} / add {module} / edit)

## Output report

```
✅ Architecture scan: docs/_shared/architecture/  ({proj})
   Overview: {proj}-context.svg, {proj}-container.svg
   Module map: {proj}-modules.svg ({N} modules{, K circular ⚠️})
   ERD: {proj}-erd.svg ({T} tables) | Sequence: {proj}-flows.md ({F} flows)
   {+ detail: {proj}-module-{m}.svg}
   Gallery: {proj}-architecture.html

🟡 Needs your confirmation: {inferred points}
Open {proj}-architecture-index.md to see everything. Re-run /scan-project --module {m} to zoom in.
```

## Gotchas

- **d2 not installed** → stop, print a 1-line install.
- **Huge codebase** → use `--focus`; sample large directories; do NOT read every file (context blow-up). Prioritize entry points + manifest + schema.
- **Monorepo/multi-service** → each package/service is a "container"; you can run `--focus <service>` separately.
- **No schema** → drop the ERD, note "no schema detected".
- **No docs** → from code only (normal for brownfield).
- **Circular dependency** → draw + flag it (a valuable insight), don't hide it.
- **Don't fabricate**: cannot read a flow/relationship → mark 🟡 + ask, do NOT make up names/flows.
- **Do NOT draw deployment** (port/replica/VPC/CI) — wrong altitude; if needed, that is a different job.
- **Subagent read-only** — does not Write diagrams/targets itself; returns findings, the main thread Writes after the HARD STOP.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/icon-map.md (tech auto-icon; resolver `scripts/icon-path.sh`)
- @../system-design/SKILL.md (C4 formula + palette + gallery template)
- @../d2-architect/SKILL.md · @../d2-erd/SKILL.md · @../sequence/SKILL.md (formula for each diagram type)
