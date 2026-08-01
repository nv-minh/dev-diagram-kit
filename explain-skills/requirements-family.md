---
type: skill-explainer
skill: requirements-family
updated: 2026-08-01
---

# The requirements family — /brainstorm /urd /brd /prd-epic /srs (+ /prd /roadmap)

**English** · [Tiếng Việt](requirements-family.vi.md)

## 1. Why this family exists

Before any diagram is worth drawing, someone has to answer: what problem, for whom, why now, what exactly must the system do. These seven skills are that answer as a **document chain** — each one consumes the previous one's output and mints the IDs the next one covers. The result is a vault where every functional requirement traces back to a user need, and `/gap` (wave 4) can prove it.

## 2. Quick pick

| You need to… | Run | It mints |
|---|---|---|
| Explore a raw idea | `/brainstorm "<idea>"` | Open Questions |
| Capture who the users are + what they need | `/urd <feature>` | `UN-{feature}-NNN` |
| Make the business case | `/brd <feature>` | `BO-{feature}-NN` |
| Decide what to build for one feature | `/prd-epic <feature>` | `CAP-{feature}-NN` |
| Spec exact system behavior | `/srs <feature>` | `FR- NFR- BR- E-` |
| Define the whole product (once) | `/prd` | the Feature Map |
| Prioritize the Feature Map | `/roadmap` | RICE-lite scores |

## 3. The chain — a diagram

```
/brainstorm ──▶ /urd ──▶ /brd ──▶ /prd-epic ──▶ /srs ──▶ (wave 2: /usecase /userstory /ac)
   OQs          UN-       BO-       CAP-        FR-/NFR-/BR-/E-
                 └────────── every ID covers the one before it ──────────┘

/prd (product singleton) ──▶ /roadmap (RICE-lite Now/Next/Later)
        Feature Map ─── each feature enters the chain above via /prd-epic
```

Open Questions cascade forward automatically: an OQ you can't answer at `/brainstorm` reappears in the URD, BRD, and PRD until it's resolved (`rules/resolve-oqs.md` defines the mechanics). No skill ever invents an answer to close a gap — unanswered means OQ, always.

## 4. The shared run shape

Every skill in the family runs the same way: resolve the feature (creating it if the input is a new idea — `rules/feature-bootstrap.md` group A) → read the upstream docs → interview only the gaps (no re-asking) → build a fact-list with sources → preview at L1 → write with the activity log set → **validate with `doc-validate`** (frontmatter, IDs, links — hard gate) → big docs also pass `@doc-reviewer` (coverage, fabrication, altitude).

## 5. Worked example

`example/atlas-re/` carries the full chain for a reinsurance claim-approval feature: brainstorm → URD → BRD → PRD → SRS, cross-linked with the diagrams (swimlane, BPMN, states) the 1.x kit already generated for the same domain.

## 6. Product level vs feature level

`/prd` and `/roadmap` are **singletons** in `docs/_product/` — run once for the whole product, updated in place. "PRD for the checkout feature" is `/prd-epic checkout`, not `/prd`. The product PRD's Feature Map is where feature slugs are born; the roadmap reads that map one-way.

## See also

- `explain-skills/ba.md` — the router that picks between all of these
- `explain-skills/diagram-selection.md` — when the need is a picture instead
- `rules/doc-selection.md` — the full decision matrix + wave status
