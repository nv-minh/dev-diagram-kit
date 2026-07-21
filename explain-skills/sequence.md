---
type: skill-explainer
skill: sequence
updated: 2026-07-14
---

# What is `/sequence` and how does it run?

**English** · [Tiếng Việt](sequence.vi.md)

## 1. What it is for, and when you should type this command

`/sequence` is the command that draws a **sequence diagram** — a type of picture that shows **who talks to whom, in what order in time**, within a business flow.

Picture it like **the script of a conversation**: a few "actors" stand as vertical columns across the top of the picture (for example: Customer, Screen, System, Momo payment gateway), and each horizontal arrow shows "what this one sends to that one" — read from top to bottom in the exact order events happen. Who calls first, who answers after, where it branches (this way on success, that way on error) — all of it shows up clearly along the timeline.

A few typical situations where you should use `/sequence`:

- You want to describe a flow **with several parties going back and forth** — for example a login flow (Customer → Screen → System → checks then returns a result), a payment flow (with an external payment gateway added in), a flow receiving a notification from a partner (webhook).
- The flow has a **clear order in time** and you want readers to see "which step happens first, which happens after."
- The flow has an **error branch** — for example "if payment succeeds show a thank-you page, if it fails/times out show an error message."

You type a command as simple as:

```
/sequence "customer taps pay, the system calls the Momo gateway, Momo reports back the result" --feature payment
```

The part in quotes is **your plain-language description** of the flow. The `--feature payment` part tells the system which feature this flow belongs to (if you leave it out, and the project only has one feature in progress, the system will guess it).

**One sentence to remember:** `/sequence` draws **the exchange between multiple parties along a timeline** — best suited when you need to make clear "who calls whom, what gets returned, in what order, and how it branches on error."

---

## 2. The whole run — a diagram

A thing worth remembering about `/sequence`: the picture it draws is **text-based code** (Mermaid) embedded directly into the document — meaning you don't see the picture right in the chat window; you have to open the document (in a document reader like VS Code / Obsidian / GitHub) for the picture to appear. That's why the system has a step that **draws a trial image to check** before reporting done — making sure the picture isn't broken when you open it.

```
 YOU TYPE THE COMMAND
 /sequence "describe the flow" --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine which feature this flow belongs to │
 │  Reads the description, guesses the feature. Not sure │
 │  → asks you. Feature doesn't exist yet → names it     │
 │  itself and creates it (doesn't make you prepare      │
 │  anything beforehand).                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Understand the flow correctly                │
 │  Reads existing documentation of the feature (use     │
 │  case, spec...) to gather: which "actors" exist, what  │
 │  they exchange in what order, whether there are error  │
 │  branches.                                             │
 │  Description still vague → ASKS you (who takes part?   │
 │  are there error/timeout/cancel branches?) — does NOT  │
 │  make things up.                                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Draw up a "must-have checklist" for later     │
 │  Before drawing, the system lists out 3 things itself: │
 │   • the actors that will appear                        │
 │   • the main steps in order                            │
 │   • the branches (error/timeout/cancel), each numbered │
 │  This list is used at the end to CHECK COVERAGE.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before writing (asks permission)      │
 │  The system describes in words: "will add flow X to    │
 │  the document, with N actors, M steps, K branches."    │
 │  You nod (Y) before it writes to the file.             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Write the diagram into the feature's shared   │
 │          document                                      │
 │  Adds a new entry to the feature's "flows" file        │
 │  (doesn't create a separate file, keeps everything in  │
 │  one easy-to-find place).                              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Trial-render an image, check for syntax       │
 │          errors                                        │
 │  Since the picture doesn't show in chat, the system    │
 │  "trial-renders" an image itself to make sure it can   │
 │  actually be drawn. Error → self-fix, try again         │
 │  (a few times). Only moves on once a picture comes out. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Check coverage: was ENOUGH content drawn?     │
 │  Compares the picture just drawn against the           │
 │  "must-have checklist" from Step 3:                     │
 │   • are all actors present?                            │
 │   • are all main steps present?                        │
 │   • are all error branches present, labeled correctly?  │
 │  Missing something → self-fills it in then redraws.    │
 │  (Rendering ≠ rendering with complete content — these   │
 │  are two different things.)                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 8 — Bring in a "diagram reviewer" (only when the  │
 │          flow is COMPLEX)                              │
 │  If the flow has many branches / many actors / has     │
 │  callbacks (webhook, timeout), the system invites a     │
 │  dedicated technical diagram reviewer to check it       │
 │  over. Simple flow → skip.                             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 9 — Completion report                             │
 │  Reports which file the flow was added to, that the    │
 │  picture renders, and that content coverage was         │
 │  checked. Logs it in a tracking record.                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the picture
```

---

## 3. What do the "actors" and "arrows" in the diagram mean?

This section helps you **read and understand** a sequence diagram, even if you are not a technical person.

**Actors (standing as vertical columns across the top of the picture).** Each column is a party taking part in the flow. There are two kinds:

- **A real person** — for example "Customer", "Approving staff." Usually shown with a person icon in the picture.
- **A system / department** — for example "Screen", "System", "Momo payment gateway." Shown as a rectangle box in the picture.

One small point: if your description mentions a specific person's name (e.g. "Ms. Lan taps the button"), the system will **convert it to a generic role like "Customer"/"User"** — because the diagram describes a role, not an individual.

**Arrows (horizontal lines between the columns).** Each arrow is "one party sending something to the other," read top to bottom in time order. This set of documentation uses a **convention for easier reading**:

- **A solid arrow** = one party **requests / calls** the other to do something (e.g. Customer taps "Pay," sending to Screen).
- **A dashed arrow** = **the result returned** (e.g. System returns "success" to Screen).

> **A spot commonly misunderstood, worth stating clearly:** solid / dashed here is **only to distinguish "outgoing call" from "returned result"** for easier reading — it does **not** carry the technical meaning of "synchronous / asynchronous" that some people used to reading UML diagrams might assume. This is the team's convention for readability, not a technical term.

**Branch blocks.** When the flow has several possible outcomes, the picture will show a surrounding frame divided into a few sections — for example: *"If payment succeeds"* as one section, *"If the customer cancels or it times out"* as another. This lets the reader see both the normal path and the path when something goes wrong.

---

## 4. Why "trial-render an image" and "check coverage" (Steps 6 and 7)?

These are two important self-check steps, and they're what makes the difference between "reported done but the picture is broken" and "reported done and it's actually usable."

**Why trial-render an image (Step 6)?**
A sequence diagram is stored as **text-based code** — that is, a piece of text in its own syntax, meant for a document reader to turn into a picture automatically when you open it. The problem: that piece of code can have a small syntax mistake (a missing character, a mismatched bracket), so that when you open the document, **the entire diagram block shows an error and nothing appears at all**. And because the picture can't show inside the chat window, if the system doesn't self-check, you'll only discover the error when you open the file yourself — by then the effort is wasted. So the system **trial-renders an image itself** right after writing; if it fails to render, it reads the error itself, fixes it, and tries again a few times — only reporting done once it's certain the picture renders.

**Why check content coverage (Step 7)?**
This is a subtle point: **a picture rendering successfully (correct syntax) doesn't mean the picture was drawn with complete content.** For example, your description might mention a branch "if the payment times out, report an error," but while drawing, the system could accidentally omit that branch — and the picture still renders normally, with no error reported. If no one checks this, you'd end up with a diagram that looks fine but is missing an important scenario.

That's why the system reuses the "must-have checklist" drawn up in Step 3 (which actors, which steps, which branches must be present) to **inspect each item to see if the picture covers it**. Whatever is missing gets added back in and redrawn. It's like finishing an essay and then rechecking the outline to see if all the intended points were covered, rather than just checking "is the grammar correct."

---

## 5. Who "reviews" the diagram when the flow is complex? (Step 8)

For **simple** flows (few actors, running straight through), the two self-checks above are enough — the system doesn't invite anyone else in, to avoid slowing things down.

But when the flow is **complex** — with many branches (3 or more error branches), or many parties involved (4 or more actors), or branches nested within branches, or a "call back later" pattern (webhook, waiting for a timeout) — the system invites a **dedicated technical diagram reviewer** (you can picture it as a colleague skilled at reading diagrams, brought in to check the work over).

This reviewer specializes in catching errors that self-checks easily miss: a missing actor, an error branch mentioned in the description but not yet drawn, a path that leads somewhere then "dead-ends" going nowhere, a branch point missing one of its possibilities. If the reviewer finds a serious gap, the system fixes it itself and redraws, up to a few rounds.

This approach balances things: **simple flows move fast, complex flows get checked thoroughly** — not every flow is forced through the same heavyweight review process.

---

## 6. Where is this diagram stored, and how does it differ from other diagram types?

`/sequence` **does not create a separate file** for each flow. Instead, it gathers all the flows of the same feature into **one shared document** (the feature's "flows" file). Each time you draw another flow, it adds a new entry to the end of this document — so all flows of a feature stay in one place, easy to look up.

An important rule: **a sequence diagram must NOT be stuffed into the Use Case document.** The reason is that these two kinds of documents sit at different "altitudes":

- **Use Case** describes the business from the user's point of view ("what does the customer want to achieve, what's the expected outcome") — readable at a glance, no technical detail attached.
- **Sequence diagram** goes into the detail of "which side calls which side" — closer to how the system actually operates.

Mixing the two together would make business readers get lost in technical detail, while technical readers still have to jump to another file to get the full picture. So they're kept separate: Use Case in one place, sequence diagrams in the "flows" document. If you ask to "draw the sequence diagram inside the use case," the system will decline and explain this reason.

As for choosing the right diagram type: `/sequence` is one of many diagram-drawing commands. In short, here's how to tell them apart:

| You need to show... | You should use |
|---|---|
| Multiple parties **exchanging back and forth over time** (calling out, returning) | `/sequence` (this command) |
| A process **step by step, with branches** (who does which step) | the process-diagram command group (`/activity`, `/activity-swimlane`...) |
| The **state lifecycle** of an object (order: pending → paid → delivered) | `/state` |
| The **data picture** (what data tables exist, how they relate) | `/erd`, `/d2-erd` |

---

## 7. Why does this command NOT "draw over and over across many rounds in chat"?

Some drawing commands (for example the command that draws a screen wireframe using characters) let you see the result right in the chat window and then say "fix this bit, fix that bit" across many rounds in a row. `/sequence` **deliberately does not do that**, and there's a good reason:

A sequence diagram is stored as text-based code, and **that code does not render into a picture inside the chat window** — chat only prints out the raw code; looking at a pile of characters, you can hardly "review" whether the picture is good or bad, complete or lacking. Letting you "fix it over many rounds" on something you can't see a picture of would be pointless.

Instead, the more sensible approach is: the system writes the picture into the document, self-checks that it renders and is complete, and then you **open the document in a reader** (VS Code / Obsidian / GitHub) to see the real picture. To make a change, you **call the command again** and say what needs changing — the system automatically understands it's editing the existing flow (doesn't create a duplicate), shows you the changed part "before/after," and only then overwrites.

In other words: you review from **the real picture in the document**, not from the code in chat — so the edit loop happens by calling the command again, not by editing in place in chat.

---

## 8. A real-world example

**Lan**, a BA in charge of the "payment" feature, needs to clearly describe the flow of a customer paying via Momo for developers to understand — especially making sure they see clearly what happens when the payment **fails or times out**, not just the happy path.

Lan opens a terminal and types:

```
/sequence "customer taps pay, the system creates a request then hands off to Momo, Momo reports back the result via webhook; handle success, failure, and timeout cases" --feature payment
```

1. The system recognizes this is the `payment` feature (Lan specified it clearly) — no need to ask again.

2. The system reads the existing documents of `payment` to understand the flow correctly: which parties take part, what order they exchange in, what error branches exist.

3. Before drawing, the system draws up a "must-have checklist" itself: 4 actors (Customer, Screen, System, Momo); the main steps (tap pay → create request → hand off to Momo → Momo reports back); and 3 branches (success / failure / timeout), each branch numbered separately.

4. The system describes in words: *"I'll add the 'Pay via Momo' flow to payment's flows document: 4 actors, about 8 steps, 3 branches (success / failure / timeout). Apply?"* Lan types `Y`.

5. The system adds a new entry to the file `docs/payment/srs/payment-flows.md` — where all flows for the payment feature are gathered.

6. The system trial-renders an image to check syntax. The first attempt has a small error; the system reads the error itself, fixes it, redraws — this time producing a complete picture.

7. The system checks coverage against the "must-have checklist": all 4 actors present? — yes. All main steps present? — yes. All 3 branches present? — it finds the "timeout" branch's label is a bit unclear, adjusts it to match the description, and redraws once more.

8. Because this flow has 4 actors, 3 branches, and a webhook (callback later), the system invites the **diagram reviewer** to check it over. The reviewer confirms no branch dead-ends and no party is missing — good.

9. The system reports done: the "Pay via Momo" flow has been added to `payment-flows.md`, the picture renders, and coverage was checked for all 4 actors / main steps / 3 branches. Lan opens the file in VS Code and sees the diagram show up clearly — both the smooth payment path and the two failure branches. She sends it to the developer, who immediately understands what to handle when Momo reports failure or doesn't respond.

A few days later, the business rules change: a step needs to be added for "send a receipt email to the customer after successful payment." Lan just types the command again with that change request — the system automatically understands it's editing the existing flow, shows her the changed part "before/after," and only then overwrites, without creating a duplicate flow.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (Mermaid syntax, how the picture is checked, steps 1-10, special cases), read the source file: `.claude/skills/sequence/SKILL.md`.

Other diagram-drawing commands in the same toolkit:

- `explain-skills/state.md` — draws the **state lifecycle** of an object (order: pending → paid → delivered). Different from `/sequence`: a state diagram draws *the states one object passes through*, while `/sequence` draws *multiple parties exchanging with each other over time*.
- `explain-skills/activity-family.md` — the group of commands that draw **process diagrams** (step by step how something runs, who does which step).
- The full rule for choosing a diagram type (when to use a sequence diagram, when to use another type) lives in the source file: `.claude/rules/diagram-selection.md`.
