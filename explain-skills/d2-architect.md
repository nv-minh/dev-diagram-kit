---
type: skill-explainer
skill: d2-architect
updated: 2026-07-14
---

# What is `/d2-architect` and how does it run?

**English** · [Tiếng Việt](d2-architect.vi.md)

## 1. What it is for, and when you should type this command

`/d2-architect` draws out **an overall picture of a system** — the kind of diagram where a single glance tells you "what blocks make up this system, what's inside each block, which outside services it calls, and how data flows back and forth between them." In the trade this is called an *architecture diagram*.

Picture it like **a bird's-eye map of a neighborhood**: you see the buildings (the big blocks: the user-facing part, the backend processing part, the data store), you see what rooms are inside each building (the sub-components), and you see the roads connecting them (data flowing from here to there). It does **not** draw the detail of each individual brick — the goal is for both business people and developers to look at it and understand **the shared context**, not a construction blueprint.

The word "d2" in the command's name is the name of the drawing tool this command uses. What makes D2 well-suited to this type of diagram: it draws **blocks nested inside blocks** very neatly — a "Backend building" containing an "Auth room," a "Main processing room," a "Data store"... all sitting tidily inside one large frame. This is exactly the spot where the Mermaid tool (used by many other drawing commands) doesn't render nicely — so for this particular kind of architecture diagram, D2 is the more sensible choice.

A few typical situations where you should use `/d2-architect`:

- You need an **overview picture of the system** to put into documentation, use at a project kickoff, or explain to a newcomer "what parts our system consists of and how they connect."
- You want to clearly show **which outside services the system calls** (Google login, a payment gateway, an email-sending service...) and what each one is used for.

You type a command as simple as:

```
/d2-architect --feature auth
```

or describe the whole overall system (not tied to a specific feature):

```
/d2-architect "an English-learning system: web/mobile, backend, data store, calls Google for login and an AI service to score pronunciation"
```

**One sentence to remember:** `/d2-architect` draws **an overall map of the system** at an easy-to-understand altitude — what blocks exist, how they're nested, which outside services get called — so everyone shares the same context. It draws *the context*, not *the construction blueprint*.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /d2-architect --feature auth   (or describe the whole system)
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 0 — Check whether the drawing tool is installed   │
 │  Needs the "D2" tool installed on the machine before   │
 │  it can draw. Not installed → STOPS immediately,        │
 │  hands you a one-line install command. Does NOT draw   │
 │  halfway, does NOT create an empty file.                │
 └──────────────────────────────────────────────────────┘
        │  (tool already installed → continue)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine who it's drawn for                  │
 │  Drawing for one specific feature? → goes into that    │
 │  feature's folder. Drawing the whole overall system?   │
 │  → goes into a shared folder. Feature doesn't exist    │
 │  yet → names it itself and creates it.                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Understand the system correctly                │
 │  Reads the "system overview" document if one exists    │
 │  (the best source), or the feature's specification.    │
 │  Missing / vague → ASKS you, does NOT make up a block  │
 │  or a service that doesn't exist.                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Break it down into blocks                      │
 │  Divides into: the big blocks (Front end / Backend /   │
 │  ...), the sub-components inside each block, the        │
 │  outside services, and the data flows connecting them.  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before drawing (asks permission)      │
 │  Describes in words: "will draw K blocks, N              │
 │  sub-components, M outside services, the main flows      │
 │  are...". You nod (Y) before it proceeds.                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Draw + verify an image comes out               │
 │  Writes the diagram description, then has the D2 tool  │
 │  "really render" it into an image file. Render error →  │
 │  self-fixes, redraws. Only reports DONE once a complete │
 │  image has come out.                                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Completion report                             │
 │  Gives you the image file's (.svg) path to open and     │
 │  view. Logs it into the architecture-diagram tracking   │
 │  record.                                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — you have 1 standalone architecture-diagram image file
```

---

## 3. The core point: it draws at "context altitude," NOT construction detail

This is the spot most easily misunderstood, so it's worth spelling out in full. `/d2-architect` serves the business analyst (BA), **not the systems architect/engineer**. That means it draws at the level of **"what blocks the system consists of, which outside services it calls, how the main data flows"** — enough for stakeholders and developers to share the context, and it stops there.

**It DOES draw:**

- The big logical blocks: the front-end part (web/mobile), the Backend part (backend processing), the Data store.
- Sub-components by business function: the login component, the main processing component, the data-entry component...
- Outside services by **real name + purpose**: "Google — for login," "payment gateway," "email-sending service."
- The main data flows, with easy-to-understand labels: "Front end calls Backend," "Backend calls Google for login."

**It does NOT draw** things belonging to technical operational detail — the number of servers running in parallel, load balancers, network configuration, port numbers, underlying software versions... Those are the systems engineer's job when actually building it, and they're outside the scope of a business diagram. If you need that level of detail, this is not the right tool.

The reason for holding this principle: an architecture diagram meant **to communicate and align on context** should stay as compact as possible. Stuffing construction detail into it only clutters the picture and dilutes what stakeholders actually need to see. That's also why `/d2-architect` **will not ask you** questions like "how many servers to run, which port to open" — it only asks about blocks, sub-components, outside services, and data flows in business language.

---

## 4. Why use D2 instead of Mermaid? (stated plainly, no spin)

This toolkit has many diagram-drawing commands, most of which use Mermaid. `/d2-architect` alone uses D2 for a specific reason, and it's worth stating clearly to avoid misunderstanding.

Architecture diagrams have a particular trait: they need to draw **blocks nested inside blocks** — a big "Backend" frame containing a few small boxes (Auth, Main processing, Data store), and those small boxes in turn connect outward. Mermaid draws this kind of nesting **messily, prone to clutter**. D2 handles this block-nesting far more neatly — that's the real reason for choosing it for this particular type of diagram.

> **A point worth stating outright to avoid misunderstanding:** D2 being suited to architecture diagrams **does not mean it's "prettier" or "better" than every other tool for every kind of picture.** It's simply **a different drawing approach, strong specifically at this block-within-block situation.** For other diagram types (a multi-role process, for instance), other tools do better. In other words: choose `/d2-architect` because you need to **draw a system architecture**, not because you think "D2 is the prettiest."

Besides the block-nesting, D2 also helps with a few small readability touches: data stores are drawn as cylinders (like the familiar hard-disk icon), users are drawn as person icons, and clusters of outside services are **circled with a dashed border** so you immediately see "this sits outside our control."

---

## 5. Where do results go? Drawn for 1 feature or for the whole system?

`/d2-architect` is flexible in that it can draw both **the architecture of one specific feature** and **the overall architecture of the whole product** — and it places results in two different spots depending on which:

- If you draw for **one feature** (e.g. the login feature), the result sits inside that feature's own folder.
- If you draw **a picture of the whole system** (not belonging to any single feature), the result sits in a **shared** folder for the whole project — because it's a shared asset, and shouldn't be tucked into a single feature.

Wherever it goes, each drawing produces:

- A "source" file (`.d2` extension) — containing the text-based description, so it can be edited later.
- An image file (`.svg` extension) — the finished picture itself, opened with a browser or document viewer to see right away, no extra install needed.
- An entry logged into a "tracking record" — listing the architecture diagrams that have been drawn, for easy lookup.

If you redraw a diagram that **already exists**, the system automatically understands it's **updating the existing version** — it shows you a preview of the change before overwriting, and **doesn't touch** other diagrams.

> **One source it helps to have beforehand for accuracy:** the project may already have a "system overview" document describing the blocks and how they connect. If it exists, this is the best source for `/d2-architect` to draw accurately. If not, the system will ask you to help build it up — or you can create that overview document first and drawing will go more smoothly.

---

## 6. Why check for the tool and only report done "once an image actually comes out"?

Two details in how it runs help put your mind at ease about the result — just like the other commands in the D2 family.

**Check for the tool first.** Unlike many commands that run entirely inside the system, `/d2-architect` needs the "D2" tool installed on your computer before it can draw. So the first thing it does is check: is this tool present? If not, it **stops right away and hands you exactly one line of install command** — rather than trying to draw halfway and producing a broken file.

**Only reports done once an image actually comes out.** After finishing the diagram description, the system has D2 "really render" it into an image file. If the description has an error that prevents rendering (a common error: a name with a special character not yet handled), it **reads the error itself, fixes it, redraws** (tries a few times). It only reports "done" once there's a proper image file — not when the image is still broken or opens up blank.

One thing `/d2-architect` does **not** do: it doesn't have a "draw it, then edit back and forth over many rounds right in the chat window" mode. The diagram description doesn't render into a picture in chat, so you view the picture from the image file itself. To make a change, call the command again with the change request — the system automatically understands it's editing the existing version.

---

## 7. A real-world example

**Tuan**, a BA, is preparing the kickoff for an English-learning project and needs **an overview picture of the system** to open with — for the whole team (including people not versed in technical detail) to look at and understand "what parts our product consists of, how they connect, and which outside services it calls."

Tuan opens a terminal and types:

```
/d2-architect "an English-learning system: web and mobile, a backend handling lessons, a data store, calls Google for login and an AI service to score pronunciation"
```

1. The system checks beforehand: is the D2 tool installed on the machine? Yes — proceed. (If not, it would have stopped right away and handed him an install command.)

2. Since this is a description of **the whole overall system** (not tied to any single feature), the system decides to place the result into the project's shared folder.

3. It looks for a "system overview" document — none exists yet, so it **asks Tuan back** a few questions to understand correctly: *"What sub-components make up the Backend? Is the pronunciation-scoring AI service an outside service, or built in-house within the system?"* He answers in business language, without needing to worry about servers or ports.

4. The system describes in words: *"I'll draw an architecture diagram: 3 big blocks (Web/mobile front end, Backend, Outside services), with 3 sub-components inside Backend (Login, Lesson processing, Data store), 2 outside services (Google login, Pronunciation-scoring AI). Main flow: Front end calls Backend, Backend calls Google and the AI. Apply?"* Tuan types `Y`.

5. The system writes the diagram description and has D2 really render it. The first attempt hits a small error (the name "AI (pronunciation scoring)" has parentheses not yet handled) — it self-fixes, redraws. This time a complete image comes out.

6. The system reports done, giving the image file's path. Tuan opens it in a browser: he sees a compact diagram — the big Backend block nesting three sub-boxes inside, the data store drawn as a cylinder, the cluster of outside services (Google, AI) circled with a dashed border indicating "outside our control," and the arrows carrying clear labels.

7. Tuan puts this picture on the opening slide of the kickoff meeting. The whole team — including people not versed in technical detail — grasps the big picture of the system at a glance, and the meeting spends far less time on explanation.

A few weeks later, the project adds a study-reminder email service. Tuan just needs to type the command again and mention the new service — the system automatically understands it's updating the existing version, shows him a preview of the change, and then redraws the new picture.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (the diagram-writing syntax, how rendering works, special cases), read the source file: `.claude/skills/d2-architect/SKILL.md`.

Commands that also use the D2 tool (the D2 family):

- `explain-skills/d2-activity.md` — `/d2-activity`, draws **process diagrams** with D2 (lays out cleanly when there are many branches, standalone file).
- `/d2-erd` — draws **data diagrams** (data tables and the relationships between them) with D2. All three D2 commands share the same "rendering engine" underneath.
- The full rule for choosing a diagram type (when to use an architecture diagram, when to use another type) lives in the source file: `.claude/rules/diagram-selection.md`.
