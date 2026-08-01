---
name: inbox
description: Use when you need zero-friction capture — a raw note dumped fast for later triage, or triage mode that routes existing inbox notes to the right skill via the /ba table. Trigger with `/inbox "<note>"` or `/inbox --triage`. Project-level (docs/inbox/), excluded from the activity log. Differs from /meeting (structured minutes; this is raw capture) and /brainstorm (idea exploration; this is a parking lot).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "\"<note>\" [--triage]"
---

# /inbox — Zero-friction capture + triage

## Goal

Two modes. **Capture** (`/inbox "<note>"`): dump a raw note fast — `docs/inbox/YYYY-MM-DD-{slug}.md` (type `inbox`), no structure required, for later sorting. **Triage** (`/inbox --triage`): read the inbox, propose a destination skill per note (via the `/ba` routing table), and route — convert a note into the right doc or leave it parked.

## Constraints

- **Group C\*** (`feature-bootstrap.md`): project-level; no feature needed.
- **Excluded from the activity log** (`changelog.md`) — inbox is raw capture, not a business event; the hook skips `docs/inbox/`.
- **Capture is frictionless** — no L1 ceremony for a raw dump; write it, confirm in one line. Structure comes at triage time.
- **Triage routes via `/ba`** — each note's content → the matching document skill (a decision → `/cr`; a requirement → `/srs`/`/brd`; a raw idea → `/brainstorm`; minutes → `/meeting`). Ambiguous → ask, never auto-route to the wrong skill.
- **Triage is destructive-safe** — routing a note converts it (the note is consumed/marked routed); the original stays in inbox marked `routed → {skill}` until the user prunes.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — capture re-run same day+slug → append; triage re-run → only unrouted notes.
- **Template** — `@../../templates/doc-inbox.md`.
- **Validate before done** — doc-validate (capture: step 4; triage touches other skills' outputs, those validate themselves).

## Inputs

```
/inbox "Finance wants the reserve check to flag anything over 500k"     # capture
/inbox --triage                                                          # route the inbox
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Inbox: !`ls docs/inbox/*.md 2>/dev/null | tail -10`

## Approach (capture)
1. **Slug from the note** — derive a kebab slug; date-stamp.
2. **Write** the raw note per the template (frontmatter `type: inbox`, the note body, a `triage: —` marker). **Activity log** — NOT set (excluded).
3. **One-line confirm** + suggest `/inbox --triage` when the pile grows.

## Approach (triage)
1. **Read the inbox** — every unrouted note.
2. **Classify** — per note, match the `/ba` routing table: requirement/spec/idea/change/minutes/capture. Propose a destination skill + the carry-through args.
3. **L1 preview** — per note: `{note} → /{skill} {args} (because {reason})`. Ambiguous → ask.
4. **On approval → route** — invoke the target skill with the note carried through; mark the inbox note `routed → {skill} {date}`.
5. **Output report** — routed counts + parked (ambiguous/needs-user) + the skills invoked.

## L1 plan preview (triage)

> Triage **{N} inbox notes**:
> - "{note}" → `/{skill} {args}` (because {reason})
> - …
> Parked (need your call): {list | none}.
> On approval I route each (the target skill runs with the note carried through) and mark the inbox notes routed.
> Apply? (Y / edit)

## Output report (triage)

```
✅ Triaged: {N} notes → routed {R}, parked {P}
   {per note: → /{skill} (done) | parked (reason)}
   Inbox notes marked routed; prune with /inbox --prune (future) or delete when stale.
```

## Gotchas

- **Capture speed is the point** — if `/inbox` asks 3 questions, the user writes the note in a sticky instead; keep it to a one-line write.
- **Don't auto-route aggressively** — a note routed to the wrong skill pollutes that doc; when unsure, park it and ask.
- **Inbox is not storage** — it's a parking lot; triage it regularly or it becomes a graveyard. The report nudges triage when the pile grows.
- **Excluded from the log by design** — a captured half-thought isn't a business event; don't work around the exclusion.

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
- @../../templates/doc-inbox.md
- @../../scripts/doc-validate.ts (validate capture — triage step)
