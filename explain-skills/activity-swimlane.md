---
type: skill-explainer
skill: activity-swimlane
updated: 2026-07-14
---

# What is `/activity-swimlane` and how does it run?

**English** · [Tiếng Việt](activity-swimlane.vi.md)

## 1. What it is for, and when you should type this command

`/activity-swimlane` is the command you type when you need to **draw a business process diagram involving many people/many departments**, and you want to see at a glance **who is responsible for which step**.

The key keyword is **"swimlane" — that is, splitting the diagram into "lanes" by role** (let's call it *lane splitting*). Picture a **swimming pool with multiple lanes**: each lane is for one role — the Customer's lane, the System's lane, the Staff's lane, the Manager's lane. Each step of work is placed inside the lane of the person in charge of that step. When work moves from one person to another, the path in the diagram will **"jump lanes"** to the neighboring column. Thanks to that, just glancing down a vertical column tells you right away "who does this part."

A few typical situations where you should use `/activity-swimlane`:

- Drawing a **refund** process: Customer requests → System checks → Staff reviews → Manager approves → System transfers the money. There are as many as 4 roles and they "pass the ball" back and forth continuously.
- Drawing a **multi-level approval** process (e.g. content approval, leave-request approval through several signers).
- Drawing an **onboarding** process (bringing on a new customer/employee) that passes through many departments.

In short: **when a process has 2 or more roles and they interact back and forth many times**, this is the most suitable command — because it's the only tool in the group that keeps "lanes" as fixed straight columns (why, see Section 3).

You type a command as simple as:

```
/activity-swimlane "customer requests a refund, system checks, staff reviews, manager approves" --feature payment
```

**One sentence to remember:** a process with many people, and you want to see clearly who does which step → type `/activity-swimlane`.

---

## 2. The whole run — a diagram

Point to remember: before drawing, the system **asks you to confirm the list of roles**; after drawing, it **opens the image itself to review it** for anything wrong, then reports back to you.

```
 YOU TYPE THE COMMAND
 /activity-swimlane "describe the process" --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 0 — Check conditions for being able to draw       │
 │  Rendering the image is done through the web service  │
 │  plantuml.com, so the machine needs the encoding tool │
 │  + a working connection to it. Missing either one     │
 │  → STOP right away, report in 1 line, does NOT create │
 │  an empty file.                                       │
 └──────────────────────────────────────────────────────┘
        │  (conditions met → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 1 — Find the right feature + read the business  │
 │  The system guesses which feature you're talking      │
 │  about, then reads the existing documentation         │
 │  (description, spec) to understand the steps, the     │
 │  branches, who does what. Missing information →       │
 │  asks you (in business language, not technical         │
 │  language).                                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 2 — ASK TO CONFIRM THE LANES (roles)            │
 │  Because a swimlane always has multiple lanes, the    │
 │  system says: "I found 4 roles: Customer / System /   │
 │  Staff / Manager. Is that complete?" → WAITS for you  │
 │  to nod or add more.                                   │
 │  (Why this step matters: see Section 4.)              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 3 — Ask permission before writing (a summary)   │
 │  The system describes in words: how many lanes it     │
 │  will draw, how many steps, how many decision points, │
 │  where it starts and where it ends.                   │
 │  You type Y (agree) before it continues.               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 4 — Draw + require a SUCCESSFUL RENDER to move  │
 │           on                                            │
 │  The system writes the "diagram description," then    │
 │  sends it to the dedicated drawing website; the       │
 │  website returns an image file. If the description    │
 │  has an error that prevents rendering → fixes itself,  │
 │  redraws (up to 2 times). Only continues once a valid  │
 │  image has been produced.                              │
 │  (The rendering is done by the plantuml.com service.)  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 5 — REVIEW THE IMAGE ITSELF (a special step)    │
 │  Producing an image is NOT enough — the system also   │
 │  opens the image itself and looks with "eyes" to check │
 │  WHETHER IT WAS DRAWN CORRECTLY FOR THE BUSINESS:      │
 │   • do the arrows point the correct direction?         │
 │   • is each step in the correct lane of the person     │
 │     in charge?                                          │
 │   • is any branch cut short (a dead end)?              │
 │  Finds something wrong → fixes itself and redraws      │
 │  (up to 2 rounds).                                      │
 │  (Why this step exists: see Section 5.)                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STAGE 6 — Save the files + report completion          │
 │  Saves 2 things in the feature's srs/ folder: the      │
 │  original .puml (for future edits) + the .svg image.   │
 │  Then embeds the .svg image into the shared flow       │
 │  diagram file (flows.md, shared with other diagrams).  │
 │  Tells you to open the image to view it.                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — you have a swimlane diagram to use in the BA
     documentation
```

Note: this command has **no "back-and-forth editing right in the chat screen" step**. The simple reason: the chat window cannot display the drawn picture (it only sees the raw text). So the system draws it into an image file, reviews it itself to help you (Stage 5), and then you open the image file to view it. To make a change, you type the command again with a description of the change.

---

## 3. Why does there need to be a separate command for "real swimlanes"?

This is the reason this command exists, so it deserves a detailed explanation.

The toolkit already has a sibling command, `/activity` (see "See also"). Both draw process diagrams, but they use **two different drawing tools**, and this is the key point:

- `/activity` uses a drawing tool called **Mermaid**. With this tool, "lanes" are only **a decorative frame drawn for looks** — it doesn't really "hold" steps in place inside their correct lane. When a process has many roles and lots of back-and-forth handoffs, steps **drift around**, lanes get **skewed**, and it looks very messy, making it hard to tell which step belongs to whom.

- `/activity-swimlane` uses a drawing tool called **PlantUML**. This tool is capable of drawing **real lane splitting**: each lane is a **fixed** straight vertical column, and each step is "locked" into the lane of the person in charge of it. No matter how many times the work jumps back and forth between roles, the columns stay straight and aligned, making it very easy to read.

To picture it simply: the lanes of `/activity` (Mermaid) are like chalk-drawn boxes on a playground — there are boundaries for looks, but players still run across into another box. The lanes of `/activity-swimlane` (PlantUML), on the other hand, are like a cabinet with rigid compartments — every item (every step) always sits neatly in the compartment of the person in charge of it, without shifting no matter how many times you take things out and put them back.

That's why, for a **process with many roles and lots of back-and-forth interaction**, `/activity-swimlane` is the **default preferred choice** (marked with ⭐ in the diagram-selection documentation). `/activity` (Mermaid), on the other hand, should only be used for a **compact flow, 1-2 roles, little handoff back and forth**.

---

## 4. Why must it ASK TO CONFIRM the lanes before drawing?

Before drawing, the system stops and asks you: *"I found these roles... is that complete?"* — then waits for your answer. (With swimlane diagrams, this asking step happens almost always, because by nature a lane-split diagram must have 2 or more lanes — with no roles there's no lane to draw at all.)

The reason is very practical: **roles are often hidden in the wording, and are very easily missed**. When you describe a process in words, some participants are not named clearly. For example you say *"customer requests a refund, after the check the money is transferred back"* — hearing this sentence, it sounds like only 1 role (Customer). But actually there are at least 2-3 hidden roles: who "checks"? who "transfers the money"? is an "approving" person needed?

If the system just guesses on its own and draws right away, it might **miss an entire lane** — meaning the diagram is missing an important participant in the process, causing the documentation to be misleading. Missing a lane is more serious than missing a step, because it misrepresents the whole picture of "who is responsible for what."

So the system chooses the safe way: it lists out the roles it recognizes, then lets you — the person who understands the business best — confirm or add to it, **before** putting pen to paper.

---

## 5. Why is there a "review the image itself" step (Stage 5)?

This is the most notably careful step of this command.

After finishing drawing, the system does something most tools skip: it **opens the just-drawn image itself and looks at it with "eyes"** to check it, instead of only doing a mechanical check.

There's an important difference here. Normally a tool can only check "is the description text grammatically correct" — like spell-checking a sentence. But a grammatically correct sentence can still **produce a wrongly drawn picture**: an arrow pointing the wrong way, a step sitting in the wrong person's lane, or a branch running into a dead end with no way out. These errors are only visible **by looking at the picture**, a spell-check cannot catch them.

So the system sets itself a list of questions and reviews each item on the real image:

- Do all arrows point in the correct progression direction?
- Is each step in the correct lane of the person who actually does that step? (e.g. the "transfer money" step must be in the System lane, not the Customer lane)
- Is there any branch that's cut off — leading somewhere with no way out?
- Does each decision point (a yes/no question) have both branch directions present?

If it finds something wrong, it **fixes itself and redraws** (up to 2 rounds) before reporting to you. That means by the time you receive the diagram, it has already been "reviewed" once on your behalf — you have less manual error-catching to do.

---

## 6. A real-world example

**Minh**, a BA in charge of the "payment" feature, is assigned to draw a diagram of the **refund** process for the spec document. The process has many participants passing work back and forth, so he picks `/activity-swimlane`.

Minh opens a terminal and types:

```
/activity-swimlane "customer submits a refund request, system checks whether the order is valid, staff reviews, manager approves if the amount is large, then system transfers the money" --feature payment
```

1. The system immediately recognizes this is the `payment` feature (because Minh wrote `--feature payment` explicitly) and reads the existing documentation for this feature to understand the steps and the branches.

2. The system stops and tells Minh: *"I found 4 roles: Customer, System, Staff, Manager. Is that complete?"* Minh realizes there's still a missing step, "send an email notifying the customer of the result," but the roles are complete at 4, so he replies *"that's complete, but add a step where the system sends a final email"*. The system takes note.

3. The system describes in words what it will draw: *"4 lanes, 8 steps, 2 decision points (Is the order valid? / Does the amount exceed the threshold requiring manager approval?), starting when the customer submits the request, ending when the system sends the email. Agree?"* Minh types `Y`.

4. The system writes the diagram description and sends it to the plantuml.com website to render. The website returns an image file.

5. The system **opens the image itself to review it**. It finds one error: the "transfer money" step is mistakenly placed in the Staff lane, when actually the System is the one that transfers the money. It fixes the description itself, redraws, and reviews again — this time every step is in the correct lane, every branch has an exit.

6. The system embeds the diagram image into the file collecting the flow diagrams for the payment feature, then reports to Minh: *"The refund swimlane diagram is done, 4 lanes / 8 steps / 2 branches, self-review of image: passed. Please open the image file to view it."*

7. Minh opens the image file, sees 4 clearly aligned columns, and can tell at a glance which step belongs to whom. He's satisfied and doesn't need any further changes.

Throughout the whole process, Minh only had to confirm the roles once and nod to approve the drawing once — the image error-checking was already handled by the system on his behalf.

---

## See also

This is one of three commands in the same "process diagram" family. Pick according to your need:

- `explain-skills/activity.md` — the `/activity` command (Mermaid tool): lightest, embeds directly into the documentation and automatically shows the picture on GitHub/Obsidian. Suited to a **compact flow, 1-2 roles**.
- `explain-skills/d2-activity.md` — the `/d2-activity` command (D2 tool): draws a **polished standalone image** to show your boss/client or export as a file.
- `explain-skills/activity-family.md` — a comprehensive comparison of all three commands, to help you pick the right one for each situation.

To see the full technical details (each step, writing rules, special cases), read the source file: `.claude/skills/activity-swimlane/SKILL.md`.
