---
name: doc-review
description: Use when you need a multi-agent quality review of BA documents — spawn reviewer agents, aggregate findings (BLOCKING/WARNING/SUGGESTION), apply accepted fixes as L2 diffs, and drive doc status transitions. Trigger with `/doc-review <doc-path|feature> [--agents <list>]`. Renamed from the declared /review slot (ecosystem collision with the user-level review skill). Differs from /gap (coverage; this is quality) and /cr (a change; this is an audit).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "<doc-path|feature> [--agents <list>]"
---

# /doc-review — Multi-agent document quality review

## Goal

Run a multi-agent quality review over a document (or a feature's doc set): spawn reviewer agents (`@doc-reviewer`, plus `@senior-ba`/`@qa-reviewer` when wired), aggregate findings per `review-format.md`, present them, apply the accepted fixes as L2 diffs, and drive the doc's status transition (`in-review → revisions` or `→ approved`).

## Constraints

- **Group C** (`feature-bootstrap.md`): read-mostly; empty vault → friendly abort.
- **Orchestrator writes only** (`review-format.md`) — agents return findings, NEVER edit; this skill applies the accepted fixes under L2 gates.
- **Renamed from `/review`** — the declared slot collided with the user-level `review` (gstack pre-landing PR review) skill; this is the BA-document quality audit.
- **Aggregate + dedupe** (`review-format.md`) — the same finding from N agents counts once (keep the most detailed).
- **Status transitions** — `approve` (0 BLOCKING + 0 unacked WARNING) → status `approved`; `revise` (≥1 WARNING) → `revisions`; `block` (≥1 BLOCKING) → `revisions` + must fix.
- **Criteria sourced from the agents** — `@doc-reviewer` (coverage/fabrication/altitude/cleanliness); `@senior-ba` (business soundness, when wired); `@qa-reviewer` (testability of FRs/ACs, when wired). Port BMAD `po-master-checklist` style criteria into the agent prompts.
- **No fabrication in fixes** — an accepted fix uses the doc's sources; a fix that invents content is rejected.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Template** — none (findings per `review-format.md`; the review output is structured prose, not a templated doc).

## Inputs

```
/doc-review docs/atlas-re/srs/atlas-re-spec.md       # one doc
/doc-review atlas-re                                  # the feature's doc set
/doc-review atlas-re --agents doc-reviewer,qa-reviewer
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`

## Approach

1. **Resolve the target** — one doc or a feature set. Empty → friendly abort.
2. **Spawn reviewers** — `@doc-reviewer` (always) + the optional agents; each gets the doc(s) + the fact-list/sources. Agents return findings (BLOCKING/WARNING/SUGGESTION + location + suggested fix).
3. **Aggregate + dedupe** — merge findings per `review-format.md`; compute the verdict.
4. **Present findings** — grouped by severity, each with location + suggested fix; the user accepts/rejects each (or accepts-all-WARNING, holds-BLOCKING).
5. **Apply accepted fixes** — per accepted finding, an L2 diff to the target doc; set the activity log env before each Edit.
6. **Drive status** — set the doc's `status:` per the verdict (`approved`/`revisions`); tick `status_changed`.
7. **Activity log** — `CLAUDE_SKILL_NAME=/doc-review` + note + author.
8. **Output report** — verdict + counts applied/rejected + the status transition + next.

## L1 plan preview

> Reviewing **{target}** with {agents}. Findings: **{B} BLOCKING · {W} WARNING · {S} SUGGESTION** → verdict **{approve/revise/block}**.
> {worst BLOCKING: list}. I'll apply the fixes you accept as L2 diffs and set status → {new status}.
> Apply (the accepted fixes)? (Y / edit / per-finding)

## Output report

```
✅ Review complete: {target} → verdict {approve/revise/block}
   Findings: {B}/{W}/{S} | Applied: {a} | Rejected/held: {r} | Status: {old} → {new}
   {If block: fix the {B} BLOCKING items, then /doc-review again.}
   Coverage gap (not quality)? /gap.
```

## Gotchas

- **Agents never edit** — the orchestrator applies fixes; an agent that writes bypasses the L2 gate and the dedupe. (Per `review-format.md`.)
- **Quality ≠ coverage** — this skill catches unsound/fabricated/wrong-altitude content; "FR-007 has no story" is `/gap`'s job. Route coverage findings there.
- **Dedupe or drown** — three agents flagging the same vague FR is one finding, not three; merge to the most actionable version.
- **The rename is load-bearing** — `/review` would shadow the user's pre-landing PR review skill for exactly the devs this kit serves; `/doc-review` avoids it.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/review-format.md
- @../../rules/status-lifecycle.md
- @../../rules/language.md
- @../../agents/doc-reviewer.md (the always-on reviewer)
