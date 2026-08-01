---
name: prd
description: Use when you need the product-level PRD — pitch, problem, users, themes, Feature Map, and metrics for the WHOLE product, written once to docs/_product/prd.md (singleton). Trigger with `/prd [--update]`. Differs from `/prd-epic` (PRD for one feature — "PRD for checkout" goes there) and `/roadmap` (prioritizes the Feature Map this doc defines).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--update]"
---

# /prd — Product PRD (project-level singleton)

## Goal

Define the WHOLE product once — pitch, problem, users, value, goals, themes, the **Feature Map** (the canonical feature list `/roadmap` prioritizes and feature slugs are born from), metrics, constraints, risks. **Single output**: `docs/_product/prd.md` (type `prd-product`, NO `feature` field — project-level).

## Constraints

- **Singleton** — `docs/_product/prd.md`; a second run = update mode (L2 diff), never a second file.
- **Group C** (`feature-bootstrap.md`) — runs BEFORE any feature exists; an empty vault is a valid starting state, no routing needed.
- **Product altitude** — themes and the Feature Map, not capability detail. One line per feature in the Map; detail belongs to that feature's `/prd-epic`.
- **The Feature Map is the contract** — slug (kebab-case, per `naming-conventions.md`) + theme + one-line purpose + status. `/roadmap` reads it one-way; feature folders adopt these slugs.
- **Own OQs only** — Section 11; the product PRD is the product-level root, nothing cascades in (`resolve-oqs.md`). Cascade scans stay within this file.
- **No fabricated market claims** — metrics targets and user segments need a stated basis or become OQs.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Template** — `@../../templates/doc-prd-product.md`, structure only.
- **Reviewer** — ≥5 themes OR ≥3 P0-equivalent "now" features → `@doc-reviewer` gate.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/prd                # create (interview) or open update mode if it exists
/prd --update       # explicit update mode (L2 diff per section)
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Product PRD exists: !`ls docs/_product/prd.md 2>/dev/null || echo "no — will create"`
Existing features (candidates for the Feature Map): !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`

## Approach

1. **Mode.** `docs/_product/prd.md` exists → update (Read fully first, no-re-ask). Else → create.
2. **Interview (one batched round):** the pitch in one sentence · the problem + who has it · segments + their core job · what makes this valuable · product goals · theme candidates · known features (seed the Map — include existing `docs/*/` folders) · metrics + basis · constraints/risks.
3. **Fact-list** — every claim + origin.
4. **Draft** per the template — Sections 1-11; Feature Map rows get valid slugs (existing folders keep theirs).
5. **L1 plan preview** — theme + Feature Map summary.
6. **Write** — no `feature:` in frontmatter; `links: []` or pointers to research docs.
7. **Activity log** — `CLAUDE_SKILL_NAME=/prd` + note + author before Write. Update `updated:`.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/_product/prd.md`. Exit 1 → fix, ≤2 attempts.
9. **Reviewer gate** (over threshold) — `@doc-reviewer`; apply BLOCKING fixes.
10. **Output report** — Feature Map + next steps (`/roadmap`, `/prd-epic {slug}`).

## L1 plan preview

> I'll write the product PRD to `docs/_product/prd.md`: **{T} themes**, **{F} features** in the Feature Map ({new} new slugs, {existing} existing), {M} metrics.
> OQs: {K}.
> Logged: activity log "product PRD {T} themes {F} features".
> Apply? (Y / edit)

## Output report

```
✅ Product PRD written: docs/_product/prd.md
   Themes: {T} | Feature Map: {F} features | Metrics: {M} | OQs: {K}
   doc-validate: OK {| doc-reviewer: approve}

Next: /roadmap — prioritize the Feature Map (RICE-lite, Now/Next/Later).
Per feature: /prd-epic {slug} → /srs {slug}.
```

## Gotchas

- **"PRD for {feature}" → `/prd-epic`** — this skill only does the product singleton; redirect immediately, don't create a second product PRD.
- **Feature Map slugs are forever** — folders get created from them; renaming later means moving `docs/{slug}/`. Spend the extra minute on slug quality.
- **Metrics without a basis** — a target pulled from air becomes the team's OKR; make the basis explicit or file an OQ.
- **Roadmap sync is one-way** — editing the Feature Map does not auto-update `roadmap.md`; re-run `/roadmap` (per `resolve-oqs.md`).

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
- @../../templates/doc-prd-product.md
- @../../agents/doc-reviewer.md (reviewer gate — step 9)
- @../../scripts/doc-validate.ts (validate after Write — step 8)
