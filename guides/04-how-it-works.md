# 04 — How the skills work (common flow)

**English** · [Tiếng Việt](../huong-dan/04-cach-hoat-dong.md)

> Understanding the run flow helps you know when a skill will ask questions, when it waits for your approval, and why it self-corrects. All 14 skills follow this same framework (with 2 extended skills having variants: `/scan-project` runs **2 phases with a HARD STOP** scan→plan→generate; `/sync-confluence` adds a **preview + confirmation** step before writing to Confluence).

> **Bilingual EN/VI:** the output language (diagram labels + interview questions + L1 plan + report) **automatically follows the language you type in** — type English → English, Vietnamese → VI; force it with `--lang en|vi` (per `rules/language.md`). Engine syntax keywords + real technical identifiers (table/service/endpoint) always stay in English.

---

## The 6-step flow

```
1. Receive input       →  you type /skill "<description>" --feature <slug>
2. Read context        →  the skill reads existing docs/{slug}/ (SRS, use cases...) if any
3. Ask to fill gaps    →  asks in business language, does NOT re-ask what it already has
4. L1 — preview plan   →  prints a table of "which files it will write" — you type Y / request changes
5. Draw + write file   →  generates the diagram source, writes to the right path
6. Render + self-check →  compile-check / validate / semcheck → reports the result
```

If the file already exists (running again): between steps 4-5 there's an **L2 — diff review** before overwriting.

---

## Step 3 — What the skill asks (and how it picks the altitude)

The skill serves **devs doing BA work** — you have a technical background, so the skill asks/uses detail at the **right altitude for the reader + diagram type**, rather than banning technical detail outright:

✅ **Business-communication diagrams** (use case, business activity, C4 **Context**) — asks in plain language: who does which step · when it branches · the business outcome the user sees · what kind of information needs to be stored · which external services are called (name + purpose). Don't stuff port/replica/SDK in here (wrong altitude).

✅ **Technical diagrams** (`/erd` `/dbdiagram` `/sequence` · C4 **Container/Component** · `/scan-project`) — **may** use/ask for real technical detail: column/table names · endpoint/route · schema · framework · payload · SDK. Devs already have this context (or it's read from code) → use it to make the diagram more accurate.

> The remaining principle is **the right altitude**, not "ban technical detail" (the old rule assumed a non-tech BA audience — that's been dropped). **Don't invent:** if there's no source (code/spec/doc) yet, ask or flag it as an assumption. See `rules/ba-conventions.md` Section 3.

**No re-ask:** the skill scans the description + previous answers + existing files, and does **not re-ask** what it already knows.

---

## Steps 4-5 — Approval gate (you're always in control)

The skill **never writes files silently**. Three levels:

| Level | When | What you see | Response |
|---|---|---|---|
| **L1 Plan** | Before writing a new file | Table: path · create/edit · summary | `Y` (approve) / `n` (cancel) / type a change request |
| **L2 Diff** | Overwriting an existing file | Unified diff | `Y` / `n` / `edit-prompt: <change>` |
| **L3 Iterate** | ASCII/prose output only | A draft in the chat | `Agree` / `Change: ...` |

> Mermaid/PlantUML/D2/BPMN diagrams **skip L3** — chat can't render diagrams, so the skill writes the file and you view it from the rendered image / IDE / editor. See `rules/approval-gate.md`.

---

## Step 6 — Self-check (the package's strong point)

Each engine has its own way of catching errors, run **before reporting "done"**:

| Engine | How it checks | What it catches |
|---|---|---|
| Mermaid | `mermaid-verify.mjs` compiles every block via `mmdc` | Syntax errors (forbidden characters in labels, missing tokens) |
| D2 | `render.sh` compiles `.d2` → `.svg` | D2 syntax errors |
| DBML | `dbml2sql {feature}.dbml --postgres` | Invalid DBML syntax |
| BPMN | `bpmn-semcheck.mjs` | Missing actor/branch/error vs. the facts, gateways missing a branch, dead ends |
| PlantUML | server returns HTTP != 200 | Encode/network/server failure |

Errors → the skill **fixes and retries** (usually up to 2-3 times), never writing out a broken diagram and reporting it as complete.

**Business review (skill-dependent):** `/sequence` and `/activity` spawn `@diagram-reviewer` when the diagram is complex, to check technical coverage (missing actor/lane, missed error branches) before reporting done.

---

## Why does the `diagram-reviewer` agent exist?

- **`diagram-reviewer`** — reviews technical diagrams (`/sequence`, `/activity`) when they exceed a complexity threshold: catches missing actors/lanes, missed error/alt branches, dead ends, gateways missing a branch.

This is a read-only agent that returns findings for the skill to improve itself — it doesn't write files. (The full package also has `flow-reviewer` for `/user-flow`, but `/user-flow` isn't part of this diagram package, so it isn't included.)

---

## Where the output lands

Every skill writes into `docs/{slug}/` per the `rules/naming-conventions.md` convention:

| Skill | Path |
|---|---|
| `/sequence` `/activity` | `docs/{slug}/srs/{slug}-flows.md` |
| `/state` | `docs/{slug}/srs/{slug}-states.md` |
| `/erd` | `docs/{slug}/srs/{slug}-erd.md` |
| `/activity-swimlane` | `docs/{slug}/srs/{slug}-*-swimlane.puml` + `.svg` |
| `/usecase-diagram` | `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg` |
| `/bpmn` | `docs/{slug}/bpmn/{process}.bpmn` + editor HTML |
| `/d2-activity` | `docs/{slug}/d2-activity/{slug}.d2` + image |
| `/d2-erd` | `docs/{slug}/d2-erd/{slug}.d2` + image |
| `/d2-architect` | `docs/{slug}/d2-architect/{slug}.d2` + image |
| `/system-design` | `docs/{slug}/system-design/` — `.d2`/`.svg` per C4 level + HTML + `-index.md` |
| `/dbdiagram` | `docs/{slug}/dbdiagram/{slug}.dbml` + `.sql` |
| `/scan-project` | `docs/_shared/architecture/` — `.d2`/`.svg` (C4 + module + ERD) + `{proj}-flows.md` + `-index.md` (+ optionally `.html`) |
| `/sync-confluence` | ✱ **doesn't write into `docs/`** — updates the Confluence page in place + state `.claude/state/atlassian/sync-state.yaml` |

> ✱ `/scan-project` writes into `docs/_shared/architecture/` (architecture is cross-feature, not tied to a single slug). `/sync-confluence` is the one exception that does **not** generate a file in `docs/` — it writes to Confluence (a side effect outside the vault).

See `example/atlas-re/` for the real structure.
