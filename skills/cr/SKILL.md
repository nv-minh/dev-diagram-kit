---
name: cr
description: Use when scope changes mid-flight — record a Change Request with an Impact Matrix (which FR/US/E- IDs are affected), a Rollback plan, and a guided Apply order that edits each affected doc as an L2 diff. Trigger with `/cr "<change>" [--apply CR-...]`. Project-level (docs/cr/). Differs from `/doc-review` (quality audit, not a change) and the OQ workflow (an OQ is an internal question; a CR is an external scope change).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "\"<change>\" [--apply CR-...]"
---

# /cr — Change Request (record + impact + rollback + guided apply)

## Goal

Record a scope change as a self-contained Change Request — `docs/cr/CR-{YYYYMMDD}-{NNN}.md` (type `change-request`) — carrying the Impact Matrix (affected IDs across the spine), the Detailed Impact, and the Rollback Plan. With `--apply`, walk the Apply order and edit each affected doc as an L2 diff.

## Constraints

- **Group C\*** (`feature-bootstrap.md`): project-level; consumes any doc. The CR file is **self-contained** — Impact Matrix + Detailed Impact + Rollback live INSIDE it (no separate `docs/impacts/` file, per `naming-conventions.md`).
- **Mint `CR-{YYYYMMDD}-{NNN}`** — date-based, project-wide, max+1 for the day.
- **Record first, apply second** — `/cr "<change>"` writes the CR record (L1); `--apply CR-...` executes the Apply order (per-doc L2 diffs). Never apply without a recorded CR.
- **Impact Matrix cites real IDs** — every affected row names an existing FR/US/E-/…; `/gap` later flags a CR whose Impact names a nonexistent ID (drift).
- **Apply order = a sequence of L2 diffs** — each step targets one doc, shown as a diff, approved per `approval-gate.md`. The `@change-tracker` agent computes the order + drafts the diffs (per `review-format.md`).
- **Rollback is mandatory** — every CR carries a rollback plan (revert the IDs, restore prior states); an apply without a rollback path is BLOCKING.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Template** — `@../../templates/doc-cr.md`.
- **Validate before done** — doc-validate on the CR file (step 7).

## Inputs

```
/cr "<change description>"            # record the CR (Impact + Rollback), no edits yet
/cr --apply CR-20260801-001           # execute the Apply order (per-doc L2 diffs)
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Existing CRs: !`ls docs/cr/CR-*.md 2>/dev/null | tail -5`
Features in scope: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`

## Approach

### Record mode (`/cr "<change>"`)
1. **Understand the change** — interview (one batched round): what changes, why, which features/IDs are affected, is it reversible.
2. **Build the Impact Matrix** — scan the vault for the affected IDs (FR/US/E-/screens…); each row: ID + doc + nature of impact (add/modify/remove) + the new value.
3. **Draft the Apply order** — the sequence of per-doc edits (dependencies first; e.g. SRS before the stories that slice it).
4. **Draft the Rollback Plan** — the reverse sequence + prior values to restore.
5. **L1 plan preview** — affected-ID count + apply-order summary + rollback confidence.
6. **Write `docs/cr/CR-{date}-{NNN}.md`.** **Activity log** — `CLAUDE_SKILL_NAME=/cr` + note + author.
7. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/cr/CR-{date}-{NNN}.md`. Exit 1 → fix, ≤2 attempts.
8. **Output report** — CR id + next (`--apply` when ready).

### Apply mode (`--apply CR-...`)
1. **Read the CR** — the Apply order + Impact Matrix.
2. **Spawn `@change-tracker`** — computes the per-doc diffs (the agent returns diffs, never writes — `review-format.md`).
3. **Walk the Apply order** — per doc: show the L2 diff → on approval, Edit → set the activity log env → next. A step whose target doc changed since the CR was recorded → HARD STOP (re-assess impact).
4. **Tick the CR's applied-status** per step; on completion stamp `applied: {date}`.
5. **Output report** — steps applied + any that needed re-assessment.

## L1 plan preview (record)

> I'll record **CR-{date}-{NNN}** to `docs/cr/`: change "{summary}".
> Impact: **{N} IDs** across {features} ({add} add · {mod} modify · {rem} remove). Apply order: {step summary}. Rollback: {reversible/complex}.
> Logged: activity log "CR recorded {id}".
> Apply? (Y / edit)

## Output report (record)

```
✅ Change Request recorded: docs/cr/CR-{date}-{NNN}.md
   Impact: {N} IDs | Apply order: {steps} | Rollback: {confidence}
   doc-validate: OK

When approved: /cr --apply CR-{date}-{NNN} (walks the Apply order, L2 per doc).
```

## Gotchas

- **Apply ≠ record** — a recorded CR with no apply is a normal "logged but not done yet" state; don't auto-apply.
- **Stale impact is the killer** — if a target doc changed after the CR was recorded, the Apply order's diffs are wrong; HARD STOP and re-assess rather than apply a stale diff.
- **Rollback or don't ship** — an irreversible change with no rollback path must be called out at record time, not discovered at apply.
- **CR is cross-cutting** — it touches the spine anywhere; let `@change-tracker` compute the order so dependencies (SRS→stories→tests) aren't violated.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/traceability.md
- @../../rules/review-format.md
- @../../rules/language.md
- @../../templates/doc-cr.md
- @../../agents/change-tracker.md (computes the Apply order — apply mode step 2)
- @../../scripts/doc-validate.ts (validate the CR record — step 7)
