---
type: skill-explainer
skill: system-design
updated: 2026-07-26
---

# What is `/system-design` and how does it run?

**English** · [Tiếng Việt](system-design.vi.md)

## 1. What it is for, and when you should type this command

`/system-design` draws a **system design as a multi-level story**, following a well-known convention called the **C4 model**. Instead of one big picture that tries to say everything at once, it produces **a small set of pictures, each one zoomed in a little further than the last** — and then packages them into a single presentation file you can show to stakeholders.

Picture it like **using an online map**: first you look at the country view (**L1 System Context** — your system is one single block, plus who uses it and which outside services it talks to), then you zoom to the city view (**L2 Container** — the lid comes off and you see the apps, services, and data stores inside, and which one talks to which), and — only when someone actually asks — the street view (**L3 Component** — what functional pieces sit inside one of those blocks). Each level answers **exactly one question**, so a reader can stop at whatever altitude is enough for them.

A few typical situations where you should use `/system-design`:

- You need to **present the architecture to stakeholders** — a kickoff, a steering meeting, an architecture review — where one picture at one altitude isn't enough: business people want the country view, developers want the city view.
- A feature is **large enough that "who uses it" and "what's inside it" deserve separate pictures**, instead of cramming both into one crowded diagram.
- You want a **ready-to-present deliverable**: not just image files, but one polished HTML page with all levels stacked, a dark theme, and buttons to export PNG/PDF for slides.

You type a command as simple as:

```
/system-design --feature payment
```

or describe a whole system not tied to one feature:

```
/system-design "an online-ordering system: web/mobile, API, database, calls Momo for payment and an email service"
```

Later, you can zoom further or add a runtime view:

```
/system-design --feature payment --component "Payment API"     # add the L3 street view of one block
/system-design --feature payment --dynamic "customer pays via Momo"  # one request's path, numbered
```

**One sentence to remember:** `/system-design` tells **the story of a system by zooming in level by level** (Context → Container → optional Component), and hands you both the individual pictures and **one presentation file** ready to show — use it when one quick picture is not enough.

---

## 2. The whole run — a diagram

Unlike the Mermaid-based commands, the pictures here are drawn with a tool called D2 that **renders real image files** (`.svg`) on the spot — so at the end you open an `.svg` or the `.html` deck and see finished pictures, no special reader needed. The system still self-checks every level before reporting done.

```
 YOU TYPE THE COMMAND
 /system-design --feature X | "<system description>"
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Decide where this design lives               │
 │  Belongs to one feature → that feature's folder.      │
 │  Describes the WHOLE system → the shared folder       │
 │  (docs/_shared/system-design/). Feature doesn't       │
 │  exist yet → derives a name and creates it. Ambiguous │
 │  → asks you instead of guessing.                      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the facts, at the right altitude      │
 │  Reads existing documents first (system overview,     │
 │  the feature's spec and flows). Nothing to read →     │
 │  interviews you, but ONLY at the C4 altitude: what    │
 │  the system does, who uses it, which outside services │
 │  it calls, which apps/stores are inside. It will NOT  │
 │  ask about ports, servers, or network setup — and it  │
 │  does NOT invent flows or external systems.           │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Sort the material into levels                │
 │  L1: users + your system + external systems.          │
 │  L2: the blocks inside + data stores + who calls who. │
 │  L3 (only if asked): the pieces inside one block.     │
 │  Discipline: each fact goes to its own level — no     │
 │  cramming city detail into the country view.          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview before writing (asks permission)     │
 │  Describes the plan in plain words: which levels,     │
 │  how many blocks, which external systems, the main    │
 │  flow. No code dump. You nod (Y) before it writes.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Draw each level and render it to a real      │
 │          image                                        │
 │  Writes the source for each level (no manual          │
 │  positioning — the layout engine arranges the boxes), │
 │  renders each to .svg. A level fails to compile →     │
 │  self-fix and retry (a couple of times per level).    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Look at its own picture before showing you   │
 │  Renders a check image per level and inspects it:     │
 │  overlapping boxes? crossed edges? wrong labels? a    │
 │  level that leaked detail from another level? Fixes   │
 │  what it finds, then re-renders.                      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Build the one-file HTML presentation deck    │
 │  Takes a bundled template, embeds the real .svg of    │
 │  each drawn level, fills in the title, the summary    │
 │  cards, the footer. Levels you didn't draw are        │
 │  removed from the deck, not left as empty holes.      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 8 — Update the index and report                  │
 │  A small index file lists every level, its file, and  │
 │  when it was updated. The report tells you to open    │
 │  the .html (present/export) or the .svg per level.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the .html in a browser to present,
     or the .svg files to view each level
```

---

## 3. The three zoom levels — one question per level

The heart of the C4 model is a simple rule: **each level answers exactly one question, and nothing else.**

- **L1 System Context — "where does this system stand in the world?"** Your system is one single block. Around it: the people who use it (roles like Customer, Staff — never individuals) and the external systems it calls (a payment gateway, an email service — each with its real name and a one-phrase purpose, drawn with a dashed border so "not ours" is visible at a glance). Nothing about what's inside.
- **L2 Container — "what runnable blocks make up the system?"** Now the lid comes off: the web/mobile app, the API service, the background worker, the databases and queues — plus the call lines between them and out to the external systems. "Container" here just means "a thing that runs or stores data," not any specific technology.
- **L3 Component — "what's inside one of those blocks?"** Drawn only on request (`--component <name>`), for the one block someone actually needs to open — for example the functional pieces inside the API service.
- **L4 Code** — deliberately **out of scope**. That's the developer's and architect's territory, not a shared-understanding picture.

Why the discipline matters: the moment you cram containers into the L1 picture "to save a diagram," business readers drown in blocks they don't care about, and the picture stops answering *any* question cleanly. Keeping one question per level is what lets a director read L1 in ten seconds, and a developer read L2 in one minute — **each audience stops at its own altitude**. If your material threatens to break the rule (say, boxes nested more than three deep), the system splits things out rather than letting one picture carry too much.

---

## 4. Why a one-file HTML presentation deck?

Individual `.svg` files are great for pasting into documents — but a meeting needs something else: **one thing you can open, scroll through top-down, and export from.** That's what the `.html` deck is.

It's a **single file** built from a bundled template: dark theme (comfortable on a projector), every drawn level stacked in zoom order with its title, three summary cards up top (who uses it + external systems / the main containers / data + main flow), and an export toolbar — **Copy-PNG for pasting straight into chat or slides, or PNG/PDF download**. You can send this one file to a stakeholder and they need nothing installed to view it.

Two things worth knowing about how it's built, because they explain behavior you might notice:

- **The pictures inside are the real rendered `.svg` of each level, embedded as-is** — the system never "hand-draws" the deck. This guarantees the deck always matches the standalone image files: fix a level, rebuild the deck, they can't drift apart.
- **The deck loads two small scripts from the internet to power the PNG/PDF export**, each pinned with an integrity fingerprint. The system deliberately never edits those two lines — if the fingerprint didn't match, the browser would refuse to load the scripts and the export buttons would silently die. So if you ever hand-edit the deck, leave those two lines alone.

---

## 5. When should you prefer this over `/d2-architect`?

`/d2-architect` is the close sibling in the same family — it also draws a system overview, with the same drawing tool and the same renderer. The difference is not quality but **shape of the deliverable**:

| | `/d2-architect` | `/system-design` |
|---|---|---|
| Number of pictures | **1** — one context picture | **2–3** — Context / Container / optional Component |
| Method | free-form (nested blocks, one canvas) | **standard C4** — disciplined zoom, one question per level |
| Output | `.d2` + `.svg` | `.d2`/`.svg` per level **+ the HTML presentation deck** (PNG/PDF export) |
| Best when | you need **one quick picture** to drop into a document | you need to **tell the story at multiple levels** for stakeholders/slides |

A practical rule of thumb: **if the picture will live inside a document, use `/d2-architect`; if the picture will be presented in a meeting, use `/system-design`.** Also: a small feature with three blocks doesn't need C4 layering — one `/d2-architect` picture says it all. A system with a dozen moving parts and a mixed audience does.

---

## 6. What it deliberately does NOT draw — and the optional runtime view

**No deployment detail.** No ports, no server counts, no load balancers, no network zones, no container images. Those belong to a *deployment diagram*, which is the architect's job at a later stage. This skill draws the **logical** architecture — what blocks exist, who they call, where the main data flows — which is precisely the altitude where a dev-as-BA aligns understanding with stakeholders. If you ask for infra detail, the system will point this out rather than draw it (and it won't interview you about it either — see Step 2).

**The runtime view (`--dynamic`) is an optional extra, one flow at a time.** The static L2 picture shows *structure* — which blocks exist and which lines connect them — but not *order*. `--dynamic "<flow>"` adds one more picture: the same container blocks, with the edges of **one request's journey numbered 1, 2, 3…** so you can trace, say, a payment from the app through the API to the gateway and back. One flow per dynamic picture; a second flow means a second `--dynamic` run.

This overlaps on purpose with `/sequence`, so pick by what you need to see: **need the flow drawn on top of the container structure** → `--dynamic`; **only need who-calls-whom in what order, with error branches** → `/sequence` is the better tool (branches are its specialty; the dynamic view stays a single happy path).

---

## 7. Where the files live, and what happens when you run it again

Everything lands in one folder: `docs/{feature}/system-design/` for a feature-scoped design, or `docs/_shared/system-design/` when you described the whole system (architecture that spans features is never stuffed into one feature's folder). Inside, a predictable set: one `.d2` + `.svg` pair per level, the `.html` deck, and a small index file listing each level with its file and last-updated date.

The command is **idempotent**: one system = one file set, forever. Running `/system-design --feature payment` again does **not** create `payment-v2` — the system reads the existing sources, works out what changed, shows you a **before/after diff of the affected levels**, and only after your Y re-renders those levels and rebuilds the deck. That makes it safe to re-run casually: added an external service? new worker? just call the command again and say so. The pictures and the deck stay in step, because the deck is always rebuilt from the freshly rendered images (see Section 4).

---

## 8. A real-world example

**Minh** is a developer playing the BA role for an online-ordering product. Next Tuesday he has an architecture alignment meeting: the product owner, two backend devs, and a manager who will ask "what exactly are we building and what does it depend on?". One picture won't serve both audiences — he needs the layered story.

Minh opens a terminal and types:

```
/system-design "online-ordering system: web and mobile app, ordering API, orders database, background worker, calls Momo for payment and SendGrid for email" --feature ordering
```

1. The system resolves the target: feature `ordering` doesn't exist yet, so it derives the slug and will create it on write — Minh doesn't have to prepare anything.

2. There's no system overview document yet, so the system interviews Minh — but only at the C4 altitude: "Who uses the system besides the customer? Is there a staff/admin role?" Minh adds: "yes, staff confirm orders through an admin screen." Not one question about servers or ports.

3. The system sorts the material: L1 gets 2 user roles, the system block, and 2 external systems; L2 gets 5 containers (web/mobile, admin screen, ordering API, orders DB, worker) and the call lines between them and out to Momo/SendGrid.

4. It previews in plain words: *"I'll draw the ordering system design as C4: L1 Context + L2 Container. Users (2): Customer, Staff. External (2): Momo, SendGrid. Containers (5): … Main flow: Customer → API → Momo → Worker → SendGrid. Apply?"* Minh types `Y`.

5. Each level is written and rendered to `.svg`. The container level fails to compile once — a label with a `/` needed quoting — the system fixes it and re-renders.

6. The system inspects its own rendered images: on L2 two edges cross confusingly near the worker, so it reorders the source and re-renders — now clean.

7. It builds `ordering-system-design.html` from the template: both SVGs embedded, summary cards filled in, the L3 section removed since no component level was drawn.

8. The report lands: files in `docs/ordering/system-design/`, open the `.html` to present. Minh opens it in a browser, scrolls the two levels, hits **Copy PNG** on the L1 picture and pastes it into the meeting invite. In the meeting, the manager gets his answer from L1 in ten seconds; the devs argue over L2 — exactly the split the levels were designed for.

A week later the team adds a Redis cache in front of the orders DB. Minh runs `/system-design --feature ordering` again, says what changed — the system diffs the container level, shows him before/after, and on `Y` re-renders L2 and rebuilds the deck. Still one file set, no `-v2` copies. When a dev later asks "what's actually inside the ordering API?", Minh runs `--component "Ordering API"` and the L3 street view joins the same deck.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. For the full technical details (the D2 source formulas per level, the palette, the HTML template rules, the gotchas), read the source file: `.claude/skills/system-design/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/d2-architect.md` — the **single quick context picture** in the same family. Rule of thumb: picture for a document → `/d2-architect`; layered story for a meeting → `/system-design`.
- `explain-skills/scan-project.md` — draws the architecture set **by reading an existing codebase** instead of interviewing you. Greenfield / design-by-description → `/system-design`; brownfield code already exists → `/scan-project`.
- `explain-skills/sequence.md` — when you only need **who calls whom in what order, with error branches**, without the container structure underneath.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
