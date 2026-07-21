---
type: skill-explainer
skill: state
updated: 2026-07-14
---

# What is `/state` and how does it run?

**English** · [Tiếng Việt](state.vi.md)

## 1. What it is for, and when you should type this command

`/state` draws a **state diagram** for an "object" in your system — what the trade calls a *state diagram*. It sounds a bit unusual, but the idea is very everyday: many things in software **pass through several different phases (states) over their lifecycle**, and a state diagram draws out all of those phases together with "what needs to happen to go from this phase to that phase."

Some examples to make it concrete:

- A user **account**: newly registered it's *unverified* → tap the email verification link and it becomes *verified* → enter the wrong password 5 times and it gets *locked* → after 24 hours it *auto-unlocks*. Each italicized phrase there is a state.
- An **order**: *awaiting payment* → *paid* → *shipping* → *delivered* → (or) *cancelled*.
- A **subscription plan**: *trial* → *active* → *expired* → *renewed*.

What's good about drawing this diagram: it **forces you (and the whole team) to think everything through** — how many states does this object have in total, which state can transition to which, **what triggers** each transition (a button press? a timeout? admin approval?), and most importantly **which transitions are NOT allowed** (for example an order that's *paid* must absolutely never go back to *awaiting payment* on its own). These forbidden transitions are very easy to miss when only described in words — draw it out and they're exposed right away.

A few typical situations where you should use `/state`:

- You have an object (account, order, request ticket, subscription plan, login session...) that passes through **3 or more states**. (If there are only 2 states like on/off, a single sentence is enough — no need to draw.)
- You want to clearly document the **transition rules** so developers and testers don't misunderstand (when a transition is allowed, when it's forbidden).

You type a command as simple as:

```
/state Account --feature auth
```

(meaning: draw the state diagram for the "Account" object, belonging to the "auth" feature).

**One sentence to remember:** `/state` draws **the lifecycle of an object** — which states it passes through, what makes it transition between states, and which paths are forbidden — so the whole team thinks it through completely and doesn't misunderstand.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /state Account --feature auth
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine the object + the feature            │
 │  Understands which object you're drawing for           │
 │  (Account), which feature it belongs to (auth).        │
 │  Feature doesn't exist yet → names it itself and       │
 │  creates it, doesn't make you do anything beforehand.  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Gather state information                      │
 │  Reads existing documentation of the feature (idea      │
 │  notes, spec) to pull in the states + rules already      │
 │  known. Missing or vague description → ASKS you, does   │
 │  NOT make things up.                                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Check "is this worth drawing"                 │
 │  Fewer than 3 states → reminds you "a few words might   │
 │  already be enough, still want to draw it?" — waits    │
 │  for your decision.                                     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before drawing (asks permission)      │
 │  Describes in words: "will draw N states, M            │
 │  transitions, K forbidden transitions." You nod (Y)     │
 │  before it continues.                                   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Write the diagram into the document           │
 │  Adds a new entry for this object into the feature's   │
 │  shared states file. Includes a separate table          │
 │  listing the FORBIDDEN transitions.                     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Self-inspect the picture + check coverage     │
 │  Trial-renders an image, OPENS THE IMAGE ITSELF TO      │
 │  LOOK (are arrows pointing the right way? is any state  │
 │  left dangling?), then checks coverage: are all states  │
 │  + all transitions present? Missing/wrong → self-fixes, │
 │  redoes it. Only reports done once it's good.           │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Completion report                             │
 │  Reports which file the diagram was added to; open it  │
 │  in a document reader (IDE/Obsidian/GitHub) to see the  │
 │  picture.                                               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — the states file has a new diagram added
```

---

## 3. The three most important things this diagram makes you think through

This is the real reason `/state` is worth using — not to have a picture just for the sake of it, but to **not miss anything**.

**First — are all the states covered?** It's very common: when described in words, people only mention a few "main" states (pending, done) and forget the "secondary" but important ones (processing, rejected, expired). Draw it as a diagram and those gaps show up right away — "wait, if delivery fails from *shipping*, where does the order go?"

**Second — what triggers each transition?** Every arrow in the diagram carries a label spelling out **what causes it to transition**: the user taps a button, the system's wait times out, an admin approves, a payment succeeds... Requiring this label to be filled in means requiring you to answer "why does it transition," rather than leaving it vague.

**Third — which paths are FORBIDDEN?** This is a part many other tools skip, but `/state` builds out **a dedicated table** for it. It lists the transitions that **are not allowed to happen**, along with the reason — for example "order *paid* → *awaiting payment*: not allowed, because once payment is made it can't go back to unpaid." These forbidden rules are exactly where the system is prone to bugs if developers don't know about them — writing them out explicitly is a preventive measure.

> **Why keep forbidden transitions in a separate table instead of drawing them in the picture?** Because if both allowed and forbidden transitions were drawn into the same picture, it would get cluttered and easy to misread (mistaking a forbidden path for an allowed one). So the picture only draws allowed transitions; forbidden ones sit neatly in a table below, clearly readable.

---

## 4. Where do results go? Why gather them into one file?

`/state` **does not create a separate new file for each object.** Instead, all state diagrams for the same feature are **gathered into one shared file** (named in the form `...-states.md`), with each object as its own entry in that file.

For example, the "auth" feature might have state diagrams for *Account* and for *VerifyLink* — both sitting in the same file, each as its own entry. Next time you draw another object, it adds another entry to that same file.

The reason for gathering them together: the state diagrams of one feature are usually related, so keeping them in one place makes it easy to read the whole set, easy to find, without having to open a dozen separate files. If you re-draw for an object that **already exists** in the file, the system automatically understands it's **updating the existing entry** — it will show you a preview of the change (a before/after comparison) before overwriting.

The picture is drawn with a tool called **Mermaid**. The convenient part: this type of picture **shows up directly when you open the file** on popular tools (code editors, Obsidian, GitHub) — no need to install anything extra, no need to export a separate image file.

---

## 5. Why "open the image itself to inspect" and "check coverage"?

The two checking steps at the end are what let you feel confident that "reported done" really means it's fine, not just half-finished.

**Open the image itself to inspect.** After writing the diagram, the system **trial-renders an image itself and opens that image to look at it** — checking for errors that only show up by looking at the picture: is any state left **dangling** (no path leading in or out)? are the arrows pointing the **right direction** (drawing *Locked → Verified* when the intent is the reverse would be wrong)? are labels **overlapping, losing text**? If it spots an error, it self-fixes and redraws. The reason for doing this: this type of picture cannot render inside the chat window, so if the system didn't self-inspect, the error would be left for you to discover only when you open the file — late and wasted effort.

**Check coverage.** This is a check step **different** from inspecting the image: before drawing, the system already drew up a list of "must have these states, these transitions." After drawing, it **re-checks each item** — has every state on the list appeared as a box? does every transition have its trigger label filled in? Whatever is missing gets added. Because a diagram can "render without error" yet still be **missing a state** compared to the original intent — inspecting the image doesn't catch this kind of missing content, so a separate coverage-check step is needed.

One thing `/state` does **not** do: it doesn't have a "draw it, then edit back and forth over many rounds right in the chat window" mode. The description doesn't render into a picture in chat, so you view the picture from the file. To make a change, call the command again and say what needs changing — the system automatically understands it's editing the existing version.

---

## 6. What `/state` will NOT ask you (and why)

`/state` serves the business analyst (BA), not the developer. So when it needs more information, it only asks in **business language**:

- What **states** does this object pass through?
- **What event** causes it to transition from this state to that one?
- Are there any **forbidden** transitions?

It **will not ask** about things that belong to storage or programming technicalities — for example which database column the state is stored in, what data type, what the handler function is named. That's the job of the technical specification step and of developers, not something you need to worry about while drawing a state diagram. You only need to be able to answer the "business lifecycle" question and that's enough.

A small but useful rule: if you say "draw this state diagram and just stuff it right into use case X," the system will **politely decline** and explain why — because an object (like an account) is usually shared across many places, so its state diagram must live in the shared states file, not be tucked into a single use case.

---

## 7. A real-world example

**Lan**, a BA in charge of the login feature (`auth`), just finished a meeting and realized: the "account" object in the system is actually more complex than she thought — it has quite a few states and a couple of forbidden rules that, if not documented clearly, developers could easily get wrong. She decides to draw a state diagram for it.

Lan opens a terminal and types:

```
/state Account --feature auth
```

1. The system understands she's drawing for the "Account" object belonging to the "auth" feature. This feature already has existing documentation, so it reads through to gather information.

2. From the idea notes, the system sees mention of the states *unverified*, *verified*, *locked* — but the part about "when does it auto-unlock" is described vaguely. It **asks back**: *"How does a locked account get unlocked again — does an admin unlock it manually, or does it auto-unlock after some period of time?"* Lan answers: *"Auto-unlocks after 24 hours, no admin needed."* — asking prevented a wrong guess.

3. This object has 3 states, enough to be worth drawing (it isn't reminded "a few words might already be enough").

4. The system describes in words: *"I'll add a state diagram for Account: 3 states (Unverified, Verified, Locked), 4 transitions, 1 forbidden transition (verified must not go back to unverified). Apply?"* Lan types `Y`.

5. The system adds a new "Account" entry to the auth feature's shared states file, together with a table listing the forbidden transition.

6. It trial-renders an image and **opens it itself to inspect**: is the arrow *Locked → Verified* (auto-unlock after 24h) pointing the right way? is any state left dangling? — it's fine. Then it **checks coverage against the list**: all 3 states present, all 4 transitions present, each transition has a trigger label. Fully covered.

7. The system reports done, letting Lan know the diagram was added to the file `docs/auth/srs/auth-states.md`, under the "Account" entry. Lan opens the file in a document reader and sees the diagram show up clearly — with the forbidden-transitions table underneath. She sends it to the developer, who immediately understands the rule "a verified account must not go back to unverified," with no need to ask again.

The following week, the system adds an "account suspension" feature. Lan just needs to type `/state Account --feature auth` again and mention the new state — the system automatically understands it's updating the existing diagram, shows her a preview of the change, and only then writes it.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (Mermaid syntax, how the picture is checked, special cases), read the source file: `.claude/skills/state/SKILL.md`.

Other diagram-drawing commands in the same toolkit:

- `explain-skills/activity-family.md` — the group of commands that draw **process diagrams** (step by step how something runs). Different from `/state`: a process diagram draws *the flow of work*, while `/state` draws *the state lifecycle of an object*.
- The full rule for choosing a diagram type (when to use a state diagram, when to use another type) lives in the source file: `.claude/rules/diagram-selection.md`.
