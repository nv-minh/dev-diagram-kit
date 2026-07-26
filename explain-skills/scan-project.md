---
type: skill-explainer
skill: scan-project
updated: 2026-07-26
---

# What is `/scan-project` and how does it run?

**English** · [Tiếng Việt](scan-project.vi.md)

## 1. What it is for, and when you should type this command

`/scan-project` takes an **existing codebase** — a project that was already built, maybe years ago, maybe by people who have since left — and **reverse-engineers a full set of architecture diagrams from the source code itself**. You don't describe anything; the system reads the code and draws what it finds.

Picture it like **hiring a surveyor for a house that has no blueprints**: the house exists, people live in it, but nobody has the plans anymore. The surveyor walks every floor, measures the rooms, traces the pipes, and hands you back a folder of drawings — floor plan, plumbing diagram, wiring diagram — each one annotated with *how sure* they are about it ("I measured this wall myself" vs "this pipe probably goes there, I couldn't open the ceiling"). That folder is what `/scan-project` produces, for software: this kind of inherited-without-plans project is what the trade calls a **brownfield** codebase.

A few typical situations where you should use `/scan-project`:

- You **just joined or inherited a project** with little or no documentation, and need to understand its shape before touching anything.
- You're the **dev playing the BA role** on a legacy system, and stakeholders keep asking "what does this system actually consist of?" — a question the code can answer but no document does.
- The docs exist but are **years out of date**, and you want pictures drawn from what the code says *today*, not what someone wrote back then.

You type a command as simple as:

```
/scan-project
```

to scan the project in the current directory, or point it somewhere and narrow it down:

```
/scan-project ~/work/legacy-shop            # scan a project at a path
/scan-project --focus src/billing           # big codebase: only scan deeply in one area
/scan-project --module billing              # only (re)draw the detail of one module
```

**One sentence to remember:** `/scan-project` **reads the code** of an existing project and draws the **whole architecture diagram set** from it — with every element labeled by how certain the system is and where in the code it came from — so you inherit a documented system instead of a mystery.

---

## 2. The whole run — a diagram

The run has **two phases with a full stop between them**: first the system scans and shows you *a plan* of what it found and proposes to draw; only after you approve does it draw anything. (Why that stop exists is Section 5.)

```
 YOU TYPE THE COMMAND
 /scan-project [path] [--focus <dir>]
        │
        ▼
 ═════ PHASE 1 — SCAN AND PLAN ═════
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Identify what kind of project this is        │
 │  Reads the manifest files (package.json, go.mod,      │
 │  pom.xml…) → language, framework, entry points.       │
 │  Framework unclear → asks you to confirm the stack    │
 │  instead of guessing wildly.                          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Send out scouts to read the code             │
 │  Several helper agents scan in parallel, one aspect   │
 │  each: modules & boundaries · dependencies between    │
 │  modules (circular ones flagged) · the data schema ·  │
 │  the 2-3 most important flows from the entry points · │
 │  external systems (DB, queue, payment, email…).       │
 │  Scouts are READ-ONLY: they report findings with      │
 │  file evidence, they never write or draw anything.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Cross-check against docs, if any exist       │
 │  README / docs / decision records are compared with   │
 │  what the code says. On conflict, the CODE wins —     │
 │  but the conflict itself is noted for you.            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Write the scan plan, then FULL STOP          │
 │  A scan-plan file: modules found, proposed diagrams   │
 │  (a tick-list you can trim), and a list of uncertain  │
 │  spots (🟡). The system prints the summary and asks:  │
 │  "Draw this set? (Y / drop a diagram / edit)" —       │
 │  and WAITS. Nothing is drawn before your answer.      │
 └──────────────────────────────────────────────────────┘
        │
        ▼   (you answer Y, or trim the list)
 ═════ PHASE 2 — GENERATE ═════
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Draw each selected diagram                   │
 │  C4 overview, module map, module detail, ERD, key     │
 │  flows — each drawn with the same recipe as its       │
 │  sibling command (/system-design, /d2-erd,            │
 │  /sequence…), from the scan findings.                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Render and verify every diagram              │
 │  Each one is compiled to a real image; a failure →    │
 │  self-fix and retry (a couple of times per diagram).  │
 │  Nothing ships broken.                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Write the index (and optional gallery)       │
 │  An index file: every diagram, its source files in    │
 │  the code, and its confidence. Optionally one HTML    │
 │  gallery page (dark theme, PNG/PDF export) with all   │
 │  diagrams embedded.                                   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 8 — Report, including what to double-check       │
 │  Lists the files, and — importantly — the 🟡 items    │
 │  the system could not confirm from code and wants     │
 │  you to verify.                                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — open the index (or the gallery) to browse the set
```

---

## 3. What's inside the diagram set?

One scan produces up to **six deliverables**, all in one shared folder (`docs/_shared/architecture/` — architecture belongs to the whole project, never to one feature):

1. **C4 overview** — two zoom levels: the *context* picture (the system as one block, its users, its external services) and the *container* picture (the apps/services/data stores inside). Same convention as `/system-design` — see that explainer for what the levels mean.
2. **Module map** — the project's modules and the dependency lines between them. **Circular dependencies get flagged**, not hidden — module A needing B needing A back is one of the most valuable things a scan can surface, because it's invisible when you read files one at a time.
3. **Module detail** — the lid off one module: its main components and internal wiring. Drawn for the module you name (`--module`) or the largest ones.
4. **ERD** — the data picture: tables and their relationships, read from the schema/migrations/ORM entities. No schema in the project → this one is dropped with a note, never invented.
5. **Key flows** — 2-3 sequence diagrams of the most important journeys (the main request path, a background job, a webhook), traced from real entry points in the code.
6. **Index** — the table of contents: every diagram, where its facts came from, how confident. Optionally an **HTML gallery** — one dark-theme page with every diagram embedded and PNG/PDF export, same style as the `/system-design` deck.

Notice these are the same diagram *types* the toolkit already draws one at a time — and that's deliberate: `/scan-project` reuses the exact recipes of `/system-design`, `/d2-architect`, `/d2-erd`, and `/sequence` rather than inventing its own look. A scanned diagram and a hand-made one sit side by side in your docs and match. One nice extra: because the scan *knows* the tech it found (Postgres, Redis, Kafka…), those nodes get their tech logos automatically — one glance at the container picture reveals the stack.

---

## 4. The confidence markers: ✅ read · 🔵 inferred · 🟡 guessed

This is the part that makes a scanned diagram trustworthy, so it deserves its own section.

When a human reverse-engineers a codebase, they silently mix three kinds of knowledge: things they *read directly* ("there is a `payments` table — I saw the migration"), things they *inferred* ("this service talks to Redis — the client library is imported and configured"), and things they *guessed* ("this queue is probably for order events — the name suggests it"). A diagram that presents all three with the same confident ink is dangerous: a reader can't tell the surveyed wall from the assumed pipe.

So every element in the set carries two labels:

- **Confidence** — ✅ *read for certain* (seen directly in the code) · 🔵 *inferred* (concluded from strong evidence) · 🟡 *guessed* (plausible but unconfirmed — "needs confirmation").
- **Provenance** — *which file or path the fact came from*, so any claim can be checked at its source in seconds.

Behind this sits a hard rule: **the system does not fabricate.** If a flow or relationship can't actually be read from the code, it gets marked 🟡 and put on the "please confirm" list in the final report — it does not get a made-up name and confident ink. The 🟡 list is genuinely useful in itself: it's a ready-made agenda for your next conversation with whoever knows the system's history.

---

## 5. Why the full stop between scanning and drawing?

Because between "what the code contains" and "what's worth drawing" there is a judgment call **only you can make**.

The scan might find nine modules, of which three are dead code nobody has touched in years. It might propose an ERD from a schema that's mid-migration. It might name a module `misc` because the directory gave it nothing better. If the system barreled ahead and generated the full set, you'd get polished diagrams of things that shouldn't be drawn — and polished output has a way of looking more authoritative than it deserves.

So Phase 1 ends by writing a **scan plan** — the module list with responsibilities and confidence, a tick-list of proposed diagrams, and the open questions — then comes to a **full stop** and waits. You can drop a diagram ("skip the ERD, that schema is being replaced"), correct a module name, or answer a 🟡 question before a single picture exists. Only after your Y does Phase 2 draw, and it draws only what survived the tick-list.

One more design choice belongs in this section: the code-reading scouts of Phase 2 (of the diagram — Step 2 of the run) are **read-only by construction**. They report findings back; the main thread does all the writing, and only after your stop-point approval. That's the same "preview before writing" contract every command in this toolkit honors — the scan just applies it at a bigger scale.

---

## 6. How does it survive a huge codebase?

Reading *every* file of a large project would be slow and mostly pointless — the shape of an architecture lives in a small fraction of the files. So the scan is built to **sample smartly instead of reading exhaustively**:

- It **prioritizes the high-signal files**: manifests (what is this project?), entry points (where do requests come in?), schema/migrations (what data is there?), and the import graph (who depends on whom?). Big directories get sampled, not read file by file.
- On a really large codebase, you narrow it yourself with **`--focus <dir>`** — deep scan one area, leave the rest shallow. In a **monorepo**, each package/service naturally becomes one "container" in the overview, and you can `--focus` each service in separate runs.
- The scouts run as **separate helper agents**, each reading its own aspect and returning only *findings* — tables of facts with file evidence — not raw file contents. The main thread synthesizes findings; it never drowns in source code itself.

The honest trade-off: sampling means the first pass can miss things — which is exactly why the confidence markers (Section 4) and the full stop (Section 5) exist. A missed corner shows up as a 🟡 or as a gap you spot in the scan plan, you point it out, and a `--focus` re-run fills it in. The system is designed to be *correctably incomplete* rather than confidently wrong.

---

## 7. Running it again, and how it differs from its siblings

**Re-running is the normal way to keep the set alive.** The command is idempotent: one project = one file set. Run `/scan-project` again after a few months of development and it enters **update mode** — it re-scans, diffs each diagram against the existing one, shows you what changed (a new module, a dropped dependency, three new tables), and only rewrites after your Y. Your architecture docs can track the code instead of rotting the way hand-written ones do. For a targeted refresh, `--module <name>` redraws just one module's detail.

Two siblings are easy to confuse with this command; here's the split:

| | `/system-design` | `/scan-project` | `/code-flow` |
|---|---|---|---|
| Source of truth | **you** — a description, docs, an interview | **the code** — no business interview | **the code** — one target |
| Scope | one system's design, drawn top-down | the **whole codebase**, full diagram set | **one function/module's** behavior |
| Best for | greenfield / design-first work | inheriting or documenting a brownfield project | "how does *this* function actually work?" |

In practice they chain: `/scan-project` gives you the map of an inherited system; when one flow on that map needs a microscope, `/code-flow <target>` traces that single function with line-level provenance; and when you *design a change* to the system, `/system-design` draws the to-be picture from your description. Scan reads what *is*, system-design draws what *will be*.

---

## 8. A real-world example

**Tuấn** has just been handed a four-year-old NestJS ordering system. The two devs who built it are gone; the README still describes version one; and his manager wants an architecture overview by Friday. Reading the code file by file would take him weeks.

Tuấn opens a terminal at the project root and types:

```
/scan-project
```

1. The system reads `package.json` and the source layout: NestJS on TypeScript, a Postgres schema in `prisma/`, entry points in `src/main.ts` and a couple of queue consumers.

2. Scouts fan out: one maps the modules (`orders`, `payments`, `inventory`, `notifications`, `shared`…), one traces cross-module imports — and flags that `orders` and `inventory` **import each other**, a circular dependency — one reads the Prisma schema (14 tables), one traces the checkout flow and a payment webhook from their entry points, one collects the external systems (Postgres, Redis, a Momo SDK, SMTP config).

3. The old README claims there's a "reporting service" — the scouts found no trace of it in the code. The conflict is noted: code wins, README was stale.

4. The system writes the scan plan and stops: *"Detected 6 modules, 4 external systems, 14 tables. I propose: C4 overview · module map (1 circular ⚠️) · ERD (14 tables) · sequences «checkout», «payment webhook» · module detail «orders». Uncertain (🟡): the `legacy-sync` job's purpose — the name suggests syncing with an old system, nothing in code confirms it. Draw this set?"* Tuấn drops the module detail for now ("just the overview first") and answers Y.

5-6. Phase 2 draws each selected diagram with the family recipes and compiles every one; the ERD needs one self-fix (a table label with special characters), then all pass.

7. The index is written — each diagram with its provenance ("modules: from `src/*` structure; ERD: from `prisma/schema.prisma`") — plus the HTML gallery. The container picture shows Postgres, Redis, and Momo with their logos: the stack visible at a glance.

8. The report lists the files and repeats the 🟡: *"Please confirm what `legacy-sync` does."* Tuấn asks the former team's manager, learns it syncs orders to a warehouse system that's being retired, and notes it in the index.

On Friday, Tuấn presents the gallery. The circular dependency between `orders` and `inventory` — which nobody in the room knew about — becomes the meeting's main action item. Three months later, after the team splits `inventory` properly, Tuấn runs `/scan-project` again: update mode diffs the module map, shows the circular arrow is gone, and after his Y the set is current again — no rot, no `-v2` files.

---

## See also

This document only explains the idea and the run flow at an easy-to-understand level. For the full technical details (the scan-plan skeleton, the subagent prompts, the per-diagram recipes, the gotchas), read the source file: `.claude/skills/scan-project/SKILL.md`.

Related commands in the same toolkit:

- `explain-skills/system-design.md` — draws a system design **from your description/interview** (the greenfield direction). `/scan-project` is its brownfield mirror: same diagram types, but the code is the source of truth and there's no business interview.
- `/code-flow` — the **single-target** sibling: traces one function/module in existing code into one flow diagram with `file:line` provenance. Scan for the map, code-flow for the microscope. Source file: `.claude/skills/code-flow/SKILL.md`.
- `explain-skills/d2-erd.md` and `explain-skills/sequence.md` — the standalone versions of the ERD and sequence diagrams that the scan generates as part of its set.
- The full rule for choosing a diagram type lives in the source file: `.claude/rules/diagram-selection.md`.
