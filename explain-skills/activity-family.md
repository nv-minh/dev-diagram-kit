---
type: skill-explainer
skill: activity-family
updated: 2026-07-14
---

# Three commands that draw a "process diagram" — which one to pick?

**English** · [Tiếng Việt](activity-family.vi.md)

> This document explains **how the three commands relate** to each other — they all draw process diagrams: `/activity`, `/activity-swimlane`, `/d2-activity`. To understand each command in depth, read its own explainer file (listed at the end).

## 1. Why are there three commands for the same job?

All three answer the same business question: **"how does this process run — what steps are there, who does which step, how does it branch when different situations arise?"** The result is always a **process diagram / workflow diagram**: boxes are steps of work, arrows are the direction of flow, diamonds are decision points (yes/no). (This type of diagram is more formal than a plain flowchart — it can add role-based lane splitting; so don't call it a "flowchart" interchangeably.)

So why not merge them into one? Because the same process may need to be **drawn in three different styles, serving three different purposes** — like the same house, an architect might hand you a quick hand sketch, a polished technical drawing, or a display rendering. Each is strongest at one thing:

- **`/activity`** — draws fast, **embeds directly into the documentation** to read right inside the file.
- **`/activity-swimlane`** — draws with **real "lane splitting" showing clearly who does which step**, suited to processes with many participants.
- **`/d2-activity`** — a third way of drawing: **lays out more cleanly than Mermaid when there are many branches**, producing a **standalone image file** that's convenient to carry around.

The important shared point: **all three are valid "views" of the same process.** Drawing one doesn't erase another — you can perfectly well have all three versions for the same flow if you need to.

---

## 2. Quick-pick table

If you only read one part, read this table:

```
 QUESTION                                          → PICK COMMAND

 Process is COMPACT, 1-2 people, and you want to
 see the picture right inside the documentation
 file (opening on GitHub / Obsidian shows the
 picture instantly)?                              → /activity  (Mermaid)

 Process has MANY ROLES (Customer / System /
 Staff / Manager...), lots of back-and-forth
 between the parties, and you need to see clearly
 "who does which step"?                           → /activity-swimlane  (PlantUML)  ⭐ default

 Process has MANY BRANCHES but little crossing,
 drawing with Mermaid gets messy — and you want a
 STANDALONE IMAGE FILE for slides / export?        → /d2-activity  (D2)

 Complex/many-step Business flow, or you need an
 international standard (OMG) + open it with
 process software like Camunda?                   → /bpmn  (see its own explainer file)
```

One sentence to remember: **embed-directly → `/activity`; many-roles → `/activity-swimlane`; many-branches-needing-own-file → `/d2-activity`.**

---

## 3. The three commands side by side

| | `/activity` | `/activity-swimlane` | `/d2-activity` |
|---|---|---|---|
| **Drawing tool** | Mermaid | PlantUML | D2 (ELK engine) |
| **Strongest at** | Embeds directly into the docs, opening shows the picture | Real "lane splitting" — clearly shows who does which step | Lays out more cleanly than Mermaid with many branches; standalone file |
| **Best for** | Compact process, 1-2 roles | Process with many roles, lots of back-and-forth | Many branches + little crossing, needs a standalone image file to carry |
| **Where the result lives** | Written directly into `flows.md` (open the file to see it) | Original `.puml` + `.svg` image in `srs/`; the image is embedded into `flows.md` | Stands alone in the `d2/` folder (not embedded) |

> Note: `/activity-swimlane` uses the plantuml.com service to produce the output image file (svg/png) from the description.

---

## 4. Why is "many roles" the most important dividing line?

If you only remember one thing to pick correctly, remember this: **the number of roles involved mostly decides which command to pick.**

The reason lies in how the machine lays out the picture. When a process has many roles (Customer, System, Staff, Manager...) and the work **jumps back and forth** between them, drawing so that **each role gets its own straight column "lane"** becomes hard for an ordinary tool:

- **Mermaid (`/activity`)** draws a "lane" as just a decorative frame — the steps inside still float freely, so with many lanes + lots of back-and-forth, **the lanes get skewed, looking messy**.
- **D2 (`/d2-activity`)** lays out more cleanly than Mermaid, but when there are very many lines crossing diagonally between lanes, it **pulls the lanes far apart**, and the paths turn into "spaghetti."
- **PlantUML (`/activity-swimlane`)** is designed specifically for this kind: it **keeps each lane a fixed straight column**, and whichever step belongs to whom sits exactly in that person's lane. This is the right tool for a multi-role process.

So the default rule is: **multi-role process → use `/activity-swimlane` (⭐).** Only when the process is compact (1-2 roles) and you want it embedded directly in the documentation should you use `/activity`. `/activity` itself is smart enough about this: if you give it a multi-role process with lots of crossing interactions, it will **proactively suggest you switch to `/activity-swimlane`** before drawing.

---

## 5. Three similarities shared by all three commands

Even though they use different tools, all three commands operate on a few of the same principles — knowing this in advance saves surprises:

1. **You describe the business, the machine handles the layout.** You don't have to drag-and-drop or align each box's position. You (or the system, reading from existing documentation) describe the steps, the decision points, who does what — and the tool automatically lays it out into a picture. This is called "AI describes the structure, the engine handles the layout."

2. **Asks you to confirm the roles before drawing (when the process has multiple roles).** When it detects a process with 2 or more roles, all three stop and ask you "does this process have these roles — {list}, is that complete?" before drawing. Reason: a role can be **hidden/implied** in the wording (not named clearly), an automatic scan can easily miss it — and missing one role means missing a whole lane. Asking back is to avoid leaving anything out. (A single-role process has no lane to split, so this asking step is skipped.)

3. **No look-and-edit over multiple rounds in the chat window.** Unlike drawing wireframes with characters (which show up right in the chat for back-and-forth editing), the diagrams from these three commands **cannot be shown in the chat window** — you view the picture from the exported file, and if you need to change something, call the command again and say what needs fixing. In return, `/activity-swimlane` has one special step: after drawing, it **opens the image itself to review it** (are the arrows pointing the right way? is each step in the right lane?) to catch errors on your behalf.

---

## 6. A real-world example — the same process, three ways of drawing it

**Son**, a BA, faces three different situations during the week that need process diagrams — and each time he picks a different command according to the actual need:

1. **The "refund" process — four roles, passing work back and forth continuously** (Customer → System → Staff → Manager → System). Because there are many roles and lots of crossing interactions, he picks `/activity-swimlane` — producing a clearly column-aligned lane diagram, showing at a glance who does which step. The image is embedded into the `flows.md` file so the whole team can read it on GitHub. (He doesn't pick `/d2-activity` here — because with so much crossing between lanes, D2 would pull the lanes into a messy "spaghetti" look.)

2. **The "plan subscription" process — many branches but little crossing between roles.** He needs a **standalone image file to paste into a slide** presenting to the board of directors. He tries drawing with Mermaid but with many branches it gets messy, so he switches to `/d2-activity`: lays out more cleanly, right-angle lines, standing alone as one image file convenient to paste into a slide.

3. **The "change password" process — only User and System, very compact.** He only needs a small process diagram embedded directly in the documentation — he uses `/activity` (Mermaid), opening the file shows the picture right away, no separate image file needed.

The key point: Son picks the tool based on **two factors** — whether the process has many crossing roles or not, and whether he needs the picture readable in place or for display elsewhere — not based on "which one looks prettiest." Multiple versions of the same process can exist in parallel; none erases another.

---

## See also

To understand each command in depth, read its own explainer file:

- `explain-skills/activity.md` — `/activity` (Mermaid, embedded directly into the documentation).
- `explain-skills/activity-swimlane.md` — `/activity-swimlane` (PlantUML, real lane splitting, ⭐ default for multi-role).
- `explain-skills/d2-activity.md` — `/d2-activity` (D2, lays out more cleanly than Mermaid with many branches, standalone file).
- `explain-skills/bpmn.md` — `/bpmn` (international BPMN standard, feeds into process management software).

The full diagram-selection rules (for all diagram types, not just activity) live in the source file: `.claude/rules/diagram-selection.md`.
