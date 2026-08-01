---
type: skill-explainer
skill: spec-family
updated: 2026-08-01
---

# The specification family — /usecase /userstory /ac /user-flow

**English** · [Tiếng Việt](spec-family.vi.md)

## 1. Why this family exists

The SRS says what the system shall do. These four skills turn that into the artifacts a team actually works from: **use cases** (the actor's story, with everything that can go wrong), **user stories** (backlog slices a sprint can swallow), **acceptance criteria** (the pass/fail contract per story), and the **user flow** (which screens exist and how they connect — the file every wireframe skill reads).

## 2. Quick pick

| You need to… | Run | It mints |
|---|---|---|
| The actor-goal narrative + failure story | `/usecase <feature>` | `UC-{slug}` |
| Dev-ready backlog items from the FRs | `/userstory <feature>` | `US-{NNN}` |
| Make each story verifiable (Given-When-Then) | `/ac <feature>` | `AC-{NNN}` (per story) |
| The screen map wireframes will read | `/user-flow <feature>` | screens `[n]`, flow-slugs |

## 3. How they connect — a diagram

```
        srs/{f}-spec.md (FR- / BR- / E-)
        │                │
        ▼                ▼
   /usecase          /userstory ──▶ /ac (edits us-NNN.md in place)
   uc-{slug}.md      us-{NNN}.md      │
   + usecase-index   + story-index    └─ AC covers: happy + each E- + each BR- boundary
   (= the per-feature traceability matrix: UC↔FR↔Screen↔Error↔OQ)

   /user-flow ──▶ srs/{f}-userflow.md (flows + screens [n], stage: approved + hash)
                        │
                        ▼  (wave 3 reads this — the SOLE source of flow division)
                  /wireframe-ascii · /wireframe-html · /prototype-html
```

## 4. The two content/metadata splits to know

- **`uc-*.md` and `us-*.md` are zero-frontmatter** — pure prose. Status, priorities, FR links, screens, and jira-keys live in the **index files** (`{f}-usecase-index.md`, `{f}-story-index.md`). Tools (jira sync, `/gap`, dashboard) read the indexes only.
- **`/ac` never creates files** — it edits the `## Acceptance Criteria` section inside existing stories, always shown as an L2 diff.

## 5. Discovery mode (the one exception to "needs the SRS")

`/usecase` runs in two modes: with the SRS it fills full traceability; **without** it, it becomes an elicitation tool (group A) — a BA often writes UCs *before* the spec to explore the domain. FR columns stay empty, unknowns become OQs, and `/srs` formalizes afterward. `/userstory` and `/ac` have no such mode — they refuse without their upstream (stories without FRs would be invented scope).

## 6. Worked example

`example/atlas-re/`: `usecases/uc-approve-claim.md` + index, `userstories/us-001…003.md` + story index, and `srs/atlas-re-userflow.md` — all tracing back to `srs/atlas-re-spec.md` from the requirements chain.

## See also

- `explain-skills/requirements-family.md` — the chain that produces the SRS these skills consume
- `explain-skills/usecase-family.md` — `/usecase` text vs `/usecase-diagram` visual
- `rules/doc-selection.md` — the full matrix + wave status
