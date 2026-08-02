---
name: userstory
description: Use when you need dev-ready backlog items — INVEST user stories sliced from the SRS's functional requirements, one us-NNN.md per story plus the story index (single source of status/priority/jira-key). Trigger with `/userstory <feature> [--from FR-...]`. Needs `srs/{feature}-spec.md` (refuses without it — route /srs). Differs from `/usecase` (actor-goal narrative; a story is a backlog slice) and `/ac` (adds Given-When-Then inside existing stories).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--from FR-...]"
---

# /userstory — INVEST user stories (backlog slices)

## Goal

Slice the SRS's FRs into INVEST stories — As a / I want / So that + context + linked requirements + inline Acceptance Criteria — one `us-{NNN}.md` per story (zero frontmatter), with `docs/{feature}/userstories/{feature}-story-index.md` (type `userstory-index`) as the single source of metadata, status, and jira-key.

## Constraints

- **Group B** (`feature-bootstrap.md`) — `srs/{feature}-spec.md` missing → **refuse + route to `/srs`** (standard message). Slicing without FRs = fabrication. UC files missing → soft warn only (stories can slice FRs directly).
- **Content/metadata split** (`naming-conventions.md`) — `us-{NNN}.md` is **zero frontmatter**, prose sections only (User Story / Context / Linked Requirements / Acceptance Criteria inline / UI refs / Error refs / Dependencies / OQs). Status, priority, FR links, screens, jira-key live in the index table ONLY.
- **Mint `US-{NNN}`** — 3-digit, path-scoped (feature implied by folder), max+1 across the index, never renumbered.
- **INVEST discipline** — each story independently valuable and small enough for a sprint; an FR too big for one story → split by scenario/persona; several trivial FRs → one story may cover them (the index maps both ways).
- **Every story links ≥1 FR** — a story with no FR source is invented scope → refuse or send back to `/srs`.
- **AC section seeded, not padded** — 1-2 obvious Given-When-Then per story now; `/ac` is the dedicated pass for full criteria.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run → new FRs become new stories (L1), existing stories get L2 diffs.
- **Reviewer** — ≥8 stories in one run → `@doc-reviewer` gate.
- **Validate before done** — doc-validate on the userstories dir (step 9).

## Inputs

```
/userstory <feature>                    # slice all uncovered FRs into stories
/userstory <feature> --from FR-{feature}-004   # stories for one FR only
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Specs (required source): !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`
Existing story indexes: !`ls docs/*/userstories/*-story-index.md 2>/dev/null | head -10`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`

**IMPORTANT:** before slicing, read `docs/_shared/context/actors.md` and `context/domain-rules.md` if they exist (the `/discover` profile) — reuse the established actors/rules; do not re-ask.

## Approach

1. **Gate.** `srs/{feature}-spec.md` missing → refuse + route `/srs` (group B). Present → Read it (FRs, E- codes, priorities) + `{feature}-urd.md` (personas) + UC index (screens) + existing story index (coverage + max US number).
2. **Slice plan.** Map uncovered FRs → story candidates: persona (from URD) + want (the FR's observable behavior) + so-that (the need/objective upstream). Note split/merge decisions per INVEST.
3. **Fact-list** — per story: FRs covered, persona source, screen refs (if wireframes exist), E- codes touched.
4. **Draft `us-{NNN}.md`** per story — story sentence, context (why this slice), linked requirements (wikilinks to spec anchors), 1-2 seed ACs (`AC-001`, `AC-002` scoped per story), UI refs, error refs, dependencies (other US), OQs.
5. **Update the index** — one row per story: ID/title/persona/FR/screens/priority(from FR)/status `draft`/jira-key `—`/updated.
6. **L1 plan preview** — the slice plan (story list + FR coverage map + split/merge notes).
7. **Write all files.** **Activity log** — `CLAUDE_SKILL_NAME=/userstory` + note + author before each Write.
8. **Coverage check** — every targeted FR now maps to ≥1 story; report any FR left uncovered (with reason) rather than silently skipping.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/userstories/`. Exit 1 → fix, ≤2 attempts.
10. **Reviewer gate** (≥8 stories) — `@doc-reviewer`; apply BLOCKING fixes; re-validate.
11. **Output report** — coverage + next (`/ac` for full criteria; `/jira` in wave 6).

## Story shape reference (Claude composes it, do NOT hard-paste)

```markdown
# US-001 — Approver decides a claim within their tier

**As an** approver, **I want** validated claims routed to me only when the amount is within my authority, **so that** small claims stop waiting on the Head of Claims.

## Context
Slice of the tier-routing capability; the queue view is US-002.

## Linked Requirements
[[docs/atlas-re/srs/atlas-re-spec.md#FR-atlas-re-006|FR-atlas-re-006]] · BR-atlas-re-001

## Acceptance Criteria
- AC-001: Given a VALIDATED claim of 40k USD, when routing runs, then it lands in a handler-tier queue.
- AC-002: Given a claim of 300k USD, when routing runs, then it lands in the committee queue.

## UI refs · Error refs · Dependencies · OQs
Screens: (pending wireframes) · Errors: E-atlas-re-002 · Depends: US-002 · OQ: committee quorum
```

## L1 plan preview

> I'll slice **{feature}** into **{N} stories** (US-{first}…US-{last}) covering {C}/{T} targeted FRs: {list: US → FRs}.
> Splits: {notes | none}. Uncovered FRs: {list + reason | none}.
> Logged: activity log "{N} stories from {C} FRs".
> Apply? (Y / edit)

## Output report

```
✅ Stories written: docs/{feature}/userstories/ → us-{first}…us-{last} + {feature}-story-index.md
   FR coverage: {C}/{T} | Seed ACs: {K} | doc-validate: OK {| doc-reviewer: approve}

Next: /ac {feature} — full Given-When-Then per story (the seed ACs are a starting point).
Wave 6: /jira {feature} pushes these via the index's jira-key column.
```

## Gotchas

- **Story ≠ FR restated** — the story adds persona intent and slice rationale; if it reads identically to the FR, the slice is wrong (too big or too mechanical).
- **Index is the write surface for status** — never edit status/priority inside `us-*.md`; tools (jira sync, dashboard) read the index only.
- **Cross-story dependencies are a warning sign** — a chain of `Depends:` usually means the slicing follows architecture, not user value; re-slice by scenario.
- **Don't pad ACs here** — `/ac` interviews properly; two obvious seeds beat six guessed ones.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md (consume the /discover profile — actors/rules)
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-userstory.md
- @../../templates/doc-story-index.md
- @../../agents/doc-reviewer.md (reviewer gate — step 10)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
