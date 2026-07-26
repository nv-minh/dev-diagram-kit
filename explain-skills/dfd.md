---
type: skill-explainer
skill: dfd
updated: 2026-07-26
---

# What is `/dfd` and how does it run?

**English** · [Tiếng Việt](dfd.vi.md)

## 1. What it is for, and when you should type this command

`/dfd` is the command that draws a **Data Flow Diagram** — the picture that answers one specific question: **where does the data go?** Which outside party hands data in, which internal step transforms it, which store it comes to rest in, and what flows back out.

Picture it like **tracking a parcel through a postal system**: the sender and receiver stand outside (they aren't part of the post office), the sorting and delivery steps are inside, the warehouses are where parcels wait — and what you draw on every arrow is **the parcel itself**, not the act of carrying it. A DFD does exactly this for data: customers and payment gateways stand outside, processes transform the data inside, data stores hold it at rest, and every arrow is labeled with the data that moves.

One command produces **two pictures at two zoom levels**:

- **L0 (context)** — the whole system as **one single box**, surrounded by the outside parties and the data crossing the boundary. The "one glance" picture: what comes in, what goes out.
- **L1 (exploded)** — that one box opened up into a handful of numbered processes plus the data stores between them. The "how it moves inside" picture.

A few typical situations where you should use `/dfd`:

- Someone asks **"where is customer data actually stored, and who touches it?"** — a privacy review, an audit, a data-mapping exercise. This is *the* diagram for that question.
- You already have an architecture diagram and a sequence diagram, but readers still can't see **which store feeds which step** — the data view is the missing third angle.
- You're specifying a feature that is essentially **data in, transform, data out** (orders, invoicing, reporting) and want devs to agree on the stores and flows before anyone codes.

You type a command as simple as:

```
/dfd --feature order
/dfd "customers place orders, we charge them via a gateway and keep order history"
```

The first form points at an existing feature (the system reads that feature's documents as its source). The second form is a plain-language description — if the feature doesn't exist yet, the system derives a name, interviews you once, and creates it.

**One sentence to remember:** `/dfd` draws **where the data moves** — between the outside world, the processes that transform it, and the stores that hold it — at two zoom levels, L0 for the boundary and L1 for the inside.

---

## 2. The whole run — a diagram

Unlike `/sequence` (which embeds text-code into a document), `/dfd` produces **standalone image files**: two `.d2` source files and two rendered `.svg` pictures. That shapes the run: the system must compile the sources into real images, and then **look at the images itself** before reporting done.

```
 YOU TYPE THE COMMAND
 /dfd --feature order        (or a plain-language description)
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Determine which feature this belongs to      │
 │  Named feature → use it. Description of a new one →   │
 │  derives a name and creates it. Files already exist   │
 │  → switches to update mode instead of refusing.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Gather the data-flow facts, best source      │
 │          first                                        │
 │  Reads in priority order: the feature's ERD (its      │
 │  entities are candidate stores) → the spec (rules     │
 │  become processes) → brainstorm notes (outside        │
 │  parties). Nothing on file → asks YOU once, in one    │
 │  batched round of business questions.                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Build the fact checklist                     │
 │  Every external entity · every process · every data   │
 │  store · every flow (source → target + data label).   │
 │  Used at the end to verify nothing got dropped.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Preview in plain words, ask permission       │
 │  "I'll draw the DFD for order: 2 external entities,   │
 │  3 processes, 2 stores. Apply?" — business language,  │
 │  NOT a dump of diagram source. You nod (Y) first.     │
 └──────────────────────────────────────────────────────┘
        │  (you say Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Write the two sources: L0 then L1            │
 │  Text-based D2 code, no manual coordinates — the      │
 │  layout engine positions everything. L0: one system   │
 │  box + outside parties + boundary flows. L1: the box  │
 │  exploded into processes (1.1, 1.2…) + stores (D1…).  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Compile both into real .svg images           │
 │  Compile fails (usually an unquoted special           │
 │  character in a label) → self-fix, re-render. Only    │
 │  moves on when both images actually exist.            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Look at the images, check the balance        │
 │  Opens its own output: is every fact from Step 3      │
 │  drawn? And the balance rule: every flow crossing     │
 │  the L0 boundary must reappear in L1 (section 4).     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 8 — Completion report                            │
 │  Lists the files, the counts (entities / processes /  │
 │  stores), confirms both images compile. Logs the      │
 │  change.                                              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the .svg files in a browser/IDE to view
```

---

## 3. The three kinds of boxes, and the one rule about arrows

Every DFD is built from exactly three kinds of elements plus arrows. Learn these four things and you can read any DFD:

- **External entity** (gray, dashed border) — a person, organization, or system **outside your boundary**: Customer, Supplier, Payment gateway. Dashed on purpose: "we don't control this, we only exchange data with it." External entities give data and receive data; they are never drawn doing work inside.

- **Process** (green, rounded, numbered `1.0`, `1.1`, `1.2`…) — a step that **transforms** data: takes something in, does something to it, sends something out. The numbering isn't bureaucracy — it's the thread that ties zoom levels together: `1.0` at L0 explodes into `1.1`, `1.2`, `1.3` at L1, so a reader always knows which close-up belongs to which overview box.

- **Data store** (purple cylinder, numbered `D1`, `D2`…) — a place where data **rests between steps**: Orders, Customers. A store does nothing by itself; it just holds data until a process reads it back out.

- **The arrow rule — the one thing people get wrong:** every arrow label names **the data that moves, never the action**. It's `"order"`, not `"sends order"`; `"payment result"`, not `"responds"`. The arrow's direction already says "flows to" — writing the verb again is noise, and worse, it drags the diagram toward being a process chart, which is a different tool's job (section 6).

> **A spot commonly misunderstood, worth stating clearly:** a data store in a DFD is **not** a database table. "D1 Orders" says *data about orders rests here* — no columns, no data types, no relationships. That level of detail belongs to `/erd`. If you find yourself wanting to list attributes inside a store, that's the signal you've drifted into the wrong diagram.

---

## 4. Why two pictures — L0 first, then L1?

It might seem wasteful to draw the system twice. It isn't, and the reason is about **audiences and agreement**.

**L0 answers the boundary question.** Before anyone cares how data moves *inside*, everyone must agree on what crosses *the edge*: which outside parties exist, what they hand us, what we hand back. That's a conversation you can have with a sponsor or a compliance officer in thirty seconds, precisely because L0 hides everything internal — one box, a handful of arrows. Getting the boundary wrong invalidates every deeper diagram, so it deserves its own dedicated picture.

**L1 answers the inside question.** Once the boundary is agreed, L1 opens the box: 3-6 numbered processes and the stores between them. Deliberately **3-6, not more** — if the inside needs ten processes, the diagram has stopped being readable and the system will suggest going one level deeper on a single sub-process (an L2) or narrowing the scope, rather than cramming.

**And the rule that keeps the two honest: balanced decomposition.** Every arrow that crosses the boundary in L0 must reappear somewhere in L1, and L1 must introduce no new boundary crossings. If L0 shows "payment result" flowing in from the gateway, some L1 process must receive exactly that flow. Why so strict? Because the two pictures claim to be **the same system at two zoom levels** — if data can appear or vanish between them, one of the two is wrong, and readers can no longer trust either. The system checks this balance itself in Step 7, the same way `/sequence` checks its coverage checklist: rendering successfully is not the same as being complete and consistent.

---

## 5. Why does the system draw the layout itself — and review its own image?

Two design choices in the run deserve a "why."

**No manual coordinates.** The system writes only *what exists and what connects to what* — never "put this box at x=200." A layout engine computes positions automatically. This matters more than it sounds: when you later add one process to a hand-positioned diagram, everything overlaps and someone spends an hour nudging boxes. With engine layout, a re-run redraws a clean picture every time — which is exactly what makes **update mode** cheap. Re-run `/dfd --feature order` after the business adds a refund flow, and the system diffs, patches the source, re-renders; nothing needs manual rearranging.

**Self-review of the rendered image.** A `.svg` doesn't show in the chat window, so if the system stopped at "compile passed," you'd be the first person to actually *look* at the picture — and the first to discover a truncated label or a missing store. So before reporting done, the system opens its own output and checks it against the fact checklist from Step 3, plus the balance rule from section 4. Same philosophy as `/sequence`'s trial-render-plus-coverage steps, adapted to image files: **"it compiled" and "it's right" are two different checks**, and the system owes you both. For the same reason there is no "fix it over many chat rounds" loop — you review from the real `.svg`, and call the command again to change things.

---

## 6. The data view — how `/dfd` sits next to the other diagram families

The most useful way to understand `/dfd` is as **the third leg of a tripod**. A system can be looked at from three orthogonal angles, and each angle has its own command family:

| Angle | Question it answers | Command |
|---|---|---|
| **Structure** | what blocks exist and how are they nested/connected? | `/system-design`, `/d2-architect` (C4 view) |
| **Time** | who calls whom, in what order, with what branches? | `/sequence` |
| **Data** | where does data move, which process transforms it, which store holds it? | **`/dfd` (this command)** |

"Orthogonal" is the key word: these views **don't compete, they complement**. An architecture diagram can show an "Order service" box connected to a database — but it can't tell you *which data* flows over that line or *why*. A sequence diagram shows the order of calls — but data stores barely appear, and "where does this end up at rest" is invisible. Only the DFD makes data the main character. A feature documented with all three (C4 for structure, sequence for time, DFD for data) leaves very few "wait, but where does…" questions unanswered.

Two nearby commands people confuse with `/dfd`:

- **`/erd`** — draws the data *at rest in detail*: entities, attributes, relationships. The DFD names a store "D1 Orders" and stops; the ERD opens that store up. Sibling views of data — motion vs. shape.
- **`/d2-activity`** — draws a *process* flow: steps, decisions, who does what. Looks superficially similar (boxes and arrows!) but its arrows mean "then do this," while DFD arrows mean "this data moves here." If your arrow labels keep wanting to be verbs, you want `/d2-activity`, not `/dfd`.

---

## 7. Where the files land, and how you review and edit

`/dfd` writes into a dedicated folder per feature — `docs/{feature}/dfd/` — five files: the L0 source and image, the L1 source and image, and a small index file listing every element. It deliberately does **not** write into the feature's `srs/` folder: text specs and rendered diagrams have different lifecycles, and mixing them makes both harder to maintain.

Reviewing is simple: **open the two `.svg` files** in a browser, IDE, or Obsidian — real pictures, not code. Check three things in order: (1) is the L0 boundary right — every outside party present, nothing internal leaking out? (2) do the L1 processes match how the business actually thinks about the work? (3) spot-check a few arrows — is each label a piece of data, not a verb?

To change anything, **run the command again** and say what changed. The system recognizes the existing files, enters update mode, shows you the difference before overwriting, and re-renders both levels — keeping them balanced. It never creates a duplicate set.

---

## 8. A real-world example

**Trang**, a BA on the "order" feature, gets a question from a compliance review she can't answer from her existing documents: *"show us every place customer data flows and where it's stored."* She has an ERD and a spec — but nothing that shows data **in motion**.

Trang opens a terminal and types:

```
/dfd --feature order
```

1. The feature exists — the system finds `docs/order/` and its documents. No questions needed.
2. It gathers facts by priority: the ERD yields candidate stores (Orders, Customers); the spec's business rules yield the processes (capture order, process payment, fulfill); the brainstorm notes yield the outside parties (Customer, Payment gateway).
3. It builds the fact checklist: 2 external entities, 3 processes, 2 stores, 9 flows — each flow with its data label.
4. It previews in plain words: *"I'll draw the DFD for order at `docs/order/dfd/` — External entities (2): Customer, Payment gateway. Processes (3): 1.1 Capture order · 1.2 Process payment · 1.3 Fulfill order. Data stores (2): D1 Orders · D2 Customers. Source: your ERD + spec. Apply?"* Trang types `Y`.
5. It writes the two sources. L0: one box "1.0 Order system," Customer and Gateway outside, four boundary flows ("order," "confirmation," "payment request," "payment result"). L1: the box exploded into 1.1/1.2/1.3 plus D1 and D2, every arrow labeled with data — "order record," "pending order," "payment status," "customer profile."
6. It compiles both. L1 fails once — the label `"1.2 Process payment (card)"` had unquoted parentheses; the system quotes it and re-renders clean.
7. It reviews its own images against the checklist, and checks the balance: all four L0 boundary flows reappear in L1 — the Customer's "order" now lands on 1.1, the Gateway pair on 1.2. Balanced.
8. It reports: two `.svg` files, 2 entities / 3 processes / 2 stores, compile OK.

Trang opens `order-dfd-l1.svg` in her browser. The compliance answer is now literally visible: customer data enters at 1.1, rests in D2 Customers, feeds order capture, and **never flows to the payment gateway** — only payment requests do. She pastes the L0 into the review deck for the executives and the L1 into the working session with the auditors. A month later the business adds refunds; she re-runs `/dfd --feature order`, the system enters update mode, adds process 1.4 and the "refund request" flows to both levels, and shows her the diff before overwriting.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. To see the full technical details (D2 notation, the pastel style tokens, the L0/L1 formulas, gotchas), read the source file: `.claude/skills/dfd/SKILL.md`.

Other diagram-drawing commands in the same toolkit:

- `explain-skills/d2-architect.md` — the **structure** view (blocks, nesting, connections). Pairs with `/dfd`: C4 shows what the blocks are, DFD shows what data moves between them.
- `explain-skills/sequence.md` — the **time** view (who calls whom, in what order). The third leg of the tripod in section 6.
- `explain-skills/erd-family.md` — data **at rest, in detail** (entities, attributes, relationships). Opens up the stores that `/dfd` only names.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
