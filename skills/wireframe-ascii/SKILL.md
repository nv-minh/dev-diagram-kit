---
name: wireframe-ascii
description: Use when you need screen wireframes reviewable directly in chat — an ASCII frame per screen plus the 5-column description table (# / Items / Control type / Data type / Description), written to ascii-wireframe/{flow-slug}.md with the screen index. Trigger with `/wireframe-ascii <feature> [--flow <slug>]`. Needs the user flow (`srs/{feature}-userflow.md`, stage: approved) — refuses otherwise. L3 iterate (renders in chat). Differs from `/wireframe-html` (browser-rendered, not chat) and `/journey` (experience, not screens).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--flow <slug>]"
---

# /wireframe-ascii — ASCII wireframes + 5-column descriptions

## Goal

Draw one ASCII frame per screen in a flow + the **5-column screen-description table** (`# / Items / Control type / Data type / Description`), merged into one `docs/{feature}/ascii-wireframe/{flow-slug}.md` (zero frontmatter) per flow, and keep `docs/{feature}/ascii-wireframe/{feature}-wireframe-index.md` (type `screen-index`) as the single source of metadata + per-screen purpose for the whole feature.

## Constraints

- **Group B\*** (`feature-bootstrap.md`): `srs/{feature}-userflow.md` with `stage: approved` missing → refuse + route to `/user-flow`. The flow-slug (if passed) must exist in that file's flow list.
- **L3 iterate IS the point** (`approval-gate.md` L3 list) — ASCII renders in chat; iterate the frame at L3 with the user before the Write. No L3 means this skill lost its reason to exist over `/wireframe-html`.
- **One screen = one state at one point in time** (`ba-conventions.md` §8) — split multi-state screens; forms don't span full width.
- **No emoji inside the ASCII frame** — breaks the border alignment. Emoji only outside the frame, if ever.
- **Description depth is the value** (`ba-conventions.md` §6) — 6 layers (purpose · validation/constraints · states · navigation · error+wording · edge/security). Source ONLY from `srs/{feature}-spec.md` (FR/BR/NFR/E-), UC branches, URD — **never fabricate**; gaps → ask the user one element at a time (no-re-ask), or mark clearly where filling is needed.
- **Device question first** (`ba-conventions.md` §7) — pre-suggest from `userflow.md`'s `primary_device`; never decide silently. Confirm via AskUserQuestion (Mobile 375 / Tablet 768 / Desktop 1024 / Responsive). Write `primary_device` back if missing.
- **Screens numbered `[n]` from the userflow** — reuse the userflow's numbers; the `id="s{n}"` deep-links match the HTML skills.
- **Bilingual (mirror input — @../../rules/language.md)**; table headers stay English.
- **Idempotent** — same flow re-run → L2 diff; the screen index `updated` column ticks.
- **Validate before done** — doc-validate on the ascii-wireframe dir (step 9).

## Inputs

```
/wireframe-ascii <feature>                  # prompt for the flow, or do all un-drawn flows
/wireframe-ascii <feature> --flow <slug>    # one flow
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Userflows (gate source): !`ls docs/*/srs/*-userflow.md 2>/dev/null | head -10`
Screen indexes: !`ls docs/*/ascii-wireframe/*-wireframe-index.md 2>/dev/null | head -10`
Existing ASCII flows: !`ls docs/*/ascii-wireframe/*.md 2>/dev/null | grep -v index | head -10`

## Approach

1. **Gate.** `userflow.md` missing or `stage`≠`approved` → refuse + route `/user-flow`. Read it: the target flow's screens `[n]`, device, navigation edges.
2. **Confirm device** (AskUserQuestion, pre-suggest from `primary_device`). Write `primary_device` back into `userflow.md` if it was missing.
3. **Read description sources** — `srs/{feature}-spec.md` (FR/BR/NFR/E- per screen), `usecases/uc-*.md` (branches → screens), URD personas. Build the fact-list per screen.
4. **Ask the gaps** (one element at a time, no-re-ask) — every control whose validation/error/state the sources don't pin down; "skip" → mark the row shallow with a clear fill-needed note.
5. **Draft per screen** — ASCII frame (boxed, label `[n] Name`, the controls as ASCII) + the 5-column table beneath it. Iterate the frame at **L3** in chat until the user is happy with the layout.
6. **Update the index** — ensure each screen has a `## Descriptions` H3 row (1-2 sentence purpose) + the Screens table row (status / owning flow / used-by / Figma+HTML / updated).
7. **L1 plan preview** — flow + screen count + device + per-screen fill-level (filled / marked-needs-fill).
8. **Write `{flow-slug}.md`** + edit the index. **Activity log** — `CLAUDE_SKILL_NAME=/wireframe-ascii` + note + author before each Write/Edit.
9. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/ascii-wireframe/`. Exit 1 → fix, ≤2 attempts.
10. **Output report** — screens drawn + marked-needs-fill count + next (`/wireframe-html` same flow, or `/ac`/`/prototype-html`).

## ASCII shape reference (Claude composes it, do NOT hard-paste)

```
┌─ [3] Decision panel ──────────────────────── desktop 1024 ─┐
│  Amount:   USD 250,000                                     │
│  Reserves: ✓ validated (Finance, 2026-08-01)               │
│                                                            │
│  [ ] I confirm the decision is mine to make                │
│                                                            │
│  ( Approve )   ( Reject )        ← buttons                 │
└────────────────────────────────────────────────────────────┘

| # | Items | Control type | Data type | Description |
|---|---|---|---|---|
| 1 | Amount | text | currency | • Business purpose: the claim amount in USD at filing-date rate (BR-atlas-re-001). • Read-only here. |
| 2 | Approve | button | action | • Nav → [4] Confirmation. • Disabled until the confirm checkbox is ticked. • Error E-atlas-re-001: approver is the validator → blocked. |
```

## L1 plan preview

> I'll wireframe flow **{flow}** for **{feature}** to `ascii-wireframe/{flow}.md`: **{N} screens** (`[n]` list), device **{device}**.
> Description fill: {filled}/{N} fully sourced; {K} marked needs-fill (gaps below).
> Logged: activity log "ascii wireframes {flow} {N} screens".
> Apply? (Y / edit)

## Output report

```
✅ ASCII wireframes written: ascii-wireframe/{flow}.md + {feature}-wireframe-index.md
   Screens: {N} | Device: {device} | Fully sourced: {filled}/{N} | Needs-fill: {K}
   doc-validate: OK

Needs your input (marked in the doc): {element list}.
Same flow in a browser? /wireframe-html {feature} --flow {flow} (renderer on par).
Clickable demo of all flows? /prototype-html {feature}.
```

## Gotchas

- **The ASCII frame is throwaway-grade layout** — its job is to confirm *what's on the screen* and the rough arrangement, not pixel fidelity; `/wireframe-html` is the fidelity pass.
- **Don't pad the Description** — terse is the rule (`ba-conventions.md` §6); a row that needs 6 layers gets them, a link needs 1-2.
- **Numbers must be sourced** — "max 50k" came from BR-atlas-re-001; cite it, never retype it as a guess.
- **One state per screen** — the error state of a form is its own screen (or a clearly split frame), not a busy combo.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-wireframe-index.md
- @../../scripts/doc-validate.ts (validate after Write — step 9)
