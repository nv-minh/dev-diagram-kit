---
type: skill-explainer
skill: erd
updated: 2026-07-14
---

# What is `/erd` and how does it work?

**English** · [Tiếng Việt](erd.vi.md)

## 1. What it's for, and when to type this command

`/erd` draws a **data diagram** — the technical term is ERD (Entity-Relationship Diagram). In plain words: it's a picture describing **what kinds of information your feature needs to store, and how those kinds of information relate to one another**.

Picture each "kind of information" as a table: the "Customer" table (stores email, phone number, creation date...), the "Order" table (stores amount, status, which customer it belongs to...), the "Transaction" table (stores the payment result, which order it belongs to...). The data diagram draws these tables as boxes, lists the pieces of information in each table, then connects them with lines carrying business annotations — for example "one Customer **places** many Orders", "one Order **generates** many Transactions". One glance and you grasp the feature's data picture.

What makes `/erd` distinctive: the picture it draws can be **embedded directly into the feature's documentation**, and it **renders as a picture automatically** when you open the document in a common reader (VS Code / Obsidian / GitHub) — no extra tool to install, no separate image file. The diagram sits together with the other business descriptions, which is convenient for whoever reads the document.

A few typical situations for using `/erd`:

- You want a data diagram that **sits right inside the feature's spec document**, so anyone who opens the document sees it — no need to open a separate image file.
- The feature has a few kinds of information to store and you want to record "how they connect to each other" for the devs and for your own later reference.

Type a simple command like:

```
/erd --feature payment
```

The `--feature payment` part tells the system which feature to draw the data diagram for. (If you leave it out, and the project has only one feature in progress, the system guesses it; with several features it asks you to choose.)

**One sentence to remember:** `/erd` draws the **data picture** of a feature and **embeds it directly into the document** — perfect when you want the diagram to live alongside the spec, render automatically when the document is opened, with no external tool needed.

---

## 2. The full flow — diagram

The thing to remember about `/erd`: the picture it draws is a form of **text code** (Mermaid) embedded in the document — meaning you don't see the picture right in the chat window; you open the document and only then does the picture appear. That's why the system has a step to **render a trial image and self-inspect it** before reporting done — ensuring the picture both renders and is correct.

```
 YOU TYPE THE COMMAND
 /erd --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Identify which feature you're drawing for   │
 │  Read your request, identify the feature. Several    │
 │  features, unclear → ask you to pick. Feature not yet│
 │  created → auto-name it and create new (no prep).    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Get the "data picture" right                │
 │  Read the existing spec docs to extract the tables to│
 │  store. Missing info → ASK you: what kinds of        │
 │  information exist, what each stores, how they link. │
 │  DON'T invent tables, don't guess relationships.     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Preview before writing (ask permission)     │
 │  The system describes in words: "will draw N data    │
 │  tables (Customer, Order...), M main relationships". │
 │  Only writes to the document once you nod (Y).       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Write the diagram into the feature's doc    │
 │  Add the diagram to the feature's data file          │
 │  (embedded directly, no separate image file).        │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Render a trial image + SELF-INSPECT         │
 │  Since the picture doesn't show in chat, the system  │
 │  renders a trial image. Syntax error → self-fix,     │
 │  retry. Once it renders, it OPENS THE IMAGE and      │
 │  checks by eye:                                      │
 │   • enough tables?                                   │
 │   • are the relationship lines the right DIRECTION?  │
 │   • are the notes readable, not covered up?          │
 │  Wrong → self-fix and redraw. (Renders ≠ correct.)   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Report done                                 │
 │  States which file the diagram went into, that it    │
 │  renders and was self-inspected. Logs it into the    │
 │  feature tracker.                                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the picture
```

---

## 3. How to read a data diagram (for non-technical people)

This part helps you **understand the picture just by looking**, with no database knowledge needed.

**Each box is a "table" — one kind of information to store.** For example: the "Customer" table, the "Order" table. The table name sits at the top of the box.

**Inside each box are rows — the pieces of information of that table.** Each row is one piece of information. Next to each row there's usually an annotation spelling out its business meaning — for example "email — contact address, unique", or listing the possible values ("status: pending | confirmed | paid | cancelled").

**A few rows are marked with an abbreviation at the end:**

- **PK** (primary key) — the row used to tell each record apart so none collide (like an ID number distinguishing each person). Each table usually has one such row.
- **FK** (foreign key) — the row that "points to" another table to create a relationship. For example the "Order" table has a row pointing back to the "Customer" table to know whose order it is.

**The connecting lines between boxes** — each line is a relationship, with a business annotation ("places", "generates", "owns"...). At the end of the line there's a small symbol indicating whether the relationship is **"one-to-many"** or **"one-to-one"** — for example one Customer places *many* Orders. (These symbols are a bit hard to read for newcomers, but the text annotation always states the nature of the relationship, so just read the annotation and you'll understand.)

Overall, this diagram answers the question: *"What kinds of information does this feature store, and how do they connect to one another?"*

---

## 4. One thing to make clear: an ERD is allowed a little "light technicality"

This document set has a general principle: commands meant for BAs **don't ask you the technical questions of database programmers** (like "what data type is this column", "how many characters long", "is it indexed"). `/erd` keeps that principle when it **interviews** you — it only asks in business language ("what information does this table store", "how does it relate to that table").

However, one point needs clarifying to avoid misunderstanding: **the ERD itself is inherently a somewhat technical kind of picture** — so when drawing, the system **automatically** assigns each piece of information a "type" at a light, easy-to-understand level: text, number, money, datetime, true/false. This isn't role drift — it's how a standard ERD still expresses things. You **don't need** to supply these types; the system handles it, while you only describe the business meaning.

What the system **deliberately doesn't do** on this diagram: it doesn't go into the deep details of the database (specialized data types, indexes, optimization plans, security/encryption notes). Those are the job of the dev/database engineer at implementation time. If you need a diagram that goes that deep — with real database types, indexes, and exportable command code for handoff — that's the job of the `/dbdiagram` command (see Section 6).

---

## 5. Why "render a trial image then self-inspect" (Step 5)?

This is the most important self-check step, the difference between "reported done but the picture is broken/wrong" and "reported done and it's usable".

**Part 1 — render a trial to catch syntax errors.** The diagram is saved as **text code** for the document reader to turn into a picture. That code can have one small mistake written wrong that makes **the whole picture block error out and show nothing** when you open the document. And since the picture doesn't show in the chat window, if the system didn't self-check, you'd only discover the error when you open the file yourself — a waste of effort. So the system renders a trial image; if it doesn't render, it reads the error, fixes it, and retries a few times.

**Part 2 — open the image and look, to catch content errors.** This is the subtle point: **a picture that renders (correct syntax) doesn't mean the picture is correct.** A common error with data diagrams is **drawing a relationship backwards** — for example intending to draw "one Customer has many Orders" but drawing "one Order has many Customers" instead. This error still shows the picture normally, with no syntax error reported, but the content is entirely wrong. A syntax checker can't catch this kind of error — only "looking with your eyes" catches it.

So after it renders, the system **opens the image and self-inspects**: enough tables, are the relationship lines the right direction (is one-to-many placed at the correct end), are there any meaninglessly duplicated rows, are the notes obscured. Wherever it's wrong, it self-fixes and redraws. Like writing a sentence and then reading it aloud to see if it flows, not just checking spelling.

---

## 6. Three siblings that all draw the "data picture" — which to pick?

`/erd` is one of three commands that all describe a feature's data. They differ in **who reads it and what it's used for** — picking wrong wastes effort. Here's an easy way to tell them apart:

All three draw **the same kind of content** (tables + relationships) — differing in two things: **which drawing style** and **how much detail**.

| Command | Main difference | Who reads it / what for |
|---|---|---|
| **`/erd`** (this command) | Mermaid style — **embedded directly in the document**, renders automatically when opened, no tool to install | BA/stakeholder reading in the document |
| **`/d2-erd`** | **Same content as `/erd`, only a different drawing style** (the D2 tool instead of Mermaid) — produces a separate image file (`.svg`), needs the D2 tool installed | anyone who prefers this style, or needs an image file separate from the document |
| **`/dbdiagram`** | Goes **deeper technically** — real database types, choice lists, indexes, **exports SQL code** for handoff | dev / database engineer implementing |

Quick way to choose:

- **`/erd` and `/d2-erd` are two drawing styles of the same thing** — choose by display preference: want it embedded directly in the document (no install needed) → `/erd`; want a separate image file or to try a different layout style → `/d2-erd`. Neither is "prettier" — they're just two styles, use whichever suits your eye.
- Only when you need to **hand off to devs and export SQL** (data has many choice lists, indexes) do you step up to `/dbdiagram` — this is a difference of *detail level*, not drawing style.

---

## 7. Why does this command NOT "redraw over many rounds in the chat"?

Like the other diagram commands that use text code, `/erd` **deliberately does not** let you "revise over many rounds right in the chat" — for a simple reason: **that text code doesn't render into a picture in the chat window**; the chat just prints a pile of raw characters that you can hardly "review" to tell whether the picture is right or wrong. Letting you revise many rounds on something whose picture you can't see is pointless.

Instead: the system writes the picture into the document, self-checks that it renders and self-inspects that it's correct, and then you **open the document in a reader** to see the real picture. To revise, you **call the command again** and say what needs changing — the system understands it's editing the old version (no duplicate), shows you the "before/after" of the changes, and only then overwrites.

---

## 8. A real example

**Lan**, a BA in charge of the "payment" feature, needs to clearly record "what kinds of information this feature stores" right inside the spec document, so devs see it as soon as they read the document, without opening a separate image file.

Lan opens the terminal and types:

```
/erd --feature payment
```

1. The system recognizes this is the `payment` feature (Lan stated it clearly) — no need to ask again.

2. The system reads `payment`'s existing spec docs and extracts the data tables: Customer, Order, Transaction, Payment Method. There's a spot where the relationship between "Order" and "Transaction" — one-to-one or one-to-many — is unclear, so the system asks; Lan answers "one order may generate several transactions (first payment fails, retries on the second)".

3. The system describes in words: *"I'll draw the data diagram for payment: 4 tables (Customer, Order, Transaction, Payment Method); 4 main relationships (Customer places Order, Order generates Transaction, Transaction uses Payment Method, Customer owns Payment Method). Apply?"* Lan types `Y`.

4. The system writes the diagram into the file `docs/payment/srs/payment-erd.md` — embedded directly, no separate image file.

5. The system renders a trial image. It compiles on the first try, so the system opens the image and inspects: are all 4 tables there? — yes. Are the lines the right direction? — it checks and finds the "Customer – Order" line is correct (one customer, many orders), but one relationship's annotation wrapped long and covered a corner, so the system shortens the annotation and redraws it tidier.

6. The system reports done: the diagram was written into `payment-erd.md`, it renders and was self-inspected. Lan opens the file in VS Code and sees the diagram appear right in the middle of the document — 4 tables, information rows with annotations in Vietnamese, PK/FK columns clearly marked. She sends the document to the devs, who read it and immediately understand the data structure, no extra questions needed.

A few days later, the business adds a "discount voucher" function. Lan just types `/erd --feature payment` again and mentions adding a "Discount Voucher" table — the system understands it's updating the old diagram, keeps the existing tables, adds the new one, shows her a preview of the changes, and only then overwrites.

---

## See also

This document only explains the idea and the flow at an accessible level. For the full technical details (Mermaid syntax, how the picture is checked, steps 1-10, edge cases), read the source file: `.claude/skills/erd/SKILL.md`.

Sibling commands in the data-describing family:

- `explain-skills/d2-erd.md` — **same content as `/erd`, only a different drawing style** (uses the D2 tool instead of Mermaid), producing a separate image file.
- `.claude/skills/dbdiagram/SKILL.md` — a data diagram **closer to programming** (real database types, SQL export), used when handing off to devs.

Other diagram commands in the same toolkit:

- `explain-skills/sequence.md` — draws an **exchange between multiple parties over time** (who calls whom, what's returned).
- `explain-skills/state.md` — draws the **state lifecycle** of an object.

Choosing a diagram type:

- `explain-skills/erd-family.md` — a quick comparison of all 3 data-drawing commands (`/erd`, `/d2-erd`, `/dbdiagram`), to help pick the right one.
- `explain-skills/diagram-selection.md` — a routing guide for **all diagram types** (when you don't yet know which one you need).
- Source rule (technical version, for machines): `.claude/rules/diagram-selection.md`.
</content>
</invoke>
