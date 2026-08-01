# Atlassian Sync — conventions for syncing docs to Confluence/Jira

> Shared rule for skills that write to Atlassian (`/sync-confluence`, `/confluence`, `/jira`). Goal: sync **safely, controlled, with drift detection**. Every such skill references this file in Constraints + References.

## 1. HITL principle — external writes are irreversible

- **ALWAYS preview + confirm (Y) before each write** to Confluence/Jira. NO auto-approve flag, NO "write then report".
- Writing to Atlassian is a **side-effect outside the vault** — not rollback-able with git. A mistake → the version must be restored manually. Hence the gate is stricter than the internal L1.
- `--preview`/dry-run: run up to the diff step then STOP, absolutely no writing.

## 2. Resolve cloudId dynamically (do NOT hardcode)

- Use `getAccessibleAtlassianResources` → pick the resource whose `url` matches the host of the user-provided link.
- Multiple sites match → ask the user to choose. Do NOT hardcode site/cloudId/spaceId (unlike the old skill that hardcoded `macromill.atlassian.net`).
- Parse `pageId` from the url: `/pages/(\d+)/`. `issueKey` from `/browse/([A-Z]+-\d+)`.

## 3. Content format

- **Read to analyze:** `contentFormat: "markdown"` (easier content matching).
- **Read to preserve structure + write:** `contentFormat: "html"` (keeps the `<ac:structured-macro>` macro, panels, tables, status).
- **Edit in-place:** change only the relevant section's content; keep the rest + all macros intact. Do NOT replace the whole page.
- Always set a `versionMessage` describing the sync source (e.g. `sync from code HEAD~3..HEAD — 2026-07-25`).

## 4. State: `.claude/state/atlassian/sync-state.yaml`

Stores the mapping + watermark/hash to detect drift (1 entry/artifact). Minimal:

```yaml
mappings:
  confluence:
    "<pageId>":
      url: "<page url>"
      title: "<title>"
      last_synced: "2026-07-25T10:00:00Z"
      last_version: 12                 # Confluence version after the write
      content_hash: "<sha of the html at sync time>"   # detect page changed outside the kit
      source_watermark: "<git commit sha | conversation:<date>>"
  jira:
    "<US-NNN>":                         # the story whose story-index row holds the key
      issue_key: "KAN-127"             # written back into the story-index jira-key column
      url: "<issue url>"
      last_synced: "2026-07-25T10:00:00Z"
      source_hash: "<sha of the story at sync time>"
```

- **Conflict detection:** before writing, compare the artifact's current hash with the stored value. Different → the artifact changed outside the kit since the last sync → **warn**, let the user review the differences before overwriting.
- **Watermark:** store the synced source commit/timestamp → next time only consider NEW changes (code mode: `git diff <watermark>..HEAD`).
- The file lives under `.claude/state/` (not `docs/`) — machine state, not a business doc.

### Jira-specific (`/jira`)

- **One issue per story** (`US-{NNN}` → one Jira issue); the story-index `jira-key` column is the canonical pointer (so `/gap`/`/dashboard` can see coverage).
- **Bidirectional key** — on push, write the returned `issue_key` into the story-index row; on pull, read issue status back into the index `status` column (mapped: Jira story statuses → our lifecycle `draft`/`in-review`/`approved`/`shipped`).
- **Watermark by story hash** — re-push only stories whose `us-*.md` changed since `source_hash` (no re-pushing the whole backlog every run).
- **Refuse `status: stale` stories** (`approval-gate.md` named hard-gate) — a stale story pushed to Jira propagates outdated scope; route to `/userstory` to refresh first.

## 5. Audit (optional, does not touch the body)

- Can use `createConfluenceFooterComment` to leave a mark "🔄 Synced by dev-ba-kit from {source} at {ISO}" — an audit trail that does not mutate the page content.
- Do NOT use comments to hold the main content (content goes into the body via in-place update).
- For Jira, prefer a `dev-ba-kit` label on synced issues (queryable) over a comment, unless the team convention differs.

## 6. No-fabrication + in-scope

- Only write what can be drawn from a real source (code diff / conversation). Do NOT infer logic without a source.
- Touch only the sections related to the change; leave the rest of the page intact.
- New content language follows `language.md`, but prefer keeping the page's existing language for consistency.

## One-line summary

> **Preview + Y before each write · resolve cloudId/pageId dynamically · read markdown/write html keeping macros · edit in-place · hash-watermark drift detection · no fabrication.**
