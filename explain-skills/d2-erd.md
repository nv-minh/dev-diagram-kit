---
type: skill-explainer
skill: d2-erd
updated: 2026-07-14
---

# What is `/d2-erd` and how does it work?

**English** · [Tiếng Việt](d2-erd.vi.md)

## 1. What it's for, and when to type this command

`/d2-erd` draws a **data diagram** — the technical term is ERD (Entity-Relationship Diagram). In plain words: it's a picture describing **what kinds of information your feature needs to store, and how those kinds of information relate to one another**.

Picture each "kind of information" as a table: the "User" table (stores email, status, creation date...), the "Deck" table (stores the deck name, which user it belongs to...), the "Card" table (stores the card content, which deck it belongs to...). The data diagram draws these tables as boxes, lists the columns in each table, then connects them with arrows carrying business annotations — for example "one User **owns** many Decks", "one Deck **contains** many Cards". One glance and you grasp the feature's data picture.

The "D2" in the command name is the name of the **drawing tool** this command uses under the hood. `/d2-erd` has the **same content** as `/erd` (both are data diagrams of tables + relationships) — only the **way of drawing** differs: `/erd` uses the Mermaid tool (embedding the picture code straight into the document), while `/d2-erd` uses the D2 tool and produces a **separate image file** (a `.svg` file). In short: **D2 is an alternative drawing option to Mermaid — a different drawing style for you to pick as fits your case**, not something "prettier" or "fancier".

Both share one convenience: **you only need to describe the content** (which tables, which columns, how they relate), while **arranging the tables and drawing the connecting lines** is the tool's job. The real practical difference between the two commands is **where the result lives** and **whether a tool needs installing** (see Section 6), not a matter of pretty versus ugly.

A few typical situations for using `/d2-erd`:

- You want a **separate image file** (`.svg`) to open in a browser, paste into a slide, or send by email — instead of a picture buried inside the spec document.
- You already tried drawing with `/erd` (Mermaid) but found **its layout style doesn't suit your eye** for your case — and want to try a **different drawing style** to see if it fits better.

Type a simple command like:

```
/d2-erd --feature flashcard
```

The `--feature flashcard` part tells the system which feature to draw the data diagram for. (You can also describe it directly in words if that feature has no existing documentation yet — see Step 2 in the diagram below.)

**One sentence to remember:** `/d2-erd` draws the **data picture** of a feature using **a different drawing style (the D2 tool instead of Mermaid)**, producing a separate image file — pick it when you want to try a different drawing style or need an image file separate from the document.

---

## 2. The full flow — diagram

```
 YOU TYPE THE COMMAND
 /d2-erd --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 0 — Check the drawing tool is installed
 │  The system needs the "D2" tool installed on the
 │  machine to draw. Not there → STOP now, show you one
 │  install command. NO half-done drawing, no empty file.
 └──────────────────────────────────────────────────────┘
        │  (tool present → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Identify which feature you're drawing for
 │  Read your request, identify the feature. Feature
 │  doesn't exist → auto-name it and create new (no
 │  prep step required of you beforehand).
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Get the "data picture" right
 │  Prefer re-reading the feature's existing data
 │  diagram (if drawn earlier with /erd). If none, read
 │  the spec docs to extract the tables. Still none →
 │  ASK you: what kinds of information exist, what each
 │  stores, how they relate. DON'T invent tables.
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Preview before drawing (ask permission)
 │  The system describes in plain words: "will draw N
 │  data tables (User, Deck, Card...), M main
 │  relationships (User owns Deck...)". Only acts once
 │  you nod (Y).
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Draw + verify an image comes out
 │  The system writes the diagram description, then has
 │  the D2 tool "really draw" it into an image file. IF
 │  it errors → self-fix, redraw. Only reports DONE once
 │  a complete image comes out.
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Report done
 │  Gives you the image file path (.svg) to open and
 │  view in a browser. Logs it into the feature tracker.
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — one image file (.svg), viewable in a browser
```

---

## 3. How to read a data diagram (for non-technical people)

This part helps you **understand the picture just by looking**, with no database knowledge needed.

**Each box is a "table" — one kind of information to store.** For example: the "User" table, the "Deck" table. The table name sits in bold at the top of the box.

**Inside each box are rows — the "columns" of that table.** Each column is one piece of information of that kind. For example the "User" table has the columns: email, status (active / locked), creation date. Next to each column is the kind of information at an easy level — text, number, datetime, or a choice list ("free | paid").

**A few columns are specially marked on the right edge:**

- **Primary key** (abbreviated PK) — the column used to tell each row in the table apart so none collide (like an ID number distinguishing each person). Each table usually has one such column.
- **Foreign key** (abbreviated FK) — the column that "points to" another table to create a relationship. For example the "Deck" table has a column pointing back to the "User" table to know whose deck it is.

**The arrows connecting the boxes** — each arrow is a relationship, annotated in Vietnamese so you understand right away: "owns", "contains", "reviewed via"... For example the arrow from "User" to "Deck" labeled "owns" means one user owns (many) decks.

Overall, this diagram answers the question: *"What kinds of information does this feature store, and how do they connect to one another?"* — without reading a single line of spec text.

---

## 4. One important thing: this diagram is at the BUSINESS level, not deep technical

This is a point to clarify to avoid misunderstanding the command's scope.

`/d2-erd` deliberately **keeps the diagram at a level easy for business people to understand**, rather than going deep into the technical details of the database. Specifically:

- It writes the kind of information at an **easy-to-understand** level — "text", "number", "datetime", "choice list" — rather than using the technical terms of database programmers (like `varchar(255)`, `uuid`...).
- It **doesn't ask you** technical questions like "how many characters long is this column", "is it indexed", "what data type in the database" — because those are the job of the dev/database engineer at implementation time, not the BA's job when describing the business.

If you need a diagram **closer to programming** — with real database data types, value lists (enums), indexes, and exportable SQL command code for handing off to devs — that's the job of another command in the same group (`/dbdiagram`, see Section 6). `/d2-erd` stops at the business-picture level, exactly like `/erd` — only the drawing style differs.

---

## 5. Why check the tool first, and "only report done once an image comes out"?

Two small but important details in how this command runs.

**Check the tool first (Step 0).** Unlike some commands that run entirely inside the system, `/d2-erd` needs a tool called "D2" installed on your machine in order to draw. So the first thing it does is check: is this tool present? If not, it **stops right away and gives you exactly one command to install it** — rather than trying to half-draw and producing a broken file. Like a carpenter checking they have the saw and chisel before taking the order.

**Only report done once an image comes out (Step 4).** After writing the diagram description, the system has the D2 tool "really draw" it into an image file. If the description has a syntax error that stops it rendering (the most common spot is forgetting to wrap quotes around values with special characters, e.g. the choice list "free | paid"), the system **reads the error, fixes it, and redraws**. It only reports "done" once there's a proper image file — not when the image is still missing or opens blank. This is the commitment: being reported done means there truly is a picture to view.

One thing `/d2-erd` **doesn't** do: it has no "draw it then revise back and forth over many rounds right in the chat window" mode. The diagram description can't render into a picture in the chat, so you view the picture from the drawn image file itself. To adjust, you call the command again with the change request — the system understands it's editing the old version (no duplicate), shows you the changes, then redraws.

---

## 6. Three siblings that all draw the "data picture" — which to pick?

`/d2-erd` is one of three commands that all describe a feature's data. All three draw **the same kind of content** (tables + relationships) — differing in two things: **which drawing style** and **how much detail**.

| Command | Main difference | Who reads it / what for |
|---|---|---|
| **`/erd`** | Mermaid style — **embedded directly in the document**, renders automatically when opened, no tool to install | BA/stakeholder reading in the document |
| **`/d2-erd`** (this command) | **Same content as `/erd`, only a different drawing style** (the D2 tool instead of Mermaid) — produces a **separate image file** (`.svg`), needs the D2 tool installed | anyone who prefers this style, or needs an image file separate from the document |
| **`/dbdiagram`** | Goes **deeper technically** — real database types, choice lists, indexes, **exports SQL code** for handoff | dev / database engineer implementing |

Quick way to choose:

- **`/erd` and `/d2-erd` are two drawing styles of the same thing** — choose by display preference: want it embedded directly in the document (no install needed) → `/erd`; want a separate image file or to try a different layout style → `/d2-erd`. Neither is "prettier" — they're just two different styles, use whichever suits your eye.
- Only when you need to **hand off to devs and export SQL** (data has many choice lists, indexes) do you step up to `/dbdiagram` — this is a difference of *detail level*, not drawing style.

**One note:** don't pick `/d2-erd` because you think "it's prettier/fancier" — it is **not** prettier than `/erd`, just a different drawing option to give you more style choice.

---

## 7. A real example

**Minh**, a BA in charge of the "flashcard" feature of an English-learning app, needs a data diagram to paste into a meeting slide. Earlier he drew the version embedded in the document with `/erd` (Mermaid), but for the slide he wants a **separate image file** and wants to try a **different drawing style** to see if it suits his eye better — so he uses `/d2-erd`.

Minh opens the terminal and types:

```
/d2-erd --feature flashcard
```

1. The system checks first: is the D2 drawing tool installed on the machine? Yes — continue. (If not, it would have stopped right away and handed Minh an install command.)

2. The system recognizes this is the `flashcard` feature, and finds that he drew a data diagram earlier with `/erd`. It re-reads that version to get the exact tables and relationships — not making him re-describe from scratch.

3. The system describes in plain words: *"I'll draw the data diagram for flashcard: 4 tables (User, Deck, Card, Card Review); 3 main relationships (User owns Deck, Deck contains Card, Card reviewed via Card Review). Apply?"* Minh types `Y`.

4. The system writes the diagram description, then has the D2 tool really draw it into an image file. The first draw hits a small error (a column with the choice list "free | paid" wasn't wrapped in quotes) — the system reads the error, fixes it, and redraws once more. This time a complete image comes out.

5. The system reports done and gives Minh the image file path: `docs/flashcard/d2-erd/flashcard.svg`. Minh opens it in a browser and sees 4 tidy tables — table names in bold, columns aligned, primary-key / foreign-key columns clearly marked on the right edge, arrows annotated in Vietnamese ("owns", "contains", "reviewed via").

6. Minh pastes this image file straight into the meeting slide. The board immediately understands "what kinds of information the flashcard feature stores and how they connect", without reading a single line of technical spec.

A few days later, the business adds a "tag decks" feature. Minh just types `/d2-erd --feature flashcard` again and mentions adding a "Tag" table — the system understands it's updating the old diagram, shows him a preview of the changes, then redraws the new picture.

---

## See also

This document only explains the idea and the flow at an accessible level. For the full technical details (the formula for writing the diagram, how it renders, edge cases), read the source file: `.claude/skills/d2-erd/SKILL.md`.

Sibling data-describing commands and the D2 siblings:

- `explain-skills/erd.md` — draws the data diagram with Mermaid, **embedded directly in the document** so GitHub/Obsidian renders it automatically.
- `.claude/skills/dbdiagram/SKILL.md` — a data diagram **closer to programming** (real database types, SQL export), used when handing off to devs.
- `explain-skills/d2-activity.md` — the same D2 tool but draws a **process diagram** (how a task runs step by step), rather than a data diagram.

Choosing a diagram type:

- `explain-skills/erd-family.md` — a quick comparison of all 3 data-drawing commands (`/erd`, `/d2-erd`, `/dbdiagram`), to help pick the right one.
- `explain-skills/diagram-selection.md` — a routing guide for **all diagram types** (when you don't yet know which one you need).
- Source rule (technical version, for machines): `.claude/rules/diagram-selection.md`.
</content>
