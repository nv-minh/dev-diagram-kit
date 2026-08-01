---
name: urd
description: Use when you need the User Requirements Document — personas, context of use, and user needs (UN- IDs) for one feature, written to docs/{feature}/{feature}-urd.md. Trigger with `/urd <feature>`. Second step of the discovery chain (/brainstorm → /urd → /brd). Differs from `/brd` (business case — objectives and ROI, not user needs) and `/journey` (experience diagram, not a needs doc).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /urd — User Requirements Document

## Goal

Capture WHO the users are and WHAT they need — personas, context of use, and a needs table that mints **`UN-{feature}-{NNN}`** IDs (the root of the traceability spine: UN → BO → CAP → FR). **Single output**: `docs/{feature}/{feature}-urd.md`.

## Constraints

- **1 fixed output** — `docs/{feature}/{feature}-urd.md` (type `urd`, FULL frontmatter).
- **Feature arg required in spirit** — missing/new feature → group A (`feature-bootstrap.md`): derive slug, interview user needs, create on Write.
- **Read upstream first** — `docs/{feature}/brainstorms/*.md` if present: personas and pains often already exist there; inherit unresolved OQs (`resolve-oqs.md` Phase E). No-re-ask.
- **Mint `UN-` IDs** — `UN-{feature}-{NNN}`, 3-digit, max+1, never reused. Every need row cites its source (brainstorm section, interview answer, research doc).
- **User altitude** — needs are phrased from the user's world ("needs to see the refund status without calling support"), NOT solution language ("needs a status API"). Solutioning belongs downstream.
- **No fabricated personas** — no source + no answer → OQ, not an invented persona.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run → update mode (L2 diff); new needs append with the next `UN-` number.
- **Template** — `@../../templates/doc-urd.md`, structure only.
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/urd <feature>              # existing feature (reads its brainstorms)
/urd <new-feature>          # group A: interview user needs + create
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with a URD: !`ls docs/*/*-urd.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature.** Existing → read `brainstorms/*.md` + any prior URD. New → group A.
2. **Gather.** From the brainstorm: affected users → persona candidates; pains → need candidates. Gaps → one batched interview: personas (who, context, goals, frustrations) · context of use (where/when/on what) · needs per persona · environment constraints.
3. **Fact-list** — every persona + need + its source; unresolved upstream OQs to inherit.
4. **Assign IDs** — `UN-{feature}-{NNN}` per need, scanning the existing URD for max.
5. **Draft** per the template: personas table · context of use · needs table (ID/persona/statement/priority/source) · environment & constraints · assumptions · OQs (own + inherited, marked with origin).
6. **L1 plan preview** — persona count + need count + inherited OQ count.
7. **Write** — with frontmatter `links:` pointing at the source brainstorm(s).
8. **Activity log** — `CLAUDE_SKILL_NAME=/urd` + note + author before Write. Update `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/{feature}-urd.md`. Exit 1 → fix, ≤2 attempts.
10. **Output report** — needs minted + next step (`/brd {feature}`).

## L1 plan preview

> I'll write the URD for **{feature}** to `docs/{feature}/{feature}-urd.md`: **{P} personas**, **{N} user needs** (UN-{feature}-001…{NNN}).
> Source: {brainstorm files | interview}. Inherited OQs: {K}.
> Logged: activity log "URD {P} personas, {N} needs".
> Apply? (Y / edit)

## Output report

```
✅ URD written: docs/{feature}/{feature}-urd.md
   Personas: {P} | Needs: UN-{feature}-001…{NNN} | OQs: {M} ({K} inherited)
   doc-validate: OK

Next: /brd {feature} — turn these needs into business objectives (BO- covers UN-).
```

## Gotchas

- **Needs ≠ features** — "needs to export a monthly report" is a need; "needs an Export button" is a solution. Push solution phrasing down to the PRD/SRS.
- **Persona sprawl** — >4 personas usually means the feature is too broad; suggest splitting the feature instead of padding the table.
- **ID discipline** — never renumber existing `UN-`s on update; deleted needs keep their number retired.
- **Priority is the user's voice** — P0 = the persona cannot do their job without it, not "we want it first".

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-urd.md
- @../../scripts/doc-validate.ts (validate after Write — step 9)
