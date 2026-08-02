---
name: brd
description: Use when you need the Business Requirements Document — objectives with success measures (BO- IDs), business scope, cost-benefit, and risks for one feature, written to docs/{feature}/{feature}-brd.md. Trigger with `/brd <feature>`. Third step of the discovery chain (/urd → /brd → /prd-epic). Differs from `/prd-epic` (what we'll build — capabilities; the BRD is why — money and objectives) and `/urd` (user needs, not the business case).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /brd — Business Requirements Document

## Goal

Make the business case — objectives with measurable success criteria that mint **`BO-{feature}-{NN}`** IDs covering the URD's `UN-` needs, plus business scope, business rules, cost-benefit, and risks. **Single output**: `docs/{feature}/{feature}-brd.md`.

## Constraints

- **1 fixed output** — `docs/{feature}/{feature}-brd.md` (type `brd`, FULL frontmatter).
- **Feature missing → group A** (`feature-bootstrap.md`): derive slug + interview + create. URD missing but feature exists → proceed with a soft note ("BO- rows will have empty Covers-needs until /urd runs") — the BRD can legitimately come first in some engagements.
- **Section names are load-bearing** — Executive Summary · Business Objectives & Success Measures · Business Scope · Business Rules · Cost-Benefit · Risks. `resolve-oqs.md` §3.5.3's topic map scans these exact names for OQ cascade; do not rename.
- **Mint `BO-` IDs** — `BO-{feature}-{NN}` (2-digit ok), max+1. Every objective row: measurable success measure + target + the `UN-` needs it covers.
- **Money altitude, no fabricated figures** — cost/benefit estimates carry a `basis` column; no basis from the user → OQ, never an invented number (`ba-conventions.md` §3).
- **Inherit OQs** — from the URD + brainstorms (`resolve-oqs.md` Phase E); mark origins.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run → L2 diff update.
- **Template** — `@../../templates/doc-brd.md`, structure only.
- **Reviewer** — ≥5 BOs OR quantified cost-benefit → spawn `@doc-reviewer` before reporting (threshold per `agents/doc-reviewer.md`).
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/brd <feature>              # reads {feature}-urd.md + brainstorms if present
/brd <new-feature>          # group A: interview the business case + create
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with a BRD: !`ls docs/*/*-brd.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature.** Read `{feature}-urd.md` (needs to cover) + `brainstorms/*.md` (problem framing) if present.
2. **Gather.** Gaps → one batched interview: why now (the business driver) · objectives + how each is measured · in/out of scope + dependencies · known business rules · cost/benefit items with their basis · risks.
3. **Fact-list** — every objective/figure/rule + its origin; inherited OQs.
4. **Assign IDs** — `BO-{feature}-{NN}`, covering `UN-` refs per row.
5. **Draft** per the template — the six load-bearing sections + OQs.
6. **L1 plan preview** — BO count + UN coverage + risk count + any uncovered UN- called out.
7. **Write** — `links:` → the URD + brainstorm(s).
8. **Activity log** — `CLAUDE_SKILL_NAME=/brd` + note + author before Write. Update `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/{feature}-brd.md`. Exit 1 → fix, ≤2 attempts.
10. **Reviewer gate** (over threshold) — pass the doc + fact-list to `@doc-reviewer`; apply BLOCKING fixes; re-validate.
11. **Output report** — coverage summary + next step (`/prd-epic {feature}`).

## L1 plan preview

> I'll write the BRD for **{feature}** to `docs/{feature}/{feature}-brd.md`: **{N} objectives** (BO-{feature}-01…{NN}) covering {C}/{T} user needs, {R} risks, cost-benefit {with basis | pending — {K} OQs}.
> Uncovered needs: {list or none}.
> Logged: activity log "BRD {N} objectives".
> Apply? (Y / edit)

## Output report

```
✅ BRD written: docs/{feature}/{feature}-brd.md
   Objectives: BO-{feature}-01…{NN} | UN coverage: {C}/{T} | Risks: {R} | OQs: {M}
   doc-validate: OK {| doc-reviewer: approve}

Next: /prd-epic {feature} — capabilities (CAP-) that deliver these objectives.
```

## Gotchas

- **A success measure is not a feature** — "increase self-service refunds to 80%" is a measure; "add a refund button" belongs in the PRD.
- **Cost-benefit honesty** — a table full of confident numbers with no basis column filled is worse than OQs; stakeholders will hold the BRD to those numbers.
- **Business Rules here are business-level** — policy ("refunds over $500 need manager approval"), not system behavior; system-level `BR-` IDs are minted later by `/srs`.
- **Do not rename sections** — the OQ cascade greps them.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md (the /discover profile — reuse established rules/objectives)
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-brd.md
- @../../agents/doc-reviewer.md (reviewer gate — step 10)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
