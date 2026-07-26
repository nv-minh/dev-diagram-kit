---
type: skill-explainer
skill: gallery
updated: 2026-07-26
---

# What is `/gallery` and how does it run?

**English** · [Tiếng Việt](gallery.vi.md)

## 1. What it is for, and when you should type this command

After a few weeks of BA work on a feature, its diagrams end up scattered: architecture pictures as `.svg` files in one folder, a data model in another, sequence and state diagrams living as Mermaid code inside `.md` documents. That's fine for you — but now you need to show all of it to a **stakeholder who has no VS Code, no repo access, and no patience for "open this folder, then that file."**

`/gallery` solves the handoff. It gathers **every diagram of one feature into a single self-contained HTML file**: one tab per diagram type, dark theme, and an export toolbar with **Copy / PNG / PDF** buttons on each tab. The file opens by double-click — no server, no internet connection needed for the pictures, nothing to install. You send one file over chat or email, and the receiver has the feature's entire picture set.

One thing to be clear about up front: **`/gallery` is not a diagram type.** It draws nothing new. It only packages what the other commands already drew — think of it as **binding loose pages into a booklet**, not writing another page.

You type:

```
/gallery --feature payment
```

and get `docs/payment/payment-gallery.html`. Add `--out some/path.html` if you want the file somewhere else.

**One sentence to remember:** `/gallery` turns a folder of diagrams into **one file you can send over chat** — for handing a feature's pictures to people who will never open your repo.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /gallery --feature payment
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Check the feature name                       │
 │  --feature is REQUIRED here — no guessing. The deck   │
 │  is strictly per-feature; a wrong guess would bundle  │
 │  the wrong pictures into a stakeholder-facing file.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Scan for diagrams                            │
 │  Looks through docs/{feature}/ (plus the shared       │
 │  folder docs/_shared/) for two kinds of material:     │
 │   • ready-made .svg images (D2 / PlantUML / BPMN)     │
 │   • Mermaid code blocks inside .md documents          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Preview before building (asks permission)    │
 │  Tells you in words: how many diagrams found, which   │
 │  tabs they'll form, which Mermaid blocks will be      │
 │  rendered or skipped. You nod (Y) before it builds.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Build via the builder script                 │
 │  A script (gallery-build.ts) assembles the HTML:      │
 │  inlines every .svg into the file itself, renders     │
 │  Mermaid blocks into pictures (when the mmdc tool is  │
 │  installed), and wires up the tabbed shell + export   │
 │  toolbar. The HTML is never written by hand.          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Sanity-check the output                      │
 │  Confirms the file exists and the builder's summary   │
 │  adds up (N diagrams across M tabs).                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Completion report                            │
 │  Where the file is, how many diagrams per tab, which  │
 │  Mermaid blocks made it in. Opening the file in a     │
 │  browser is your call.                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — double-click the HTML, switch tabs, export via ⋯
```

---

## 3. What the deck looks like, and how tabs are decided

Open the file and you see a dark-themed page with **tabs across the top — one per diagram type**: Architecture, Data flow, Data model, Process (BPMN), Use cases, Code flow, SRS diagrams. The tab a diagram lands in is decided by **which folder it was found in** — the kit's drawing commands already save each type into its own folder, so the grouping comes for free. A diagram sitting in a folder the builder doesn't recognize lands in a tab called "Other"; if that bothers you, move or rename the folder to a known type and rebuild.

Each tab carries an export toolbar (the `⋯` button) with three actions for the diagram you're looking at:

- **Copy** — puts the picture on the clipboard, ready to paste into a chat message or a slide.
- **PNG** — downloads the current view as an image file.
- **PDF** — produces a PDF, handy when the receiver wants to print or archive.

This toolbar is not written fresh for `/gallery` — it is **the same toolbar used by `/system-design`** (the multi-level architecture command), reused as-is. One toolbar, two skills: a fix or improvement in one place must be synced to the other, which is exactly why the skill forbids editing the export code independently.

---

## 4. Why a script builds the HTML — and why it's one self-contained file

**Why a script, not hand-written HTML?** Because the deck must be *reproducible*. You will rebuild it every time a diagram is added or fixed, and each rebuild must give the same reliable result — same tabs, same inlining, same toolbar. Hand-assembling a big HTML file is exactly the kind of work where a small slip (one unescaped character in an inlined SVG) silently breaks the file. So the skill's hard rule is: **run the builder, never write the HTML by hand.** The build is idempotent — re-running simply overwrites the previous deck, which makes "add a diagram, rebuild, resend" the natural workflow.

One subtle guard worth knowing: the builder deliberately **skips any previously built deck** it finds while scanning (`*-gallery.html` and similar generated files). Without this, rebuilding would inline the *old* deck into the *new* one as if it were a diagram — a file that swallows its own previous version and doubles in size each rebuild.

**Why self-contained?** The whole point is the receiver's experience. A stakeholder gets one file; it must work on their machine with zero setup — no server to start, no internet fetch for the images, no missing-file errors because a folder didn't come along. That's why every SVG is embedded *into* the HTML rather than linked. The trade-off is honest: a feature with many large diagrams produces a large HTML file. For a handoff artifact, that's expected and fine.

---

## 5. Why there is no "fix it in chat" loop — and what can be missing

**No iterating in chat.** You review the deck by opening it in a browser — that's where the real tabs and toolbar are, and no chat window can show you that. And there's a deeper reason: `/gallery` never edits diagrams. If a picture in the deck is wrong, the deck is not where you fix it — you fix the *source* diagram with its own drawing command (`/sequence`, `/dfd`, `/erd`...), then run `/gallery` again. The deck is a mirror of the sources; polishing the mirror doesn't fix the face.

**What can be missing — Mermaid blocks.** Ready-made `.svg` diagrams are always included. But diagrams stored as Mermaid *code* inside documents (sequence, state, ERD, mindmap, journey...) must first be rendered into pictures, and that needs an extra tool (`mmdc`, the Mermaid command-line renderer, plus a Chrome it can use). If that tool isn't installed, those blocks are **skipped with a warning** rather than breaking the build — you get a valid deck, just without the Mermaid-based tabs' content. Install `@mermaid-js/mermaid-cli` and rebuild to include them.

**No diagrams at all?** The builder stops with "No diagrams found" — the deck has nothing to bind. Draw first (or ask `/diagram` which command to draw with), then come back.

---

## 6. A real-world example

**Minh**, a developer doing BA work on the "onboarding" feature, has a sprint review on Friday. Over the past two weeks he has produced an architecture diagram (`/d2-architect`), a data-flow diagram (`/dfd`), an ERD, and two sequence flows living inside the feature's flows document. The audience: a product owner and two ops leads — none of them will ever clone the repo.

Minh types:

```
/gallery --feature onboarding
```

1. The system confirms the feature exists, then scans `docs/onboarding/` and the shared folder: it finds 3 `.svg` files and 3 Mermaid blocks across the docs.

2. It previews: *"7 diagrams into 4 tabs (Architecture, Data flow, Data model, SRS diagrams); 3 Mermaid blocks will be rendered. Build?"* Minh types `Y`.

3. The builder assembles `docs/onboarding/onboarding-gallery.html`, inlining every SVG and rendering the Mermaid blocks to pictures.

4. The report confirms: 7 diagrams across 4 tabs, all Mermaid blocks rendered. Minh double-clicks the file — dark deck, tabs on top, everything renders with no network.

He drops the single file into the review channel. During the meeting, the product owner flips between tabs on her own laptop; when she asks for the data-flow picture "for the steering deck," she presses `⋯ → PNG` herself and drags it into her slides. Nobody asked Minh how to open anything.

The following sprint, a payment step is added to onboarding and one sequence flow changes. Minh fixes the *source* diagram with `/sequence`, then reruns `/gallery --feature onboarding` — the deck is rebuilt in place, and he resends the same single file.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (the builder script, tab mapping, toolbar reuse rules), read the source file: `.claude/skills/gallery/SKILL.md`.

Related reading:

- `explain-skills/diagram.md` — not sure which drawing command produces a diagram you still need? The router picks for you.
- `explain-skills/sequence.md` — one of the drawing commands whose output ends up in this deck.
- `/system-design` (source: `.claude/skills/system-design/SKILL.md`) — the architecture command whose export toolbar this deck reuses.
