---
name: userguide
description: Use when you need an end-user manual — a double-clickable entry .html plus a same-name bundle folder (index/data/pages/images), light-mode only, scoped to the whole product or one feature. Trigger with `/userguide [--feature <slug>] [--lang en|vi]`. Phased (outline HARD STOP). Differs from /export (stakeholder snapshot; this is the manual users read) and /wireframe-html (screens; this is task guidance).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>] [--lang en|vi]"
---

# /userguide — End-user manual

## Goal

Produce an end-user manual: one externally-exposed entry `docs/userguide/{feature}-userguide.html` (or `userguide.html` for the whole product) + a same-name bundle folder (`index.md` metadata, `data.js` content, `pages/*.md` zero-frontmatter, `images/`). Light mode only. The entry is the only file the user opens.

## Constraints

- **Group C** (`feature-bootstrap.md`): project-level or feature-scoped; an empty vault → friendly placeholder ("nothing to document yet").
- **Phased, scan-project shape** — Phase 1: scan the vault (docs/wireframes) → outline the manual (sections + page list) → HARD STOP (confirm the outline). Phase 2: generate the bundle.
- **Light mode ONLY** (`naming-conventions.md` line 82) — docs-style black/white + blue highlight; NO dark mode. End-users read printed/light screens.
- **Compact structure (entry + bundle)** — only `*.html` visible at top level; everything else in the bundle folder of the same name. Don't use bare `preview.html`/`index.md` at top level.
- **Pages are zero-frontmatter** (`naming-conventions.md`) — content only; metadata in the bundle's `index.md`.
- **Self-contained entry** — no CDN; inline CSS + the `data.js` content; double-click to run.
- **Source = the vault** — task guidance from the SRS/use cases/wireframes; screenshots from `images/` if provided. No fabricated steps.
- **Resolve-oqs Phase E** — the userguide is a downstream doc; inherit unresolved OQs from the chain (`resolve-oqs.md` globs `skills/userguide/**`).
- **Bilingual (mirror input — @../../rules/language.md)**; `--lang` forces one.
- **Template** — `@../../templates/doc-userguide-index.md` (the bundle index); the HTML entry is generated.
- **Validate before done** — doc-validate on the bundle index (step 8).

## Inputs

```
/userguide                          # whole product
/userguide --feature atlas-re       # one feature
/userguide --lang vi                # force language
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`
Existing userguides: !`ls docs/userguide/*.html 2>/dev/null | head -5`

## Approach

1. **Scope + scan** — whole product or `--feature`. Read the docs (SRS/use cases), wireframes (screen purposes → manual sections), URD personas (audience → altitude).
2. **Outline (Phase 1)** — the manual's sections + the page list per section + which screens/screenshots each needs. **HARD STOP** — confirm before generating.
3. **Generate (Phase 2)** — per confirmed page: task-oriented prose (how to do X, not how the system works), zero-frontmatter, image refs. Build `data.js` (content embedded) + the entry `.html` (light, self-contained, sidebar TOC).
4. **L1 plan preview** (post-outline) — section/page count + audience altitude + screenshot gaps.
5. **Write** the entry + bundle. **Activity log** — `CLAUDE_SKILL_NAME=/userguide` + note + author.
6. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/userguide/{name}/index.md`. Exit 1 → fix, ≤2 attempts.
7. **Output report** — entry path + page count + screenshot gaps.

## L1 plan preview (post-outline)

> I'll generate the user guide for **{scope}** to `docs/userguide/{name}.html` + `{name}/`: **{S} sections**, **{P} pages**, audience **{persona/altitude}**.
> Screenshot gaps: {list | none}. Light mode, self-contained entry.
> Apply? (Y / edit)

## Output report

```
✅ User guide written: docs/userguide/{name}.html (entry) + {name}/ ({P} pages)
   Sections: {S} | Light mode | Self-contained | doc-validate: OK

Screenshot gaps (pages marked TBD): {list | none}.
```

## Gotchas

- **Task-oriented, not system-oriented** — "How to approve a claim", not "The approval service records a transition". End-users care about their job, not the architecture.
- **Light mode is non-negotiable** — a dark manual printed on paper or read on a bright desk is hostile; don't "improve" it with dark mode.
- **The entry is the contract** — `docs/userguide/` top level shows only `*.html`; the bundle keeps it tidy (and Obsidian/IDE quick-switcher sane).
- **Don't skip the outline HARD STOP** — generating 20 pages from a guessed outline wastes a full run; confirm the shape first.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-userguide-index.md
- @../../scripts/doc-validate.ts (validate the bundle index — step 6)
