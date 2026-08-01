---
name: prototype-html
description: Use when you need a clickable multi-screen demo — one self-contained {feature}-prototype.html where the screen-to-screen navigation actually works (anchors to id="s{n}"). Trigger with `/prototype-html <feature>`. Needs the wireframes (ASCII screens or HTML wireframes). Differs from `/wireframe-html` (static, navigation only via the entry TOC) and `/gallery` (a diagram deck, not screens).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /prototype-html — Clickable multi-screen prototype

## Goal

Produce ONE self-contained, clickable HTML prototype — `docs/{feature}/html-design/{feature}-prototype.html` — where every navigable control moves the user to its target screen (`#{slug}` anchors), covering all flows. Referenced back from `{feature}-wireframe-index.md` column `HTML prototype` as `{feature}-prototype.html#{slug}`.

## Constraints

- **Group B** (`feature-bootstrap.md`): needs ASCII screens in `ascii-wireframe/{flow-slug}.md` (preferred) OR HTML wireframes — missing both → refuse + route to `/user-flow` + `/wireframe-ascii`.
- **No L3** — HTML; review from the file (L1/L2).
- **Navigation must actually work** — the defining feature: a button whose Description said "Nav → [4]" must jump to `#s4`. Broken/dead links are BLOCKING.
- **Self-contained** — inline CSS + the minimal JS for screen switching (anchor + optional show/hide); no CDN, no build step, double-click to run.
- **One screen = one state** (`ba-conventions.md` §8) — error/empty/loading states are their own screens or clearly toggled views, not a busy combo.
- **Device frame** — inherit from `userflow.md`'s `primary_device` (no re-ask — it's settled); the prototype renders at that width.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run → L2 diff (regenerate from current wireframes).
- **Template** — `@./resources/prototype.html`.
- **Index update** — set the `HTML prototype` column in `{feature}-wireframe-index.md`.

## Inputs

```
/prototype-html <feature>          # all flows → one clickable file
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Wireframe sources: !`ls docs/*/ascii-wireframe/*.md 2>/dev/null | grep -v index; ls docs/*/html-wireframe/*.html 2>/dev/null | grep -v "wireframe.html$" | head`
Userflows: !`ls docs/*/srs/*-userflow.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No ASCII screens AND no HTML wireframes → refuse + route `/user-flow` + `/wireframe-ascii`. Read the wireframes (content) + `userflow.md` (the navigation edges — what links to what).
2. **Build the nav map** — every control with a `Nav →` in its Description becomes a working link to `#s{n}`; every error-path edge too.
3. **Draft `{feature}-prototype.html`** — all screens as sections (`id="s{n}"`), inline CSS, the minimal JS to switch screens on click; device-width frame; B&W neutral (this is interaction, not visual design).
4. **L1 plan preview** — flow/screen count + nav edges wired + any dead-end found (must be resolved or explicitly an exit).
5. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/prototype-html` + note + author before Write.
6. **Index update** — `{feature}-wireframe-index.md` column `HTML prototype` → `{feature}-prototype.html#{slug}` per screen.
7. **Output report** — open path + nav coverage + dead-ends (none expected).

## L1 plan preview

> I'll build the clickable prototype for **{feature}** to `html-design/{feature}-prototype.html`: **{N} screens** across **{F} flows, **{E} navigation edges** wired (every `Nav →` and error edge).
> Dead-ends found: {list | none}. Device: {primary_device}.
> Logged: activity log "prototype {N} screens, {E} nav edges".
> Apply? (Y / edit)

## Output report

```
✅ Prototype written: html-design/{feature}-prototype.html ({N} screens, {E} nav edges)
   Open it (double-click) and click through every flow.
   Wireframe index `HTML prototype` column updated. Dead-ends: {none|list}.

Push screens to Figma next? /figma {feature}.
```

## Gotchas

- **A prototype with broken links is worse than no prototype** — it looks done but misleads; verify every edge before reporting done.
- **Don't add visual polish here** — colors, real typography, images belong to the real frontend or `/figma`; the prototype proves *flow*, not *look*.
- **State screens count** — if the spec has an error state for a form, it's a screen in the prototype, not a hidden assumption.
- **Reuse wireframe content** — drifting from the ASCII/HTML wireframes here means three sources of truth; re-sync instead.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @./resources/prototype.html (self-contained shell)
