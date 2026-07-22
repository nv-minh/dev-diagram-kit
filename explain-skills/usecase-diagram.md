---
type: skill-explainer
skill: usecase-diagram
updated: 2026-07-14
---

# What is `/usecase-diagram` and how does it work?
**English** · [Tiếng Việt](usecase-diagram.vi.md)

## 1. What it's for, and when to run this command

`/usecase-diagram` draws a **use case diagram — an overview of who participates and what they can do** in a feature.

If `/usecase` is the detailed description of each scenario, then `/usecase-diagram` is the picture hung on the wall: who stands outside the system, what the main tasks inside the system are, and where the feature's scope lies.

An everyday example: a restaurant has customers, a cashier, and a delivery partner. The overview diagram shows:

- The customer can order food and track the order.
- The cashier can confirm payment.
- The delivery partner can receive delivery information.

It does not narrate each step of ordering, nor describe which screen appears first. The purpose is for everyone to understand the **scope** together before diving deep.

You should use `/usecase-diagram` when:

- Preparing a kickoff with stakeholders and needing a picture to grasp quickly.
- Wanting to confirm: "in this feature, who can do what?"
- The feature has many actors or many goals, and reading a table of text is starting to be hard to visualize.
- There is already a use case index or SRS to serve as a real information source.

Example command:

```
/usecase-diagram --feature payment
```

**One line to remember:** `/usecase-diagram` draws a map of scope: **who is outside the system, what tasks are inside the system** — rather than narrating each step of a scenario.

---

## 2. The whole run flow — diagram

```
 YOU RUN THE COMMAND
 /usecase-diagram --feature payment
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Find the right feature and available sources │
 │  The skill looks for the feature's use case index or  │
 │  SRS. Missing both → refuse, guide you to run         │
 │  /usecase or /srs first; it won't invent actors/uses. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Gather actors and use cases                   │
 │  Read the index, use case files, URD and SRS to find: │
 │  who participates, what they do, any external system. │
 │  The skill offers a list for you to confirm or edit.  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Define scope and real groups                  │
 │  Every use case sits inside the "System: {feature}"    │
 │  frame. Only group when there is a real domain like    │
 │  User/Admin. Don't group just because there are many.  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Check special relationships                   │
 │  Include/extend/generalization are drawn only when     │
 │  the source text proves it and the reason can be       │
 │  explained. Not sure → just connect actor to use case. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Preview the plan before writing               │
 │  The skill states the count of actors, use cases,      │
 │  groups and relationships. Only when you agree (Y)     │
 │  does it create or update the file.                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Draw and render into an image                 │
 │  The skill creates the .puml source file, sends the    │
 │  content to plantuml.com to render into a .svg image.  │
 │  If the image errors, the skill self-fixes up to 2x.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Self-inspect + update the index               │
 │  Only reports done when the image renders validly and  │
 │  matches the business. The image plus the Actors/      │
 │  Relationships tables are embedded into the feature's  │
 │  use case index file.                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — a source file, an SVG image and an overview page
```

---

## 3. Why is this diagram different from `/usecase`?

The two skills talk about the same feature but answer two different questions.

`/usecase-diagram` answers: **"Who can do what within this scope?"**

`/usecase` answers: **"To accomplish a specific goal, what happens on the main path, what happens on error, and what result must be guaranteed?"**

Picture a shopping mall:

- The use case diagram is the floor plan: which zone customers enter, which zone staff enter, what main services there are. It helps newcomers not get lost.
- The use case text is the detailed procedure for returns/exchanges: what receipt is needed, how it's handled if the receipt is missing, which documents get updated on success.

So the use case diagram is very useful for kickoff and discussing scope with stakeholders, but it does not replace detailed use cases, flows, or acceptance criteria. A picture can be "nice" and still lack business rules; the skill does not treat rendering an image as proof that the business is correct.

---

## 4. Why must there be a system boundary frame?

In the diagram, all use cases must sit inside a named frame of the form:

```
System: {feature}
```

The actors — users, admins, or external systems such as a payment gateway — stand **outside** the frame.

This is a small but very important rule. It's like an apartment's floor plan: you need the apartment's outline to know which room belongs to the apartment, which hallway is the shared area, and where guests stand.

Without this frame, stakeholders easily misunderstand:

- Which task is the feature's responsibility?
- Which task is done by an external system?
- Is something being drawn in that actually isn't in scope?

For example, "Google OAuth" or "payment gateway" may appear in the diagram as external actors. That doesn't mean your system does Google's or the bank's job for them; it only shows the feature exchanges with them.

When a feature has genuinely different domains, the skill can split the use cases into groups like "User", "Admin", "Integration". But the skill does not group just because there are many use cases. Counting numbers is like splitting filing cabinets because there's a lot of paper; what matters is whether they belong to different business groups.

---

## 5. Why not draw `include`, `extend` and "seemingly reasonable" relationships on its own?

The diagram can have special relationships such as:

- **include**: a behavior that is always required for the main use case to complete.
- **extend**: an additional behavior that occurs only under a specific condition.
- **generalization**: one use case is a genuinely specialized form of another.

These names are not there to make the diagram look more professional. Drawing them wrong makes the reader misunderstand the business relationships.

For example, two tasks that both appear on the login screen do not automatically make an `extend`. An error occurring during payment does not automatically become an `extend` either. The skill draws these relationships only when it finds evidence from the use case text or SRS, and can explain the reason.

The safe default is to connect the actor to the use case with an undirected line: this person **participates** in this task. Without enough evidence, no special arrow is added.

This is like a family tree: seeing two people with the same surname doesn't mean you can immediately record a parent–child relationship. You need grounds first.

A light note: the arrow direction of `include` and `extend` is very often reversed. `include` goes from the main use case to the always-needed behavior; `extend` goes from the additional behavior back to the base use case. Because it's easy to get wrong and easy to mislead, the skill is more cautious rather than "drawing every symbol to be complete".

---

## 6. Why PlantUML, and why you need to know about data going over the internet?

The skill uses **PlantUML native** — a tool with standard symbols for actor, use case, and scope group. This is not a flow diagram "pretending to be" a use case diagram.

The result consists of two files:

```
docs/{feature}/usecases/{feature}-usecase-diagram.puml
docs/{feature}/usecases/{feature}-usecase-diagram.svg
```

- `.puml` is the original source in text. When something needs changing, the skill edits this file.
- `.svg` is the rendered image for you to open in a browser, IDE, or Obsidian.

Currently the skill renders via the public `plantuml.com` server. That means the actor and use case names in the diagram are sent over the internet each time the image is drawn. For most ordinary business diagrams, this is information you need to know to decide; if the content is sensitive, the team should choose an internal rendering option instead of the current flow.

The skill does not display the image directly in the chat for you to edit over many rounds. After it finishes, you view the `.svg` file; if you want changes, call `/usecase-diagram` again and state clearly what needs to change. The skill will understand it as an update, and show you the changes before writing.

---

## 7. Where the result lives, and why there's no separate `.md` file for the diagram?

Besides `.puml` and `.svg`, the skill embeds the image and explanatory tables directly into:

```
docs/{feature}/usecases/{feature}-usecase-index.md
```

Which contains the sections:

- **Diagram**: the diagram image.
- **Actors**: which actor, what type, description, and source of information.
- **Relationships**: if there is a special relationship, what it is and why it was drawn.

This way the index becomes the single overview page of all use cases in the feature. You don't need to open another Markdown file just to re-read content that's already in the index.

Note: the Diagram, Actors, and Relationships sections are regenerated by the skill when rendering. You should not edit these sections directly by hand, because a later run may overwrite them. When you need to change the content, update the `.puml` source by calling the skill again.

---

## 8. What `/usecase-diagram` does NOT ask you (and why)

The skill does not ask you about programming details, for example:

- which API to use;
- which table the data is stored in;
- how many buttons the screen has;
- what code a technical error returns.

That is not the purpose of a scope diagram. What the skill needs from the BA and stakeholders is:

- Who participates?
- What goal does that person have in the feature?
- Is there any external system involved?
- Is there any mandatory, conditional, or specialized relationship that the source docs prove?

The skill also does not invent actors/use cases if the feature lacks both an SRS and a use case index. In that case it refuses and points the way:

```
/usecase {feature}
```

or:

```
/srs {feature}
```

The reason is that a wrong overview diagram is more dangerous than having no diagram: it can make an entire kickoff agree on the wrong scope.

If the feature has only one actor and one very clear goal, the skill may note that the diagram might not be necessary. This is a hint about need, not a judgment that the feature is "small" or "less important".

---

## 9. A real example

**Lan** is in charge of the `authentication` (login) feature. The team is about to kick off with the PM, QA, dev, and stakeholders. She wants everyone to quickly see who is in the feature and what capabilities exist.

Lan types:

```
/usecase-diagram --feature authentication
```

1. The skill finds the feature's SRS and use case index, so it has real sources to read.

2. The skill gathers the actors: User, Administrator, and Google OAuth. It also gathers the use cases: register, log in, verify email, forgot password, manage account.

3. The skill proposes the "User" and "Admin" groups, because these are two real domains. Google OAuth is placed outside the frame as an external system.

4. The skill finds that the docs prove "Register" always requires "Verify email" to complete. It proposes an `include` relationship and states the reason. For "Forgot password", the docs are not enough to prove this is an `extend` of "Log in", so the skill does not draw that relationship on its own.

5. The skill presents Lan the plan: 3 actors, 6 use cases, 2 groups, and 1 justified relationship. Lan confirms `Y`.

6. The skill creates the `.puml` source file, renders it into `.svg` via plantuml.com, and self-checks whether the image is valid.

7. The skill updates `authentication-usecase-index.md` with the image, the actor table, and the relationship table.

8. During the kickoff, Lan opens the index. The whole team immediately sees Google OAuth outside the system boundary, and the account-management function on the admin branch. A debate over "is forgot password a mandatory part of login?" is noted to be clarified in the use case text, instead of just drawing an arbitrary arrow.

---

## See also

The skill's source document: `.claude/skills/usecase-diagram/SKILL.md`.

Related explainers:

- `explain-skills/usecase-family.md` — **the big picture**: how `/usecase`, `/usecase-diagram`, `/userstory` relate to each other.
- `explain-skills/usecase.md` — the detailed description of each user scenario.
- `explain-skills/userstory.md` — turning requirements and use cases into a backlog draft.
- `.claude/rules/diagram-selection.md` — the rule for choosing the right diagram type.
