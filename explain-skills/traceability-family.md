---
type: skill-explainer
skill: traceability-family
updated: 2026-08-01
---

# The traceability & change family — /gap /cr /reverse-doc

**English** · [Tiếng Việt](traceability-family.vi.md)

## 1. Why this family exists

Three skills that operate *across* the document chain rather than producing one link in it: `/gap` proves the chain is complete, `/cr` changes it safely, and `/reverse-doc` rebuilds it from legacy sources. They share one contract — `rules/traceability.md`'s spine and parse surfaces.

## 2. Quick pick

| You need to… | Run | It mints |
|---|---|---|
| See what's missing/orphaned across the whole vault | `/gap [--feature <slug>]` | the `traceability.md` report |
| Record a scope change + apply it safely | `/cr "<change>"` then `/cr --apply CR-...` | `CR-{YYYYMMDD}-{NNN}` |
| Reconstruct BA docs from old docx/pdf/code | `/reverse-doc <sources> [--feature <slug>]` | `reverse-{feature}.md` |

## 3. The spine they all share

```
UN → BO → CAP → FR/NFR/BR/E → UC/US → AC → CHK → TC
                         CR cuts across all
```

- `/gap` walks this and reports breaks (FR with no UC/US, US with no AC, E- uncited, orphan docs, stale chains).
- `/cr` records an impact across it (which IDs change) and applies the edits in dependency order (SRS before stories before tests) via `@change-tracker`.
- `/reverse-doc` rebuilds a view of it from sources, tagging every claim ✅/🔵/🟡 — it sits *alongside* the official docs, never overwriting them.

## 4. The three parse surfaces

All three join IDs the same way (`traceability.md`): frontmatter `links:`, body wikilinks `[[path#ID|ID]]`, and the **index tables** (usecase-index, story-index, wireframe-index) — the cheap join surface for path-scoped IDs, since content files are zero-frontmatter.

## 5. `/gap` is read-only (almost)

It scans the vault and computes coverage; the **only** thing it writes is the report (`docs/_shared/traceability.md`), L1-gated. It never edits the docs it scans — it tells you the gap, the owning skill (`/srs`, `/userstory`…) fills it. Coverage, not quality (quality is `/doc-review` + `@doc-reviewer`).

## 6. `/cr`'s record-then-apply split

A change is recorded first (`/cr "<change>"` → Impact Matrix + Rollback, no doc edits), then applied (`/cr --apply CR-...` → per-doc L2 diffs in dependency order). The split matters: a recorded-but-not-applied CR is a normal "logged, pending" state, and the `@change-tracker` agent catches stale targets (a doc that changed since the CR was recorded → HARD STOP, re-assess).

## 7. `/reverse-doc`'s confidence honesty

Every claim in a reverse doc carries ✅ (directly stated) / 🔵 (inferred) / 🟡 (gap → OQ). A reconstruction full of ✅ that were really 🔵/🟡 is worse than useless — it looks authoritative and isn't. When unsure, drop a level.

## 8. Worked example

`example/atlas-re/` carries a `traceability.md` from a real `/gap` run (showing the deliberate gaps — the unsliced FRs, the uncited-nothing because the example is tight), and a sample `CR-20260801-001` raising the authority threshold (50k → 60k) with its impact across spec → stories → checklist.

## See also

- `explain-skills/testing-family.md` — `/test-checklist` + `/test-cases`, the CHK/TC tail `/gap` joins
- `rules/traceability.md` — the spine, the parse surfaces, the coverage rules
- `rules/doc-selection.md` — the full matrix + wave status
