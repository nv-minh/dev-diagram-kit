---
name: export
description: Use when you need a stakeholder package — the feature's docs bundled as md/html/pdf/docx with a change-history section rendered from the activity log. Trigger with `/export [--scope all|<feature>] [--format md|html|pdf|docx]`. Needs ≥1 doc. Differs from /userguide (end-user manual; this is a stakeholder snapshot) and /gallery (a diagram deck; this is the documents).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--scope all|<feature>] [--format md|html|pdf|docx]"
---

# /export — Stakeholder package

## Goal

Bundle a feature's (or the whole vault's) BA documents into one stakeholder-facing package — md/html/pdf/docx — with a "Change history" section rendered from `docs/_shared/activity.log` (filtered by scope, per `changelog.md`). **Single output**: `docs/exports/{date}-{scope}{-feature}-package.{ext}` (type `export-package`).

## Constraints

- **Group B** (`feature-bootstrap.md`): needs ≥1 feature doc; empty vault → friendly abort.
- **Excluded from the activity log** (`changelog.md`) — exports are regenerated artifacts; the hook skips `docs/exports/`.
- **Change history from the log** — render the package's "Change history" by grepping `activity.log` for the scope's paths; do NOT stuff history into the source docs.
- **Formats** — md (always); html (single self-contained file); pdf/docx need `pandoc` (doctor checks it; missing → degrade to md+html, report).
- **Scope** — `--scope all` (every feature, project-level docs last) or `--scope <feature>` (that feature's set).
- **Bilingual (mirror input — @../../rules/language.md)**; the package follows the docs' language.
- **Idempotent** — re-run regenerates (a new dated package); old packages stay (they're snapshots).
- **Template** — `@../../templates/doc-export.md` (the change-history section shape).
- **Validate before done** — doc-validate on the package (step 7, md format only).

## Inputs

```
/export --scope atlas-re --format pdf       # one feature, PDF
/export --scope all --format html           # whole vault, HTML
/export                                     # default: scope all, format md
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`
Existing exports: !`ls docs/exports/* 2>/dev/null | tail -5`

## Approach

1. **Gate.** Empty vault → friendly abort. Resolve scope (feature set or all) + format.
2. **Collect the docs** — the scope's docs in reading order (URD → BRD → PRD → SRS → use cases → stories → tests).
3. **Render change history** — grep `activity.log` for the scope's paths; format per `changelog.md` (date · skill · @author · path · note).
4. **Assemble** — the docs concatenated (md) or converted (html/pdf/docx via pandoc) + the change-history section + a cover/TOC.
5. **L1 plan preview** — doc count + format + change-history entry count.
6. **Write** the package. **Activity log** — NOT set for the export itself (excluded), but the env is set if any source doc is touched (it isn't — read-only over sources).
7. **Validate (md only)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/exports/{file}.md`. Exit 1 → fix, ≤2 attempts.
8. **Output report** — the package path + format + degraded (if pandoc missing) + next.

## L1 plan preview

> I'll export **{scope}** to `docs/exports/{date}-{scope}-package.{ext}`: **{N} docs** ({list}), format **{format}**.
> Change history: {H} entries from activity.log. {Degraded to md+html — pandoc missing | pandoc OK}.
> Apply? (Y / edit)

## Output report

```
✅ Package written: docs/exports/{date}-{scope}-package.{ext}
   Docs: {N} | Format: {format} | Change-history entries: {H}
   {Degraded: pdf/docx unavailable (pandoc missing) → md+html produced.}
```

## Gotchas

- **Exports are snapshots** — they go stale; the source docs are the truth. Don't edit an export to "fix" content — fix the source, re-export.
- **Change history is derived, not stored** — it comes from the activity log each run; never hand-edit it into a doc.
- **PDF/DOCX need pandoc** — degrade gracefully (md+html) and say so; a silent pdf-missing is confusing.
- **Scope order matters** — stakeholders read top-down (why → what → system → tests); don't dump files alphabetically.

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
- @../../templates/doc-export.md
- @../../scripts/doc-validate.ts (validate md package — step 7)
