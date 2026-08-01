---
name: roadmap
description: Use when you need to sequence and prioritize features — RICE-lite scores, a Now/Next/Later (or by-quarter) plan, and a dependency map, written once to docs/_product/roadmap.md (singleton). Trigger with `/roadmap [--format now-next-later|quarter]`. Reads the Feature Map from docs/_product/prd.md one-way. Differs from `/timeline` (the visual milestone diagram — a roadmap doc can link one) and `/prd` (defines the features this skill sequences).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--format now-next-later|quarter]"
---

# /roadmap — Product roadmap (RICE-lite + plan + dependencies)

## Goal

Turn the Feature Map into a prioritized plan — RICE-lite scores per feature (Reach · Impact · Confidence · Effort), a Now/Next/Later or by-quarter plan, a dependency map, and a decisions log. **Single output**: `docs/_product/roadmap.md` (type `roadmap`, frontmatter has `format`).

## Constraints

- **Singleton** — `docs/_product/roadmap.md`; re-run = update mode (L2 diff). Frontmatter `format:` records the chosen shape.
- **Group C** (`feature-bootstrap.md`) — no product PRD yet → friendly message: "No Feature Map yet — run `/prd` first, or list your features now and I'll score them" (a Map-less roadmap from a live list is valid).
- **One-way read** — consumes `docs/_product/prd.md`'s Feature Map (+ each feature's `CAP-` priorities if PRDs exist). Never edits the PRD; PRD changes → re-run `/roadmap` to sync (`resolve-oqs.md`: no OQ cascade into this file).
- **RICE-lite discipline** — Reach/Impact/Confidence on the agreed scale (1-5 or %), Effort in relative units; **every score's basis comes from the user or a doc** — no invented scores. Score = (R×I×C)/E, computed, shown per row.
- **Now means committed** — "Now" items should have (or be about to get) a `/prd-epic`; flag "Now" features with no PRD.
- **Dependencies are typed** — tech / data / team / vendor, per row.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Template** — `@../../templates/doc-roadmap.md`, structure only.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/roadmap                              # default format: now-next-later
/roadmap --format quarter             # by-quarter plan
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Product PRD (Feature Map source): !`ls docs/_product/prd.md 2>/dev/null || echo "missing — /prd first, or provide a feature list"`
Roadmap exists: !`ls docs/_product/roadmap.md 2>/dev/null || echo "no — will create"`
Features with a PRD: !`ls docs/*/*-prd.md 2>/dev/null | head -20`

## Approach

1. **Load the Feature Map** from `docs/_product/prd.md` (or take a live list — group C fallback). Existing roadmap → update mode, Read fully first.
2. **Score interview (one batched round per gap):** per feature — Reach basis · Impact on which product goal · Confidence + why · Effort relative to a named anchor feature. Skip rows the user already scored.
3. **Fact-list** — every score + basis; sequencing constraints; dependency claims.
4. **Compute + draft** per the template — RICE table sorted by score · the plan (Now/Next/Later or quarters; note where the plan order deviates from score order and why) · dependency map (typed) · decisions log (append-mode across runs).
5. **L1 plan preview** — top-3 by score + any score-vs-plan deviations + "Now without PRD" flags.
6. **Write.**
7. **Activity log** — `CLAUDE_SKILL_NAME=/roadmap` + note + author before Write. Update `updated:`.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/_product/roadmap.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — the plan summary + suggested next (`/prd-epic` for un-specced "Now" items, `/timeline` for a visual).

## L1 plan preview

> I'll write the roadmap to `docs/_product/roadmap.md` ({format}): **{F} features scored**, Now: {n} · Next: {x} · Later: {l}.
> Plan deviates from score order at: {rows + reasons | nowhere}. "Now" without a PRD: {list | none}.
> Logged: activity log "roadmap {F} features scored".
> Apply? (Y / edit)

## Output report

```
✅ Roadmap written: docs/_product/roadmap.md ({format})
   Scored: {F} | Now: {n} · Next: {x} · Later: {l} | Dependencies: {d}
   doc-validate: OK

Un-specced "Now" features: {list} → /prd-epic {slug} each.
Want a visual for stakeholders? /timeline (Mermaid milestones) — link it from this doc.
```

## Gotchas

- **Score ≠ plan** — dependencies and strategy legitimately reorder; the deviation note is what makes the roadmap defensible.
- **Effort needs an anchor** — "3" means nothing; "3× the size of {shipped-feature}" survives review.
- **Don't cascade OQs here** — this file is derived; questions belong in the PRD/feature docs, and the fix is a re-run.
- **Decisions log is append-only across runs** — it's the "why did we demote X in July" memory; never rewrite old rows.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-roadmap.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
