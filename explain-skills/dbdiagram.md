---
type: skill-explainer
skill: dbdiagram
updated: 2026-07-14
---

# What is `/dbdiagram` and how does it run?

**English** · [Tiếng Việt](dbdiagram.vi.md)

## 1. What it is for, and when you should type this command

`/dbdiagram` also draws a **data diagram** (the picture of "what kinds of information this feature stores, and how they connect to each other") — like `/erd` and `/d2-erd`. But it's the **closest-to-dev sibling** among the three commands: what it produces isn't just for looking at, but is meant to be **handed straight to developers to build a real database**.

Picture three levels of the same data picture:

- `/erd` — a drawing **for reading in the documentation** (drawn Mermaid-style, embedded directly), enough for BAs and stakeholders to understand.
- `/d2-erd` — **the same content as `/erd`, just a different drawing style** (using the D2 tool), producing a separate image file.
- `/dbdiagram` — a drawing **for devs to build the database** — detailed down to the real data types of the database, along with a "table-creation code" file (SQL) that devs can run to create the data structure immediately.

The defining feature of `/dbdiagram`: it produces a file in a database-description language called **DBML**, which you can **bring to a website called dbdiagram.io** (or dbdocs.io) — paste it in and it immediately produces a visual diagram on the web, with a link you can share with the whole team. It also exports an accompanying **SQL** file — the exact "table-creation recipe" for devs to build the real database.

A few typical situations where you should use `/dbdiagram`:

- You need to **hand off the data structure to devs** to build the database — you want to give them something they can import and run immediately, not something they have to retype.
- The feature has complex data — many **fixed choice lists** (e.g. order status can only be "pending / paid / cancelled") or you need to mark **duplicate-prevention rules** — which the other two commands cannot express.
- You want a data diagram **shared on the web** (via dbdiagram.io / dbdocs.io) so the whole team can view and comment on it together.

You type a command as simple as:

```
/dbdiagram --feature flashcard
```

**One sentence to remember:** `/dbdiagram` is the data drawing **closest to dev** — detailed down to the real database level, comes with a table-creation code file (SQL), and can be viewed/shared on the dbdiagram.io website.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /dbdiagram --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 0 — Check whether the tool is installed           │
 │  The system needs a small tool (@dbml/cli) installed  │
 │  on the machine to check and export the SQL file.     │
 │  Not installed → STOPS right away, shows you 1 install│
 │  command line. Doesn't do it halfway.                 │
 └──────────────────────────────────────────────────────┘
        │  (tool already present → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine which feature is being worked on    │
 │  Reads your request, determines the feature. Feature  │
 │  doesn't exist yet → picks a name itself and creates  │
 │  it (doesn't require any preparation step from you     │
 │  first).                                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Get the "data picture" correctly               │
 │  Prioritizes reading an existing data diagram (if      │
 │  drawn previously with /erd) and upgrading it to real  │
 │  database level. Not present → reads the spec. Still   │
 │  not present → ASKS you what kinds of information       │
 │  exist, what's stored, how they relate. Does NOT make  │
 │  up tables on its own.                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Preview before writing (asking permission)     │
 │  The system describes in plain words: "will create N   │
 │  tables, M relationships, and the choice lists /        │
 │  duplicate-prevention rules (if any)." You nod (Y)      │
 │  before it proceeds.                                     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Write file + CHECK by actually exporting SQL   │
 │  The system writes the description file (DBML), then   │
 │  asks the tool to try TURNING IT INTO A REAL SQL FILE.  │
 │  If SQL comes out that means the description is valid, │
 │  devs can import it. Errors → fixes itself, tries       │
 │  again. Only reports DONE when clean SQL is exported.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Report completion                              │
 │  Gives you 2 files: the description (.dbml) to paste   │
 │  onto dbdiagram.io to view the diagram, and the .sql    │
 │  file for devs to create the DB.                        │
 │  Records it in the feature's tracking log.               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — you have a description to view on the web + a
     SQL file for devs
```

---

## 3. The two files you receive — how to use them

`/dbdiagram` doesn't embed a picture into the documentation like `/erd`, nor does it create an image file like `/d2-erd`. It produces **two files that can actually be put to use**, and here's how you (or your dev) use them:

**File one — the description (`.dbml` extension).**
This is the "original" written in the database-description language (DBML). By itself it's text, not yet a picture. To see it as a picture: you open the **dbdiagram.io** website, **paste the entire content of this file into it** — the website immediately draws out the diagram, which can be zoomed in/out and shared via a link with the whole team. (Or bring it to dbdocs.io to turn it into a database documentation page that can be commented on.) To edit later, you edit this `.dbml` file and paste it again.

**File two — the table-creation code (`.sql` extension).**
This file is for **devs**. It's exactly the "recipe" for the computer to create the actual data structure in the database. A dev takes this file, runs it into the database management system, and out come the tables exactly as described — no need to sit and retype it from scratch based on the documentation (which is both extra work and prone to drift out of sync with the documentation).

> **A point easily confused, worth clarifying right away:** the command name is `/dbdiagram` (named after the dbdiagram.io website for easy memory), but the file it produces has a `.dbml` extension — because "DBML" is the name of the *language*, while "dbdiagram.io" is the name of the *viewing tool*. Don't go looking for a file with a `.dbdiagram` extension — there isn't one.

---

## 4. Why is this command ALLOWED to go deep into database technicalities, while the others are not?

This is a point worth explaining clearly so you understand the command's role correctly.

This toolkit has a general principle: the commands meant for BAs usually **keep everything at the business level**, without diving into the technical details of the database. `/erd` and `/d2-erd` follow this exactly — they record information at a compact, easy-to-understand level.

But `/dbdiagram` **deliberately differs**: because its purpose is to **hand off to devs for building a real database**, it *must* go deeper — using the database's actual real data types, adding **fixed choice lists** (e.g. an order status can only be one of "pending / paid / cancelled," no odd values allowed), adding **duplicate-prevention rules** and **default values**. This isn't scope creep — this is precisely the reason this command exists: it's the layer closest to dev, so it's allowed to be as detailed as devs need.

Still, there's one place where it **keeps to the BA principle**: it does **not** make you answer technical database-person questions (like "what data type does this column use," "how many characters long"). You only need to describe the business meaning — for example "email is the contact address," "amount is the order price" — while **picking the right data type for the database** is handled automatically by the system. In other words: it *produces* something detailed-for-dev, but it doesn't *make you think* like a dev.

---

## 5. Why "only reports done once an SQL file can be exported"? (Step 4)

This is how `/dbdiagram` checks its own quality, and it's a bit different from how the other diagram-drawing commands self-check.

The image-drawing commands (`/erd`, `/d2-erd`) self-check by "trying to draw it out as an image and seeing if a picture comes out." `/dbdiagram`, on the other hand, self-checks by **trying to turn the description into a real SQL file**. Reason: if the description has something wrong somewhere (e.g. a table pointing to another table that doesn't exist, or a choice list used before being declared), then the tool will **fail to export SQL** — it reports the error right away.

This is a very trustworthy test: **producing clean SQL means the description is certainly valid, and devs can import it into the database right away** — rather than "it looked correct but when the dev tried it, an error turned up." If the first attempt has an error, the system reads the error itself, fixes the description, tries again a few times. It only reports "complete" once clean SQL has been exported.

Like a chef who doesn't just look at a recipe and say "must be tasty," but **cooks a test batch** to make sure the recipe actually works before handing it to the head chef.

One thing `/dbdiagram` does **not** do: it doesn't have a "edit back and forth over multiple rounds right in the chat window" mode — because the description doesn't show up as a picture in the chat. You view the picture by pasting the `.dbml` file onto dbdiagram.io. To adjust it, you call the command again with your change request — the system understands on its own that it's editing the old version, shows you the changed part, and then records it and exports a new SQL file.

---

## 6. Three siblings that draw the "data picture" — which one to pick?

`/dbdiagram` is one of three commands that all describe a feature's data. They differ in **who views it and uses it for what** — here's how to tell them apart, for easy memory:

All three draw **the same kind of content** (tables + relationships) — differing in **which style they're drawn in** and **how detailed they get**.

| Command | Main difference | Who views / uses it for what |
|---|---|---|
| **`/erd`** | Mermaid style — **embedded directly into the documentation**, shows automatically when opened, no tool install needed | BA/stakeholder reading in the documentation |
| **`/d2-erd`** | **The same content as `/erd`, only a different drawing style** (the D2 tool instead of Mermaid) — produces a separate image file | anyone who prefers this drawing style, or needs an image file separate from the documentation |
| **`/dbdiagram`** (this command) | Goes **deeper technically** — real database types, choice lists, duplicate-prevention rules, **exports SQL code** for devs to build the database; view/share on dbdiagram.io | dev / database engineer implementing it |

Quick pick:

- Just need to quickly see how the data relates in the documentation → `/erd` (or `/d2-erd` if you prefer that drawing style — the two only differ in drawing style, neither is better than the other).
- Need to **hand off to dev, export SQL, or share the diagram on the web** (especially when the data has many choice lists / duplicate-prevention rules) → use `/dbdiagram` (this command) — this is a difference in *level of detail*, not drawing style.

**An honest note:** `/dbdiagram` isn't "the fanciest one you should always use." For a small feature with just 2-3 tables where you just want to quickly see how they relate, `/erd` is enough and lighter. `/dbdiagram` truly shines when you need to **hand off to dev, export SQL, or describe complex data** (many choice lists, duplicate-prevention rules, default values) that the other two commands can't express. Pick according to your actual need, not according to "which one is most detailed."

---

## 7. A real-world example

**Minh**, a BA in charge of the "flashcard" feature of an English-learning app, has just finished the business description and needs to **hand off the data structure to the dev team** so they can start building the database. He wants to give the devs something they can import and run right away, while also having a diagram on the web for the whole team to view together.

Minh opens a terminal and types:

```
/dbdiagram --feature flashcard
```

1. The system checks first: is the necessary tool installed on the machine? Yes — continue. (If not, it would have stopped right away and given Minh one install command line.)

2. The system recognizes this is the `flashcard` feature, and finds that he previously drew a data diagram with `/erd`. It reads that version and **upgrades it to real database level** — without making him describe everything again from scratch. While reading, it notices the feature has a "card review result" that can only be one of three values (forgot / unsure / remembered), so it prepares to create a fixed choice list for it.

3. The system describes in plain words: *"I'll create a database schema for flashcard: 4 tables (user, deck, card, review session); 3 main relationships; 1 choice list for review result (forgot / unsure / remembered); 1 quick-lookup rule by card + review time. Apply?"* Minh types `Y`.

4. The system writes the description file (DBML), then tries turning it into an SQL file to check it. The first attempt has a small error (the "review result" choice list wasn't declared before being used) — the system reads the error itself, fixes it, tries again. This time it exports a clean SQL file, meaning the description is valid.

5. The system reports completion, giving Minh two files: `docs/flashcard/dbdiagram/flashcard.dbml` (the description) and `flashcard.sql` (the table-creation code). Minh opens the dbdiagram.io page, pastes the `.dbml` file's content in — the diagram appears right away, and he copies the share link for the whole team to view. As for the `.sql` file, he sends it straight to the dev; the dev runs it and the database structure is built, matching the documentation 100%.

A few days later, the business adds a feature to "tag decks with labels." Minh just needs to type `/dbdiagram --feature flashcard` again and mention the new "Label" table — the system understands on its own that it's updating the old version, shows him the change beforehand, records it, and exports a new SQL file.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (the DBML-writing formula, how SQL is exported, special cases), read the source file: `.claude/skills/dbdiagram/SKILL.md`.

The sibling commands in the data-description family:

- `explain-skills/erd.md` — draws a data diagram **embedded directly into the documentation** so GitHub/Obsidian shows it automatically (lightweight, for BAs to read).
- `explain-skills/d2-erd.md` — **the same content as `/erd`, only a different drawing style** (using the D2 tool instead of Mermaid), producing a separate image file.

Other diagram-drawing commands in the same toolkit:

- `explain-skills/sequence.md` — draws **an exchange between multiple parties over time**.
- `explain-skills/state.md` — draws **the state lifecycle** of an object.

Choosing the diagram type:

- `explain-skills/erd-family.md` — a quick comparison of all 3 data-drawing commands (`/erd`, `/d2-erd`, `/dbdiagram`), to help you pick the right one.
- `explain-skills/diagram-selection.md` — a guide pointing the way for **every diagram type** (when you don't yet know which one you need).
- The original rules (technical version, for the machine): `.claude/rules/diagram-selection.md`.
