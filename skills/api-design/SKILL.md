---
name: api-design
description: Use when you need the Integration Blueprint — how WE orchestrate the 3rd-party API: call orchestration, state-map, source-of-truth, webhook handling, retry + reconciliation, and degraded UX. Written to integration/api-design.md; /api-map converges under it. Trigger with `/api-design <feature>`. Step [2] of the API chain; needs the summary from /api-doc. Differs from `/api-doc` (their contract; this is our orchestration) and /system-design (whole architecture; this is one integration).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /api-design — Integration Blueprint (API chain [2])

## Goal

Design how our system orchestrates the integration — the call sequence, where state lives (source-of-truth per field), how webhooks are received + reconciled, the retry policy, and the degraded UX when the provider is down. **Single output**: `docs/{feature}/integration/api-design.md` (type `api-design`). `/api-map` is a part underneath this (field-level detail), and the checklist converges under the design.

## Constraints

- **Step [2]** (`api-integration.md`): reads `api-summary*.md` (their contract). Summary missing → refuse + route `/api-doc` (can't orchestrate a contract you haven't digested).
- **Six mandatory concerns** — orchestration (the call sequence + who triggers each), state-map (which entities hold integration state + their fields), source-of-truth (per synced field: ours / theirs / derived), webhook handling (receive → verify → idempotent apply → reconcile), retry + reconciliation (the polling fallback for a missed webhook), degraded-UX (what the user sees when the provider is down).
- **No fabrication** — every decision cites the summary or the SRS; an invented endpoint or a guessed retry policy is BLOCKING.
- **Source-of-truth is explicit** — every synced field declares its owner; a field with no owner is a drift bug (flag it).
- **Webhook ⇄ reconciliation pair** — every webhook has a reconciliation path; a webhook with no fallback is a silent data-loss path.
- **Reads the SRS** — the FRs/NFRs (latency, availability) constrain the design (retry budget, sync vs async).
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — L2 diff.
- **Template** — `@../../templates/doc-api-design.md`.
- **Reviewer** — the blueprint touches reliability → consider `@doc-reviewer` for ≥3 webhooks or a complex retry fan-out (opt-in API coverage section).
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/api-design <feature>          # reads api-summary*.md + srs/{feature}-spec.md
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Contract summaries (required): !`ls docs/*/integration/api-summary*.md 2>/dev/null | head -10`
Specs: !`ls docs/*/srs/*-spec.md 2>/dev/null | head -10`
Existing designs: !`ls docs/*/integration/api-design.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No `api-summary*.md` → refuse + route `/api-doc`. Read the summary (endpoints/auth/webhooks/limits) + the SRS (FRs/NFRs that constrain the integration).
2. **Interview gaps** (one batched round): the call trigger per endpoint · sync vs async · where state lives · webhook verify + idempotency key · retry policy (attempts/backoff) + reconciliation endpoint+interval · degraded-UX surfaces.
3. **Fact-list** — every design decision + its source (summary row / SRS FR / interview); the source-of-truth owner per synced field.
4. **Draft** per the template — the six concerns, each decision sourced; a state-map (which entities/fields); a retry/reconciliation table per webhook.
5. **L1 plan preview** — endpoint count orchestrated + webhook⇄reconciliation pairs + degraded-UX surfaces + any ownerless field flagged.
6. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-design` + note + author.
7. **Self-check** — every webhook has a reconciliation partner; every synced field has an owner; retry budget fits the NFR latency.
8. **(Reviewer gate, opt-in)** — `@doc-reviewer` API coverage section.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/integration/api-design.md`. Exit 1 → fix, ≤2 attempts.
10. **Output report** — concerns covered + next (`/api-map` for field detail; `/api-checklist` for the test outline).

## L1 plan preview

> I'll write the Integration Blueprint for **{feature}** to `integration/api-design.md`: orchestrating {E} endpoints, **{W} webhooks** (each with a reconciliation partner), retry policy {attempts}/{backoff}, degraded-UX on {surfaces}.
> Source-of-truth: {ownerless-count} fields flagged (need an owner). Sources: summary + SRS.
> Apply? (Y / edit)

## Output report

```
✅ Integration Blueprint written: integration/api-design.md
   Endpoints orchestrated: {E} | Webhooks: {W} (all reconciled) | Degraded-UX: {D} surfaces | doc-validate: OK
   Ownerless fields flagged: {list | none}

Next: /api-map {feature} (field-level provider↔model↔UI mapping) → /api-checklist.
```

## Gotchas

- **Webhook without reconciliation = data loss** — the most common integration bug; the self-check exists to catch it.
- **Ownerless fields drift** — "who's right when both sides have a value?" must be answered per field at design time, not at the first conflict.
- **Retry budget vs NFR** — a 5-retry exponential backoff can blow a 2s latency NFR; check the budget against the SRS.
- **Don't restate the summary** — the design adds orchestration decisions, not a second copy of their endpoints.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-design.md
- @../../agents/doc-reviewer.md (opt-in API coverage — step 8)
- @../../scripts/doc-validate.ts (validate after Write — step 9)
