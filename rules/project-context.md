# Project Context — the `/discover` artifact and how skills consume it

> A one-time intake (`/discover`) deep-scans the repo + runs a bounded interview, then writes a small, fresh, provenance-tagged **context set** under `docs/_shared/`. Consuming skills load the non-derivable domain facts cheaply and pull depth on demand — so they stop re-asking and stop inventing names, without paying a context tax every invocation. **Staleness is enforced at the loader**, not buried in `/dashboard`.

## Why a context set (and why this shape)

Generic "repository overview" content does not generally help coding/BA agents — it adds cost and rots fast. What DOES help is the **specific slice the code cannot re-derive**: the business purpose, naming collisions, business rules, and traps — if it is small, fresh, and provenance-tagged. So the artifact is split into tiers by *how derivable* the content is and *how often* it is needed:

```
docs/_shared/
├── project-context.md          ← Tier 1: ALWAYS loaded. HARD CAP 60 lines (content, excl. frontmatter).
└── context/
    ├── glossary.md             ← Tier 2: on demand
    ├── domain-rules.md         ← Tier 2
    ├── actors.md               ← Tier 2
    ├── entities.md             ← Tier 2 (pointer-heavy; defers to /erd or /scan-project output)
    └── architecture.md         ← Tier 2 (pointer-heavy; defers to architecture/)
```

## Tier 1 — `docs/_shared/project-context.md` (always loaded, hard cap 60 lines)

Loaded into every consuming skill's context via the loader line (below). **Hard cap 60 lines of content** (excluding frontmatter) — enforced by `scripts/doc-validate.ts`: a 61-line file fails validation. Rationale: this file is loaded across many skills, so it must be tighter than a file loaded once.

Contents — **only what a `grep` cannot answer in two seconds**:

1. **What the system does and who pays for it** — 2–3 sentences. Not derivable from code. Highest-value line in the file.
2. **Stack one-liner** — `NestJS + Postgres + Redis, pnpm monorepo`. One line, no elaboration.
3. **Actors** — the role names, comma-separated. Detail lives in `context/actors.md`.
4. **Glossary — collisions only.** Terms where the **business word ≠ the code identifier**, or where a common word means something project-specific. `Booking → reservations.tbl_res` is worth a line; `User → users` is not. The single most defensible anti-hallucination payload.
5. **Gotchas** — non-obvious traps, max 5 bullets.
6. **Pointer index** — one line per Tier-2 file: what it holds + when to read it.

Everything else (full entity list with fields/state machines, service-responsibility tables, interaction maps) is **demoted to Tier 2 or omitted** — it is exactly the "repository overview" content that rots fastest, and that `glob`/`grep` re-derive accurately on demand.

### The content test (apply before adding ANY line to Tier 1)

> **Can `grep` answer this in two seconds? Then it does not belong in Tier 1.**
> **Is it a business fact, a naming collision, a rule, or a trap? Then it does.**

Adapted from the practitioner heuristic — *failure-backed? tool-enforceable? decision-encoding? triggerable? if it fails all four, delete it.* This test is what keeps Tier 1 under 60 lines AND on the side of the evidence.

## Tier 2 — `docs/_shared/context/*.md` (on-demand)

No line cap, but each carries the same frontmatter + confidence/provenance discipline. A skill Reads the specific file its job needs: `/erd` reads `entities.md`, `/system-design` reads `architecture.md`, `/userstory` reads `actors.md` + `domain-rules.md`, `/srs` reads `glossary.md` + `domain-rules.md` + `actors.md`.

`entities.md` and `architecture.md` stay **pointer-heavy**: link to the ERD / architecture diagrams rather than duplicating them. Duplicated structure is drift waiting to happen.

## Frontmatter (Tier 1 and Tier 2 alike)

```yaml
---
type: project-context          # project-context-detail for Tier 2
status: approved               # draft → in-review → approved
version: 1.2.0                 # semver; MAJOR = domain understanding changed
updated: 2026-08-02
profile_hash: <sha of scanned inputs>
source_watermark: <git HEAD sha at scan time>
staleness_budget_commits: 200  # loader warns past this
human_edited: [glossary, gotchas]   # sections /discover --update MUST NOT overwrite
links: []
---
```

- `profile_hash` + `source_watermark` — make freshness machine-checkable.
- `staleness_budget_commits` — the freshness contract, tunable per repo.
- `human_edited` — sections that are human territory; `--update` may *propose* changes to them in a Sync Impact Report but never rewrites them in place (do not reproduce the spec-kit `--force` silent-overwrite bug).

> **Note on validation:** both types use `kind: slim` in `doc-validate.ts` (same as `_shared/traceability.md`), so `feature:` is waived (project-level under `_shared/`). The 60-line cap applies ONLY to `type: project-context` (Tier 1).

## Confidence + provenance (every concrete claim)

**Legend:** ✅ read (directly stated in source) · 🔵 inferred from source · 🟡 guessed (→ OQ)

Every concrete claim in the context set is tagged with a confidence marker + provenance `file:path` (e.g. `✅ src/auth/auth.service.ts:42`). This is the kit's genuine edge over generic context files — a reader (human or agent) can tell what to trust. It is also the mitigation when the file is stale: provenance tells you where to verify.

## The loader — two tiers, fails loud when stale

### Tier 1 loader (pasted into every consuming skill's `## Context (dynamic)` block)

```
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
```

A script (not an inline `cat`) so the staleness logic lives in one place instead of being duplicated across ~35 skills. `scripts/context-load.sh`:

1. No `docs/_shared/project-context.md` → print `(no project context — run /discover for more accurate output)` and exit 0.
2. Compute drift: commits between `source_watermark` and current `HEAD`; also re-hash the scanned inputs vs `profile_hash`.
3. **Fresh** (within `staleness_budget_commits` and hash unchanged) → emit Tier 1 verbatim.
4. **Stale** → emit Tier 1 **prefixed with a loud banner**:
   `⚠️ PROJECT CONTEXT IS STALE (N commits since scan; manifest changed). Treat every claim below as a HINT, not fact — verify against code before relying on it. Re-run /discover.`

Step 4 is the direct mitigation for stale-context failure: a banner *inside the context window* breaks the silence where agent + reviewer trust the same stale file. Warning only in `/dashboard` does not, because nobody runs `/dashboard` mid-task.

### Tier 2 loader (an instruction in the skill body, only for skills that need depth)

```markdown
**IMPORTANT:** before drafting, read `docs/_shared/context/entities.md` and
`docs/_shared/context/domain-rules.md` if they exist.
```

The `IMPORTANT:` is not decoration — passive availability is not consumption; agents do not proactively read referenced docs without explicit emphasis.

## How `/discover` produces it

See `skills/discover/SKILL.md`. In short: manifest sniff → N read-only `Task` subagents by aspect → ingest docs (code wins on conflict) → bounded 5-question interview → HARD STOP preview → generate Tier 1 (enforcing the 60-line cap — fail & re-summarize if over) + Tier 2 → stamp hashes → `doc-validate`.

## One-line summary

> **Tier 1 = always-loaded ≤60-line index of non-derivable facts (purpose / stack / actors / glossary-collisions / gotchas / pointers); Tier 2 = on-demand depth. The loader fails loud when stale. If `grep` answers it in 2 seconds, it isn't in Tier 1.**
