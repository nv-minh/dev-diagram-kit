---
type: skill-explainer
skill: discover
updated: 2026-08-02
---

# What is /discover and how does it run?

**English** · [Tiếng Việt](discover.vi.md)

## 1. What it is for

`/discover` is the **one-time project intake**. Run it when you first enter a repo (or when the shared context has gone stale). It deep-scans the code + docs, asks at most 5 business questions code can't answer, and writes a small, always-loaded **context brief** (`docs/_shared/project-context.md`, ≤60 lines) plus on-demand detail files (`docs/_shared/context/*.md`). Every later BA skill consumes that brief — so they stop re-asking "what does this system do?" and stop inventing entity/role names.

It exists because the kit's skills are domain-agnostic: each re-derives the domain from scratch. A one-time intake that learns the repo, then feeds later skills, is worth doing — provided the artifact stays **small, fresh, and provenance-tagged** (generic "repository overview" content does NOT help; it adds cost and rots).

## 2. The whole run — a diagram

```
you: /discover
        │
        ▼
┌─────────────────────────────────┐
│ manifest sniff + N subagents    │  read-only Task agents by aspect (stack/entities/...); RETURN findings
├─────────────────────────────────┤
│ ingest docs (code wins)         │  cross-check README/ADR
├─────────────────────────────────┤
│ interview ≤5 Qs, one at a time  │  purpose → glossary → rules → authority → the one gotcha
├─────────────────────────────────┤
│ write .discover-plan.md         │
├─────────────────────────────────┤
│ HARD STOP — L1 preview          │  "Write the context set?" → WAIT for Y
└─────────────────────────────────┘
   ▼  (user Y)
   Tier 1 project-context.md (≤60 lines, enforced) + context/*.md
   stamp profile_hash + source_watermark → doc-validate
```

## 3. The two tiers

- **Tier 1** (`project-context.md`) is ALWAYS loaded (via `scripts/context-load.sh`). Six sections only: what it does & who pays · stack · actors · glossary-collisions · gotchas (≤5) · pointers. **Hard cap 60 lines.**
- **Tier 2** (`context/*.md`) is read ON DEMAND by the skill that needs depth — `/erd` reads `entities.md`, `/userstory` reads `actors.md` + `domain-rules.md`, `/srs` reads `glossary.md` + `domain-rules.md` + `actors.md`.

## 4. What it never does

- Never writes before the HARD STOP confirmation.
- Never ships a Tier 1 over 60 lines — it cuts or moves depth to Tier 2 and re-summarizes.
- Never fabricates — can't read it → marks 🟡 + asks, never invents names/rules.
- `--update` never overwrites sections listed in `human_edited` — it proposes, in a Sync Impact Report.
- It does NOT draw architecture diagrams — that's `/scan-project`. It produces the CONTEXT BRIEF.

## See also

- `rules/project-context.md` — the schema, the content test ("if `grep` answers it in 2 seconds, it's not in Tier 1"), the staleness contract
- `skills/scan-project/SKILL.md` — the overlap (/scan-project = diagrams; /discover = context brief)
- `skills/discover/references/example-session.md` — a full worked session on atlas-re
