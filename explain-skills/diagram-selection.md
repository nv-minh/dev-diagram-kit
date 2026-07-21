---
type: skill-explainer
skill: diagram-selection
updated: 2026-07-14
---

# Which diagram should I choose? — a signpost for every diagram type

**English** · [Tiếng Việt](diagram-selection.vi.md)

> This document is the **starting point** for when you know you need to "draw something" but **don't yet know which type of diagram to draw**. It points you to the right command — then you read that command's own explainer file (or the "family comparison" file) to understand it in depth. In other words: this is *the overall map*, and the other files are *the detailed directions*.

## 1. Why is a dedicated signpost document needed?

This toolkit has **a great many diagram-drawing commands** — each strong at one type. The common problem isn't "how does this command run" (that already has its own explainer), but the question that comes *before* it: **"What type of diagram should I use to describe the thing I need to describe?"**

Pick the wrong diagram type and you waste effort redrawing from scratch — for example, if you want to show "which states an object passes through" but instead go draw a diagram of exchanges between parties, the resulting picture won't answer the question you actually needed.

This document solves that problem: you describe **your business situation**, and it points you to **the right diagram type** and **the corresponding command**.

> Something to distinguish right away: there's another file with a similar name — `.claude/rules/diagram-selection.md`. That file is **a rule for the machine** (helping the system auto-select an engine at runtime), written in technical language. The file you're reading now is **the version for humans**, explaining the same thing in plain words.

---

## 2. Six questions to choose the right diagram type

The fastest approach: ask **"what do I want to show someone?"** then compare it against the six groups below. Each group answers a different *kind of business question*.

| What you want to show | Example | Diagram type | Command |
|---|---|---|---|
| Several parties exchanging back and forth **in a time order** — who calls whom first, what gets returned, then which step comes next | login, payment, calling an outside service | Sequence diagram | `/sequence` |
| Which **states** an object passes through, and when it transitions from this state to that one | Account: unverified → verified → locked | State diagram | `/state` |
| How a **process** runs — what steps exist, who does which step, how it branches | approving a refund, multi-level onboarding | Process diagram | see the **activity family** (Section 3) |
| The **big picture** of a feature — who (roles) exist and what they can do in the system | a scope picture at kickoff with stakeholders | Use case diagram | `/usecase-diagram` |
| What kinds of information a feature **stores**, and how they relate to each other | Customer — Order — Transaction | Data diagram | see the **ERD family** (Section 4) |
| An **architecture** picture — how the system's components / services / data stores are nested together | which services the app calls, where data lives | Architecture diagram | `/d2-architect` |

One sentence to remember: **time → sequence; state → state; process → activity; scope → use case; data → ERD; architecture → architecture.**

Two of the six groups — **process** and **data** — each have **multiple commands** (drawing the same type but with different tools/levels of detail). For these two groups, once you know which type you need, read on to Section 3 (activity family) or Section 4 (ERD family) to pick the right command within the family.

---

## 3. The "process" group has four choices — how to pick

Once you know you need a **process diagram** (steps, who does which step, branches), there are three commands that can all draw it (`/activity`, `/activity-swimlane`, `/d2-activity`) plus one specialized option (`/bpmn`) — choose using this quick table:

| You need | Choose |
|---|---|
| A **compact process, 1-2 roles**, want the picture **embedded directly in the document** (shows up on opening GitHub/Obsidian) | `/activity` |
| A process with **many roles**, lots of back-and-forth between parties, need to clearly see **"who does which step"** (real lanes) ⭐ default | `/activity-swimlane` |
| A process with **many branches** but little crossing over, need a nice **standalone image file** to paste into slides / export | `/d2-activity` |
| A process needing the **international (OMG) standard** or to open with process-management software (Camunda, Bizagi) | `/bpmn` |

The most important boundary in this family: **the number of roles involved**. Many roles crossing over → `/activity-swimlane` (it keeps each role in its own straight column "lane"). To understand why, and see the full comparison, read `explain-skills/activity-family.md`.

---

## 4. The "data" group has three commands — how to pick

Once you know you need a **data diagram** (information tables + relationships), there are three commands that can all draw it — differing in **drawing style** and **level of detail**:

| You need | Choose |
|---|---|
| A picture **embedded directly in the document** for BAs/stakeholders to read (lightweight, no tool install needed) | `/erd` |
| **The same content as `/erd`, just a different drawing style** — a **standalone image file** (needs the D2 tool installed) | `/d2-erd` |
| **A handoff to developers**: real database types, choice lists, **exports SQL code**, shareable on the dbdiagram.io website | `/dbdiagram` |

The important boundary: `/erd` and `/d2-erd` only differ in **drawing style** (neither is "prettier"); `/dbdiagram` differs in **level of detail** (closest to developers). To understand it in depth and see the full comparison, read `explain-skills/erd-family.md`.

---

## 5. Table of "real situation → what to draw"

Sometimes it's easier to choose by looking at a concrete situation. A few common examples:

| The situation you're facing | You should draw | Command |
|---|---|---|
| "I want to record the Google login flow: user taps a button → the system calls Google → Google returns → the system creates a session" | Sequence diagram (multiple parties, over time) | `/sequence` |
| "I want to record which states an order passes through: pending → paid → delivered → cancelled" | State diagram | `/state` |
| "I want to describe a refund-approval process passing through Customer, System, Staff, Manager" | Process diagram with lanes (many roles) | `/activity-swimlane` |
| "I want to describe a change-password process — just the user and the system, very compact, to embed in a document" | Compact process diagram, embedded directly | `/activity` |
| "I want one overview picture for a stakeholder to see at kickoff: who exists and what they can do in the feature" | Use case diagram | `/usecase-diagram` |
| "I want to record what kinds of information the payment feature stores and how they relate, for developers to read in the document" | Embedded data diagram | `/erd` |
| "I want to hand off the data structure to developers to build a database, with a ready-to-run file included" | Data diagram close to developers, exports SQL | `/dbdiagram` |
| "I want one architecture picture: which services the app calls, where data lives" | Architecture diagram | `/d2-architect` |

If your situation doesn't match any row, go back to **the six questions in Section 2** — within the scope of this command set, most real situations fall into one (sometimes a few) of those six groups.

---

## 6. Two general principles — read before drawing

**Draw to communicate, not to show off.** Don't draw a diagram for *everything* just because you can. A diagram is only worth drawing when it **helps someone understand faster** than reading text would. A simple process with just a few linear steps only needs a few numbered lines — no need for an elaborate process diagram. A two-state toggle (on/off) is settled with a single sentence — no need for a state diagram.

**A complex feature usually needs MULTIPLE complementary diagrams, not a single choice.** Different diagram types answer different questions, so they **don't exclude each other**. For example, a full payment feature might need: a use case diagram (big picture) + a few sequence diagrams (each flow) + a swimlane process diagram (the refund flow) + a state diagram (the order lifecycle) + a data diagram (Order / Transaction / Refund). The question isn't "which one to pick" but "which ones are needed for everyone to fully understand."

| Example feature | Typical set of diagrams used |
|---|---|
| Login / registration (with OAuth, email verification) | Use case (overview) + Sequence (each flow) + State (Account lifecycle) |
| Payment / ordering | Use case + Sequence (payment flow) + Swimlane process (refund) + State (order) + Data |
| Multi-level approval process | Use case + Swimlane process (approval) + State (request) |

---

## 7. A real-world example — using this signpost

**Ha**, a BA who has just taken on the "class scheduling" feature for an English-learning app, sits in front of her screen with a pile of business notes and no idea where to start drawing. She opens this document and follows **the six questions in Section 2**:

1. She has a flow: "student books a slot → the system checks the teacher's open availability → sends a confirmation by email." This is **multiple parties exchanging over time** → she chooses `/sequence`.

2. She realizes a class session passes through states: *booked → confirmed → held → cancelled*. This is a **state lifecycle** → she chooses `/state`.

3. She has a "request to reschedule" process passing through Student, System, and Teacher (the teacher must agree). This is a **process with many roles** → she opens Section 3, sees "many roles → `/activity-swimlane`," and chooses it.

4. She needs one overview picture for a kickoff meeting with the head of product: who exists (Student, Teacher, Admin) and what they can do. This is **overall scope** → she chooses `/usecase-diagram`.

5. Finally, she needs to record what the feature stores (Session, Available slot, Student, Teacher) for developers to read. This is **data**; since she only needs developers to read it in the document, she opens Section 4 and chooses `/erd` (no need for `/dbdiagram` yet, since it isn't time to hand off database building).

Result: Ha didn't draw at random. She ends up with exactly five diagrams, each answering a different question, complementing each other — not five ways of drawing the same thing. And she chose them just by comparing her situation against the six groups, without needing to know anything about the underlying drawing tools.

---

## See also

Once this signpost has helped you choose the **type** of diagram, read on to understand each command in depth:

**"Family comparison" files (when a group has multiple commands):**

- `explain-skills/activity-family.md` — choosing between `/activity`, `/activity-swimlane`, `/d2-activity` (+ `/bpmn`) for **process diagrams**.
- `explain-skills/usecase-family.md` — distinguishing `/usecase`, `/usecase-diagram`, `/userstory` (text scenario / picture overview / backlog breakdown).
- `explain-skills/erd-family.md` — choosing between `/erd`, `/d2-erd`, `/dbdiagram` for **data diagrams**.

**Per-command explainers (groups with only one command):**

- `explain-skills/sequence.md` — `/sequence` (multi-party exchange over time).
- `explain-skills/state.md` — `/state` (the state lifecycle of an object).
- `explain-skills/usecase-diagram.md` — `/usecase-diagram` (overview picture of actors + use cases).
- `explain-skills/d2-architect.md` — `/d2-architect` (system architecture diagram).
- `explain-skills/bpmn.md` — `/bpmn` (the international BPMN standard, opened with process-management software).

**Source rule (for the machine / for people who want technical detail):**

- `.claude/rules/diagram-selection.md` — the full engine-selection table + notes on safe Mermaid syntax. This is the technical version; the file you just read is the human-readable explanation.
