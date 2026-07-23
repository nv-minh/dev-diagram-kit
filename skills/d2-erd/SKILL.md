---
name: d2-erd
description: Use when you need a pretty ERD in D2 (sql_table with PK/FK, ELK layout). Trigger with `/d2-erd --feature <slug>`. Differs from `/erd` (Mermaid, inline embedding). Same family as `/d2-activity`, `/d2-architect`.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>]"
---

# /d2-erd — Entity-Relationship Diagram (D2, sql_table + ELK)

> D2 skill family: `/d2-activity` (flow) · `/d2-erd` (this data model) · `/d2-architect` (architecture). All 3 share `render.sh` at `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`.

## Goal

Draw a feature's data model as a **pretty, compact** ERD using [D2](https://d2lang.com) `shape: sql_table` — each entity a table with columns + types + PK/FK constraints, with business-labeled relationships between tables. Output in `docs/{feature}/d2-erd/`:

1. `{feature}.d2` — D2 source (text, git-tracked). Edit when calling the skill again (auto update mode).
2. `{feature}.svg` — pre-rendered (open in browser/IDE/Obsidian).

Plus `d2-erd/{feature}-d2-erd-index.md` (metadata + entity table).

## Why D2 instead of Mermaid?

D2's `shape: sql_table` draws a bold header, aligned columns, and a clear right-aligned constraint (PK/FK) column; relationships are arrows with business labels (`owns`, `contains`, `cloned from`). Mermaid `erDiagram` cardinality symbols (`||--o{`) are hard to read + lay out poorly with >5 entities. D2 + ELK arrange the tables more compactly.

> Keep `/erd` (Mermaid) for **inline embedding** in GitHub/Obsidian. Use `/d2-erd` when you need a **pretty standalone version** for stakeholders / export / reviewing a complex data model.

## Constraints

- **Fixed output** `docs/{feature}/d2-erd/{feature}.d2` + `.svg`. Do NOT write into `srs/{feature}-erd.md`.
- **`--feature` optional** — auto-detect from context; file already exists → enter update mode automatically, no flag needed. **Feature does not exist + a data model description → auto-derive slug + create feature** (entry point, see `feature-bootstrap.md` group A).
- **AI writes the source, NO coordinates** — ELK handles the layout.
- **Render via `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`** (shared). Do NOT call d2/Chrome directly.
- **Compile must PASS** before reporting done.
- **Review the image yourself** (accuracy): if Chrome is available, render `--png` then Read the image to inspect overlaps/wrong PK-FK/wrong labels before reporting; without Chrome, inspect the source + `.svg` carefully.
- **L1 approval** before Write — BA-friendly prose, described in business terms (entities + relationships), do NOT dump the source.
- **NO L3 iterate** — review from the .svg.
- **Do NOT ask about technical DB/column types** — the data model is at the business level (per `ba-conventions.md` IT-BA framing). A column = "a type of business information" (email, status, created date), NOT "varchar(255)".
- **Bilingual (mirror input — @../../rules/language.md)** for relationship labels; entity/column names follow srs/{feature}-erd.md if it exists (usually English).
- **Per `diagram-selection.md`** — `/d2-erd` when you need a pretty standalone ERD; inline embedding → `/erd`.
- **Idempotent** — 1 feature = 1 file `{feature}.d2`; rerun → enter update mode automatically (L2 diff), no refusal.

## Inputs

```
/d2-erd --feature <slug>            # create a new ERD (reads srs/{feature}-erd.md or srs/{feature}-spec.md as the source)
/d2-erd "<data model description>"        # feature doesn't exist → derive slug + interview entities/relationships + create (entry point)
```

Feature already has a D2 ERD → the skill recognizes it and enters update mode (L2 diff), no extra typing needed.

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with srs/{feature}-erd.md (good source): !`for d in docs/*/srs/*-erd.md; do [ -f "$d" ] && dirname "$d" | xargs dirname | xargs basename; done 2>/dev/null | head -10`
d2 installed: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## Flow runtime

```
User calls /d2-erd --feature X   (or /d2-erd "<data model description>")
   │  d2 not installed? → stop, give install instructions
   │  ┌─ Feature matches no docs/{feature}/ (entry point, feature-bootstrap.md group A):
   │  │  arg is a data model description → derive feature slug (kebab-case, ASCII, ≤50 chars),
   │  │  confirm the slug at L1 (user can override), create docs/{feature}/d2-erd/ on Write.
   │  │  arg is a 1-word unknown slug → ask "new feature or typo?" (list existing features).
   │  └─ Do NOT require the user to run /brainstorm first.
   ▼
1. Read the data model source by priority:
   docs/X/srs/{feature}-erd.md (Mermaid erDiagram — convert directly) → if not present:
   docs/X/srs/{feature}-spec.md (Business Rules + entity mentions) → if not present:
   interview EXACTLY the scope the ERD needs (feature-bootstrap.md group A step 3), gather 1
   business-language batch (do NOT ask about DB/column types): entities · business attributes per
   entity (name + meaning: email, status, created date — NO varchar) · relationships (cardinality
   1:1 / 1:N / N:N). No-re-ask what the source already has.
   Ambiguous description even with a source (srs/{feature}-erd.md only lists entity names, attributes/relationships unclear) →
   MUST ask clarifying questions before generating, do NOT fabricate attributes/cardinality.
   ▼
2. Extract: entity → columns (name + business type + PK/FK), relationships (source→target + label)
   ▼
3. Write the .d2 source (formula below)
   ▼
4. L1 plan preview (prose: N entities, M relationships). User Y → continue
   ▼
5. Write {feature}.d2 → render.sh → {feature}.svg (compile fail → fix, up to 2 times)
   ▼
6. Update d2-erd/{feature}-d2-erd-index.md — set the env note before Write,
   │  the hook appends to activity.log (independent of whether spec.md exists).
   ▼ Tell the user.
```

## How to build (build step-by-step)

### Step 1 — Skeleton d2-erd/ if it doesn't exist

`docs/{feature}/d2-erd/{feature}-d2-erd-index.md` (type `d2-erd-index`): standard frontmatter + entity table (name / column count / PK / outgoing FK). Lifecycle inherited from `srs/{feature}-spec.md`.

### Step 2 — Formula for writing the .d2 source (ERD)

```
direction: right       # horizontal ERD reads more easily; change to 'down' if many entities vertically

USER: {
  shape: sql_table
  id: string { constraint: primary_key }
  email: "string (unique)"        # QUOTE when there is a () / special character
  status: "active | locked"
  createdAt: datetime
}

DECK: {
  shape: sql_table
  id: string { constraint: primary_key }
  userId: string { constraint: foreign_key }
  name: string
}

# Relationship = an edge from one column to another, business label:
USER.id -> DECK.userId: owns
```

**Rules:**
- 1 entity = 1 block `shape: sql_table`. Column: `name: type { constraint: primary_key | foreign_key }`.
- **QUOTE column values** when they contain `()`, `|`, `/`, `:` — e.g. `"free | premium"`, `"string (nullable)"`. Bare column names (`id`, `userId`) don't need it.
- Relationship: `A.pk -> B.fk: label`. Vietnamese business labels (`owns`, `contains`, `reviewed`).
- Business types that suffice: `string`, `int`, `boolean`, `datetime`, enum listed as `"a | b | c"`. NO `varchar(255)`, NO index/DB detail.
- NO coordinates/width — ELK handles it.

### Step 3 — Render + verify

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/d2-erd/{feature}.d2
# compile fail → usually a missing quote on a column value with () or | → fix, re-render.
```

## L1 plan preview (BA-friendly template)

> I will draw the data diagram (ERD) for feature **{feature}** at `docs/{feature}/d2-erd/{feature}.d2` (+ a `.svg` image):
>
> **Entities ({N}):** {list: USER, DECK, CARD, CARD_REVIEW...}
> **Main relationships ({M}):** {e.g. "USER owns DECK", "DECK contains CARD", "CARD reviewed via CARD_REVIEW"}
>
> Source: {srs/{feature}-erd.md | srs/{feature}-spec.md | you provide}.
>
> **Logged:** activity log "{note}".
>
> Apply? (Y / edit)

## Output report

```
✅ D2 ERD: docs/{feature}/d2-erd/{feature}.svg
   Entities: {N} | Relationships: {M}

Open {feature}.svg in browser/IDE/Obsidian to view (compact PK/FK tables).
Need changes? /d2-erd --feature {feature} (the skill enters update mode automatically)
```

## Gotchas

- **d2 not installed** → stop, print 1 install line.
- **QUOTE column values with special characters** (gotcha #1) — `"free | premium"`, `"string (nullable)"`, `"A1 | A2 | B1"`. Forget the quotes → compile fail "unexpected text".
- **The best source is srs/{feature}-erd.md** — if present, convert 1-1 (USER {...} → sql_table). Don't fabricate entities beyond the spec.
- **ERD with >8 entities** → consider `direction: down` + group related entities close together by declaration order.
- **Many-to-many relationships** → represent via a junction table as a separate entity, just like the real data model.
- **Do NOT ask about DB details** — index, migration, column length are dev/DBA work, not a business ERD.
- **Update mode (feature already has an ERD)** → Read the old source, L2 diff, re-render after user Y.
- **Just-bootstrapped feature** — no special handling: the event always goes to activity.log via the hook, independent of spec.md.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
