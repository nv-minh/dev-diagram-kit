---
name: confluence
description: Use when you need to publish kit-generated BA docs as a Confluence page tree (new/owned pages with mapping state), not update an existing page from code. Trigger with `/confluence <feature|doc-path> [confluence:<space-url>]`. External-write hard HITL; reuses the sync-confluence mechanics (cloudId/markdown-read/html-write/hash drift). Differs from /sync-confluence (code diff→existing page in-place; this is vault docs→new/owned pages).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature|doc-path> [confluence:<space-url>]"
---

# /confluence — Publish vault docs to Confluence

## Goal

Publish kit-generated BA documents (a feature's URD/BRD/PRD/SRS/use cases/stories, or one doc) as a Confluence page tree under a space, with mapping state in `sync-state.yaml` `mappings.confluence` so future runs detect drift. For pushing your BA docs out; for keeping an existing page current with a code diff, use `/sync-confluence`.

## Constraints

- **External-write — hard HITL** (`atlassian-sync.md` §1): preview the page tree + target space, explicit **Y** per page.
- **Confluence MCP must be authenticated** — not connected → STOP with connect instructions.
- **Group B** (`feature-bootstrap.md`): needs ≥1 feature doc (usually `srs/{feature}-spec.md`); missing → refuse + route `/srs`.
- **Reuses `/sync-confluence` mechanics** — resolve cloudId dynamically, read markdown / write html keeping macros, edit-in-place for updates, hash-watermark drift detection (`atlassian-sync.md`).
- **Drift detection** — before updating a page, compare its current hash to the stored one; changed outside the kit → warn + review before overwrite.
- **One mapping per page** in `sync-state.yaml` `mappings.confluence`.
- **No local doc output** — only sync-state is edited (the docs already exist in the vault).
- **Disambiguation** — description + Constraints must state: "for pushing docs; for syncing a page to code changes use `/sync-confluence`".
- **Bilingual (mirror input — @../../rules/language.md)**; prefer the page's existing language on update.

## Inputs

```
/confluence <feature>                          # publish the feature's doc set
/confluence docs/atlas-re/srs/atlas-re-spec.md # one doc
/confluence <feature> confluence:<space-url>   # explicit target space
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features with docs: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`
Sync state: !`ls .claude/state/atlassian/sync-state.yaml 2>/dev/null || echo "none — will create"`

## Approach

1. **Gate.** Resolve the doc set (a feature's docs, or the one path). No docs → refuse + route `/srs`. Verify Confluence MCP auth.
2. **Resolve the target space** — from the `confluence:<url>` arg, or memory, or ask once.
3. **Page-tree plan** — one page per doc (or a parent + children by doc type); title from the doc heading; note new vs update (drift check on updates).
4. **L1 hard-gate preview** — the page tree + "this writes to Confluence"; explicit **Y** per page (or batched Y with per-page diffs shown).
5. **On Y → MCP writes** — markdown read (source) → html write (page), keeping macros on update; collect page ids/urls.
6. **Update sync-state** — `mappings.confluence` per page (url/title/version/content_hash/last_synced).
7. **Activity log** — `CLAUDE_SKILL_NAME=/confluence` + note + author.
8. **Output report** — pages published + drift warnings + the space link.

## L1 plan preview (hard gate)

> This **writes to Confluence** (space `{space}`). Review before approving.
> Pages: **{N}** ({new} new, {upd} updates). Drift on updates: {list | none}.
> {per page: doc → page title}.
> On Y, I publish and record mappings in sync-state.yaml.
> Apply? (Y / edit / cancel)

## Output report

```
✅ Confluence publish done: {N} pages in {space} → {space url}
   New: {new} | Updated: {upd} | Drift warned: {list | none}
   Sync state updated.

Keeping a page current with code changes? /sync-confluence (in-place, from a diff).
```

## Gotchas

- **Drift is a warning, not a block** — a page changed outside the kit may be a legitimate human edit; surface it, let the user decide, don't silently overwrite.
- **Don't replace whole pages** — edit-in-place the changed sections; a full-page replace destroys macros/tables/status the team added.
- **`/confluence` vs `/sync-confluence`** — pushing docs out = this; a known page ← code diff = `/sync-confluence`. The disambiguation is mandatory in both descriptions.
- **Version the versionMessage** — record the sync source so the Confluence history is readable.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/atlassian-sync.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../sync-confluence/SKILL.md (the in-place code-diff variant; reuse its mechanics)
