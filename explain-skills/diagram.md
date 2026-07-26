---
type: skill-explainer
skill: diagram
updated: 2026-07-26
---

# What is `/diagram` and how does it run?

**English** · [Tiếng Việt](diagram.vi.md)

## 1. What it is for, and when you should type this command

This toolkit contains over twenty diagram-drawing commands — sequence, state, swimlane, ERD, mindmap, cloud architecture with official AWS/Azure icons, and more. Great for coverage, but it creates a very real problem: **you know what you want to show, but not which command draws it.**

`/diagram` exists to solve exactly that. It is a **router**: you describe your need in plain language, it figures out which diagram skill fits, then **runs that skill for you**, carrying your description along. It never draws anything itself — picture it as **the receptionist at a clinic**: it listens to your symptoms and sends you to the right specialist; it doesn't treat you personally.

A few typical situations where you should use `/diagram`:

- You're new to the kit and haven't memorized the 20+ drawing commands.
- You know the content ("who does what in the refund process") but not the diagram vocabulary (is that an activity diagram? a swimlane? BPMN?).
- You keep hesitating between two similar commands (`/erd` or `/dbdiagram`? `/activity` or `/activity-swimlane`?) and would rather have the choice made for you.

You type a command as simple as:

```
/diagram "show how the login + OAuth callback flow works"
```

The part in quotes is your plain-language description of what you want to show. If you only want the recommendation without running anything, add `--recommend-only` — the system names the right command and stops there, letting you run it yourself.

**One sentence to remember:** `/diagram` is the **"which diagram do I need?" command** — describe the need, answer at most 2 short questions, and the right drawing command runs with your description passed into it.

---

## 2. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /diagram "describe what you want to show"
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Read your need                               │
 │  Parses the description (or picks it up from the      │
 │  conversation). Notes anything worth passing along:   │
 │  a --feature, an @file, a code path or function name. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Match against the routing table              │
 │  Compares your need with a table of "you want to      │
 │  show X → use command Y" rows (about 20 of them).     │
 │  Exactly one row fits → NO questions asked, jump      │
 │  straight to Step 4.                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Still torn between 2-3 candidates?           │
 │  Asks AT MOST 2 short questions, together in one go   │
 │  (e.g. "drawing from a spec, or from existing code?", │
 │  "inline in a doc, or a standalone image?").          │
 │  It never asks when the table already decides.        │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Announce, then hand off                      │
 │  Prints one line: "→ /<command> <args> (because       │
 │  <one-line reason>)" — then RUNS that command,        │
 │  carrying your description and answers into it.       │
 │  With --recommend-only it stops here instead.         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — The chosen command takes over                │
 │  From here on you're inside /sequence, /dfd, /erd...  │
 │  — with that command's own previews and self-checks.  │
 │  Nothing fits (your need isn't a diagram at all)? It  │
 │  says so in one line and suggests the closest thing.  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — the right diagram gets drawn by the right command
```

---

## 3. How does it decide? (the routing table)

The router's brain is a table mapping "what you want to show" onto exactly one command. A few sample rows to give you the flavor:

| You describe... | It routes to |
|---|---|
| who calls whom **over time** (login, checkout, webhook, error path) | `/sequence` |
| who does which step in a **multi-department process** | `/activity-swimlane` |
| the **states** an order passes through (pending → paid → cancelled) | `/state` |
| **where the data moves**, which store holds it | `/dfd` |
| the **data model** (tables and relations) | `/erd`, `/d2-erd` or `/dbdiagram` — one question decides |
| architecture with **real AWS/Azure/GCP icons** | the `/drawio-*` family |
| how one **function in the code** actually behaves | `/code-flow` |
| the architecture of the **whole repo**, read from code | `/scan-project` |

One thing worth knowing: the table inside the skill is only a **condensed copy**. The full decision matrix — with the "when to use / when not to use" reasoning for every diagram type — lives in one rule file, `rules/diagram-selection.md`, and that file is the **source of truth**. If the copy and the rule ever disagree, the rule wins. Keeping the real matrix in a rule file (rather than buried inside the router) means humans can read it directly, other skills can point to it, and when a diagram skill is added or removed there is one authoritative place to update.

---

## 4. Why "at most 2 questions" — and what those questions are

A router that interrogates you is worse than no router: if answering five questions takes longer than just reading the command list, nobody will use it. So the design is deliberately stingy with questions:

- **Zero questions is the normal case.** If the table decides in one row, the router runs the command immediately — asking anyway would just be friction.
- **At most 2 questions, batched into one round**, and only when the need genuinely sits between 2-3 candidates.

The questions it is allowed to pick from:

1. **Where does the truth come from — a description/spec, or existing code?** If from code and you're pointing at one function → `/code-flow`; from code covering the whole project → `/scan-project`; otherwise the regular diagram skill for the topic.
2. **What shape should the output be — inline in a document, or a standalone file?** Inline (the picture renders right inside the `.md` on GitHub/Obsidian) → the Mermaid family; a pretty standalone image for stakeholders → the D2 family; an editable `.drawio` file that developers keep working on → the draw.io family. This is the single most useful question in practice — most "which of these two?" hesitations collapse to it.
3. *(tie-break only)* **Which view matters — who does what (control), where data moves (data), or how blocks nest (structure)?**

---

## 5. Why does it never draw anything itself?

This is a hard rule of the skill, and it's worth understanding why.

Each drawing command in the kit comes with its own guarantees: a preview before writing, a trial render to catch syntax errors, a coverage check to make sure nothing from your description was silently dropped (the `/sequence` explainer walks through these). If the router "helpfully" sketched a quick version itself, all those guarantees would be bypassed — you'd get a picture that no step ever verified, in a style that matches none of the kit's conventions. It would effectively be inventing an unofficial twenty-first diagram type.

So the router's job stops at: **choose the command, carry your context into it, and get out of the way.** The practical consequence for you: the result is exactly the same whether you call `/sequence` directly or reach it through `/diagram` — the router adds convenience, never a shortcut around quality.

---

## 6. A real-world example

**Quân** is a backend developer who was just handed BA duties on his team. He needs diagrams for the documentation but has never used this kit before, and the list of twenty-plus drawing commands means nothing to him yet.

First need — describing the refund process. He types:

```
/diagram "who does what in the refund process, 3 departments, with an approval step"
```

The table decides in one row (a multi-role process → swimlane). The router prints `→ /activity-swimlane "refund process..." (because ≥2 roles/lanes)` and runs it — **zero questions asked**. Quân answers that command's own prompts and gets his swimlane.

A week later — the data model. He types:

```
/diagram "the data model for orders and refunds"
```

This time three commands are plausible (`/erd`, `/d2-erd`, `/dbdiagram`), so the router asks its one decisive question: *"Inline in a doc, a pretty standalone image, or a dev handoff with real column types / SQL?"* Quân answers "dev handoff — they'll want the actual types," and the router runs `/dbdiagram` with his description carried through.

One day he tries `/diagram "write me the spec for refunds"` — that's not a diagram at all. The router says so in one line and points him to `/srs` instead of forcing a picture where prose belongs.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (the complete routing table, delegation rules, edge cases), read the source file: `.claude/skills/diagram/SKILL.md`.

Related reading:

- `.claude/rules/diagram-selection.md` — the full decision matrix (source of truth) the router mirrors.
- `explain-skills/sequence.md` — a typical drawing command this router delegates to, with all its self-checks explained.
- `explain-skills/gallery.md` — once you've drawn several diagrams for a feature, this collects them into one handoff file.
