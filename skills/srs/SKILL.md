---
name: srs
description: Use when you need the SRS — precise system behavior as testable Functional Requirements, NFRs, Business Rules, and an Error Matrix (FR-/NFR-/BR-/E- IDs), written to docs/{feature}/srs/{feature}-spec.md, then a menu of diagram skills to illustrate it. Trigger with `/srs <feature> [--section <n>]`. Last step of the discovery chain and the source every spec skill consumes. Differs from `/usecase` (actor-goal narrative) and `/prd-epic` (capabilities; the SRS is system-shall precision).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "<feature> [--section <n>]"
---

# /srs — Software Requirements Specification (orchestrator)

## Goal

Specify EXACTLY what the system must do — Section 2 Functional Requirements (`FR-`), Section 3 NFRs (`NFR-`), Section 4 Business Rules (`BR-`), Section 5 Error Matrix (`E-`) — each testable and traced to a `CAP-`. **Single output**: `docs/{feature}/srs/{feature}-spec.md` (type `srs`, FULL frontmatter). After the spec, offer the diagram menu (`/sequence` `/state` `/erd` `/user-flow`…) — each menu item is its own skill run.

## Constraints

- **1 fixed output** — `docs/{feature}/srs/{feature}-spec.md`. Diagrams do NOT embed here — they live in `srs/{feature}-flows.md` / `-states.md` / `-erd.md` via their own skills.
- **Orchestrator special case** (`feature-bootstrap.md`): spec missing → group A for the spec itself (derive slug + interview Batch 1-2 + create `srs/`); the menu items stay group B (they need the just-written spec).
- **Sub-agents return content, never write** (`approval-gate.md` §sub-agents) — every Write goes through this orchestrator's L1 gate.
- **Testable phrasing** — every FR: "The system shall {observable behavior} when {condition}" (or equivalent); reject vague verbs (support/handle/manage) in favor of observable outcomes. Every FR row: Covers (CAP-) + Priority + Source.
- **Mint 4 ID families** — `FR-/NFR-/BR-/E-{feature}-{NNN}`, 3-digit, max+1 each, never renumber.
- **Error Matrix is first-class** — every FR with a failure mode gets an `E-` row (condition · system behavior · user sees · related FR). An SRS with 12 FRs and 1 error row is under-specified.
- **PRD missing → soft note** (Covers column empty until `/prd-epic` runs); feature missing → group A.
- **Inherit OQs** (`resolve-oqs.md` Phase E) — from PRD/BRD/URD chain; own OQs in the "Open Questions" section.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — `--section <n>` or full re-run → L2 diff.
- **Template** — `@../../templates/doc-srs.md`, structure only.
- **Reviewer** — ≥15 FRs OR ≥5 E- OR ≥3 NFR categories OR ≥10 BRs → `@doc-reviewer` gate.
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/srs <feature>                  # full spec (create or update)
/srs <feature> --section 5      # revisit one section (e.g. Error Matrix)
/srs <new-feature>              # group A: interview Batch 1-2 + create
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with a spec: !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature + mode.** Read the chain: `{feature}-prd.md` (CAPs to cover) → `{feature}-brd.md` (business rules to formalize) → `{feature}-urd.md` (actors from personas). Existing spec → update mode.
2. **Interview Batch 1 (frame):** actors + system boundary · the main scenarios per P0 capability. **Batch 2 (behavior):** per scenario — trigger, observable outcome, failure modes, business rules touched, data touched. No-re-ask what the chain already answers.
3. **Fact-list** — every behavior/rule/error + origin (PRD/BRD/interview); each CAP → its FR candidates.
4. **Assign IDs** — FR/NFR/BR/E per section, scanning the existing spec for max.
5. **Draft** per the template — Overview + actors · Section 2 FRs (testable, Covers CAP-) · Section 3 NFRs (category + measure) · Section 4 BRs (formalized from BRD + interview) · Section 5 Error Matrix (linked to FRs) · data notes · diagram links · OQs.
6. **L1 plan preview** — per-section counts + CAP coverage + uncovered CAPs called out. `--section` mode → preview only that section's diff.
7. **Write** — `links:` → PRD (+ BRD/URD).
8. **Activity log** — `CLAUDE_SKILL_NAME=/srs` + note + author before Write. Update `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/srs/{feature}-spec.md`. Exit 1 → fix, ≤2 attempts.
10. **Reviewer gate** (over threshold) — `@doc-reviewer` with the doc + fact-list; apply BLOCKING fixes; re-validate.
11. **Diagram menu** — offer per `doc-selection.md`/`diagram-selection.md`: flows (`/sequence`, `/activity-swimlane`), lifecycle (`/state`), data (`/erd`, `/dbdiagram`), screens (`/user-flow`, wave 2). Each item runs as its own skill with this spec as source.
12. **Output report.**

## L1 plan preview

> I'll write the SRS for **{feature}** to `docs/{feature}/srs/{feature}-spec.md`: **{F} FRs** covering {C}/{T} capabilities, **{N} NFRs**, **{B} business rules**, **{E} error rows**.
> Uncovered CAPs: {list or none}. OQs: {M} ({K} inherited).
> Logged: activity log "SRS {F} FR + {E} error".
> Apply? (Y / edit)

## Output report

```
✅ SRS written: docs/{feature}/srs/{feature}-spec.md
   FR: {F} | NFR: {N} | BR: {B} | E: {E} | CAP coverage: {C}/{T} | OQs: {M}
   doc-validate: OK {| doc-reviewer: approve}

Illustrate it (each runs as its own skill):
  /sequence "{main flow}" --feature {feature}     · time-ordered interactions
  /state "{entity}" --feature {feature}           · lifecycle
  /erd --feature {feature}                        · data model
Downstream (wave 2): /usecase, /userstory slice these FRs.
```

## Gotchas

- **"Support X" is not a requirement** — rewrite to the observable behavior ("shall return the refund status within 2s of the request").
- **The Error Matrix is where specs earn their keep** — happy paths survive contact with users; error rows are what devs and testers actually need.
- **NFRs need a measure** — "fast" is not an NFR; "p95 < 500ms at 100 rps" is.
- **BR here is system-enforceable** — BRD-level policy became `BR-` rows only when the system enforces them.
- **Do not embed diagrams** — link `srs/{feature}-flows.md` etc.; the merged-file convention keeps the spec reviewable.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-srs.md
- @../../agents/doc-reviewer.md (reviewer gate — step 10)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
