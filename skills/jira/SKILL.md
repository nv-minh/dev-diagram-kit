---
name: jira
description: Use when you need to push/sync user stories to Jira issues (and pull status back), writing keys into the story-index jira-key column and sync-state mappings.jira. Trigger with `/jira <feature> [--push|--pull] [--dry-run]`. External-write hard HITL (preview + Y per issue); refuses stale stories. Differs from /confluence (pages; this is issues) and /sync-confluence (a code diff→existing page; this is stories→backlog issues).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--push|--pull] [--dry-run]"
---

# /jira — Push/sync user stories to Jira

## Goal

Sync the feature's user stories ↔ Jira issues bidirectionally: push stories as issues (one `US-` → one issue), write the returned key into `{feature}-story-index.md`'s `jira-key` column, and pull issue status back into the index. Mapping state in `.claude/state/atlassian/sync-state.yaml` `mappings.jira`.

## Constraints

- **External-write — hard HITL** (`atlassian-sync.md` §1): preview every issue + target project, explicit **Y** per write. `--dry-run` runs to the diff, writes nothing.
- **Jira MCP must be authenticated** — not connected → STOP with connect instructions; never fabricate keys.
- **Group B** (`feature-bootstrap.md`): needs `userstories/us-*.md` + the story index; missing → refuse + route `/userstory`.
- **One issue per story** (`atlassian-sync.md` Jira-specific); the story-index `jira-key` column is the canonical pointer.
- **Refuse `status: stale` stories** (`approval-gate.md` named hard gate) — route to `/userstory` to refresh first; a stale story pushed propagates outdated scope.
- **Watermark by story hash** — re-push only changed stories (no full-backlog re-push every run).
- **Bidirectional status map** — Jira statuses → our lifecycle (`draft`/`in-review`/`approved`/`shipped`); ambiguous mappings → ask, never guess.
- **No local doc output** — only the story-index `jira-key`/`status` columns + sync-state are edited.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run updates existing issues (keys stable).

## Inputs

```
/jira <feature> --push              # push changed stories (default)
/jira <feature> --pull              # pull issue status into the index
/jira <feature> --push --dry-run    # preview, write nothing
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Story indexes (required): !`ls docs/*/userstories/*-story-index.md 2>/dev/null | head -10`
Sync state: !`ls .claude/state/atlassian/sync-state.yaml 2>/dev/null || echo "none — will create"`

## Approach

1. **Gate.** No stories → refuse + route `/userstory`. Verify Jira MCP auth; probe project access.
2. **Diff vs watermark** — read sync-state `mappings.jira`; compute changed stories (hash ≠ stored `source_hash`). Stale-status stories → BLOCKING, route to `/userstory`.
3. **Push preview** — per changed story: the issue title/summary/desc (from the story), the target project, the expected key (new vs update). `--pull` instead → the issues whose status changed.
4. **L1 hard-gate preview** — list every issue write + "this writes to Jira"; get explicit **Y** (or stop at `--dry-run`).
5. **On Y → MCP writes** — create/update each issue; collect returned keys.
6. **Edit the story index** — write keys into `jira-key` (push) or status from the pull map (pull); tick `updated`.
7. **Update sync-state** — `mappings.jira` per story (key/url/last_synced/source_hash).
8. **Activity log** — `CLAUDE_SKILL_NAME=/jira` + note + author before the index Edit.
9. **Output report** — pushed/pulled counts + any stale-refused + coverage (`jira-key` filled / total).

## L1 plan preview (hard gate)

> This **writes to Jira** (project `{project}`). Review before approving.
> Push: **{N} stories** → {new} new issues, {upd} updates. Stale (refused): {list | none}.
> {per story: `US-NNN` → issue, title}.
> On Y, I create/update issues and write keys into `{feature}-story-index.md` (jira-key column).
> Apply? (Y / edit / cancel)

## Output report

```
✅ Jira sync done: {N} issues ({new} new, {upd} updated) in {project}
   Story index jira-key column filled: {filled}/{total} | Stale refused: {list | none}
   Sync state updated: .claude/state/atlassian/sync-state.yaml

Pull status next time: /jira {feature} --pull.
```

## Gotchas

- **Never invent a key** — a write that returns nothing leaves the cell empty + reported, not faked.
- **Stale = hard stop** — it's the named gate for a reason; pushing a story whose FRs changed silently corrupts the backlog.
- **Status map ambiguity** — Jira's "In Progress" could be our `draft` or `in-review`; ask once, record the mapping, don't guess per run.
- **One issue per story** — don't bundle stories into an epic issue; the `jira-key` column is 1:1 (epics are a Jira-side grouping, not a story-side one).

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/atlassian-sync.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
