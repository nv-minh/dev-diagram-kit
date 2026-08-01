---
name: meeting
description: Use when you need structured meeting notes — decisions, blockers, and action items as tables WITHIN the note file (no separate files). Trigger with `/meeting "<title>" [--type standup|review|kickoff]`. Project-level (docs/meetings/). Differs from /inbox (zero-friction raw capture; this is structured minutes) and /cr (a scope change record; this is a discussion capture).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "\"<title>\" [--type standup|review|kickoff]"
---

# /meeting — Meeting notes (structured)

## Goal

Capture a meeting as structured notes — attendees, agenda, discussion, and three tables WITHIN the file: **Decisions**, **Blockers**, **Action items** (with owner + deadline). **Single output**: `docs/meetings/YYYY-MM-DD-{type}-{slug}.md` (type `meeting`). Statuses `captured → processed`.

## Constraints

- **Group C** (`feature-bootstrap.md`): project-level; no feature needed.
- **Tables WITHIN the file** (`naming-conventions.md` line 77) — decisions/blockers/actions live as tables inside the note, NOT in separate files. One note = one self-contained file.
- **Two states** (`status-lifecycle.md`): `captured` (raw, just written) → `processed` (tables structured + action items have owners/deadlines). Default to `processed` when the skill runs from a transcription/notes; `captured` for a quick raw dump.
- **Action items have owner + deadline** — an action with no owner is a wish, not an action; flag it.
- **Link to docs** — a decision touching `FR-`/`CAP-`/a feature doc links it (wikilink), so `/gap`/`/dashboard` see the connection.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run on the same date+title → L2 diff (append new items).
- **Template** — `@../../templates/doc-meeting.md`.
- **Validate before done** — doc-validate (step 7).

## Inputs

```
/meeting "Sprint 14 review" --type review
/meeting "Claim approval kickoff" --type kickoff
/meeting "Standup" --type standup
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Recent meetings: !`ls docs/meetings/*.md 2>/dev/null | tail -5`

## Approach

1. **Resolve title + type + slug** — from the arg; type defaults to `review` if ambiguous.
2. **Gather** — from a transcript/notes the user pastes, or a short interview: attendees · agenda · the decisions · blockers · action items (owner + deadline each). No-re-ask.
3. **Draft** per the template — attendees, agenda, discussion summary, then the three tables; link any doc-touching decision.
4. **L1 plan preview** — decision/blocker/action counts + any ownerless action flagged.
5. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/meeting` + note + author.
6. **Flag ownerless actions** in the report (so they get an owner before the meeting's value leaks).
7. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/meetings/{file}.md`. Exit 1 → fix, ≤2 attempts.
8. **Output report** — counts + ownerless actions + next (route an action to a doc via `/cr` if it's a scope change).

## L1 plan preview

> I'll write meeting notes for "{title}" to `docs/meetings/{date}-{type}-{slug}.md` ({type}): **{D} decisions**, **{B} blockers**, **{A} action items**.
> Ownerless actions: {list | none}. Doc links: {list | none}.
> Apply? (Y / edit)

## Output report

```
✅ Meeting notes written: docs/meetings/{date}-{type}-{slug}.md
   Decisions: {D} | Blockers: {B} | Actions: {A} (ownerless: {n}) | doc-validate: OK

Ownerless actions need an owner: {list}.
A decision that changes scope? /cr "<change>" to record + apply it.
```

## Gotchas

- **Tables, not prose** — "we decided X" buried in discussion is lost; the Decisions table is the searchable record.
- **Ownerless = flagged** — an action without an owner never happens; surface it rather than silently assigning a guess.
- **Don't fork files** — one note holds everything; a "decisions.md" + "actions.md" split drifts the moment one updates.
- **Link, don't duplicate** — a decision about `FR-atlas-re-006` links the spec; it doesn't restate the FR.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/status-lifecycle.md
- @../../rules/language.md
- @../../templates/doc-meeting.md
- @../../scripts/doc-validate.ts (validate after Write — step 7)
