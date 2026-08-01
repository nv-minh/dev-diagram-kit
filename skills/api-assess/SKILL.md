---
name: api-assess
description: Use when a feature needs a 3rd-party integration and the provider is NOT yet chosen — a build-vs-buy / provider-selection scorecard written to integration/api-assess.md. Trigger with `/api-assess <feature> ["<need>"]`. Step [0] of the API chain; skippable when the provider is fixed (go straight to /api-doc). Differs from `/api-doc` (understand a chosen contract; this chooses the contract).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [\"<need>\"]"
---

# /api-assess — Build-vs-buy / provider selection (API chain [0])

## Goal

Decide whether to build or buy, and if buy, which provider — as a scorecard: candidates × weighted criteria (coverage of our need, cost, reliability/SLA, auth model, data residency, sunset risk). **Single output**: `docs/{feature}/integration/api-assess.md` (type `api-assess`), consumed by `/api-doc` (the chosen provider's contract).

## Constraints

- **Step [0], skippable** (`api-integration.md`): provider already fixed → tell the user to skip to `/api-doc`; don't fabricate a decision that was already made.
- **Group A\*** (`feature-bootstrap.md`): integration-first feature entry point; can create the feature.
- **No fabrication** — every scorecard cell needs a basis (provider docs, a quote, a known limitation); unknowns → OQ. A provider scored on a guessed SLA is the worst kind of decision record.
- **Weighted, not flat** — criteria carry weights the user confirms; a flat "X is best" with no weights isn't a defensible choice.
- **Read the need first** — from `srs/{feature}-spec.md` (what FRs demand of the integration) or the `<need>` arg; the scorecard scores against the need, not in the abstract.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run → L2 diff.
- **Template** — `@../../templates/doc-api-assess.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-assess <feature> "<need>"          # score providers against the stated need
/api-assess <feature>                   # derive the need from the SRS
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Specs (need source): !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`
Existing assessments: !`ls docs/*/integration/api-assess.md 2>/dev/null | head -10`

## Approach

1. **Resolve the need** — from the SRS (FRs touching an external service) or the `<need>` arg. State it in one line.
2. **Candidate + criteria interview** (one batched round): candidate providers; the weighted criteria (coverage / cost / SLA / auth / residency / sunset); per-candidate notes with their basis.
3. **Fact-list** — every score + basis; unknowns → OQ.
4. **Score** — per candidate × criterion (the weights sum to 100%); compute the totals.
5. **Draft** the scorecard + a one-paragraph recommendation citing the winning margin + the biggest risk of the winner.
6. **L1 plan preview** — candidates + the winner + the deciding criterion + open risks.
7. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-assess` + note + author.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/integration/api-assess.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — the choice + next (`/api-doc <feature> --provider <winner>`).

## L1 plan preview

> I'll write the provider assessment for **{feature}** to `integration/api-assess.md`: need "{need}", **{N} candidates** scored on {criteria}.
> Recommendation: **{winner}** (margin {x} over {runner-up}, decided by {criterion}). Biggest winner-risk: {risk}.
> Apply? (Y / edit)

## Output report

```
✅ Assessment written: integration/api-assess.md → recommended {winner}
   Candidates: {N} | Deciding criterion: {c} | OQs: {m}

Next: /api-doc {feature} --provider {winner} (digest their contract).
```

## Gotchas

- **Don't pick for the user** — present the scored recommendation; the choice is theirs (a cost-led choice over a coverage-led one is legitimate).
- **Sunset/deprecation is a criterion** — a provider EOL-ing in 6 months scoring high on coverage is a trap; weight it.
- **Skip honestly** — if the provider is fixed, say so and route to `/api-doc`; a faux-assessment of one candidate is theater.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-assess.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
