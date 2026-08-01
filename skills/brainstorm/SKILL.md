---
name: brainstorm
description: Use when you have a raw feature idea and nothing structured yet — a facilitated exploration that turns one idea into a brainstorm doc with decisions and Open Questions, written to docs/{feature}/brainstorms/. Trigger with `/brainstorm "<idea>" [--feature <slug>]`. The root of the discovery chain (→ /urd → /brd → /prd-epic → /srs). Differs from `/prd` (defines the whole product) and `/mindmap` (a scope tree diagram, not a doc).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "\"<idea>\" [--feature <slug>]"
---

# /brainstorm — Idea exploration (BA discovery doc)

## Goal

Turn ONE raw idea into a structured brainstorm document — problem, affected users, idea sketch, success criteria, explorations, decisions, and explicit Open Questions. **Single output**: `docs/{feature}/brainstorms/{idea-slug}.md`. This doc is the root of the OQ cascade (`resolve-oqs.md`) — downstream `/urd` and `/brd` inherit its unresolved OQs.

## Constraints

- **1 fixed output** — `docs/{feature}/brainstorms/{idea-slug}.md` (type `brainstorm`). One idea = one file; a second idea for the same feature = a second file.
- **`--feature` optional** — auto-detect; **feature does not exist + an idea → derive slug + create** (entry point, `feature-bootstrap.md` group A — `/brainstorm` is THE comprehensive-interview skill, the one place a wide-ranging interview is its job).
- **Facilitate, don't dictate** — offer elicitation angles (SCAMPER-style what-if, role-play "how would {persona} react", constraint-flip) one round at a time; the user's answers are the content. Never fill sections with invented business facts.
- **L3 iterate allowed** — the doc is prose + ASCII sketches, it renders in chat; iterate on the sketch before L1 if the user engages.
- **OQs are first-class** — anything the user can't answer becomes an `- [ ] OQ-n:` item, never a guess. The OQ section format must match `resolve-oqs.md` (checkbox list, `[ ]`/`[~]`/`[x]`).
- **No-re-ask (`ba-conventions.md` §2)** — scan the idea seed + previous answers before each question round.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — same idea-slug re-run → update mode (L2 diff).
- **Template** — `@../../templates/doc-brainstorm.md`, structure only (`ba-conventions.md` §0).
- **Validate before done** — run doc-validate (step 9); exit 1 = fix before reporting.

## Inputs

```
/brainstorm "<idea>"                        # derive feature slug from the idea
/brainstorm "<idea>" --feature <slug>       # explicit feature (existing or new)
/brainstorm "<idea>" --feature payment      # second idea in an existing feature
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Existing brainstorms: !`ls docs/*/brainstorms/*.md 2>/dev/null | head -10`

## Approach

1. **Resolve feature + idea slug.** Derive the feature slug from the idea's domain noun (group A); derive the idea-slug from the idea itself. Both confirmable at L1.
2. **Interview — round 1 (the frame):** problem/opportunity · who is affected + their situation today · what success looks like. Batched, ≤5 questions.
3. **Interview — round 2 (exploration):** pick 1-2 elicitation angles that fit the idea (what-if flips, persona role-play, "what breaks at 10× scale", constraint removal). Offer the menu; the user picks or skips.
4. **Fact-list** — every answer + its origin (user round 1/2); unanswered items become OQ candidates.
5. **Draft sections** per the template: problem, affected users (table), idea sketch (prose or ASCII), success, explorations, decisions (table with rationale), out-of-scope, Open Questions.
6. **L1 plan preview** — feature + idea slug + section fill summary + OQ count.
7. **Write** — create `docs/{feature}/brainstorms/` on first Write.
8. **Activity log** — set `CLAUDE_SKILL_NAME=/brainstorm` + `CLAUDE_CHANGELOG_NOTE` + `CLAUDE_CHANGELOG_AUTHOR` before Write. Update `updated:`.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/brainstorms/{idea-slug}.md`. Exit 1 → fix, ≤2 attempts.
10. **Output report** — OQ count called out + the next step in the chain (`/urd {feature}`).

## L1 plan preview

> I'll write the brainstorm for **{idea}** to `docs/{feature}/brainstorms/{idea-slug}.md` — {N} sections filled, **{M} open questions** captured (not guessed).
> New feature `{feature}` will be created. | Existing feature `{feature}`.
> Logged: activity log "brainstorm {idea-slug} captured".
> Apply? (Y / edit)

## Output report

```
✅ Brainstorm written: docs/{feature}/brainstorms/{idea-slug}.md
   Sections: {N} | Decisions: {D} | Open Questions: {M}
   doc-validate: OK

Next in the discovery chain: /urd {feature} (user needs) → /brd {feature} (business case).
Unanswered OQs cascade forward — resolve them any time with the OQ workflow (rules/resolve-oqs.md).
```

## Gotchas

- **Don't interrogate** — two rounds max by default; the doc can grow on a later run. A brainstorm that takes an hour of questions kills the idea's momentum.
- **Sketch ≠ spec** — the idea sketch stays at business altitude; "how would the API look" belongs to `/srs` or `/api-design` later.
- **One idea per file** — a second idea mid-interview → offer to split into its own file.
- **OQ format matters** — `resolve-oqs.md` parses the checkbox list; freeform prose OQs won't cascade.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-brainstorm.md
- @../../scripts/doc-validate.ts (validate after Write — step 9)
