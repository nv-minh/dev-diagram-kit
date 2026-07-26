---
type: skill-explainer
skill: timeline
updated: 2026-07-26
---

# What is `/timeline` and how does it run?

**English** · [Tiếng Việt](timeline.vi.md)

## 1. What it is for, and when you should type this command

`/timeline` is the command that draws a **roadmap timeline** — a picture that lays out **milestones grouped by period** (quarter, year, or phase), each with a one-line note.

Picture it like **the signposts along a road**: the road is time, cut into stretches (2026 Q1, Q2, Q3...), and on each stretch stand one to three signs saying what will be reached there — "Launch MVP: Catalog + Cart," "Payment integration: Momo, Stripe." No task bars, no arrows between tasks — just what lands, and when.

A few typical situations where you should use `/timeline`:

- A stakeholder asks **"when do we get what?"** and you need one picture instead of a spreadsheet.
- You're planning a feature or a whole product across **quarters or phases** and want the milestones agreed before detailed planning starts.
- A brainstorm produced a rough roadmap section and you want it turned into a **presentable picture**.

You type a command as simple as:

```
/timeline "online shop roadmap" --feature online-shop
```

The part in quotes is the **subject** of the roadmap. `--feature` says which feature it belongs to (leave it out and the system guesses; a feature that doesn't exist yet gets created). For a roadmap that spans the whole project rather than one feature, add `--shared` instead.

**One sentence to remember:** `/timeline` draws **milestones over time, grouped by period** — best when the question is "what lands when," not "which task blocks which."

---

## 2. The whole run — a diagram

The picture is **text-based code** (Mermaid) embedded in a document — it doesn't render in the chat window; open the file in a reader (VS Code / Obsidian / GitHub) and it appears. That's why the run ends with a **trial-render check** before reporting done.

```
 YOU TYPE THE COMMAND
 /timeline "subject" --feature X   (or --shared)
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 1 — Determine the feature, subject, and target  │
 │  Guesses the feature; unsure → asks. --shared →      │
 │  the project-wide roadmap file instead. Feature      │
 │  doesn't exist → derives a name and creates it.      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the milestones                       │
 │  Reads the feature's brainstorm roadmap section if   │
 │  present; else ASKS you in one batch: the periods    │
 │  in order, 1-3 milestones per period, a short note   │
 │  each. Does NOT invent dates.                        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 3 — Draw up a "must-have checklist"             │
 │  Every period + milestone, listed before drawing —   │
 │  used at the end to check nothing was dropped.       │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before writing (asks permission)    │
 │  "Timeline for {subject}: N periods, M milestones."  │
 │  You nod (Y) before it writes to the file.           │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 5 — Append to the timeline document             │
 │  Adds a "## Timeline: {Subject}" entry to the        │
 │  feature's timeline file (or the shared one).        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 6 — Trial-render, check for syntax errors       │
 │  Renders an image itself to be sure the picture      │
 │  isn't broken when you open it. Error → self-fix,    │
 │  retry (a couple of times).                          │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 7 — Completion report                           │
 │  Reports the file, the period/milestone count, and   │
 │  that the picture renders. Logs it in a tracking     │
 │  record.                                             │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the roadmap
```

---

## 3. How to read a timeline

Only three ingredients:

- **Periods** — the columns of the picture: quarters ("2026 Q1"), years, or phases ("Phase 1"). Labels are kept short on purpose; a long period label breaks the column layout.
- **Milestones** — one to three per period. More than three and the period should probably be split, or the extra items aren't really milestones.
- **Notes** — one short line per milestone ("Closed beta: 50 users"). A milestone can also stand alone with no note.

One honest rule underneath: **the system does not invent dates**. If neither your description nor the brainstorm says when something lands, it asks you — a roadmap with made-up quarters is worse than no roadmap, because people will believe it.

---

## 4. Why this is deliberately NOT a Gantt chart

This is the most important design decision behind `/timeline`, so it deserves its own section.

A **Gantt chart** shows tasks as bars with durations, arrows for dependencies ("A must finish before B starts"), and a critical path. That is a *project-management* tool: it needs effort estimates, resource assignments, and constant upkeep as reality shifts.

A **timeline** answers a much lighter question: *what lands, roughly when*. No bars, no dependency arrows, no critical path — on purpose. Two reasons:

- **Audience.** The people a BA shows a roadmap to — sponsors, stakeholders, sales — want commitments per period, not task mechanics. A Gantt at that table invites a debate about task durations you can't win in a meeting.
- **Honesty of maintenance.** A Gantt goes stale the week after it's drawn unless someone maintains it daily. A milestone timeline survives contact with reality much longer, because it promises less detail.

If you genuinely need "task A blocks task B" planning, that's out of this kit's scope — and if you ask for a Gantt, the command will say exactly that rather than draw a bad one.

---

## 5. Where it's stored, and how edits work

Two possible homes:

- **Per feature** — `docs/{feature}/{feature}-timeline.md` (note: at the feature root, not inside `srs/` — a roadmap is a planning artifact, not a requirements one).
- **Project-wide** — with `--shared`, it goes to `docs/_shared/_shared-timeline.md`, the cross-feature roadmap.

Each timeline is one `## Timeline: {Subject}` entry in the file. Re-run the command with the same subject and the system understands it's an **update**: it shows the change "before/after" and only then overwrites — no duplicates. Because Mermaid doesn't render in chat, you review **the real picture in the document** and call the command again when plans shift — which, for roadmaps, is a feature, not a failure.

---

## 6. A real-world example

**Huy**, a BA, has a steering-committee meeting on Friday. The sponsors want one slide answering "what do we get each quarter this year?" for the online shop. The plan exists — scattered across a brainstorm doc and three chat threads.

Huy types:

```
/timeline "online shop roadmap 2026" --shared
```

1. He used `--shared` because this roadmap spans several features (catalog, checkout, mobile) — so the target is the project-wide file, no feature to guess.

2. The system finds a roadmap section in the brainstorm notes and extracts most milestones, but Q3 is empty there. It asks Huy — he answers "mobile app and the analytics dashboard," and mentions Q4 is deliberately unplanned. The system does not fill Q4 with guesses.

3. It lists the must-have checklist — 3 periods, 6 milestones — and previews: *"Timeline for online shop roadmap 2026 → _shared-timeline.md: 3 periods, 6 milestones. Apply?"* Huy types `Y`.

4. It appends the entry to `docs/_shared/_shared-timeline.md`, trial-renders the image — passes — and reports done.

Huy opens the file, exports the rendered picture, and drops it on the slide. On Friday, one sponsor asks "can payment move to Q1?" — and because the picture shows milestones rather than a fragile web of task bars, the discussion stays where it belongs: on commitments, not on task mechanics. Monday morning, Huy re-runs the same command with the agreed change; the system shows the before/after diff and updates the entry in place.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (Mermaid `timeline` syntax, the exact steps, special cases), read the source file: `.claude/skills/timeline/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/mindmap.md` — decomposes **what** the scope contains; the timeline says **when** its pieces land.
- `explain-skills/journey.md` — the user's **experience** over time — time from the user's side, not the project's.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
