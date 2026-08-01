---
name: api-readiness
description: Use when the integration is built and tested and you need the go-live gate — cutover sequence, feature flags, monitoring, rollback, SLA/deprecation, and a go/no-go table. Written to integration/api-readiness.md. Trigger with `/api-readiness <feature>`. Step [6] (the gate before production). Hard-refuses a "go" if /api-test results are absent. Differs from /doc-review (quality audit; this is a launch gate) and /cr (a change; this is an enablement).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /api-readiness — Go-live gate (API chain [6])

## Goal

Produce the go-live gate for the integration — cutover sequence, feature flags (kill switch), monitoring + runbook, rollback, SLA/deprecation, and a go/no-go table that hard-refuses "go" if `/api-test` results are absent. **Single output**: `docs/{feature}/integration/api-readiness.md` (type `api-readiness`).

## Constraints

- **Step [6], the gate** (`api-integration.md`): reads the whole chain — summary, design, map, checklist, **tests**. `api-tests.md` missing → **hard-refuse "go"** (can't enable what you haven't proven works); still write the readiness doc with status `blocked`.
- **Go/no-go is evidence-based** — the table's "go" requires: tests present + monitoring defined + rollback defined + flags named. A "go" with any of these absent is BLOCKING.
- **Five mandatory concerns** — cutover (enablement sequence + who flips what), feature flags (kill switch name + owner + off-state = degraded UX), monitoring (alerts: error rate/latency/their-status-page + runbook link), rollback (disable sequence + partial-data back-out), SLA/deprecation (their SLA we depend on + sunset date + our deprecation notice).
- **No fabrication** — flag names, alert thresholds, SLA figures cite the design/SRS/provider docs; unknowns → OQ or a `blocked` row.
- **Degraded-UX is the flag's off-state** — the kill switch doesn't just turn the feature off, it routes to the degraded path the design specified.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run as evidence lands, flipping `blocked` → `go`.
- **Template** — `@../../templates/doc-api-readiness.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-readiness <feature>          # reads the whole chain, assesses go/no-go
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Chain artifacts: !`ls docs/*/integration/api-*.md docs/*/test/api/api-tests.md 2>/dev/null | head -15`
Existing readiness: !`ls docs/*/integration/api-readiness.md 2>/dev/null | head -10`

## Approach

1. **Gate.** Read the whole chain. `api-tests.md` absent → write readiness with go/no-go = **blocked (no test evidence)**; refuse to issue "go".
2. **Interview gaps** (one batched round): the cutover sequence + who flips each step · the kill-switch flag name + owner · the monitoring alerts + thresholds + runbook · the rollback sequence · the provider SLA + any sunset.
3. **Fact-list** — every gate item + its evidence/owner; the unknowns → `blocked` rows or OQs.
4. **Draft** per the template — the five concerns + the go/no-go table (each gate item: ready/blocked + evidence).
5. **L1 plan preview** — go/no-go verdict + the blocked items (if any) + the cutover summary.
6. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-readiness` + note + author.
7. **Self-check** — a "go" requires every gate item `ready`; any `blocked` → verdict stays `no-go`.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/integration/api-readiness.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — the verdict + the blocked items (the path to "go") + next (flip the flags on "go").

## L1 plan preview

> I'll write the go-live gate for **{feature}** to `integration/api-readiness.md`: verdict **{go | no-go — blocked: {items}}**.
> Cutover: {steps} · Kill switch: {flag} ({owner}) · Monitoring: {alerts} · Rollback: {confidence} · SLA: {value or OQ}.
> Apply? (Y / edit)

## Output report

```
✅ Readiness gate written: integration/api-readiness.md
   Verdict: {GO ✓ | NO-GO ✗ — blocked: {items}}
   {If no-go: resolve {items}, then re-run /api-readiness to flip to go.}
   doc-validate: OK

On GO: execute the cutover sequence; the kill switch ({flag}) stays in {owner}'s hands.
```

## Gotchas

- **"Go" is a verb with consequences** — a soft "looks ready" is not a go; the table forces each gate item to declare ready/blocked with evidence.
- **Rollback must be real** — "disable the flag" is half a rollback; the other half is backing out data already written to our DB / sent to the provider.
- **Their SLA is our dependency** — if the provider's SLA is worse than our NFR availability, that's a `blocked` row, not a hope.
- **Sunset dates bite** — a provider EOL in the cutover window is a hard block; record the date.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-readiness.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
