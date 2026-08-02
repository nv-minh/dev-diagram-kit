---
name: usecase
description: Use when you need fully-dressed Cockburn text use cases — actor goal, main success scenario, extensions — plus the use-case index whose table is the per-feature traceability matrix (UC↔FR↔Screen↔Error↔OQ). Trigger with `/usecase <feature> ["<goal>"]`. Two modes — discovery (no SRS yet: elicit, leave FR columns empty) and downstream (SRS present: full traceability). Differs from `/usecase-diagram` (the visual actor/UC scope picture) and `/userstory` (INVEST backlog slices).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [\"<goal>\"]"
---

# /usecase — Fully-dressed use cases (Cockburn text)

## Goal

Write actor-goal narratives the Cockburn way — Scope · Level · Primary Actor · Trigger · Preconditions · Guarantees · Main Success Scenario (numbered) · Extensions (`{step}{letter}`) · Related Requirements — one file per UC, plus the index whose `## Use cases` table IS the per-feature traceability matrix. **Outputs**: `docs/{feature}/usecases/uc-{slug}.md` (zero frontmatter) + `docs/{feature}/usecases/{feature}-usecase-index.md` (type `usecase-index`).

## Constraints

- **Two files per run, one source of metadata** — `uc-{slug}.md` holds ONLY prose sections; status/actor/FR/screens/priority live in the index table (`naming-conventions.md`). Never add frontmatter to `uc-*.md`.
- **Two-mode, never refuse** (`feature-bootstrap.md`): `srs/{feature}-spec.md` **missing → discovery mode = group A** — derive slug + interview actor/goal/flow/errors + create the feature; FR/Errors columns stay empty; unclear business numbers become OQs; route to `/srs` afterward. Spec **present → downstream mode** — extract FRs/E- codes and fill full traceability.
- **UC = business black-box** (`diagram-selection.md`) — business prose at sea level; no component calls, no payloads. Sequence/state diagrams do NOT embed here.
- **Extensions carry the E- codes** — every failure branch in downstream mode cites its `E-{feature}-NNN`; an extension with no error code and no OQ is a smell.
- **`UC-{slug}`** — human-readable kebab slug, ≤30 chars; the index table is the single traceability surface (no separate traceability file — removed 2026-07-13).
- **Index absorbs the diagram** — do not touch the `## Diagram/Actors/Relationships` sections owned by `/usecase-diagram`; update only the `## Use cases` table + `## CRUD matrix` rows this run owns.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — same slug re-run → L2 diff.
- **Reviewer** — a UC with ≥5 extensions OR ≥3 UCs in one run → `@doc-reviewer` gate.
- **Validate before done** — doc-validate on both files (step 9).

## Inputs

```
/usecase <feature>                     # detect goals from spec/URD, propose UC list
/usecase <feature> "<goal>"            # one specific UC (e.g. "approve a claim")
/usecase <new-feature> "<goal>"        # discovery mode: elicit + create feature
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Existing UCs: !`ls docs/*/usecases/uc-*.md 2>/dev/null | head -10`
Specs (mode selector): !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature + mode.** Spec present → downstream (Read spec: FRs, E- codes, actors; Read URD personas). Spec missing → discovery (group A interview).
2. **Pick the UC set.** From the goal arg, or propose one UC per user-goal-level capability; confirm the list before writing any.
3. **Interview gaps** (one batched round per UC): primary actor + goal · trigger · preconditions · minimal + success guarantees · main success scenario steps · what can go wrong per step (extensions).
4. **Fact-list** — per UC: every step + branch + its source (spec FR / interview); downstream mode maps each step to FRs and each extension to an E- code (or an OQ).
5. **Draft `uc-{slug}.md`** — Cockburn sections, numbered MSS, extensions as `{step}{letter}` (e.g. `3a`, `5b`) each ending in a resolution or a guarantee reference; Related Requirements links FRs/BRs (downstream) or notes "pending /srs" (discovery).
6. **Update the index** — append/refresh the `## Use cases` row (slug/level/status/actor/FR/screens/errors/OQ/priority/updated) + `## CRUD matrix` row against ERD entities if the ERD exists.
7. **L1 plan preview** — UC list + per-UC step/extension counts + traceability fill level.
8. **Write both files.** **Activity log** — `CLAUDE_SKILL_NAME=/usecase` + note + author before each Write. Update the index's `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/usecases/`. Exit 1 → fix, ≤2 attempts.
10. **Reviewer gate** (over threshold) — `@doc-reviewer`; apply BLOCKING fixes; re-validate.
11. **Output report** — traceability status + next steps (`/srs` in discovery; `/userstory` in downstream; `/usecase-diagram` for the visual).

## Cockburn shape reference (Claude composes it, do NOT hard-paste)

```markdown
# UC-approve-claim — Approve a claim

Scope: Atlas Re platform · Level: user-goal · Primary Actor: Approver

Trigger: a VALIDATED claim enters the approver's queue.
Preconditions: claim is VALIDATED; approver's tier covers the claim amount.
Minimal Guarantee: claim state and history remain consistent.
Success Guarantee: claim is APPROVED with actor + timestamp recorded.

## Main Success Scenario
1. Approver opens the claim from the queue.
2. System shows amount, reserves check, and history.
3. Approver approves the claim.
4. System records the transition and notifies the handler.

## Extensions
- 3a. Approver is the claim's validator → system blocks the decision (E-atlas-re-001).
- 3b. Another approver decided concurrently → system shows the conflict (E-atlas-re-004).

## Related Requirements
[[docs/atlas-re/srs/atlas-re-spec.md#FR-atlas-re-006|FR-atlas-re-006]] · BR-atlas-re-003
```

## L1 plan preview

> I'll write **{N} use case(s)** for **{feature}** ({mode} mode): {list of `uc-{slug}` + step/extension counts}.
> Index table rows {added|updated}: {N}. Traceability: {FR+E filled | pending /srs}.
> Logged: activity log "{N} UC {mode}".
> Apply? (Y / edit)

## Output report

```
✅ Use cases written: docs/{feature}/usecases/ → {list}
   Index: {feature}-usecase-index.md ({N} rows) | Mode: {discovery|downstream}
   Traceability: FR {filled/empty} · Errors {filled/empty} | doc-validate: OK

{Discovery: Next /srs {feature} to formalize FRs, then re-run /usecase to fill traceability.}
{Downstream: Next /userstory {feature} to slice these into backlog items; /usecase-diagram for the visual.}
```

## Gotchas

- **Level discipline** — user-goal ("approve a claim") is the default; a summary UC spanning sessions or a subfunction UC ("validate FX rate") needs an explicit reason.
- **Extensions are conditions, not steps** — `3a` happens INSTEAD OF/AT step 3; a linear "and then" belongs in the MSS.
- **Don't re-dress the spec** — a UC that reads like the FR table adds nothing; the value is the actor's intent and the failure story.
- **CRUD matrix honesty** — only mark entities the UC actually touches; cross-check the ERD names (CamelCase, matching `srs/{feature}-erd.md`).

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-usecase.md
- @../../templates/doc-usecase-index.md
- @../../agents/doc-reviewer.md (reviewer gate — step 10)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
