---
type: skill-explainer
skill: code-flow
updated: 2026-07-26
---

# What is `/code-flow` and how does it run?

**English** · [Tiếng Việt](code-flow.vi.md)

## 1. What it is for, and when you should type this command

`/code-flow` is the command that **reads a piece of real, existing code** — one function, one method, one module — and draws a **flow diagram** of how it behaves, with every element in the picture stamped with **where in the code it came from** (`file:line`).

Picture it like asking a careful colleague: *"walk me through what this function actually does."* Instead of an answer from memory, you get back a picture — who calls whom, where it branches, what happens on error — and **every arrow in the picture carries a page reference** pointing to the exact line of code it was read from. You can check any claim yourself.

This makes it fundamentally different from the other drawing commands in this kit:

- `/sequence`, `/activity`, `/state` draw a picture **from your plain-language description** — you tell the story, the system draws it.
- `/scan-project` reads code too, but it draws the **whole codebase's architecture** — the big map.
- `/code-flow` reads code, but for **one single target** — the close-up of one function or module.

A few typical situations where you should use `/code-flow`:

- You've **inherited code nobody documented** — you need to understand what `placeOrder` really does before touching it.
- You're doing BA work on an existing system and need to **document actual behavior**, not intended behavior — the code is the only source of truth left.
- You suspect the code **drifted away from the spec** — a diagram traced from the code, with line references, settles the argument.

You type a command as simple as:

```
/code-flow src/orders/placeOrder.ts
/code-flow OrderService.placeOrder --as state
```

The first part is the **target** — a file path or a function/class name. The optional `--as` forces a specific diagram type; leave it out and the system picks the type that fits what the code actually does (more on that in section 3).

**One sentence to remember:** `/code-flow` turns **one piece of existing code** into **one flow picture with page references** — the honest answer to "how does this function actually work?"

---

## 2. The whole run — a diagram

The run has **two phases with a hard stop in the middle**: first the system *reads* (touching nothing), then it stops and asks you, and only after your yes does it *draw*.

```
 YOU TYPE THE COMMAND
 /code-flow <file-or-function> [--as sequence|activity|state]
        │
        ▼
═══ PHASE 1 — READ AND TRACE (touches nothing) ═══
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Pin down exactly which code you mean         │
 │  Searches the codebase for the target. One match →    │
 │  proceed. Several functions share the name → lists    │
 │  them and ASKS which one — it does not guess.         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — A separate "reader" traces the code          │
 │  A read-only helper reads the target plus one level   │
 │  of the calls it makes, and returns findings with     │
 │  file:line evidence: the call chain in order ·        │
 │  branches/loops with conditions · any status field    │
 │  and its transitions · external touchpoints (DB,      │
 │  queue, 3rd-party). Each finding is marked ✅ read    │
 │  directly or 🔵 inferred (see section 4).             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Pick the diagram type that fits the code     │
 │  Mostly a call chain over time → sequence.            │
 │  Mostly branching/loops → activity.                   │
 │  Mostly a status machine → state.                     │
 │  (Skipped if you forced one with --as.)               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — HARD STOP: preview, ask permission           │
 │  "Traced <target>. It is mostly <X> → I'll draw a     │
 │  <type> diagram, N steps. 🔵 Inferred: <list>.        │
 │  Draw?" — Y / edit / switch type. NOTHING written yet.│
 └──────────────────────────────────────────────────────┘
        │  (you say Y)
        ▼
═══ PHASE 2 — DRAW ═══
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Write the diagram into the document          │
 │  Mermaid text-code, using the same drawing formula    │
 │  as /sequence, /activity, or /state.                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Trial-render, check for syntax errors        │
 │  Same self-check as /sequence: renders a trial image  │
 │  so the picture is guaranteed to appear when opened.  │
 │  Error → self-fix, retry a couple of times.           │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Append the provenance table                  │
 │  Under the diagram: one row per diagram element →     │
 │  the file:line it came from → ✅ or 🔵 confidence.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 8 — Completion report                            │
 │  Which file, which type, picture renders — and the    │
 │  list of 🔵 inferred spots needing a human eye.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the picture
```

---

## 3. How does it choose which kind of picture to draw?

You give `/code-flow` a target, not a diagram type — and different code deserves different pictures. So the system looks at **what the code actually spends its lines doing** and picks accordingly:

| The code is mostly… | It draws | Why that shape fits |
|---|---|---|
| **Calling across layers** — controller calls service calls repository calls an external gateway | **sequence** | the interesting part is *who calls whom, in what order, what comes back* |
| **Branching and looping** — many if/else, a switch, retry loops | **activity** | the interesting part is *which path the logic takes and where it forks* |
| **Flipping a status field** — an order going `pending → paid → cancelled` | **state** | the interesting part is *which states exist and what event moves between them* |

When in doubt, it defaults to **sequence** — the most common shape of "how does this work." And you always hold the override: `--as state` forces a state diagram even if the system would have picked something else, and at the hard stop (Step 4) you can say "switch type" before anything is drawn.

One deliberate limit worth knowing: the trace follows the target plus **one level** of the calls it makes. If `placeOrder` calls `PaymentService.charge`, the diagram shows that call — but it does **not** explode everything `charge` does internally (that's noted as "→ …"). This keeps the picture at the right altitude: a readable close-up of one function, not an accidental map of the whole system. Want the inside of `charge`? Run `/code-flow PaymentService.charge` as its own target.

---

## 4. What is the "provenance table," and why the ✅ / 🔵 marks?

This is the feature that gives `/code-flow` its honesty, so it deserves its own section.

Under every diagram, the system appends a **Code provenance table**: one row per diagram element, mapping it to the exact place in the code it was read from:

```
| Diagram element         | Code location               | Confidence |
|-------------------------|-----------------------------|------------|
| BE → DB: INSERT order   | src/orders/placeOrder.ts:42 | ✅         |
| → PaymentService.charge | src/orders/placeOrder.ts:51 | 🔵 inferred |
```

**Why bother?** Because a diagram of code is a set of *claims* about the code — "this function writes to the database," "on failure it goes here." A hand-drawn diagram makes you take those claims on faith. A diagram with provenance makes every claim **checkable**: open the file, jump to the line, see for yourself. When the code changes later, the table also tells you exactly which lines to re-check.

**The two confidence marks:**

- **✅ read** — the system read that exact line and saw it with its own eyes.
- **🔵 inferred** — the system could **not** fully read it, and is saying so out loud. This happens when a call goes through an interface (the concrete implementation isn't obvious from the text), crosses into another repository, or is dispatched dynamically.

> **The rule behind the marks, stated plainly: the system never fabricates.** If a call can't be traced, it appears as 🔵 with "needs confirmation" — it is never silently invented to make the picture look complete. A diagram with two honest 🔵 gaps is worth more than a seamless diagram containing one confident lie, because the 🔵 marks tell you exactly where to spend your five minutes of human review. The completion report repeats the 🔵 list for the same reason.

---

## 5. Why does a separate "reader" trace the code, and why the hard stop?

**Why a separate reader (Step 2)?** Tracing code means opening many files — the target, its callees, the types they use. If all of that raw text piled into the main conversation, the assistant's working memory would fill with code listings and the actual reasoning would degrade. So the reading is delegated to a **read-only helper** that digests the files and returns only the distilled findings — call chain, branches, states, external touchpoints, each with its `file:line`. The main thread stays clean and does the thinking. The helper is read-only by design: **Phase 1 can never modify your code or your documents**, no matter what.

**Why the hard stop (Step 4)?** Because tracing is the expensive, error-prone half — and you are the only one who knows whether the trace *matches reality*. The preview tells you what was found, what type it will draw, and — crucially — where the 🔵 uncertain spots are, **before** anything is written. If the system misidentified the target, picked the wrong diagram type, or missed a branch you know exists, you correct it here, at the cheapest possible moment. Drawing first and asking later would waste a render on a wrong premise.

---

## 6. How is it different from `/scan-project` and `/sequence`?

Three commands sound similar; the differences are sharp:

| | `/sequence` (and friends) | `/code-flow` (this command) | `/scan-project` |
|---|---|---|---|
| **Source of truth** | your plain-language description | the **code itself** | the code itself |
| **Scope** | one business flow | **one function / module** | the **whole codebase** |
| **Output** | one diagram in the feature's flows doc | one diagram **+ provenance table** | a full architecture set |
| **Best question it answers** | "how *should* this flow work?" | "how does *this function* actually work?" | "how is *this system* put together?" |

A handy way to hold it: `/scan-project` is the **satellite photo**, `/code-flow` is the **street-level close-up**, `/sequence` is the **artist's sketch from your description**. They complement rather than replace each other — a common combo is `/scan-project` once when joining a codebase, then `/code-flow` on each hairy function you're about to touch. That's also why `/code-flow` refuses to zoom out into an architecture diagram: wrong altitude for this tool.

---

## 7. What if the target is ambiguous, huge, or not a flow at all?

A few situations the command handles deliberately, worth knowing in advance:

- **The name matches several places.** `placeOrder` exists in three files → the system lists all three and asks which one. It does not guess — a perfect diagram of the wrong function is worse than a question.
- **The target is a god-function or a whole directory.** It traces the entry point plus one level, marks deeper calls as "→ name", and suggests running `/code-flow` on the sub-targets you care about. Similarly, recursion is marked "↺ self-call" instead of drawing an endless loop.
- **The target isn't a flow.** A pure data structure (a DTO, a config file) has no behavior to trace — the system says so and points you to `/erd` (data shape) or `/d2-architect` (structure) instead of forcing a meaningless flow picture.
- **You run it again on the same target.** It recognizes the existing diagram and enters **update mode** — shows you what changed before overwriting, never creates a duplicate. Same review loop as `/sequence`: you review from the real picture in the document, and re-run the command to change it.

---

## 8. A real-world example

**Minh**, a developer who just took over the order module of a five-year-old system, is asked by his BA to explain what actually happens when a customer places an order — the old spec says one thing, but nobody trusts it anymore.

Minh opens a terminal and types:

```
/code-flow src/orders/placeOrder.ts
```

1. The system finds exactly one `placeOrder.ts` — no ambiguity, it proceeds.
2. The read-only reader traces the function plus one level of its calls. It comes back with: a call chain (validate → reserve stock → charge payment → write order → publish event), two branches (payment failure, out-of-stock), and one call it can't fully resolve — `notifier.send(...)` goes through an interface, concrete class unclear → marked 🔵.
3. The code is mostly a call chain across layers → the system picks **sequence**.
4. Hard stop: *"Traced `placeOrder` (src/orders/placeOrder.ts:18). Mostly a call chain → I'll draw a sequence diagram: 9 messages, 2 branches. 🔵 Inferred: the concrete notifier behind `notifier.send`. Draw?"* Minh checks the 🔵 spot — he happens to know it's the email adapter — and types `Y`.
5. The system writes the sequence diagram into `docs/orders/code-flow/place-order-flow.md`.
6. It trial-renders the image — the picture compiles on the first try.
7. It appends the provenance table: 11 rows, each element pointing at its line in `placeOrder.ts` and its callees, ten ✅ and one 🔵.
8. The report lists the file, the type, and repeats the one 🔵 spot needing confirmation.

Minh opens the file, jumps to line 58 from the provenance table to double-check the payment-failure branch — exactly as drawn. He sends the file to his BA: she reads the picture, he trusts the line numbers, and the five-year-old spec finally gets corrected against reality. Later, when he refactors the stock-reservation step, he re-runs the same command — the system enters update mode and shows him the before/after of the changed part only.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (target resolution, the trace prompt, the provenance format, gotchas), read the source file: `.claude/skills/code-flow/SKILL.md`.

Other diagram-drawing commands in the same toolkit:

- `explain-skills/sequence.md` — draws a sequence diagram **from your description**. Same picture type `/code-flow` most often produces, opposite source of truth: you tell `/sequence` the story; `/code-flow` reads the story out of the code.
- `explain-skills/state.md` and `explain-skills/activity-family.md` — the other two picture types `/code-flow` can produce, explained on their own.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
