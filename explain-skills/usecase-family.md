---
type: skill-explainer
skill: usecase-family
updated: 2026-07-14
---

# `/usecase`, `/usecase-diagram`, `/userstory` — how are they related?

**English** · [Tiếng Việt](usecase-family.vi.md)

> This document explains the **relationship** between three commands that all work with "user scenarios" and the "backlog": `/usecase`, `/usecase-diagram`, `/userstory`. To understand each command in depth, read its own explainer file (listed at the end).

## 1. These three commands are NOT three ways of doing the same thing

Unlike the three process-diagram commands (where `/activity`, `/activity-swimlane`, `/d2-activity` are **three different ways of drawing the same thing**), the three commands here do **three different things that complement each other**. They don't replace one another — each produces its own kind of output, and you use whichever one you need (you are not required to run all three, nor to run them in a fixed order).

Picture yourself building a feature. Once you have the technical specification (SRS — where functional requirements, or FRs for short, are listed), you typically have three things to do:

- **`/usecase`** — writes out **each user scenario** in words: who wants to achieve what, which steps they go through, what happens when an error situation occurs. This is the **text** part, detailed description.
- **`/usecase-diagram`** — draws **one overview picture** showing the big picture: who (actors) exist and what they can do in the system. This is the **picture** part — a glance shows the "scope" of the feature.
- **`/userstory`** — cuts the work into **small chunks placed into the backlog** for the development team to pick up sprint by sprint. This is the **breaking work down to hand off** part.

In short: **`/usecase` describes (text), `/usecase-diagram` draws the big picture (image), `/userstory` breaks work down to hand off.** The three outputs complement each other; they are not three mutually exclusive choices.

---

## 2. The flow picture — what comes first, what produces what

```
                    ┌───────────────────────┐
                    │   /srs  (SRS spec)     │
                    │   → FR requirements    │
                    │   ("source of truth")  │
                    └───────────┬───────────┘
                                │  (/userstory needs SRS to run. /usecase-
                                │   diagram needs use cases OR SRS. /usecase
                                │   alone can run even BEFORE SRS — see ▼)
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
    ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐
    │   /usecase       │  │/usecase-diagram│ │   /userstory     │
    │  SCENARIO (text) │  │ BIG PICTURE (img)│ │ BACKLOG (chunks) │
    │  each use case    │  │  who can do what │ │  break down to   │
    │  in detail        │  │  in the system   │ │  hand off        │
    └────────┬─────────┘  └───────┬───────┘  └────────┬─────────┘
             │                    │                    │
             │ use case is a good │                    │ story is the
             │ source for the     │                    │ source for the
             │ other two commands │                    │ next step
             ▼                    ▼                    ▼
      (diagram reads back    (.puml file + .svg   ┌──────────────────┐
       the use case catalog    image + table       │   /ac            │
       to know who/what to     embedded into the   │  acceptance      │
       draw)                   same index file      │  criteria       │
                               as the use cases)    │  (testable)     │
                                                    └──────────────────┘
```

Two important things to read from this diagram:

1. **All stick to a source of truth, but under different conditions.** `/userstory` **requires SRS to exist** before it will run (not yet there → it declines, directing you to write `/srs` first). `/usecase-diagram` needs **either a use case catalog OR SRS** (only declines if both are missing). `/usecase` alone **can run even when SRS does NOT yet exist** — because writing use cases is a way of *discovering* the business, often done early, with SRS derived from it afterward (see Section 4). What they share in common: none of them makes up content out of thin air — missing something, they ask or flag an open question.

2. **They share one "ledger."** `/usecase` and `/usecase-diagram` both write into **a single shared file** — `{feature}-usecase-index.md`: use case contributes the traceability matrix table (use case ↔ FR ↔ screen ↔ error code), while the diagram contributes the picture + actor table. Because they share one place, they don't collide with each other.

---

## 3. Quick comparison table

If you only read one section, read this table:

| | `/usecase` | `/usecase-diagram` | `/userstory` |
|---|---|---|---|
| **What it produces** | Detailed text for each user scenario | One overview picture (scope) | Small work chunks for the backlog |
| **Answers the question** | "How does this scenario run, what does it guarantee?" | "Who can do what in the system?" | "How is it cut up to hand to the dev team sprint by sprint?" |
| **Form** | Text (business description) | Image (a diagram exported to an image file) | Short text + criteria + backlog table |
| **Read it to** | Dev/QA understand exactly the expected behavior | Stakeholders see the big picture at kickoff | Dev team picks up work, estimates, builds |
| **Needs beforehand** | Not required: no SRS yet → discovery mode; SRS exists → interpretation mode | ≥1 of: use case catalog OR SRS | SRS (FR) — also uses use cases if available |
| **Where results go** | `uc-*.md` + table in the index file | Image + table embedded in the same index file | Index table + each story its own `us-NNN.md` file |

One sentence to remember: **use case = scenario (text); use case diagram = big picture (image); user story = breaking work down (backlog).**

---

## 4. Typical run order (and why)

You aren't required to run all three, but the common order is:

**`/usecase` can be the earliest step — even before SRS.** Because writing use cases is a way of discovering the business, many teams build use cases *first* to clarify "what does the user need to do," and only then run `/srs` to derive formal requirements from those very use cases. `/usecase` recognizes this itself: no SRS yet → it asks you (discovery mode); SRS already exists → it reads the FR requirements (interpretation mode). Both are valid.

**`/usecase` first, then `/usecase-diagram`.** Once a clear use case catalog exists, the diagram has a ready source to "read back" — knowing exactly which use cases exist, who the actors are — so the overview picture matches reality more closely. (The diagram can still run with only SRS available, it just has to infer actors/use cases from the FRs itself.) In other words: **write the detailed scenarios first, then draw the overall map**, so the map can be checked against what was already written.

**`/userstory` can run in parallel or afterward.** User story also reads SRS as its source, and if use cases already exist, it takes advantage of them too (use cases suggest the boundaries of "one complete piece of work"). But it does **not require** use cases to exist first — SRS alone is enough.

**After `/userstory` usually comes `/ac`** (acceptance criteria): turning each story into clear pass/fail test conditions. `/userstory` even asks whether you want to run `/ac` right away after creating the stories.

The key point: this is **a chain from description → big picture → breaking down work → test criteria**, each step clarifying one more layer, moving progressively from "understanding the business" down to "ready to hand to developers."

---

## 5. Boundaries easily confused — three common mix-ups

**Use case (text) ≠ use case diagram (image).** This is the most common mix-up because the names look similar. `/usecase` produces **detailed text** for each scenario (read to understand exact behavior); `/usecase-diagram` produces **one overview picture** (look at it to grasp scope). One is for reading closely, the other is for looking at the whole — they complement, not replace, each other. That's why the picture and the use case table are kept in **the same file** for convenient reference.

**Use case ≠ user story.** A use case describes **a complete scenario** (the main path + every error branch + guarantees on success/failure) — leaning toward "understanding correctly and completely." A user story is **a small chunk of work to hand to developers** — leaning toward "cutting it so it can be built within one sprint and produces observable value." One use case (e.g. "Place an order") might be cut into several small user stories.

**One use case ≠ one FR, and one story ≠ one FR.** Neither command mechanically assumes "one FR requirement = one use case/story." A single user goal often gathers several FRs; conversely, an FR is sometimes just one rule within a larger use case. Divide by **complete business value**, not by counting FRs.

---

## 6. Three similarities shared by all three commands

Even though they do three different things, all three operate on the same handful of principles:

1. **No source, no making things up.** Each command sticks to a source of truth in its own way: `/userstory` reads SRS; `/usecase-diagram` reads the use case catalog (or SRS); `/usecase` reads SRS if it exists, and asks you if it doesn't (discovery mode). Missing a required source → **it declines and points you** to run the command that creates the source first, rather than inventing content itself. Where a piece of business detail is missing (a number, a rule) → it flags an **open question** to be clarified, instead of "just guessing."

2. **Preview before writing.** Before writing to a file, all three show you a preview of the plan (what will be created/changed) and wait for your nod. If the file already exists, they show you the changed part (a before/after comparison) before overwriting.

3. **Gather into one shared index file per type.** Instead of scattering metadata everywhere, each type has one "ledger": use case + diagram share `{feature}-usecase-index.md`, while story uses `{feature}-story-index.md`. Look in one place to see the entire status.

---

## 7. A real-world example — walking through all three

**Lan**, a BA in charge of the "refund" feature, has just finished the SRS specification (the FR requirements already exist). Now she needs to move from "specification" to "ready to hand to developers." She walks through the three commands:

1. **`/usecase refund`** — she writes out the detailed user scenarios. The system reads the SRS and suggests goals at the "sea-level" — *"Submit a refund request"* (by Customer) and *"Approve a refund"* (by Staff). It does **not** split "Verify documentation" out as its own use case — that's just a step inside. Each use case documents: the main path, error branches (request past deadline, missing documentation), and guarantees on success/failure. Result: two `uc-*.md` files + a matrix table in the index file.

2. **`/usecase-diagram --feature refund`** — she draws the overview picture. The system **reads back** the two use cases just created, recognizes two actors (Customer, Staff), and draws a compact picture: a "System: refund" boundary box with two use cases inside, two actors outside connected to it. It doesn't add include/extend relationships on its own since there's no clear evidence for them. The `.svg` image is embedded directly into **the same index file** as the use case table from step 1.

3. **`/userstory refund`** — she breaks down the work for the backlog. The system cuts by **the smallest observable business outcome**: story *"Customer submits a refund request"*, story *"Staff approves/rejects the request"*... One FR describing the refund deadline threshold is still vague (doesn't specify how many days) → the system **doesn't make it up**, instead generates a draft story + flags an **open question** "how many days is the refund deadline?" for her to clarify with the PO. When done, it asks her: *"Also create acceptance criteria (AC) right away?"* — she types `Y`, and `/ac` runs next.

By the end, Lan has: detailed scenarios (read to understand), an overview picture (look at it to grasp scope), and a backlog of stories with test criteria (ready to hand to developers) — all traceable back to the original FR requirements.

---

## See also

To understand each command in depth, read its own explainer file:

- `explain-skills/usecase.md` — `/usecase` (writes detailed user scenarios, Cockburn style).
- `explain-skills/usecase-diagram.md` — `/usecase-diagram` (draws the overview picture of actors + use cases).
- `explain-skills/userstory.md` — `/userstory` (breaks work down into user stories for the backlog).

Related commands at the two ends of the chain:

- `.claude/skills/srs/SKILL.md` — `/srs` produces the SRS (FR). `/userstory` always reads SRS; `/usecase-diagram` reads SRS or the use case catalog; `/usecase` reads SRS in interpretation mode, while in discovery mode it runs even before SRS (and helps build the SRS).
- After `/userstory` usually comes `/ac` (acceptance criteria) — turning stories into pass/fail test conditions.
