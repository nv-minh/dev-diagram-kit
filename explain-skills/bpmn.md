---
type: skill-explainer
skill: bpmn
updated: 2026-07-14
---

# What is `/bpmn` and how does it work?
**English** · [Tiếng Việt](bpmn.vi.md)

## 1. What it's for, and when to run this command

`/bpmn` is a command that draws process diagrams following **an international standard called BPMN** (short for "Business Process Model and Notation" — modeling business processes). Compared with the other process-drawing commands, `/bpmn` is not "more advanced" — it serves **a different need**: when you don't just need a picture to look at, but a standards-compliant file to bring into professional process-management software.

What does "BPMN is an international standard" mean? It means it has a **unified set of symbols that process practitioners all over the world read the same way** — a circle is a start/end point, a diamond is a branch (gateway), a rounded rectangle is a task, and "lanes" divide things by role. Like traffic signs: no matter the country, people see it and understand it, with no need to explain again.

A few typical situations where you should use `/bpmn`:

- A business process that is **complex, with many steps and many roles** (multi-level approvals, onboarding new customers/employees, refunds across several departments) — that needs to be drawn properly.
- You need a file that **opens in professional process-management software** (Camunda, Bizagi, draw.io) so the technical team can bring it into a system that runs the real process, or so you can **drag-and-drop edit** it further.
- You work with a partner/client already used to reading BPMN diagrams who expects to receive exactly that type.

Run a simple command like:

```
/bpmn "customer submits a refund request, staff reviews it, manager approves, system transfers the money" --feature payment
```

> **One line to remember:** `/bpmn` draws a process following an **international standard**, producing a file that **opens in process-management software + is drag-and-drop editable** — use it for complex business flows that need to be done properly.

---

## 2. How is this different from `/activity-swimlane`? (read first so you don't pick the wrong one)

This is the most important question, because `/bpmn` and `/activity-swimlane` are **very similar** — both draw multi-role processes with "lanes" divided by who is responsible. Picking the wrong one wastes effort.

How to tell them apart: think about **the ultimate purpose of the diagram**.

- **`/activity-swimlane`** produces a **picture to read** — embedded in BA documents, for people to look at and understand the process. Light, fast, and enough for most everyday business-description cases.
- **`/bpmn`** produces a **standards-compliant process file to "run" or edit further** — not just to look at, but for the technical team to import into process-management software, or for you to drag-and-drop edit as you would in a professional drawing tool.

An analogy: `/activity-swimlane` is like a **nice hand drawing** pinned to the wall for the whole team to see; `/bpmn` is like a **standards-compliant technical drawing** submitted to a contractor for actual construction.

Rule for choosing:
- If you only need to **describe the process in a document** for readers to understand → use `/activity-swimlane` (lighter).
- A business flow that is **complex and needs to be done properly**, or needs an **international standard / import into process software / drag-and-drop editing** → then move up to `/bpmn`.

---

## 3. The whole run flow — diagram

The most distinctive thing about `/bpmn` is how it draws: **the AI does not draw the picture itself; it only describes the business; a separate "drawing engine" handles the picture.** And before drawing, there is a step that **self-checks the process for soundness**. These two things are explained in detail in Sections 4 and 5.

```
 YOU RUN THE COMMAND
 /bpmn "process description" --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 1 — Find the feature + understand the process   │
 │  Guess which feature you mean; read existing docs     │
 │  (use case, spec) to get the steps, roles, and        │
 │  branches. Missing info → ASK you (in business        │
 │  language, not technical questions).                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 2 — Record a "structured description"           │
 │  The AI does NOT draw. It only writes a tidy          │
 │  description: what roles, what steps, what branches,  │
 │  what outcomes. (This is called the "IR" — see Sec 4.)│
 │  Plus a "cross-check" listing roles/branches/errors   │
 │  drawn from the source docs, to verify later.         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 3 — Preview before writing (ask permission)     │
 │  Summarize in words: how many roles, steps, branches, │
 │  outcomes, and which docs the business is covered by.  │
 │  You type Y (agree) before it goes on.               │
 └──────────────────────────────────────────────────────┘
        │  (only continues when you type Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 4 — THE ENGINE SELF-CHECKS soundness (semcheck) │
 │  Before drawing, it inspects the description: is there │
 │  a start and an end point? does every step have a     │
 │  path to the goal (no "orphan" steps)? does each      │
 │  branch have at least 2 directions? Bad logic → stop, │
 │  fix it. (Why it matters: see Section 5.)            │
 └──────────────────────────────────────────────────────┘
        │  (sound → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 5 — The "drawing engine" builds the standard    │
 │  A separate tool (engine) reads the description then   │
 │  computes each box's position, draws the lines, lays  │
 │  out the lanes — producing a standards-compliant BPMN │
 │  diagram file. The AI does NOT touch this.           │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 6 — Final check + report completion            │
 │  Run the check once more to be sure (clean logic, no  │
 │  overlapping shapes). Also create an HTML page so you │
 │  can DRAG-AND-DROP edit the diagram like a pro tool.  │
 │  Tell you: open that page to view/edit, or import the │
 │  file into Camunda.                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
   DONE — a standard BPMN diagram + a drag-and-drop page to edit
```

---

## 4. The core point: "the AI describes the business, the engine handles the drawing"

This is the smartest design in `/bpmn`, and also the reason it's trustworthy. It deserves a thorough explanation.

With the other drawing commands, the AI both understands the business and writes out the picture. But `/bpmn` **fully separates those two jobs**:

1. **The AI only does what it's good at: understanding the business.** It reads the docs, then writes out a "structured description" — listing: what roles this process has, what steps, who does each step, what branches there are, and what outcomes they lead to. This description has **only business content, not a single coordinate or line.** (In the technical docs this description is abbreviated "IR" — you don't need to remember the name.)

2. **A separate "drawing engine" does the rest: building the picture.** This engine reads the description then computes each box's position, draws the lines so they don't overlap, and lays out the lanes neatly. The AI **never touches the position calculations.**

Why separate them? Because these are **two very different kinds of work, and the AI is only good at one.** The AI understands business very well, but if you force it to compute "put this box at coordinate x=120, y=340" it very easily goes wrong — the picture ends up with overlapping shapes and crossing lines. Conversely, the "drawing engine" computes coordinates extremely accurately but doesn't understand the business. Match the right worker to the right job: the AI handles meaning, the engine handles form.

A practical benefit: when you want to change the process later, the AI only needs to **edit the business description** (add a step, change a branch), then the engine redraws the new picture on its own — no drawing by hand from scratch.

---

## 5. What does the "self-check for soundness" (semcheck) step do?

Before allowing the drawing, `/bpmn` runs a special check that the other commands don't have at this level — it checks whether **the described process is logically sound.** This is not a spell-check, but a check of "can this process actually run".

It inspects a few basics that a correct process must have:

- **Is there a clear start point and end point?** A process must know where it begins and where it ends.
- **Does every step have a path to the goal?** There must be no "orphan" step — meaning one that is drawn there but has no path leading to it, or that you enter and then get stuck, never reaching the end.
- **Does each branch have at least two directions?** A branch point (for example "approve or not?") that has only one way out is meaningless — it must have at least two (approve → this way, reject → that way).

If the process violates these, the system **stops and fixes it** before drawing, rather than producing a logically wrong diagram.

There is also another layer of checking called **"coverage cross-check"**: the system compares the description against the source docs to see whether anything was **left out** — for example the docs mention 4 roles but the description has only 3, or there is an error case in the docs not yet represented. If it spots a mismatch, it warns so the author can review. This is how it ensures the drawn diagram **matches the real business**, with nothing missing and nothing extra.

---

## 6. What the result includes — especially the "drag-and-drop page to edit"

`/bpmn` creates not just one picture but a set of files. The two most notable ones for you:

- **A standard BPMN diagram file** — this is a genuinely standards-compliant file, **importable into process-management software** (Camunda, Bizagi, draw.io). The technical team takes this file into their system to run the real process, or opens it to edit further.

- **An HTML page for drag-and-drop editing** — this is very handy: open this page in a browser and you get a **drawing tool like bpmn.io** (a well-known BPMN drawing tool) right in the browser. You can **drag-and-drop the boxes, edit labels, add steps** directly with the mouse, then download the edited file. That means after the system finishes drawing, you can still actively adjust it by hand if you want — you're not "locked in".

(Along with these come a few supporting files: the business description from Section 4 so you can revise later, and an index file listing the processes drawn for the feature.)

A small note: this drag-and-drop page needs **internet access the first time** to download the drawing tool (like many modern web pages). After that it works normally.

---

## 7. A real example

**Lan**, a BA in charge of the "payment" feature, is assigned to draw the **refund** process — but this time the technical team wants a standard BPMN file to bring into the company's process-management software, not just a picture to look at. So she chooses `/bpmn`.

Lan types:

```
/bpmn "customer submits a refund request, the system checks the order, staff reviews it, a manager approves if the amount is large, the system transfers the money" --feature payment
```

1. The system recognizes the `payment` feature, reads the existing docs (the refund use case) to get the steps, roles, and branches.

2. It writes out a "structured description": 4 roles (Customer, System, Staff, Manager), 7 steps, 2 branches ("Is the order valid?", "Does the amount exceed the limit requiring manager approval?"), 2 outcomes (money transferred successfully / rejected). Plus a cross-check drawn from the source docs.

3. The system summarizes for Lan in words: *"I'll create a BPMN for the refund process: 4 roles, 7 steps, 2 branches, 2 outcomes — covering all 4 roles and both branches from the use case. Agree?"* Lan types `Y`.

4. Before drawing, the engine self-checks soundness: there is a clear start (customer submits request) and end (2 outcomes); every step has a path to the goal; both branches have two directions. Clean logic. The cross-check also matches — no role or branch missing versus the docs.

5. The "drawing engine" reads the description and builds the picture on its own: computing each box's position, drawing lines without overlaps, laying out straight lanes — producing a standard BPMN file. Lan doesn't have to adjust anything.

6. The system does a final check (clean), then reports to Lan: *"The refund BPMN is done. Open the file `payment-bpmn-editor.html` to view and drag-and-drop edit; or drag the `.bpmn` file into Camunda to import it into the system."*

7. Lan opens the drag-and-drop page and sees a standards-compliant diagram with 4 clear lanes. She wants to rename one step to fit the business better, so she drag-and-drop edits it directly with the mouse then downloads it. Then she sends the `.bpmn` file to the technical team to import into their process software.

Throughout, Lan only described the business and confirmed once — the system handled the standards-compliant drawing and the logic checks, and she can still actively adjust by hand at the final step.

---

## See also

This document only explains the idea and run flow at an easy-to-understand level. To see the full technical detail (the 2-layer architecture, how the engine builds lanes, the edge cases), read the source file: `.claude/skills/bpmn/SKILL.md`.

`/bpmn` is one of a group of commands that all draw processes — each fits a different need (none is "more advanced" than another):

- `explain-skills/activity-swimlane.md` — `/activity-swimlane`: also divides into lanes by role but **lighter**, for describing the business in documents (no need for the OMG standard / process software). This is the default choice for everyday multi-role processes.
- `explain-skills/activity.md` — `/activity`: quick drawing with Mermaid, embedded straight into documents, good for compact processes.
- `explain-skills/d2-activity.md` — `/d2-activity`: a third way to draw, laid out more compactly than Mermaid when there are many branches, producing a standalone image file.
- `explain-skills/activity-family.md` — a comprehensive comparison table, helping you pick the right command for each situation.
