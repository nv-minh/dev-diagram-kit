---
name: sync-confluence
description: Use when code changed (or a decision was made in this conversation) and a Confluence doc must be brought back in sync — analyze the diff/discussion and update the linked Confluence page IN-PLACE (targeted section edits), always with a preview + confirm before writing. Use when code has just changed OR a decision was just settled in the conversation, and the Confluence page (link provided by the user) must be updated to match the latest logic. Trigger with `/sync-confluence confluence:<url> [--from <git-range>] [--preview] [--lang en|vi]`.
user-invocable: true
argument-hint: "confluence:<url> [--from <git-range>] [--preview]"
---

# /sync-confluence — Sync code/conversation → Confluence (in-place edits)

> Keep Confluence docs **matching the latest code logic**. Take a **code** change (git diff) OR a **conversation** (a decision/spec just discussed) → edit the **right section** of the Confluence page, **always preview + confirm before writing**. A skill for the **dev-as-BA**. Reuses the mechanism of `sync-jira-confluence` + the safety gate of `prd-builder`.

## Prerequisite

Atlassian MCP authenticated: `/mcp` → select Atlassian (Rovo). Needs **read + write** permission on the target page. No MCP → the skill stops, prints auth guidance.

## Goal

1. Identify **what changed** (code range or conversation) and **which part of the doc is out of sync**.
2. Compose an **in-place** update: edit only the relevant section, **keep** the rest + Confluence macros/tables intact.
3. **Preview the diff + ask for confirmation** (mandatory — writing to Confluence is an external, irreversible side-effect).
4. Write via `updateConfluencePage` (+ an audit footer comment) and update `sync-state.yaml`.

## Constraints

- **NEVER write without a Y** at the preview step. No auto-approve flag. (see `approval-gate.md` + `atlassian-sync.md`.)
- **Edit in-place, keep everything outside the section** — do NOT replace the whole page, do NOT delete unrelated macros/tables/content.
- **Resolve cloudId dynamically** via `getAccessibleAtlassianResources` — do **NOT hardcode** site/cloudId/space.
- **Content format:** read `markdown` for analysis + `html` to keep structure; write with `html` (preserves macros). Always set `versionMessage`.
- **Do not fabricate:** only update what can be drawn from real code/conversation. Do not infer logic without a source.
- **Bilingual (mirror input — @../../rules/language.md)** for new content; keep the page's existing language if the page is already in one language (consistency).
- **Conflict-safe:** compare the page hash against `sync-state.yaml` — page changed since the last sync → warn before overwriting.
- **Read-only on the code/vault side** — this skill does NOT edit code; it only reads the diff/conversation.

## Inputs

```
/sync-confluence confluence:<url>                      # auto-detect mode from context
/sync-confluence confluence:<url> --from HEAD~5..HEAD   # code mode: by git range
/sync-confluence confluence:<url> --from <commit>       # from commit to HEAD
/sync-confluence confluence:<url> --preview             # dry-run: print diff only, do NOT write
```

- `confluence:<url>` (required) — page link; parse `pageId` from `/pages/(\d+)/`.
- **Code-changes mode** (has `--from`, or the context is "just edited code"): analyze `git diff <range>` / recent commits.
- **Conversation mode** (no `--from`, context is a discussion): analyze the decision/spec in the current conversation.
- `--preview`: preview only, no write (safe for a look first).

## Context (dynamic)

Has git: !`git rev-parse --is-inside-work-tree 2>/dev/null && echo "✅" || echo "(not a git repo — conversation mode only)"`
Recent commits: !`git log --oneline -5 2>/dev/null || echo "(n/a)"`
Sync-state: !`test -f .claude/state/atlassian/sync-state.yaml && echo "✅ found .claude/state/atlassian/sync-state.yaml" || echo "(not present — created on first sync)"`

## Flow runtime

```
User calls /sync-confluence confluence:<url> [--from <range>] [--preview]
   │  Atlassian MCP not authenticated? → stop, guide /mcp.
   ▼
1. Parse pageId from the url. Resolve cloudId via getAccessibleAtlassianResources (pick the site matching the url host).
   ▼
2. Fetch the page: getConfluencePage(pageId, markdown) [analysis] + getConfluencePage(pageId, html) [keep structure].
   │  page not found / no access → report clearly, stop.
   ▼
3. Collect "what changed":
   • Code mode: git diff <range> (default since the last sync watermark in sync-state, or HEAD~1..HEAD)
     → extract DOC-relevant changes (API/endpoint change, field/schema, flow, business rule, config).
   • Conversation mode: extract the decision/spec settled in the conversation.
   ▼
4. Map "what changed" ↔ **page section** (by heading): which section to edit, what to edit.
   │  No matching section found → propose ADDING a new section (ask the user for the position), do NOT shove it in arbitrarily.
   ▼
5. Compose the in-place update: change only the relevant section's content (HTML), keep the rest + macros intact.
   ▼
6. Conflict check: hash the current html vs sync-state → different from last time? warn "the page changed outside the kit".
   ▼
7. ★ PREVIEW + GATE (mandatory): print a readable diff per section (before → after) + source (commit/conversation).
   AskUserQuestion "Apply changes to Confluence?" — Y / edit / cancel. --preview → STOP here (no write).
   ▼  (user Y)
8. updateConfluencePage(pageId, contentFormat:html, body:<edited>, versionMessage:"sync from {code <range>|conversation} — {date}").
   ▼
9. (optional) createConfluenceFooterComment "🔄 Synced by dev-diagram-kit from {source} at {ISO}".
   Update .claude/state/atlassian/sync-state.yaml (pageId, new hash, commit watermark, updated).
   ▼
10. Report: sections changed, new version, page link, spots needing manual review.
```

## How to build (detail)

### Parse + resolve
- `pageId`: regex `/pages/(\d+)/` on the url.
- `cloudId`: `getAccessibleAtlassianResources` → pick the resource whose `url` matches the link's host (do NOT hardcode). Multiple sites → ask the user to choose.

### Identify changes (code mode)
```bash
git diff <range> --stat        # overview of changed files
git diff <range> -- <path>     # detail of the relevant area
```
Filter for changes that **affect the doc**: API/route signature, field name/type, enum/status, business rule, default config, flow step. Skip pure refactor/format/tests with no behavior change.

### Map ↔ section + compose in-place HTML
- Get the page heading list (from html/markdown) → pick the section matching the change topic (e.g. "API", "Data model", "Business rules", "Flow").
- Edit **only** the content in that section; keep `<ac:structured-macro>` / tables / panels intact.
- Section missing → compose a new section + ask where to insert it.

### Preview (template)
> **Page:** {title} (v{N} → v{N+1}) · Source: {git range | conversation}
>
> **Section "{heading}"** will change:
> - {summary before → after, business-language}
> {repeat for each section}
>
> ⚠️ {conflict warning if any}
>
> Apply changes? (Y / edit description / cancel)

## Output report

```
✅ Synced Confluence: {title}  (v{N+1})
   Sections changed: {list}
   Source: {git <range> N commits | conversation}
   Link: {url}
⚠️ Needs manual review: {if any}
(sync-state updated: hash + watermark {commit})
```

## Gotchas

- **MCP not authenticated / lacks permission** → stop, guide `/mcp`; do NOT attempt to write.
- **Always preview + Y before writing** — Confluence has no convenient undo; a mistake means manual fixing/restoring a version.
- **Keep macros/tables** — Confluence storage format has `<ac:...>` macros; in-place edits must preserve them, don't strip.
- **Multiple pages** → run each link one at a time; one gate per page.
- **Conflict** (page changed outside the kit since the last sync) → warn, let the user see the differences before overwriting.
- **Don't over-sync** — only edit what the code/conversation states clearly; keep the rest of the page as-is.
- **cloudId/space NOT hardcoded** — resolve dynamically (unlike the old `sync-jira-confluence` which hardcoded macromill).
- **Diagrams embedded in the page** generated by the kit → if the logic changes, suggest running `/scan-project` or a diagram skill to regenerate, then sync the image (do not guess).

## References

- @../../rules/approval-gate.md
- @../../rules/atlassian-sync.md
- @../../rules/naming-conventions.md
- @../../rules/ba-conventions.md
- @../../rules/changelog.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
