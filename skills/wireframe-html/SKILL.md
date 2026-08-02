---
name: wireframe-html
description: Use when you need B&W static HTML wireframes to review in a browser — one {flow-slug}.html per flow (device-width frames, no JS/color) plus the {feature}-wireframe.html navigation entry (sidebar TOC + flow map + iframes). Trigger with `/wireframe-html <feature> [--flow <slug>]`. Needs the user flow. Differs from `/wireframe-ascii` (chat-reviewable ASCII, lower fidelity) and `/prototype-html` (adds click-through).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--flow <slug>]"
---

# /wireframe-html — B&W static HTML wireframes

## Goal

Render each flow as a standalone B&W static HTML file (`docs/{feature}/html-wireframe/{flow-slug}.html`, device-width frames, screens wrap automatically, each screen `id="s{n}"` for deep-linking), plus the **entry point** `docs/{feature}/html-wireframe/{feature}-wireframe.html` (sidebar TOC: flow → screen, an Overview tab that is a clickable flow map, iframes loading each flow) and the metadata index `docs/{feature}/html-wireframe/{feature}-wireframe-html-index.md` (type `wireframe-html-index`).

## Constraints

- **Group B\*** (`feature-bootstrap.md`): `srs/{feature}-userflow.md` (`stage: approved`) missing → refuse + route `/user-flow`. ASCII screens present → reuse their content 1:1 (renderer on par); missing → still works, draws from the userflow directly.
- **No L3** (`approval-gate.md`) — HTML can't render in chat; review from the file in a browser. L1 (create) / L2 (update) only.
- **B&W, no color, no JS for the per-flow files** (`naming-conventions.md` line 50) — pure static; the only JS lives in the entry `{feature}-wireframe.html` (TOC + iframe switching). Light/dark theming is out of scope.
- **Device width = frame width** — mobile 375 / tablet 768 / desktop 1024; `responsive` only if the user chose it AND you emit real breakpoints. Confirm the device (AskUserQuestion, pre-suggest from `primary_device`) — never guess.
- **Renderer on par with `/wireframe-ascii`** — same screens, same `[n]`, same 5-column description intent; the ASCII content is the source of truth, HTML is the fidelity pass.
- **Self-contained** — no CDN, inline CSS; opens by double-click. Each screen `id="s{n}"` matches the ASCII deep-links.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run → L2 diff; entry + index regenerated.
- **Template** — `@../../templates/doc-wireframe-html-index.md` for the index; the HTML shells live in `@./resources/`.
- **Validate before done** — doc-validate on the metadata index (step 9).

## Inputs

```
/wireframe-html <feature>                  # all flows, or prompt for one
/wireframe-html <feature> --flow <slug>    # one flow
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Userflows (gate): !`ls docs/*/srs/*-userflow.md 2>/dev/null | head -10`
ASCII sources (preferred content): !`ls docs/*/ascii-wireframe/*.md 2>/dev/null | grep -v index | head -10`
Existing HTML wireframes: !`ls docs/*/html-wireframe/*.html 2>/dev/null | head -10`

## Approach

1. **Gate.** `userflow.md` (`stage: approved`) missing → refuse + route `/user-flow`. Read it + the ASCII `{flow}.md` if present (content source of truth).
2. **Confirm device** (pre-suggest from `primary_device`).
3. **Per flow → `{flow-slug}.html`** — device-width frame per screen, the controls as neutral B&W boxes/labels, `id="s{n}"`, wrap screens vertically. Reuse ASCII content exactly; this is fidelity, not redesign.
4. **Entry `{feature}-wireframe.html`** (Phase G.5) — sidebar TOC (flow → screen), Overview tab = clickable flow map (anchors to each `id="s{n}"`), iframe loading each flow file. Self-contained.
5. **Index `{feature}-wireframe-html-index.md`** — Flows table (flow / file / screens / device / updated).
6. **L1 plan preview** — flows + screens + device + entry created.
7. **Write all files.** **Activity log** — `CLAUDE_SKILL_NAME=/wireframe-html` + note + author before each Write.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/html-wireframe/{feature}-wireframe-html-index.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — entry path (double-click to open) + next (`/prototype-html` for click-through, `/figma` to push frames).

## L1 plan preview

> I'll render **{F} flow(s)** for **{feature}** as B&W HTML to `html-wireframe/`: per-flow `{flow}.html` ({N} screens, device **{device}**) + the entry `{feature}-wireframe.html` (TOC + flow map + iframes) + `{feature}-wireframe-html-index.md`.
> Content source: {ASCII files | userflow}. Open the entry file in a browser to review.
> Apply? (Y / edit)

## Output report

```
✅ HTML wireframes written: html-wireframe/ → {flow}.html × {F} + {feature}-wireframe.html (entry) + index
   Screens: {N} | Device: {device} | doc-validate: OK

Double-click docs/{feature}/html-wireframe/{feature}-wireframe.html to navigate all flows.
Clickable demo? /prototype-html {feature}.  Push frames to Figma? /figma {feature}.
```

## Gotchas

- **Don't redesign in HTML** — if the ASCII and the HTML disagree, the ASCII is right; fix the HTML, never the other way silently.
- **Per-flow files stay JS-free** — the entry file is the only place with JS; mixing JS into per-flow files breaks the "static, opens anywhere" promise.
- **`id="s{n}"` is the deep-link contract** — `/prototype-html` and `/export` anchor to it; don't renumber.
- **B&W is deliberate** — color/branding is a design decision, not a wireframe one; `/figma` or the real frontend owns that.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-wireframe-html-index.md
- @./resources/wireframe-flow.html (per-flow shell)
- @./resources/wireframe-entry.html (navigation entry shell)
- @../../scripts/doc-validate.ts (validate the index — step 8)
