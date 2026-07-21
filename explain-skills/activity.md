---
type: skill-explainer
skill: activity
updated: 2026-07-14
---

# What is `/activity` and how does it run?

**English** · [Tiếng Việt](activity.vi.md)

## 1. What it is for, and when you should type this command

`/activity` is the command you type when you want to **draw a process diagram** (or *workflow diagram*) — that picture of boxes connected by arrows, showing "do this step, then go to the next; if yes branch this way, if no branch that way." People in the trade call this type of picture an *activity diagram*. It looks a lot like the familiar flowchart, but it is a more formal type — it can add role-based swimlanes and a few other structures that a basic flowchart cannot; in short, don't treat the two as the same thing.

What is special about `/activity`: it draws using a tool called **mermaid**. You don't need to know what mermaid is to use the command, but a quick understanding helps. Mermaid is **a way to write diagrams as text** — instead of dragging and dropping each box like drawing by hand in PowerPoint, you (or here, the system) just write a few lines of text describing "box A connects to box B," and then a tool reads those lines and **turns them into a picture** when you open the file to view it.

A few typical situations where you should use `/activity`:

- You need to illustrate a simple approval process: "user submits a request → the system checks it → if valid, process it; if invalid, report an error."
- You want to draw a compact business flow (1-2 people/departments involved) and want that picture to **show up right inside the documentation file** when opened on GitHub or Obsidian, without having to attach a separate image file.
- You are writing an SRS (specification document) and want to include a diagram with a few "if... then..." branch points.

You type a command as simple as:

```
/activity "user submits a refund request, the system checks the conditions, if eligible refund it, if not report a rejection" --feature payment
```

The `--feature payment` part just tells the system which feature this diagram belongs to (here "payment"). If you forget to write it, the system guesses from context, and only asks back if it is too ambiguous.

**One sentence to remember:** `/activity` draws a process diagram as text and **embeds it directly into the documentation file**, so the picture appears automatically when the file is opened — best suited for compact processes with few roles.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /activity "describe the process" --feature <name>
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 1 — Understand process + gather info           │
 │  The system reads your description. If the feature   │
 │  already has documentation (use case, SRS), it reads │
 │  that to extract the steps. Wherever the description │
 │  is missing/vague → ASK YOU (what the steps are,     │
 │  which decision points exist, how many roles take    │
 │  part).                                              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 2 — Lock down the "who takes part" list        │
 │  IF the process has multiple roles: the system scans │
 │  the description, guesses them, then ASKS YOU BACK   │
 │  "found N roles: ... complete?" and waits for your   │
 │  nod/additions before drawing (see Section 4).       │
 │  Single-role process → skip this step.               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │   Many roles + tangled back-and-forth interaction?   │
 │  → The system SUGGESTS switching to /activity-       │
 │  swimlane (draws this type better). You may stay on  │
 │  mermaid if you still want it inline.                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 3 — Preview before writing (await your nod)    │
 │  The system summarizes "what diagram it will draw,   │
 │  how many decision points, how many roles, which     │
 │  file to write to" and WAITS for your consent (Y)    │
 │  before touching the file.                           │
 └──────────────────────────────────────────────────────┘
        │
        │  (only continues when you type Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 4 — Draw + write into the docs file            │
 │  The system writes the diagram block (in mermaid     │
 │  text) and appends it to the end of                  │
 │  docs/<feature>/srs/<feature>-flows.md (the same     │
 │  file as the other diagrams for that feature).       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 5 — SELF-CHECK by machine, twice               │
 │  (a) SYNTAX check: run the machine to "compile"      │
 │      the text into an image and see if there         │
 │      are errors (like a spell-check).                │
 │  (b) CONTENT check: verify every decision point      │
 │      / role is present, and there are no "dead       │
 │      branches" (a path that runs then stalls,        │
 │      leading nowhere).                               │
 │  Error → self-fix (max 2 times) then re-check.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 5.5 — Invite "diagram reviewer" (if complex)   │
 │  Only when the diagram is intricate (many roles /    │
 │  many decisions / has loops) does it bring in one    │
 │  dedicated reviewer (the diagram-reviewer agent). A  │
 │  simple diagram skips this.                          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 6 — Completion report                          │
 │  Prints a summary: which file the diagram was        │
 │  written to, how many decision points, how many      │
 │  roles, syntax check OK, and reminds you to open the │
 │  file in IDE/Obsidian/GitHub to view the image.      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
   DONE — to edit, call /activity again; the system
   recognizes the old diagram and enters update mode
```

---

## 3. Its distinctive strength: the picture shows up inside the file, no separate image needed

This is the main reason to choose `/activity` over other ways of drawing diagrams, so it is worth explaining in detail.

Imagine you write a Word document with a diagram in it. The usual way: you draw the diagram somewhere, export it to an image file (.png), then paste the image into Word. The downside: when the process changes, you have to redraw it, export a new image, and paste over the old one — and if someone reads only the text and forgets to include the image, they won't see the picture.

`/activity` does it differently. It does not create an image file. It **writes the diagram description as text right inside the documentation file**. Popular document-reading tools like **GitHub** (where the docs are stored) and **Obsidian** (a note-taking app) both **understand that mermaid text and render it into a picture** every time someone opens the file. This means:

- Picture and text travel together as one block, never getting separated.
- To change the process, you just edit a few lines of text and the picture updates itself — no redrawing and re-exporting an image.
- The reader only needs to open the right file to see the picture, without asking for an extra attachment.

In return, this approach has one limitation: it only looks good when the process is **compact**. That is the reason for Section 4 below.

---

## 4. Why does the system ask back about the "role list" before drawing?

In a process, a "role" is a party that takes part — for example *customer*, *system*, *support staff*, *finance department*. Each role performs some of the steps.

The problem: when you describe a process in natural sentences, sometimes a role is **hidden** in the wording without being named clearly. Take the sentence "after approval is done, the money is transferred" — who transfers the money? It could be the finance department, but the sentence doesn't say so directly. An automatic scan can very easily **miss** a role like that, and if it is missed, a whole part of the diagram will be absent without anyone noticing.

Therefore, **when it detects that a process has multiple roles**, `/activity` does not confidently draw as soon as it finishes scanning. It **scans out the list of roles and asks you back**: *"Found 2 roles taking part: Customer, System. Complete, or is someone else involved?"* — and waits for you to confirm or add. (If the process has only a single role, there is no "lane" to split, so this question step is skipped.) This is a general principle of the whole toolkit: important decisions are asked of a human, not silently guessed.

**When does it advise you to switch to another tool?** If the process has 3 or more roles and the steps keep jumping back and forth between roles continuously, mermaid's way of drawing will **get skewed and cluttered** — each role's "lanes" won't line up, and arrows overlap each other. At that point `/activity` proactively suggests: *"This process has many roles, better switch to `/activity-swimlane` for a cleaner look"* (a sibling tool that can draw straight, column-aligned "lanes" for each role). You still have the right to stay with `/activity` if what matters to you is that the picture is embedded directly in the file.

---

## 5. Why is there a "self-check by machine, twice" step?

Because mermaid writes diagrams as text, there is a risk: write one wrong bracket or one odd character, and the whole diagram **won't render** when the file is opened — it just shows a confusing block of text. Worse, unlike many other commands, `/activity` **cannot show you a preview of the picture right in the chat window** (the chat window doesn't know how to render a mermaid image — it can only show the raw text). That means if it is written wrong, you will only discover it when you open the file yourself and see the broken picture.

To avoid that scene, after writing the diagram into the file, `/activity` **runs a machine check twice, of two different kinds**:

1. **Syntax check (compile):** the machine tries to "translate" the text into a picture to see if there are any writing errors — like turning on spell-check before sending an email. If there is an error, the system fixes it itself (up to 2 times) then tries again. If two fixes still fail, it clearly tells you where the error is rather than silently leaving a broken file while reporting "done."

2. **Content check (full coverage):** this is a different kind of check — not whether the text is spelled correctly, but whether **anything was left out of the drawing**. Specifically: every decision point you mentioned (each "if... then...") has appeared in the picture; every role locked down in Section 4 is present; and importantly there are no **"dead branches"** — that is, no path that runs halfway then stalls, not leading to an end point.

The point to remember: **"written with correct syntax" doesn't necessarily mean "drawn with complete content."** A diagram can render nicely and still be missing a role, or have a "reject" branch drawn halfway then left hanging. That is why both must be checked.

---

## 6. When is a "diagram reviewer" brought in?

For a compact diagram, the two machine self-checks above are enough. But when the diagram is **intricate** — many roles, many decision points, or has loops (the "redo, retry" kind) — then `/activity` brings in a **dedicated diagram reviewer** (an agent named *diagram-reviewer*, which you can picture as a colleague who specializes in going back over pictures for you).

This reviewer reads the diagram just drawn and compares it against the list of things that should be there, to catch subtle errors the machine easily overlooks: a role missing its lane, a branch forgotten in the drawing, a decision point missing one of its directions. If the reviewer finds a serious error, the system fixes it itself and re-checks, for up to a few rounds.

This reviewer is **only brought in when the diagram exceeds a complexity threshold** (roughly: 3 or more roles, or 5 or more decision points, or decisions nested several layers deep, or a loop). A simple diagram skips this step for speed.

---

## 7. There is no "back-and-forth editing right in the chat" step

Some other drawing commands let you preview right in the chat window and then edit over multiple rounds until you're happy. `/activity` **deliberately does not do that**, and the reason is very simple: as noted in Section 5, the chat window can't render a mermaid picture — it only shows the raw text, and looking at raw text, you can't judge whether the picture is good or bad, right or wrong.

So the correct workflow is: the system writes the diagram into the file → you **open the file (in an IDE, Obsidian, or GitHub) to view the real picture** → if you want to change something, you **call `/activity` again** and say what needs fixing. When you call it again through that same workflow, the system recognizes "ah, this diagram already exists," enters update mode by itself, and shows you the changed part (before/after) before overwriting.

---

## 8. A real-world example

**Mai**, a BA in charge of the "payment" feature, needs to draw a diagram for the refund process to put into the SRS document. She opens a terminal and types:

```
/activity "customer submits a refund request, the system checks whether the order is still within the refund window, if within window then refund and send a confirmation email, if expired then report a rejection" --feature payment
```

1. The system reads the description and recognizes the feature is `payment`. It sees the process is clear enough, so it doesn't need to ask much more about the steps.

2. The system scans out 2 roles — *Customer* and *System* — then asks Mai back: *"Found 2 roles taking part: Customer, System. Complete, or is someone else involved (e.g., a finance department approving manually)?"* Mai replies: "That's all, the system refunds automatically without manual approval."

3. Because there are only 2 roles and the interaction is simple, the system does **not** suggest switching to another tool — `/activity` is a reasonable choice.

4. The system summarizes for Mai: *"I'll add the refund process diagram to docs/payment/srs/payment-flows.md, with 1 decision point (within refund window or not) and 2 roles. Agree? (Y / edit)"* Mai types `Y`.

5. The system writes the diagram block and appends it to the end of flows.md.

6. Right after, the machine self-checks twice: syntax check — tries to translate the text into a picture, no errors (reports "compile OK"). Content check — the decision point "within window?" has both "within/expired" branches, both lead to an end point, no dead branches. Complete.

7. This diagram is compact (only 1 decision point, 2 roles), so the system doesn't need to bring in a diagram reviewer.

8. The system prints a report: *"Added the refund diagram to payment-flows.md. 1 decision point, 2 roles, syntax check OK, no dead branches. Open the file in IDE/Obsidian/GitHub to view the picture. Call /activity again if you need to edit."*

9. Mai opens the file on GitHub, and the picture appears right inside the document — no separate image file needed. She notices a "log the transaction" step is missing, so she types `/activity` again with the added description; the system recognizes the old diagram, shows her the newly added part (before/after), and only then overwrites.

Throughout the whole process, Mai was never subjected to the system arbitrarily drawing something wrong and writing it blindly into the file — every write had a confirmation step, and the picture was always machine-checked before it reported done.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (each step, command format, special cases), read the source file: `.claude/skills/activity/SKILL.md`.

`/activity` has 2 siblings in the same "activity family" — they also draw process diagrams but with a different tool, suited to different situations:

- **`explain-skills/activity-swimlane.md`** — draws straight, column-aligned "lanes" for each role, a better choice when the process has many roles interacting in a tangle (exactly where `/activity` gets skewed).
- **`explain-skills/d2-activity.md`** — draws a POLISHED standalone picture (as an image file) to show your boss/client or export for a report, when you don't need it embedded directly in the documentation.
- **`explain-skills/activity-family.md`** — a comparison table of all 3 tools above, to help you choose quickly which one to use.
