---
name: discover
description: Use when you FIRST enter a repo (or want a shared project context) — deep-scan the code + docs and run a bounded 5-question interview, then write a small, always-loaded context index (`docs/_shared/project-context.md`, ≤60 lines) + on-demand detail files (`docs/_shared/context/*.md`) that every later BA skill consumes, so they stop re-asking and stop inventing names. Trigger with `/discover [--update] [--tier1-only]`. Group C (no feature needed; valid on an empty/greenfield vault). Differs from `/scan-project` (architecture DIAGRAMS from code) — /discover produces the portable CONTEXT BRIEF other skills read.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "[--update] [--tier1-only]"
---

# /discover — Project intake → shared context set

> One-time intake: **deep-scan the repo + a bounded 5-question interview** → write a small, fresh, provenance-tagged **context set** under `docs/_shared/`. Consuming skills load the *non-derivable* domain facts cheaply and pull depth on demand. **Staleness is enforced at the loader** (`scripts/context-load.sh`), not buried in `/dashboard`. Formalizes the hand-written `DOMAIN.md` practice. See `rules/project-context.md` for the schema + the content test.

## Goal

Produce the tiered context set:

1. **Tier 1** — `docs/_shared/project-context.md`. ALWAYS loaded by consuming skills. **Hard cap 60 lines of content** (excl. frontmatter). Six sections only: what it does & who pays · stack one-liner · actors · glossary-collisions · gotchas (≤5) · pointer index.
2. **Tier 2** — `docs/_shared/context/{glossary,domain-rules,actors,entities,architecture}.md`. On-demand depth, read by the skill that needs it. `entities.md`/`architecture.md` stay pointer-heavy (defer to ERD / `/scan-project` output).

Every concrete claim tagged **✅ read / 🔵 inferred / 🟡 guessed** + provenance `file:path`. Stamped with `profile_hash` + `source_watermark` so the loader can detect drift.

## The content test (apply to EVERY Tier-1 line)

> **Can `grep` answer this in two seconds? Then it does NOT belong in Tier 1.**
> **Is it a business fact, a naming collision, a rule, or a trap? Then it does.**

Repository-overview content (full entity fields, service-responsibility tables, interaction maps) is demoted to Tier 2 or omitted — it rots fastest and `glob`/`grep` re-derive it accurately on demand.

## Constraints

- **Fixed output** `docs/_shared/` (project-level, no feature). No `CLAUDE.md` touch.
- **2 mandatory phases, HARD STOP between them:** Phase 1 scan + interview → `.discover-plan.md` → **user confirms (L1)** → only then Phase 2 writes the context set. Do NOT write `project-context.md` before confirmation.
- **Read code via subagents (Task)** to keep the main context lean — subagents RETURN findings; the main thread synthesizes and Writes (per `approval-gate.md`).
- **60-line cap on Tier 1 is enforced** by `scripts/doc-validate.ts` — if your draft exceeds 60 lines of content, **cut or move to Tier 2 and re-summarize**; do not ship a 61-line file.
- **Provenance + confidence on every claim. Do NOT fabricate:** cannot read it → 🟡 + note, never invent names/rules.
- **Bilingual labels/report** (mirror input — `rules/language.md`); real technical identifiers (service/table/module) kept AS-IS.
- **Idempotent** — re-run = update mode (L2 diff per file; never overwrite `human_edited` sections).
- **`docs/_shared/*` is excluded from the auto-changelog hook** (`rules/changelog.md`) — these writes are not auto-logged (same as `traceability.md`); that is expected, do not force a log line.

## Inputs

```
/discover                 # scan the project in the current directory (CLAUDE_PROJECT_DIR)
/discover --update        # refresh an existing profile: re-scan, never re-ask answered Qs, never touch human_edited sections, emit a Sync Impact Report
/discover --tier1-only    # cheap refresh of just the always-loaded Tier 1 (no Tier 2 regen)
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Root: !`echo "${CLAUDE_PROJECT_DIR:-$(pwd)}"`
Detected manifest: !`ls package.json go.mod pom.xml build.gradle requirements.txt pyproject.toml Cargo.toml composer.json Gemfile 2>/dev/null | head`
Has docs: !`ls README* docs 2>/dev/null | head`
Existing profile: !`ls docs/_shared/project-context.md 2>/dev/null && grep -E '^(version|updated|source_watermark):' docs/_shared/project-context.md || echo "(none — fresh /discover)"`

## Flow runtime

```
User calls /discover [--update] [--tier1-only]
   │
   ▼
═══ PHASE 1 — SCAN + INTERVIEW (ends with a HARD STOP) ═══
1. Manifest sniff: ls package.json go.mod ... (the scan-project one-liner) → language/framework/entry points.
   Unfamiliar stack → ask the user to confirm (do NOT guess wildly).
2. Spawn N read-only subagents (Task), each RETURNS a findings table + file:line evidence (do NOT edit, do NOT draw):
   • Stack & entry points        • Entities / data model (ORM/migration/SQL)
   • Services / modules          • External systems (SDK/env/clients)
   • Actors / roles (from auth, RBAC, route guards)   • Sync + async interactions
   Large codebase → sample entry points + manifest + schema; do NOT read everything.
3. Ingest docs (README/docs/ADR) → cross-check; CODE WINS on conflict (note the conflict).
4. --update? → read the existing profile fully FIRST; carry forward answered questions; never re-ask.
5. INTERVIEW (bounded — see below): at most 5 questions, ONE at a time, for what code CANNOT answer.
   Write each answer back into docs/_shared/.discover-plan.md atomically after the user replies.
6. Synthesize → finalize .discover-plan.md (Tier-1 outline + Tier-2 file list + 🟡 gaps) → HARD STOP:
   print the L1 preview + "Write the context set? (Y / edit / drop a section)". WAIT for the user.
   ▼  (user Y / edits)
═══ PHASE 2 — GENERATE (only after the user confirms) ═══
7. Write Tier 1 docs/_shared/project-context.md — ENFORCE the 60-line cap (fail & re-summarize if over).
8. Write Tier 2 docs/_shared/context/*.md (entities.md/architecture.md pointer-heavy).
   --tier1-only → skip this step.
9. Stamp frontmatter: profile_hash (sha of scanned inputs) + source_watermark (git HEAD sha) + version (semver bump on --update).
10. Run: bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/_shared/project-context.md docs/_shared/context
11. Output report: files written + 🟡 spots + "consumers may need a re-run if domain shifted".
```

## Phase 1 — subagent detail

Prompt for each subagent (Task): *"Read-only. Scan `<root>` for aspect <X>. Return: findings table + file:line as evidence. Do NOT edit files, do NOT draw."* Gather findings back to the main thread. (Same template as `/scan-project`.)

`.discover-plan.md` skeleton:
```markdown
# {project} — /discover plan
> Root: {path} · Stack: {lang/framework} · Scan: {date} · HEAD: {sha}

## Tier 1 outline (≤60 lines)
- Does & who pays: …
- Stack: …
- Actors: …
- Glossary collisions: …
- Gotchas (≤5): …
- Pointers: …

## Tier 2 files (tick)
- [x] glossary.md   [x] domain-rules.md   [x] actors.md   [x] entities.md   [x] architecture.md

## Interview answers (written back atomically)
1. …  2. …  3. …  4. …  5. …

## 🟡 Gaps / needs confirmation
- …
```

## The 5-question interview (spec-kit `/clarify` shape)

For what **code cannot answer**. Hard cap **5 questions**, asked **one at a time** (never batched). Each is a 2–5-option table or a ≤5-word short answer; **name a Recommended option + its rationale before the user answers.** Write the answer back into `.discover-plan.md` **atomically after each reply** (not batched at the end). Business language only — do NOT ask about DB columns / SDK / endpoints (`feature-bootstrap.md` Group A step 3, citing `ba-conventions.md` §3).

Priority order (highest-value-non-derivable first); skip any the scan already answered:

1. **Business purpose & who pays** — what the system is for in the real world.
2. **Glossary collisions** the scan flagged — where the business word ≠ the code identifier.
3. **Business rules / invariants** not visible in code.
4. **Actor authority** in the real world (who can approve/refund/override).
5. **The one gotcha** that bites newcomers.

## Modes

- **Greenfield (Group C, no code):** Phase 1 is **interview-led** (manifest sniff returns nothing) and still writes a valid Tier 1 from the answers. Tier 2 files are **omitted** (not stubbed empty) until there is something to point at.
- **`--update`:** read existing files fully first; **never re-ask** answered questions; produce an **L2 diff**; **never touch sections listed in `human_edited`** (propose changes to them in the Sync Impact Report only); bump `version` per semver (MAJOR if domain understanding changed, MINOR for new facts, PATCH for fixes). Emit a **Sync Impact Report**: what changed, what stayed, which consuming skills may need attention.
- **`--tier1-only`:** refresh just the always-loaded Tier 1 (the common maintenance path); do not regenerate Tier 2.

## L1 plan preview (HARD STOP — template)

> Scanned **{project}** ({stack}). Tier 1 will hold: purpose · stack · {N} actors · {G} glossary collisions · {≤5} gotchas · pointers to {M} Tier-2 files.
> 🟡 Uncertain: {list}.
>
> Write the context set to `docs/_shared/`? (Y / edit {section} / drop {file})

## Output report

```
✅ Project context: docs/_shared/  ({project})
   Tier 1: project-context.md ({L} lines, ≤60) — always loaded by every consuming skill
   Tier 2: context/{glossary,domain-rules,actors,entities,architecture}.md
   Stamped: profile_hash {..} · source_watermark {sha} · version {x.y.z}

🟡 Needs your confirmation: {inferred points}
Consumers (/srs /userstory /erd …) will now pick this up automatically via scripts/context-load.sh.
Re-run /discover --update after significant code changes.
```

## Gotchas

- **Tier 1 over 60 lines** → `doc-validate` fails it. Cut anything `grep` can answer; move depth to `context/*.md`.
- **Don't fabricate** a business purpose/rule the scan didn't find → mark 🟡 + ask in the interview.
- **No code (greenfield)** → interview-led Tier 1 only; don't stub empty Tier-2 files.
- **`human_edited` sections** (e.g. glossary, gotchas the user hand-tuned) → `--update` must NOT overwrite them; propose, don't replace.
- **Stale profile** → consumers see the loader banner automatically; you don't need to notify each one.
- **Subagent read-only** — returns findings; the main thread Writes after the HARD STOP.

## References

- @../../rules/project-context.md (the schema, content test, loader, staleness contract)
- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md (note: docs/_shared/* is hook-excluded)
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md (Group C greenfield)
- @../../rules/language.md
- @../../templates/doc-project-context.md
- @../../templates/doc-project-context-detail.md
- @../scan-project/SKILL.md (overlap: /scan-project = architecture DIAGRAMS from code; /discover = the CONTEXT BRIEF)
- @../../scripts/doc-validate.ts (validate after Write — step 10; enforces the 60-line cap)
