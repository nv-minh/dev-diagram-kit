---
paths:
  - "docs/**/*.md"
  - ".claude/hooks/**"
---

# Activity Log Convention

> The change history of the ENTIRE vault lives in **a single file**: `docs/_shared/activity.log` (append-only). Docs do NOT carry `changelog:` in frontmatter. No more routing table, no more prefix, no more echoing one event into multiple files.

## Why one centralized log

The old architecture (YAML changelog per review-unit + routing child file → parent file) produced: 49 files carrying a changelog, one CR-apply event copied into 11 files, a routing table existing in 3 copies (rule + hook + SKILL.md) that drifted apart, a hook that had to rewrite YAML + dedupe on every Write. The centralized log eliminates all 4 problems: **the path of the edited file IS the routing information** — no table needed anymore.

## Format

```
{date} | {skill} | {@author} | {file-path} | {note}
```

- 1 line = 1 event. Append at end of file (newest at the bottom, like `staleness.log`).
- **date**: ISO `YYYY-MM-DD`.
- **skill**: `/urd`, `/sequence`, `/cr`, `/jira`, ... or `manual` (manual edit outside a skill).
- **@author**: @handle of the runner — resolved from memory `user-identity` key `current_user` (see `ba-conventions.md` Section 1). Hook fallback: env `CLAUDE_CHANGELOG_AUTHOR` → `git config user.name`.
- **file-path**: project-relative path of the just Written/Edited file (e.g. `docs/payment/srs/payment-spec.md`).
- **note**: what changed — imperative/past-tense, factual, ≤80 chars, Vietnamese or English.

**Example:**

```
2026-07-12 | /srs | @edward | docs/payment/srs/payment-spec.md | initial spec 12 FR + 9 error
2026-07-12 | /erd | @edward | docs/payment/srs/payment-erd.md | 5 entities, 4 relationships
2026-07-13 | /cr | @edward | docs/payment/srs/payment-spec.md | applied CR-20260713-001: FR-payment-013 added
2026-07-13 | /jira | @edward | docs/payment/userstories/payment-story-index.md | pushed 7 US → KAN-127..133
```

## Write mechanism — the hook is the sole writer

Skills do NOT write to activity.log themselves. Before each Write/Edit, the skill sets env vars (as before):

- `CLAUDE_SKILL_NAME` — name of the running skill
- `CLAUDE_CHANGELOG_NOTE` — note for the event
- `CLAUDE_CHANGELOG_AUTHOR` — @handle (usually the skill resolves it once at the start of the session)

The `auto-changelog.sh` hook (PostToolUse Write|Edit) reads the env + the just-edited path → appends 1 line. Missing env → fallback `manual | {git user.name} | manual edit`. A single writer = no race when /srs runs sub-agents in parallel (append-only O_APPEND is safe).

## Dedupe

Skip if an **identical** line (same date + skill + path + note) already exists — avoids double-fire when a skill Writes the same file twice with the same note. Different note → recorded normally (multiple events per day/file is valid).

## Files excluded

Hook skips (does not log):
- `docs/_shared/*` (including activity.log itself — avoids recursion)
- `docs/exports/*` (regenerated)
- `docs/inbox/*` (raw capture)
- `docs/feature-list.md`, `docs/README.md` (auto-gen)

## Reading history

- History of one feature: `grep " docs/payment/" docs/_shared/activity.log`
- History of one file: `grep " docs/payment/srs/payment-spec.md " docs/_shared/activity.log`
- Stakeholder-facing: `/export` renders a "Change history" section from the log (filtered by feature) when needed — do NOT stuff history into the doc.
- `/dashboard`, KG engine ingest the log as an event stream (same way they read `staleness.log`).

## Note style

- Good: `added refund webhook sequence`, `AC for invalid password updated`, `applied CR-20260512-001: added OTP requirement`.
- Bad: `updated stuff`, `fixed things`, `per Hoang's request` (the person is already in the @author field).

## Backward-compat

Old demo docs still carrying `changelog:` frontmatter → **keep as-is, do not migrate** (demo docs will be dropped on rebuild). A parser/reader that encounters a `changelog:` field in frontmatter treats it as legacy and ignores it. Do not create new frontmatter entries under any circumstances.
