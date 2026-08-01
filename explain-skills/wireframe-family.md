---
type: skill-explainer
skill: wireframe-family
updated: 2026-08-01
---

# The wireframe family — /wireframe-ascii /wireframe-html /prototype-html /figma

**English** · [Tiếng Việt](wireframe-family.vi.md)

## 1. Why this family exists

Once the user flow pins down which screens exist and how they connect, someone has to draw them. These four skills are the drawing layer — four fidelities, one source of truth. They all gate on `/user-flow`'s approved file (the `[n]` screen numbers and the `primary_device` are the contract everyone follows).

## 2. Quick pick

| You need to… | Run | Artifact |
|---|---|---|
| Sketch screens you can review in chat | `/wireframe-ascii <feature> --flow <slug>` | ASCII frames + 5-column tables |
| Review the same screens in a browser | `/wireframe-html <feature> --flow <slug>` | B&W static HTML + navigation entry |
| Prove the navigation actually works | `/prototype-html <feature>` | one clickable self-contained prototype |
| Push the frames into Figma | `/figma <feature>` | Figma frames (URLs in the index) |

## 3. The fidelity ladder + the one source of truth

```
   /user-flow  (srs/{f}-userflow.md — screens [n], flows, primary_device, stage: approved + hash)
        │  the contract everyone reads
        ▼
   /wireframe-ascii  ──content source of truth──▶  /wireframe-html  ──▶  /prototype-html
   (chat, L3 iterate)                                (browser, static)      (clickable)
        │                                                  │                    │
        └──────────────────── all three write the {f}-wireframe-index.md (Figma/HTML/HTML-prototype columns)
                                                                            ▲
   /figma reads the wireframes, pushes Figma frames, writes URLs into the index (external-write gate)
```

**ASCII is the source of truth for content.** If the HTML or the prototype disagrees with the ASCII, the ASCII is right — re-sync, never silently redesign in the higher fidelity.

## 4. The two rules every screen follows

- **One screen = one state at one point in time** (`ba-conventions.md` §8) — an error state is its own screen, not a busy combo.
- **The 5-column description table is the deliverable, not the frame** (`ba-conventions.md` §6) — `# / Items / Control type / Data type / Description`, 6 information layers per element, sourced from the SRS/UC/URD (never fabricated; gaps get asked or marked).

## 5. Worked example

`example/atlas-re/ascii-wireframe/approve-claim.md` + `atlas-re-wireframe-index.md` carry the `approve-claim` flow: screens `[1]…[4]` drawn as ASCII with the 5-column tables citing the SRS's FR/BR/E- codes, device desktop 1024. The HTML and prototype shells (`skills/wireframe-html/resources/`, `skills/prototype-html/resources/`) show the next two fidelities.

## See also

- `explain-skills/spec-family.md` — `/user-flow`, whose output these skills gate on
- `rules/doc-selection.md` — the full matrix + wave status
