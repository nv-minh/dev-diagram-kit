---
type: skill-explainer
skill: erd-family
updated: 2026-07-14
---

# Three commands that draw a "data diagram" — which one to pick?

**English** · [Tiếng Việt](erd-family.vi.md)

> This document explains **how the three commands relate** to each other — they all draw data diagrams: `/erd`, `/d2-erd`, `/dbdiagram`. To understand each command in depth, read its own explainer file (listed at the end).

## 1. Why are there three commands for the same job?

All three answer the same business question: **"what kinds of information does this feature need to store, and how do those kinds of information connect to each other?"** The result is always a **data diagram** (technical name: ERD): each box is a "table" of information (Customer, Order, Transaction...), inside listing that table's pieces of information, and the connecting lines show the relationship ("one Customer places many Orders").

So why not merge them into one? Because the same data picture may need to be **produced in three different ways, serving three different needs** — like the same house, you might need a quick sketch to discuss with the homeowner, a nicely printed version to frame, or a detailed technical version to hand to the builder. Each command is strongest at one thing:

- **`/erd`** — draws fast, **embeds directly into the documentation**, shows automatically when opened (no tool install needed). For BAs and stakeholders to read.
- **`/d2-erd`** — **the same content as `/erd`, just a different drawing style** (using the D2 tool), producing a **separate image file**.
- **`/dbdiagram`** — goes **deeper technically**: real database types, choice lists, **exports SQL code** for devs to build the database.

The point to remember right away: the difference between the three commands lies along **two axes** — **drawing style** (Mermaid or D2) and **level of detail** (business or close-to-dev) — **not** which one is "prettier" or "fancier."

---

## 2. Quick-pick table

If you only read one part, read this table:

```
 QUESTION                                          → PICK COMMAND

 Want the data picture to APPEAR RIGHT AWAY in
 the documentation (opening on GitHub / Obsidian
 shows the picture instantly, no install
 needed)?                                          → /erd  (Mermaid)

 Want the same content but as a SEPARATE IMAGE
 FILE (paste into a slide / send by email), or
 want to try a different drawing style for a
 better look?                                      → /d2-erd  (D2)

 Need to HAND OFF to dev to build the database:
 real data types, choice lists, duplicate-
 prevention rules, and a SQL file that runs
 immediately?                                       → /dbdiagram  (DBML → SQL)
```

One sentence to remember: **read-in-the-documentation → `/erd`; separate-image-file → `/d2-erd`; hand-off-to-dev-export-SQL → `/dbdiagram`.**

---

## 3. The three commands side by side

All three draw **the same kind of content** (tables + relationships) — differing in two things: **which style they're drawn in** and **how detailed they get**.

| | `/erd` | `/d2-erd` | `/dbdiagram` |
|---|---|---|---|
| **Drawing tool** | Mermaid | D2 | DBML (database description language) |
| **Main difference** | Embedded directly into the documentation, shows automatically when opened | Same content as `/erd`, just a different drawing style | Goes deeper technically, can export SQL |
| **Level of detail** | Business level (compact: text/number/date) | Business level (same as `/erd`) | Close to dev (real database types, fixed choice lists, duplicate-prevention rules) |
| **Needs a tool installed?** | No | Yes (the D2 tool) | Yes (a small tool for exporting SQL) |
| **Where the result lives** | Embedded in the feature's data file | Standalone `.svg` image file | `.dbml` file (paste onto dbdiagram.io) + `.sql` file for devs |
| **Who views / uses it for what** | BA/stakeholder reading in the documentation | Anyone who likes this style, or needs a separate image file | Dev / database engineer implementing it |

> Note: `/dbdiagram` is named after the **dbdiagram.io** website (where you paste the file to view the diagram), but the file it produces has a `.dbml` extension — because "DBML" is the name of the *language*, while "dbdiagram.io" is the name of the *viewing tool*. Don't go looking for a file with a `.dbdiagram` extension — there isn't one.

---

## 4. Two important dividing lines — understand them correctly to pick without mistakes

Within this family there are two places commonly misunderstood. Getting these two right means you'll pick correctly almost every time.

**Dividing line one: `/erd` and `/d2-erd` only differ in DRAWING STYLE, neither is prettier.** These two commands produce **the exact same content** (the same tables, the same relationships, the same business level of detail) — they only differ in the underlying drawing tool (Mermaid for `/erd`, D2 for `/d2-erd`) and **where the result lives** (embedded in the documentation for `/erd`, a separate image file for `/d2-erd`). So don't pick `/d2-erd` thinking "it's fancier" — it isn't fancier, it's just **a different drawing style** to give you another option. Pick according to: want it embedded directly, no install needed → `/erd`; want a separate image file or want to try a different layout style → `/d2-erd`.

**Dividing line two: `/dbdiagram` differs in LEVEL OF DETAIL, not drawing style.** `/dbdiagram` isn't simply "another way of drawing" — it **goes considerably deeper**: it uses the database's actual real data types, adds fixed choice lists (e.g. an order status can only be "pending / paid / cancelled"), duplicate-prevention rules, default values — things `/erd` and `/d2-erd` deliberately don't express. And it exports along with it an **SQL** file for devs to build the database, ready to run immediately. This is the command **closest to dev** among the three siblings.

From these two dividing lines follows one important conclusion: **`/dbdiagram` is not "the best one you should always use."** For a small feature with just 2-3 tables where you just want to quickly see how they relate, `/erd` is enough and much lighter. `/dbdiagram` truly shines when you need to **hand off to dev, export SQL, or describe complex data**. Pick according to your actual need, not according to "which one is most detailed."

---

## 5. Three similarities shared by all three commands

Even though they use different tools and levels of detail, all three operate on a few of the same principles:

1. **No source, no making things up.** All three prioritize reading the feature's existing documentation (spec, or a previously drawn data diagram) to derive the tables. Missing information → **asks you** ("what kinds of information exist, what does each one store, how do they relate to each other"), rather than inventing tables or guessing relationships on its own. `/d2-erd` and `/dbdiagram` even reuse an existing `/erd` version (if any) as their source — they don't make you describe everything again from scratch.

2. **You describe the business meaning, the machine handles the rest.** All three **never** ask you technical database-person questions ("what type is this column," "how many characters long," "is it indexed"). You only describe the business meaning ("email is the contact address," "amount is the order price"). Even `/dbdiagram` — although it *produces* something detailed for devs — **doesn't make you think like a dev**; it picks the appropriate data type itself.

3. **Preview before writing, and self-check before reporting done.** Before writing, all three describe in words what they'll draw and wait for you to nod (if the file already exists, they show you the before/after change). After writing, all three **self-check**: `/erd` and `/d2-erd` try drawing an image themselves (and `/erd` also opens the image itself to review it, catching *wrong-direction relationship arrows* — an error a syntax checker can't see); while `/dbdiagram` self-checks by **trying to turn the description into an SQL file** — exporting clean SQL means the description is certainly valid, and devs can import it right away.

Another shared point: **no look-and-edit over multiple rounds in the chat window.** All three use "code text" that doesn't render as a picture in the chat, so you view the picture from the exported file/website, and if you need a change, call the command again and say what needs fixing — the system understands on its own that it's editing the old version (no duplicates created).

---

## 6. A real-world example — the same data, three ways of using it

**Minh**, a BA in charge of the "flashcard" feature of an English-learning app, encounters three different needs for a data diagram over the feature's lifecycle — and each time he picks a different command for the actual need:

1. **While writing the spec** — he wants to record "what the feature stores" right inside the documentation so devs reading the documentation see it, without opening a separate image file. He uses `/erd`: the picture embeds directly into the documentation, opening it in VS Code shows it right in the middle of the page, no install needed.

2. **While preparing for a meeting with the board of directors** — he needs a **separate image file** to paste into a slide, and wants to try a different drawing style to see if it looks cleaner. He uses `/d2-erd`: it reads the existing `/erd` version (without making him describe it again), draws out a standalone `.svg` image file, and he pastes it directly into the slide.

3. **While handing off to devs to build the database** — he needs to give devs something they can run right away, and the data has a fixed choice list (the card review result can only be "forgot / unsure / remembered"). He uses `/dbdiagram`: it upgrades the data version to real database level, exports a `.dbml` file (he pastes it onto dbdiagram.io for the whole team to view) and a `.sql` file generated directly from that same `.dbml` file (he sends it straight to devs to run and build the database, saving them from retyping it based on the documentation — which is both extra work and prone to drifting out of sync).

The key point: Minh does **not** draw the same thing three times, wasting effort. Using three commands three times is because there were three genuinely different needs — reading in the documentation, pasting into a slide, and handing off to dev — and the three commands each serve exactly those needs. Multiple versions of the same data can exist in parallel; none erases another.

---

## See also

To understand each command in depth, read its own explainer file:

- `explain-skills/erd.md` — `/erd` (Mermaid, embedded directly into the documentation, for BAs/stakeholders to read).
- `explain-skills/d2-erd.md` — `/d2-erd` (D2, same content as `/erd` but a different drawing style, separate image file).
- `explain-skills/dbdiagram.md` — `/dbdiagram` (DBML, closest to dev, exports SQL, shared on dbdiagram.io).

The full diagram-selection rules (for every diagram type, not just data) live at:

- `explain-skills/diagram-selection.md` — a guide pointing the way to pick the right diagram type (human version).
- `.claude/rules/diagram-selection.md` — the original rules (technical version, for the machine).
