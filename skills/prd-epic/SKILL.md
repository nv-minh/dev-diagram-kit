---
name: prd-epic
description: Use when you need the PRD for ONE feature — capabilities prioritized P0/P1/P2 (CAP- IDs), goals/non-goals, user types, and release plan, written to docs/{feature}/{feature}-prd.md. Trigger with `/prd-epic <feature>`. Fourth step of the discovery chain (/brd → /prd-epic → /srs). Differs from `/prd` (the product-level singleton in docs/_product/) and `/brd` (why/ROI; this is what we'll build).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /prd-epic — Feature PRD (capabilities)

## Goal

Define WHAT we'll build for one feature — capabilities prioritized P0/P1/P2 that mint **`CAP-{feature}-{NN}`** IDs covering the BRD's `BO-` objectives, plus goals/non-goals, user types, out-of-scope, release plan, and dependencies. **Single output**: `docs/{feature}/{feature}-prd.md`.

## Constraints

- **1 fixed output** — `docs/{feature}/{feature}-prd.md` (type `prd`, FULL frontmatter).
- **Feature missing → group A** (`feature-bootstrap.md`). BRD missing but feature exists → soft note (Covers column stays empty until `/brd` runs).
- **Section names are load-bearing** — Goals · Non-goals · User Types · Capabilities · Out of scope · Release plan · Dependencies (the `resolve-oqs.md` topic map scans them).
- **Mint `CAP-` IDs** — `CAP-{feature}-{NN}`, max+1. Every capability: priority (P0/P1/P2) + the `BO-` it covers + a one-line user-visible statement.
- **Capability ≠ implementation** — "user can retry a failed payment" (capability), not "add a retry queue" (design). P0 = the feature is pointless without it.
- **The discovery question set** — when interviewing: problem recap · target users · what must be true at launch (P0 probe) · nice-to-have (P1/P2 probe) · explicit non-goals · sequencing constraints. One batched round.
- **Inherit OQs** — from BRD/URD (`resolve-oqs.md` Phase E).
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — L2 diff on re-run.
- **Template** — `@../../templates/doc-prd.md`, structure only.
- **Reviewer** — ≥5 capabilities OR ≥3 P0 → `@doc-reviewer` gate.
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/prd-epic <feature>          # reads {feature}-brd.md + upstream chain
/prd-epic <new-feature>      # group A: interview + create
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with a PRD: !`ls docs/*/*-prd.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature.** Read `{feature}-brd.md` (objectives to cover) + `{feature}-urd.md` (user types come from personas) if present.
2. **Gather.** Gaps → the discovery question set (one batched round).
3. **Fact-list** — every capability candidate + its origin + the BO it serves.
4. **Assign IDs + priorities** — `CAP-{feature}-{NN}`; challenge every P0 ("is the feature truly pointless without this?").
5. **Draft** per the template — goals/non-goals first (they fence the capability list), then the capabilities table, user types (from personas), OOS, release plan (phases reference CAP IDs), dependencies, OQs.
6. **L1 plan preview** — CAP count by priority + BO coverage + any uncovered BO- called out.
7. **Write** — `links:` → BRD (+ URD).
8. **Activity log** — `CLAUDE_SKILL_NAME=/prd-epic` + note + author before Write. Update `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/{feature}-prd.md`. Exit 1 → fix, ≤2 attempts.
10. **Reviewer gate** (over threshold) — `@doc-reviewer`; apply BLOCKING fixes; re-validate.
11. **Output report** — priority breakdown + next step (`/srs {feature}`).

## L1 plan preview

> I'll write the feature PRD for **{feature}** to `docs/{feature}/{feature}-prd.md`: **{N} capabilities** (P0: {a} · P1: {b} · P2: {c}) covering {C}/{T} business objectives.
> Non-goals: {count}. Release phases: {count}. Uncovered BOs: {list or none}.
> Logged: activity log "PRD {N} capabilities".
> Apply? (Y / edit)

## Output report

```
✅ Feature PRD written: docs/{feature}/{feature}-prd.md
   Capabilities: CAP-{feature}-01…{NN} (P0 {a} / P1 {b} / P2 {c}) | BO coverage: {C}/{T} | OQs: {M}
   doc-validate: OK {| doc-reviewer: approve}

Next: /srs {feature} — precise system behavior (FR-/NFR-/BR-/E-) per capability.
```

## Gotchas

- **Everything-is-P0 disease** — if >60% of capabilities are P0, re-ask the "pointless without it" question per row; a PRD with no P1/P2 gives the roadmap nothing to sequence.
- **Non-goals are a gift** — every explicit non-goal kills a future scope debate; push for at least 2.
- **Release plan references CAP IDs** — phases with prose-only content can't be traced by `/gap`.
- **Do not rename sections** — the OQ cascade greps them.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md (the /discover profile — reuse established capabilities/users)
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-prd.md
- @../../agents/doc-reviewer.md (reviewer gate — step 10)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
