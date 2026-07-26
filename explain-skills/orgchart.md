---
type: skill-explainer
skill: orgchart
updated: 2026-07-26
---

# What is `/orgchart` and how does it run?

**English** · [Tiếng Việt](orgchart.vi.md)

## 1. What it is for, and when you should type this command

`/orgchart` is the command that draws an **organization chart** — a picture that shows **who reports to whom**, with people grouped into teams or departments.

Picture it like **a family tree for a company**: the head (CEO, project lead) sits at the top, lines run downward to the people who report to them, and boxes gather people of the same team together. Each person appears as a little person-shaped figure with their title and name. One glance answers the questions every project kickoff raises: who's in charge, who decides, and whose team does this person belong to?

A few typical situations where you should use `/orgchart`:

- **Project kickoff** — you've just met the client's organization and want the cast of characters on paper before requirements work starts.
- **Stakeholder analysis** — you need to know who to convince, who to inform, and who signs off; the reporting tree is the first half of that (the optional power/interest map is the second — see section 4).
- The team keeps asking **"who is this person again?"** in meetings, and a picture would end that.

You type a command as simple as:

```
/orgchart --feature crm-rollout
```

The system reads what it already knows about the feature (brainstorm notes, spec) and interviews you for the rest. For an org chart of the whole project rather than one feature, use `--shared`; to also get the stakeholder power/interest map, add `--stakeholder`.

**One sentence to remember:** `/orgchart` draws **the reporting hierarchy — people, titles, and lines of command** — best at kickoff, when you need the cast of characters before anything else.

---

## 2. The whole run — a diagram

Unlike the Mermaid-based commands in this kit, `/orgchart` belongs to the **D2 family** (like `/d2-architect`): it writes a text source file and then **actually renders it to an image** (`.svg`) as part of the run. So there's no "open a reader and hope" — the run ends with a finished image on disk, and the system looks at that image itself before reporting done.

```
 YOU TYPE THE COMMAND
 /orgchart --feature X   (or --shared, + optional --stakeholder)
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 1 — Determine the feature (or shared) target    │
 │  File already exists → switches to update mode.      │
 │  Feature doesn't exist → derives a name and creates  │
 │  it.                                                 │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the org facts                        │
 │  Reads brainstorm / spec stakeholder sections for:   │
 │  the head of the tree, each person's title, who      │
 │  they report to, and team groupings. Nothing on      │
 │  file → ASKS you in one batch. Does NOT invent       │
 │  people.                                             │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 3 — Preview before writing (asks permission)    │
 │  In plain business language: the head, N people,     │
 │  M teams — not a dump of source code. You nod (Y)    │
 │  before it writes.                                   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 4 — Write the D2 source (no coordinates)        │
 │  Describes people, teams, and reporting lines in     │
 │  text; the layout engine positions everything        │
 │  automatically — nobody hand-places boxes.           │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 5 — Render to .svg + check the image            │
 │  Compiles the source into a real image. Compile      │
 │  fails → self-fix, re-render. Then the system looks  │
 │  at the image itself to verify the tree is right.    │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 6 — (--stakeholder only) Power/interest map     │
 │  Writes a separate small document plotting each      │
 │  stakeholder by influence × interest, with an        │
 │  engagement strategy per quadrant.                   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 7 — Completion report                           │
 │  Reports the files, people/team counts, and that     │
 │  the image compiled. Logs it in a tracking record.   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the .svg in a browser / IDE to view
```

One practical prerequisite: the D2 drawing tool must be installed on the machine. If it isn't, the command stops immediately and prints the one-line install command — it won't pretend to draw.

---

## 3. How to read the chart

- **Person figures.** Each person is drawn as a person shape carrying two lines of text: the title, then the name ("CTO / Alice"). The **head of the tree is highlighted in cream** so the eye finds the top instantly; everyone else shares the same calm blue.
- **Reporting lines.** Every arrow means the same thing and is labelled the same way: **"reports to."** One convention, never varied — so nobody has to wonder what an unlabelled line means. A **dotted line** marks the exception: cross-team ("dotted-line") reporting, where someone answers to a manager outside their own box.
- **Team boxes.** When three or more people sit on the same side, they're gathered into a named container (Engineering, Business...). A four-person flat org needs no boxes at all — grouping is for tidiness, not ceremony.
- **Size limit.** Past roughly 15 people, one chart stops being readable; the system will suggest splitting by department or narrowing scope instead of drawing a poster.

---

## 4. What this is NOT — and the optional power/interest map

Three artifacts get confused with an org chart, and the command deliberately refuses to be any of them:

| You actually need... | Use instead |
|---|---|
| "Who does which step of the process?" | `/activity-swimlane` |
| "Who is Responsible / Accountable / Consulted / Informed per task?" (RACI) | a table in your spec — not a tree |
| "Who has power, who has interest — how do I engage each?" | the `--stakeholder` map (below) |

The **power/interest map** is the one `/orgchart` will draw for you — but as a *separate* artifact, produced only when you add `--stakeholder`. It's a 2×2 matrix plotting each stakeholder by **influence** (vertical) × **interest** (horizontal), and each quadrant comes with a classic engagement strategy: high power + high interest → **manage closely**; high power, low interest → **keep satisfied**; low power, high interest → **keep informed**; low both → **monitor**.

Why separate? Because the two pictures answer different questions from different data. The tree says where someone sits formally; the matrix says how much they can help or hurt your project — and the two often disagree (a mid-level architect may matter more to your project than a VP). Forcing the matrix into the tree would blur both, so it lives in its own small document, drawn with a different engine (Mermaid), next to the chart.

---

## 5. Where it's stored, and how edits work

The output lands in `docs/{feature}/orgchart/` (or `docs/_shared/orgchart/` with `--shared`), as **two files that travel together**:

- `{slug}-orgchart.d2` — the text source, the thing git tracks and diffs nicely;
- `{slug}-orgchart.svg` — the pre-rendered image, the thing people open and paste into slides.

With `--stakeholder`, a third file joins them: `{slug}-stakeholder.md` with the power/interest map. Re-run the command later and it enters **update mode**: reads the old source, shows you the change "before/after," and re-renders the image after you approve — the `.svg` never drifts out of sync with the source, because rendering is part of the run.

---

## 6. A real-world example

**An**, a BA, is starting a CRM rollout at a client. After two kickoff calls she has names scribbled everywhere: a sponsor CEO, a CTO, two team leads, an operations manager, and someone called Ba who "sort of reports to both sides." She wants the picture — and she also needs to plan who to keep close during the rollout.

An types:

```
/orgchart --feature crm-rollout --stakeholder
```

1. The feature exists but has no org data on file, so the system interviews her in one batch: who's at the top, each person's title, who reports to whom, any team grouping. An answers; for Ba she explains the dual reporting — formally under Operations, but working daily with the CTO.

2. The system previews in plain language: *"Head: CEO (sponsor). 7 people, 2 teams (Engineering, Operations), 1 dotted-line report. Plus a power/interest map for 5 stakeholders. Apply?"* An types `Y`.

3. It writes `docs/crm-rollout/orgchart/crm-rollout-orgchart.d2`, renders the `.svg` — the CEO on top in cream, two team boxes below, and Ba's dotted line running across to the CTO — then checks the image itself: every person present, every reporting line correct.

4. It writes `crm-rollout-stakeholder.md`: the CEO lands in "manage closely," the operations manager — modest interest, real veto power — in "keep satisfied," end users in "keep informed."

An opens the `.svg`, drops it into her kickoff deck, and keeps the matrix for herself — it quietly tells her that her weekly coffee should be with the operations manager, not the enthusiastic team leads. A month later the client reorganizes; she re-runs the command, approves the before/after diff, and both picture and source update together.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (D2 syntax, the person shape, container rules, the quadrant chart), read the source file: `.claude/skills/orgchart/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/d2-architect.md` — the same D2 family, drawing **system architecture** instead of people.
- `explain-skills/activity-swimlane.md` — "who does which **step**" in a process — the question an org chart deliberately doesn't answer.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
