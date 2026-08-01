---
name: figma
description: Use when you want to push the feature's wireframes into Figma frames via the Figma MCP and record the frame URLs — no local file, the URLs go into the {feature}-wireframe-index.md Figma column. Trigger with `/figma <feature> [--flow <slug>]`. External-write hard gate (preview + Y, stops if the Figma MCP is unauthenticated). Differs from `/wireframe-html` (local HTML artifact, not a Figma file) and `/confluence` (pages, not design frames).
allowed-tools: Read, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--flow <slug>]"
---

# /figma — Push wireframes to Figma frames

## Goal

Create/update Figma frames from the feature's wireframes (ASCII content as the source of truth) via the Figma MCP, and record each frame's URL into the `Figma` column of `docs/{feature}/ascii-wireframe/{feature}-wireframe-index.md`. **No local output file** — Figma is the artifact; the index is the pointer.

## Constraints

- **External-write — hard gate** (`approval-gate.md` external-write class, same shape as `/sync-confluence`): preview every frame's contents + the target Figma file/page, get an explicit **Y** before any MCP write. No auto-approve.
- **Figma MCP must be authenticated** — if the MCP is not connected/authenticated, STOP and tell the user how to connect it; do not fabricate URLs or fall back to a local file.
- **Group B** (`feature-bootstrap.md`): needs wireframes — ASCII screens preferred (`ascii-wireframe/{flow-slug}.md`), else HTML wireframes; missing both → refuse + route `/wireframe-ascii`.
- **One Figma frame per screen** — frame name = `[n] {screen-name}`; group frames by flow (a Figma section/page per flow when the tool supports it).
- **Content parity** — the Figma frames mirror the wireframes (same controls, same `[n]`); the index's `Figma` column holds the frame URL per screen.
- **No local file** (`naming-conventions.md` line 46) — only the index is edited (the `Figma` column).
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run updates existing frames (URLs stable); new screens get new frames.

## Inputs

```
/figma <feature>                  # all flows
/figma <feature> --flow <slug>    # one flow
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Wireframe sources: !`ls docs/*/ascii-wireframe/*.md 2>/dev/null | grep -v index | head -10`
Screen indexes (Figma column target): !`ls docs/*/ascii-wireframe/*-wireframe-index.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No wireframes → refuse + route `/wireframe-ascii`. Verify the Figma MCP is authenticated (probe a read-only call); if not → STOP with connect instructions.
2. **Read the wireframes** for the target flow(s) — every screen `[n]`, its controls, the device width.
3. **Draft the frame plan** — per screen: frame name `[n] {name}`, width (device), the controls to place, the target Figma file/page (from memory or ask once).
4. **L1 preview (hard gate)** — list every frame + target + a note that this WRITES to Figma; get explicit **Y**.
5. **On Y → MCP writes** — create/update each frame; collect the returned frame URLs.
6. **Edit the index** — write each URL into the `Figma` column of its screen row; tick `updated`.
7. **Activity log** — `CLAUDE_SKILL_NAME=/figma` + note + author before the Edit.
8. **Output report** — frames pushed + the Figma file link + next (`/prototype-html` for a local clickable demo).

## L1 plan preview (hard gate — external write)

> This **writes to Figma** (irreversible-ish — frames are created/updated in your Figma file). Review before approving.
> Frames: **{N}** in file `{figma file}` ({flow list}).
> {per-screen: `[n] name` → frame, device {w}}.
> On Y, I create/update the frames and record the URLs in `ascii-wireframe/{feature}-wireframe-index.md` (Figma column).
> Apply? (Y / edit / cancel)

## Output report

```
✅ Figma frames pushed: {N} frames in {figma file} → {figma url}
   Index updated: Figma column filled for {N} screens.
   Frame list: {[n] name → url …}

Local clickable demo? /prototype-html {feature} (no external dependency).
```

## Gotchas

- **Never invent a Figma URL** — if a write fails or returns nothing, leave the cell empty and report it; a fake URL breaks the index contract silently.
- **Content parity, always** — the Figma frame is a render of the wireframe, not a redesign; if the wireframe changed, re-sync the frame.
- **One source of screen truth** — the ASCII wireframe + its `[n]`; Figma frames follow those numbers, never the reverse.
- **MCP availability varies** — in headless/CI contexts the Figma MCP may be absent; this skill is interactive-only by nature.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
