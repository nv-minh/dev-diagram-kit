---
type: skill-explainer
skill: journey
updated: 2026-07-26
---

# What is `/journey` and how does it run?

**English** · [Tiếng Việt](journey.vi.md)

## 1. What it is for, and when you should type this command

`/journey` is the command that draws a **user journey map** — a picture that shows **the user's experience over time, step by step, with a feeling attached to every step**.

Picture it like **a travel diary with a mood meter**: the experience is cut into a few phases (touchpoints) — for example Discover, Buy, After purchase — each phase holds a few steps, and every step records two extra things: **who takes part** in that step, and a **satisfaction score from 1 to 5** (1 = frustrated, 5 = delighted). Reading the picture, you see not only what the user goes through but exactly **where the experience hurts** — the low-score steps stand out as the pain points to fix.

A few typical situations where you should use `/journey`:

- You want to see a feature **through the user's eyes, end to end** — not "what functions exist" but "what walking through them feels like": a first purchase, an account signup, filing a support ticket.
- You suspect there are **pain points** in the current experience and want them on paper — a step where users get stuck, retry, or give up.
- You already have use cases for a feature and want the **complementary emotional view**: the use case says what the system offers, the journey says how using it actually feels.

You type a command as simple as:

```
/journey "first-time buyer: from finding the product to receiving the order" --feature checkout
```

The part in quotes is **your plain-language description** of the experience. `--feature checkout` tells the system which feature this belongs to (leave it out and the system guesses; if the feature doesn't exist yet, it names and creates it itself).

**One sentence to remember:** `/journey` draws **the experience plus the emotion across touchpoints** — best when you need to show "what the user walks through, and at which step they suffer."

---

## 2. The whole run — a diagram

Like most Mermaid-based commands in this kit, the picture is **text-based code** embedded in a document — you won't see it in the chat window; open the file in a reader (VS Code / Obsidian / GitHub) and it appears. That's why the run ends with a **trial-render check** before reporting done.

```
 YOU TYPE THE COMMAND
 /journey "describe the experience" --feature X
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 1 — Determine the feature and journey name      │
 │  Guesses the feature from the description; unsure →  │
 │  asks you. Feature doesn't exist → derives a name    │
 │  and creates it.                                     │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the journey correctly                │
 │  Reads the feature's brainstorm / use case files     │
 │  for: the persona (whose journey), the phases in     │
 │  order, the steps, the feeling at each step, who     │
 │  takes part. Still vague → ASKS you in one batch —   │
 │  does NOT invent scores.                             │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 3 — Draw up a "must-have checklist"             │
 │  Every phase + step + its score, listed before       │
 │  drawing — used at the end to check nothing was      │
 │  dropped.                                            │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before writing (asks permission)    │
 │  "Journey for {persona}: N phases, M steps; pain     │
 │  points: ..." — you nod (Y) before it writes.        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 5 — Append to the feature's journey document    │
 │  Adds a "## Journey: {Name}" entry to one shared     │
 │  file — all journeys of a feature in one place.      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 6 — Trial-render, check for syntax errors       │
 │  Renders an image itself to be sure the picture      │
 │  isn't broken when you open it. Error → self-fix,    │
 │  retry (a couple of times).                          │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 7 — Completion report — pain points called out  │
 │  Reports the file, confirms the picture renders,     │
 │  and lists every step scored ≤2 so the pain points   │
 │  aren't buried inside the picture.                   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the map
```

---

## 3. How to read a journey map

Three things make up the picture:

- **Sections (phases / touchpoints).** The experience is grouped into a handful of named phases — Discover, Buy, After... Each becomes one section of the picture. If you find yourself needing many sections, that's a sign it should be split into two journeys.
- **Steps.** Inside each phase, one line per step — what happens, told from the user's side ("Pay at checkout", "Track order").
- **Score + actors.** Every step carries a satisfaction score **1-5** and the actor(s) taking part (the user alone, or the user plus the system/staff). Mermaid colors low scores noticeably redder — the pain literally shows on the picture.

One point worth stating clearly: the **score is the entire value of this diagram type**. A journey map where every step scores 5 is just a prettier process list — it tells you nothing. The system deliberately refuses to default everything to "happy": if it can't tell how a step feels from your description or existing documents, it asks rather than guessing high.

---

## 4. Journey map vs use case — friends, not rivals

The two commands are designed to **complement each other**, describing the same feature from two angles:

| Question | Diagram |
|---|---|
| "What can each kind of user do with the system?" (functions) | `/usecase-diagram` |
| "What does walking through it feel like, and where does it hurt?" (experience + emotion) | `/journey` (this command) |
| "How exactly does the process run, with decisions and branches?" | `/activity`, `/activity-swimlane` |

A common mistake is trying to stuff process detail into a journey map ("then the system validates, then if the card fails..."). That's control-flow — a journey map has no branches or decisions by design. If you catch yourself needing "if/else", switch to the process-diagram commands.

---

## 5. Where it's stored, and how edits work

`/journey` doesn't create a separate file per journey. All journeys of a feature are collected into **one shared document** — `docs/{feature}/srs/{feature}-journey.md` — one `## Journey: {Name}` entry each. Run the command again for a journey that already exists and the system understands it's an **update**: it shows you the changed part "before/after" and only then overwrites — no duplicates.

And because Mermaid doesn't render in chat, there is no "fix it over many rounds in chat" mode: you review **the real picture in the document**, and call the command again when something needs to change.

---

## 6. A real-world example

**Minh**, a BA on the "checkout" feature, keeps hearing support complaints that customers abandon their carts — yet the use case document looks perfectly fine, every function is there. He needs to show the team *where the experience breaks*, not what functions exist.

Minh types:

```
/journey "first-time buyer: search, compare, add to cart, pay, receive the order" --feature checkout
```

1. The feature is clear (`checkout`), so no question there. The system reads the checkout brainstorm and use case files and finds most of the steps — but the documents say nothing about how each step *feels*, so it asks Minh one batched question: which steps are smooth, which are painful, and who takes part in each.

2. Minh answers from support data: search and cart are smooth (4-5), but paying at checkout is painful (2) and retrying after a card error is worse (1).

3. The system lists its must-have checklist — 3 phases, 7 steps with their scores — then previews: *"Journey for first-time buyer → checkout-journey.md: 3 phases, 7 steps. Pain points (≤2): 'Pay at checkout', 'Payment error retry'. Apply?"* Minh types `Y`.

4. It appends the entry to `docs/checkout/srs/checkout-journey.md`, trial-renders the image — passes — and reports done, repeating the two pain steps and suggesting they be linked to an improvement requirement.

Minh opens the file in VS Code: the map starts green, then shows two visibly red steps at payment. In the next planning meeting he doesn't have to argue — the picture makes the case, and "redesign the payment error flow" gets prioritized.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (Mermaid `journey` syntax, the exact steps, special cases), read the source file: `.claude/skills/journey/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/usecase-diagram.md` — the **function view** of a feature (actors + what the system offers); the journey map is its emotional counterpart.
- `explain-skills/activity-family.md` — the **process view** (steps, decisions, branches) — use these when control-flow is what matters.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
