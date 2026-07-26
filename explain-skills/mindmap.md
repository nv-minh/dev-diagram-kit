---
type: skill-explainer
skill: mindmap
updated: 2026-07-26
---

# What is `/mindmap` and how does it run?

**English** · [Tiếng Việt](mindmap.vi.md)

## 1. What it is for, and when you should type this command

`/mindmap` is the command that draws a **scope / idea tree** — a picture that breaks one big topic into branches and sub-branches, so everyone can see **what the topic actually contains** at a glance.

Picture it like **the whiteboard at the start of a project**: the topic sits in the middle ("Online shop"), a few big branches grow out of it (Catalog, Cart, Account), and each branch carries a few concrete items (Search, Filter, Checkout...). No arrows, no order, no actors — just a tree of "what belongs under what."

This is a **discovery-phase** tool, meant for **before the SRS is written**. A few typical situations:

- You're at the start of a feature and need to **agree on scope** — what's in, what's out — before anyone writes detailed requirements.
- A stakeholder described a big fuzzy idea and you want to **decompose it** into named areas you can then work through one by one.
- A brainstorm produced a pile of notes and you want them **organized into a tree** the whole team can point at.

You type a command as simple as:

```
/mindmap "online shop" --feature online-shop
```

The part in quotes is the **topic** to decompose. `--feature` says which feature it belongs to (leave it out and the system guesses; if the feature doesn't exist yet, it derives a name and creates it — the mindmap is often the very first document a feature gets).

**One sentence to remember:** `/mindmap` draws **a pure decomposition tree of scope or ideas** — best at the very beginning, when the question is "what does this thing even consist of?"

---

## 2. The whole run — a diagram

The picture is **text-based code** (Mermaid) embedded in a document — it doesn't render in the chat window; open the file in a reader (VS Code / Obsidian / GitHub) and the tree appears. That's why the run ends with a **trial-render check** before reporting done.

```
 YOU TYPE THE COMMAND
 /mindmap "topic" --feature X
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 1 — Determine the feature and topic             │
 │  Guesses the feature from context; unsure → asks.    │
 │  Feature doesn't exist → derives a short name and    │
 │  creates it (no preparation required from you).      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the branches                         │
 │  Reads the feature's brainstorm notes if they exist  │
 │  and extracts the areas itself. Nothing on file →    │
 │  ASKS you in one batch: the main areas, and 2-4      │
 │  items under each. Does NOT invent scope.            │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 3 — Draw up a "must-have checklist"             │
 │  Every branch + leaf that must appear — used at the  │
 │  end to check nothing was dropped.                   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before writing (asks permission)    │
 │  "Mindmap for {topic}: N branches, ~M leaves." You   │
 │  nod (Y) before it writes to the file.               │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 5 — Append to the feature's scope document      │
 │  Adds a "## Scope: {Topic}" entry to one shared      │
 │  file — all scope trees of a feature in one place.   │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 6 — Trial-render, check for syntax errors       │
 │  Renders an image itself to be sure the tree isn't   │
 │  broken when you open it. Error → self-fix, retry    │
 │  (a couple of times).                                │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ STEP 7 — Completion report                           │
 │  Reports the file, the branch/leaf count, and that   │
 │  the picture renders. Logs it in a tracking record.  │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the document in a reader to see the tree
```

---

## 3. Why the tree stays at most 3 levels deep

The system deliberately keeps the tree to **three levels maximum**: the root topic, its main branches, and the items under each branch. If your material goes deeper ("Catalog → Search → Filters → Price filter → Slider widget"), the deep tail gets collapsed into a single node instead.

Two reasons, and both matter:

- **A practical one:** past three levels, the rendered picture becomes a cramped, unreadable fan — the exact opposite of what a scope overview is for.
- **A methodological one:** if a branch needs four or five levels of detail, that detail no longer belongs in a discovery mindmap — it belongs in the documents that come *after*: use cases, specs, process diagrams. The mindmap's job is to name the territory, not to survey every street. Depth at this stage is usually a sign you're writing the SRS inside the wrong diagram.

---

## 4. No actors here — how this differs from a use case diagram

A common confusion: "isn't this just a use case diagram without the stick figures?" No — and the missing stick figures are precisely the point.

| Question | Diagram |
|---|---|
| "What does this topic consist of?" (pure scope, no actors) | `/mindmap` (this command) |
| "Which kind of user can do which function?" (actors + functions) | `/usecase-diagram` |
| "What does the experience feel like, step by step?" | `/journey` |

A mindmap intentionally says nothing about *who* does anything. That keeps the discovery conversation open: you can list "Refunds" as an area before anyone has decided whether customers self-serve refunds or staff process them. Once the scope tree is agreed and you start asking "who does what," that's the moment to move to `/usecase-diagram` — the mindmap has done its job.

---

## 5. Where it's stored, and how edits work

`/mindmap` doesn't create a separate file per tree. Everything goes into **one shared document** — `docs/{feature}/srs/{feature}-scope.md` — one `## Scope: {Topic}` entry per mindmap. Run the command again with the same topic and the system understands it's an **update**: it regenerates only that entry, shows you the change "before/after," and leaves the other entries untouched.

Because Mermaid doesn't render in chat, there is no "fix it over many rounds in chat" mode: you review **the real picture in the document**, and call the command again when the scope changes — which, in discovery, it will.

---

## 6. A real-world example

**Thảo**, a BA, has just come out of a kickoff meeting for a "loyalty program" — an hour of enthusiastic but scattered ideas: points, tiers, vouchers, a partner marketplace, birthday gifts. Before anyone writes a single requirement, she wants one picture the team can agree on.

Thảo types:

```
/mindmap "loyalty program" --feature loyalty
```

1. The `loyalty` feature doesn't exist yet — the system says so, proposes creating it with that name, and Thảo confirms. No brainstorm notes exist either, so the system asks her in one batch: what are the main areas, and what sits under each?

2. Thảo answers from her meeting notes: Earning points (purchases, referrals, birthday bonus), Spending points (vouchers, partner offers), Tiers (silver/gold rules, perks), and Admin (adjustments, reporting).

3. The system lists its must-have checklist — 4 branches, 10 leaves — and previews: *"Mindmap for loyalty program → loyalty-scope.md: 4 branches, ~10 leaves. Apply?"* Thảo types `Y`. One of her notes went five levels deep ("gold tier → perks → free shipping → express only") — the system collapses that tail into a single "Gold perks" leaf and mentions it did so.

4. It appends the entry to `docs/loyalty/srs/loyalty-scope.md`, trial-renders the image — passes — and reports done: 4 branches, 10 leaves, picture renders.

Thảo opens the file and screenshots the tree into the team channel. Within an hour the debate she wanted happens: the partner marketplace branch gets marked "phase 2" and dropped from the initial scope. The next week, use cases are written branch by branch — each one traceable back to a leaf on this tree.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (Mermaid `mindmap` syntax, node shapes, the exact steps), read the source file: `.claude/skills/mindmap/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/usecase-diagram.md` — the natural **next step** after the scope tree: actors + functions, once "who does what" starts to matter.
- `explain-skills/journey.md` — the **experience view** of a feature (steps + satisfaction scores over time).
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
