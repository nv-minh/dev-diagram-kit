---
type: skill-explainer
skill: d2-activity
updated: 2026-07-14
---

# What is `/d2-activity` and how does it run?

**English** · [Tiếng Việt](d2-activity.vi.md)

## 1. What it is for, and when you should type this command

`/d2-activity` is **a third way to draw a process diagram** — alongside `/activity` (using Mermaid) and `/activity-swimlane` (using PlantUML). All three draw the same type of picture: a diagram describing step by step how something runs (where it starts, where it branches, where it ends). What differs is the **drawing tool** behind it — each tool produces a slightly different style, suited to different needs.

The word "D2" in the command name is the name of the drawing tool this command uses. What's notable about D2: you only need to describe the content ("there's step A, step B, it branches here"), while the tool itself handles **arranging the boxes to line up, keeping the lines clean, with no overlaps** (this auto-layout part is called "ELK" — you don't need to remember it, just know it's "the box-arranging machine"). Compared to `/activity` (Mermaid), D2's layout is **cleaner when the process has many branches** — that's the main reason to pick it (explained in detail in Section 3).

A few typical situations where you should use `/d2-activity`:

- Your process **has many branches**, you've already tried drawing with `/activity` (Mermaid) but the picture came out messy — crooked lines crossing each other. Switching to D2 usually lays out more cleanly.
- You want the result to come out as **one image file** convenient for pasting into a slide, a Word/PowerPoint document, or sending by email.

You type a command as simple as:

```
/d2-activity "process where customer places an order, system checks stock, admin approves" --feature order
```

**One sentence to remember:** `/d2-activity` is **the third way to draw a process diagram** (after Mermaid and PlantUML) — a different picture style, laying out more cleanly than Mermaid when there are many branches, producing one image file convenient for pasting into a slide or sending out.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /d2-activity "describe the process" --feature X
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 0 — Check whether the drawing tool is installed  │
 │  The system needs the "D2" tool installed on the      │
 │  machine before it can draw. Not installed → STOPS    │
 │  right away, shows you 1 install command line.        │
 │  Does NOT draw halfway, does not create an empty file.│
 └──────────────────────────────────────────────────────┘
        │  (tool already present → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine which feature is being drawn for   │
 │  Reads your description, guesses which feature it's   │
 │  talking about. Feature doesn't exist yet → picks a   │
 │  name itself and creates it (doesn't require any      │
 │  preparation step from you first).                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Understand the process correctly              │
 │  Reads the feature's existing documentation (if any)  │
 │  to understand the steps, the branches. Missing       │
 │  information → ASKS you, does NOT make up a step that │
 │  doesn't actually exist.                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Confirm the role list (if roles exist)        │
 │  If it detects the process has roles/departments       │
 │  involved, the system LISTS them out: "Found roles:    │
 │  Customer, System, Admin. Is that complete?" — waits   │
 │  for you to nod.                                        │
 │  A single-role process (no lane) → skips this step.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before drawing (asking permission)     │
 │  The system describes in plain words: "will draw N     │
 │  steps, M branches, K roles." You nod (Y) before it     │
 │  continues.                                             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Draw + check that an image was produced        │
 │  The system writes the diagram description, then asks  │
 │  the D2 tool to "really draw" it out into an image      │
 │  file. IF it fails to draw → fixes itself, redraws.     │
 │  Only reports DONE once a complete image has been       │
 │  produced.                                               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Report completion                              │
 │  Gives you the image file path to open in a browser    │
 │  and view.                                               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — you have 1 diagram image file to open and view
```

---

## 3. How is it different from the other two commands?

`/d2-activity` is **just another way to draw** the same type of process diagram — it's not "fancier," not "prettier" than the other two commands. It uses a different drawing tool (D2), producing a somewhat different picture style. You pick it when that style suits your need better, that's all.

The most noticeable difference: how D2 (with the "box-arranging machine" ELK) lays out the picture. When a process has many branches, `/activity` (Mermaid) sometimes lays out **crooked lines that cross through boxes, with crossing points bunching up messily**; whereas D2 usually gives:

- **Right-angle lines, gathered into channels** — instead of every arrow going its own curved way.
- **Boxes aligned in straight columns and rows.**
- **Boxes that don't overlap, arrows that don't cover boxes.**

So if you draw a process with many branches using Mermaid and it looks messy, switching to D2 is worth trying — it lays out in a different style, usually cleaner in that case. (Note: this is compared to Mermaid; if the process has many roles needing lane splitting, `/activity-swimlane` is the suitable choice instead — see Section 5.)

One reassuring point: drawing with `/d2-activity` **doesn't touch or delete** the drawings made by other commands. The same process can have multiple picture versions existing in parallel — that's normal.

---

## 4. Why check the tool, confirm roles, and require "an image was actually produced" before reporting done?

Three small but important details in how this command runs.

**Check the tool first.** Unlike some other commands that run entirely inside the system, `/d2-activity` needs a tool called "D2" installed on your computer before it can draw. So the first thing it does is check: is this tool already installed? If not, it **stops right away and shows you exactly one install command line** — rather than trying to draw halfway and producing a broken file. Like a carpenter checking whether there are enough saws and chisels before taking on a job, instead of accepting it and only then discovering missing tools.

**Confirm the list of roles before drawing.** When it detects the process has roles/departments involved (customer, system, admin, accounting...), the system will **list out the roles it recognizes and ask you "is that complete?"** before starting to draw. Reason: sometimes your description mentions a role faintly, only implied (e.g. "after it's approved" — approved by whom?), which is easy to miss if it just guesses and draws right away. Asking a short question back beats finishing the drawing only to discover an important person is missing. (If the process has only one role, there's no lane to split, so this asking step is skipped.)

**An image must actually be produced before reporting done.** After finishing writing the diagram description, the system asks the D2 tool to "really draw" it out into an image file. If the description has a syntax error preventing it from being drawn, it **reads the error itself, fixes it, redraws** (tries again a few times). It only reports "complete" once there's a proper image file — not reporting done while the image is still missing or opens up blank. This is a commitment: being told it's done means there's really a picture to view.

One thing `/d2-activity` does **not** do: it doesn't have a "draw it, then edit back and forth over multiple rounds right in the chat window" mode. The diagram description cannot be shown as a picture in the chat, so you view the picture from the actual image file that was drawn. To adjust it, you call the command again with your change request, and the system understands on its own that it's editing the old version.

---

## 5. Three siblings that all draw processes — which one to pick?

`/d2-activity` is one of three commands that all draw process diagrams. They differ in their standing point, and picking the wrong one wastes effort. Here's how to tell them apart, for easy memory:

| Command | Best suited when you need... | Characteristics |
|---|---|---|
| **`/activity`** | A picture **embedded directly into the documentation** so GitHub/Obsidian shows it automatically | Convenient, compact for a simple process with 1-2 roles. Gets messy easily with many branches. |
| **`/activity-swimlane`** | A process with **many roles** needing "real lane splitting" (each role its own straight column lane) | The default choice for a multi-role process, with lots of back-and-forth between roles. |
| **`/d2-activity`** | A **different picture style**: lays out **more cleanly than Mermaid with many branches**, produces an **image file** convenient for pasting into slides/sending out | Right-angle lines that don't overlap. Just a different way of drawing, not "better" than the other two commands. |

**A practical note:** when a process has **very many back-and-forth interactions between roles** (steps jumping back and forth between customer — system — admin continuously), D2's way of drawing tends to **pull the lanes far apart, making the picture messy like spaghetti**. In that case `/activity-swimlane` (real lane splitting) is cleaner and clearer. In other words: D2 suits many branches but little crossing between roles; while many roles crossing each other calls for `/activity-swimlane` instead.

(There is one more command, `/bpmn` — drawing according to an international standard for importing into professional process management software. That serves a different purpose, needed only when that standard is truly required, and is not discussed in depth here.)

---

## 6. A real-world example

**Minh**, a BA in charge of the "order" feature, needs to draw the order-processing process. This process **has many branches but little crossing between roles**. He tried drawing with Mermaid but with many branches the picture came out crossing messily, so he switched to `/d2-activity` for a cleaner layout — and he also wanted a separate image file convenient for pasting into a slide.

Minh opens a terminal and types:

```
/d2-activity "customer places an order, system checks stock, if in stock then admin approves the order, if out of stock then notify the customer" --feature order
```

1. The system checks first: is the D2 drawing tool already installed on the machine? Yes — continue. (If not, it would have stopped right away and given Minh one install command line.)

2. The system recognizes this is the `order` feature, and reads this feature's existing documentation to understand the steps and the branches correctly.

3. Because the process has multiple participants, the system lists them out: *"Found 3 roles involved: Customer, System, Admin. Is that complete?"* Minh remembers that "Warehouse" (the department that updates stock) is still missing, so he replies: *"Add the Warehouse role too."* The system takes note — thanks to asking back, this important role wasn't missed.

4. The system describes in plain words: *"I'll draw the order process: 6 processing steps, 2 decision branches ('In stock?', 'Admin approves?'), 4 roles. Drawing with D2 for clean, non-overlapping lines. Apply?"* Minh types `Y`.

5. The system writes the diagram description, then asks the D2 tool to really draw it into an image file. The first drawing attempt has a small error (a label with an unhandled special character) — the system reads the error itself, fixes it, redraws again. This time it produces a complete image.

6. The system reports completion, giving Minh the image file path: `docs/order/d2/order-checkout.svg`. Minh opens it in a browser and sees a clean diagram — right-angle lines, boxes aligned in a row, role lanes clear, no overlapping anywhere.

7. Minh pastes this image file directly into the meeting slide. The diagram is clean, the lines don't cross diagonally, and the board of directors understands it right away.

A few days later, the customer changes their mind and wants to add a step to "send a confirmation email to the customer." Minh just needs to type the command again with that change request — the system understands on its own that it's editing the old version, shows him the change beforehand, and redraws the new picture.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (the diagram-writing formula, how rendering works, special cases), read the source file: `.claude/skills/d2-activity/SKILL.md`.

The sibling commands in the process-drawing family:

- `explain-skills/activity.md` — draws a process with Mermaid, **embeds directly into the documentation** so GitHub/Obsidian shows it automatically.
- `explain-skills/activity-swimlane.md` — draws "real lane splitting" for a process with **many roles**, the default choice when there's lots of back-and-forth interaction.
- `explain-skills/activity-family.md` — an overall comparison of the whole process-drawing command family, helping you pick the right command for each situation.
