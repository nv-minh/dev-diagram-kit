---
name: dbdiagram
description: Use when you need to generate a database schema in DBML form (.dbml, import into dbdiagram.io / dbdocs.io, export SQL) for a single feature's data model — the layer closest to dev in the ERD family. Triggered by `/dbdiagram --feature <slug>`. Differs from `/erd` (Mermaid embedded inline, concise types for BA reading) and `/d2-erd` (D2, polished standalone diagram).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>]"
---

# /dbdiagram — Database schema (DBML, import dbdiagram.io)

> The 3-skill ERD family: `/erd` (Mermaid, embedded inline in GitHub/Obsidian, concise types) · `/d2-erd` (D2 `sql_table`, polished standalone diagram) · `/dbdiagram` (this DBML — **the layer closest to dev**: `.dbml` file imports into dbdiagram.io/dbdocs.io, exports real SQL).

## Goal

Generate a single feature's **database schema** in [DBML](https://dbml.dbdiagram.io) (Database Markup Language) form — a standard `.dbml` file that [dbdiagram.io](https://dbdiagram.io) and [dbdocs.io](https://dbdocs.io) import directly to draw the diagram + export SQL (Postgres/MySQL/…). Output in `docs/{feature}/dbdiagram/`:

1. `{feature}.dbml` — source DBML (text, git-versioned). Edited when the skill is called again (auto-enters update mode).
2. `{feature}.sql` — SQL generated from `.dbml` via `dbml2sql` (evidence the schema is valid + dev can import the DB right away).

Plus `dbdiagram/{feature}-dbdiagram-index.md` (metadata + table list).

## Why DBML alongside /erd + /d2-erd?

| | `/erd` (Mermaid) | `/d2-erd` (D2) | `/dbdiagram` (DBML) |
|---|---|---|---|
| Positioning | BA reads, embedded inline | Polished standalone diagram | **Dev handoff, close to real schema** |
| Type | concise (`string`/`date`) | concise business-level | **real DB types** (`uuid`/`varchar`/`timestamp`) |
| View diagram | IDE/Obsidian auto-renders | open `.svg` | dbdiagram.io / dbdocs.io (web) |
| Export SQL | ✗ | ✗ | **✓ (Postgres/MySQL/MSSQL)** |
| Index / enum / default | ✗ | ✗ | **✓ (DBML supports them all)** |

> **DBML is the technical artifact closest to dev** — this is where real DB detail is ALLOWED (types like `uuid`/`varchar`, index, enum, default, note) because `.dbml` is produced for devs to import the DB. Still do NOT ask the user in DB language (per `ba-conventions.md` Section 3) — the skill INFERS reasonable DB types from the business meaning itself. See [[feedback_erd_technical_ok]].

## Constraints

- **Fixed output** `docs/{feature}/dbdiagram/{feature}.dbml` + `.sql`. Do NOT write into `srs/`.
- **`--feature` optional** — auto-detected from context; file already exists → auto-enters update mode (L2 diff), no flag needed. **Feature does not exist yet + a data-model description → auto-derive the slug + create the feature** (entry point, `feature-bootstrap.md` group A).
- **AI writes the source DBML, does NOT write SQL by hand** — `dbml2sql` generates the SQL. Edit `.dbml` → regenerate `.sql`.
- **Validation is MANDATORY**: `dbml2sql {feature}.dbml --postgres` must run successfully (exit 0) before reporting done. Fail = DBML syntax error → fix, up to 2 times.
- **L1 approval** before Write — BA-friendly prose (the tables + relationships in business terms), do NOT dump the source DBML.
- **No L3 iterate** — DBML does not render in chat; the user reviews via dbdiagram.io or `.sql`.
- **Do NOT ask the user about DB types** ("varchar or text?") — the skill infers DB types from the business meaning the user describes. The user only says "email is a contact address", the skill assigns `varchar` itself.
- **Bilingual (mirror input — @../../rules/language.md)** in business Notes/comments; table/column names follow `srs/{feature}-erd.md` if it exists (usually English snake_case).
- **Per `diagram-selection.md`** — `/dbdiagram` when you need to hand off a schema to dev / export SQL / dbdocs. Embed inline for BA → `/erd`; polished standalone diagram → `/d2-erd`.
- **Idempotent** — 1 feature = 1 `{feature}.dbml` file; run again → auto-enters update mode (L2 diff), does not refuse.

## Inputs

```
/dbdiagram --feature <slug>              # create new (read srs/{feature}-erd.md or srs/{feature}-spec.md as source)
/dbdiagram "<data model description>"    # feature does not exist → derive slug + interview entities/relationships + create (entry point)
```

Feature already has `.dbml` → the skill recognizes it and enters update mode (L2 diff), nothing extra to type.

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} 2>/dev/null | grep -vE '^_' | head -20`
Features with srs/{feature}-erd.md (good source): !`for d in docs/*/srs/*-erd.md; do [ -f "$d" ] && dirname "$d" | xargs dirname | xargs basename; done 2>/dev/null | head -10`
dbml2sql installed: !`command -v dbml2sql >/dev/null && echo "✅ $(dbml2sql --version 2>/dev/null || echo installed)" || echo "❌ not installed — npm install -g @dbml/cli"`

## Flow runtime

```
User calls /dbdiagram --feature X   (or /dbdiagram "<data model description>")
   │  dbml2sql not installed? → stop, instruct: npm install -g @dbml/cli
   │  ┌─ Feature matches no docs/{feature}/ (entry point, feature-bootstrap.md group A):
   │  │  arg is a data-model description → derive feature slug (kebab-case, ASCII, ≤50 chars),
   │  │  confirm slug at L1 (user can override), create docs/{feature}/dbdiagram/ on Write.
   │  │  arg is an unknown 1-word slug → ask "new feature or typo?" (list existing features).
   │  └─ Do NOT force the user to run /brainstorm first.
   ▼
1. Read the data-model source in priority order:
   docs/X/srs/{feature}-erd.md (Mermaid erDiagram — convert straight to DBML) → if absent:
   docs/X/srs/{feature}-spec.md (Data Entities + Business Rules) → if absent:
   interview EXACTLY the schema scope needed (feature-bootstrap.md group A step 3), gather in 1 batch
   in business language (do NOT ask DB types): the entities · business attributes of each entity
   (name + meaning) · relationships (cardinality 1:1 / 1:N / N:N). No re-asking what the source already has.
   Vague description even with a source → MUST ask clarifying questions, do NOT invent attributes/cardinality.
   ▼
2. Extract: table → column (name + DB type the skill infers + pk/unique/not null/ref), relationships (Ref)
   ▼
3. Write the source .dbml (formula below)
   ▼
4. L1 plan preview (prose: N tables, M relationships). User Y → continue
   ▼
5. Write {feature}.dbml → dbml2sql regenerates {feature}.sql (validation fails → fix, up to 2 times)
   ▼
6. Update dbdiagram/{feature}-dbdiagram-index.md — set env note before Write,
   │  hook appends activity.log.
   ▼ Report to user (open dbdiagram.io, paste .dbml — or use .sql).
```

## How to build (step-by-step)

### Step 1 — dbdiagram/ skeleton if not present

`docs/{feature}/dbdiagram/{feature}-dbdiagram-index.md` (type `dbdiagram-index`): standard frontmatter + table list (name / column count / PK / outgoing FK). Lifecycle inherits `srs/{feature}-spec.md`.

### Step 2 — Formula for writing the source .dbml

```dbml
// Schema {feature} — source: srs/{feature}-erd.md (if present)

Table users {
  id uuid [pk]
  email varchar [unique, not null, note: 'contact address']
  display_name varchar [note: 'display name']
  created_at timestamp [default: `now()`]
}

Table decks {
  id uuid [pk]
  user_id uuid [ref: > users.id, note: 'which learner the deck belongs to']
  name varchar [not null]
  created_at timestamp
}

Enum card_recall {
  forgot
  fuzzy
  remembered
}

Table review_logs {
  id uuid [pk]
  card_id uuid [ref: > cards.id]
  recall card_recall
  reviewed_at timestamp

  Indexes {
    (card_id, reviewed_at) [name: 'idx_review_card_time']
  }
}
```

**Rules:**
- **1 entity = 1 plural snake_case `Table`** (`users`, `decks`, `review_logs`) — DB convention.
- **DB types the skill INFERS** from business meaning: `uuid` (keys), `varchar` (short text), `text` (long), `int`/`bigint`, `decimal` (money), `boolean`, `timestamp` (date-time), `date`. Do NOT ask the user.
- **PK**: `[pk]`. **FK/relationship**: `[ref: > other_table.id]` (`>` = many-to-one, `<` = one-to-many, `-` = one-to-one). You can also split it into a separate `Ref:` line at the end of the file.
- **Constraint**: `[unique]`, `[not null]`, `[default: ...]` (backtick for expressions `` `now()` ``).
- **Enum**: declare `Enum name { val1 val2 }` then a column `status card_recall`. This is where DBML beats Mermaid — enum is first-class.
- **Index**: an `Indexes { (col_a, col_b) [name: '...'] }` block inside the Table. ONLY add an index when the business need is clear (unique idempotency, common queries) — don't invent baseless indexes.
- **Business note**: `[note: 'business meaning']` on a column, or `Note: 'business meaning'` in a Table — this is where you record business meaning, rendered on dbdocs.io.

### Step 3 — Validate + regenerate SQL

```bash
dbml2sql docs/{feature}/dbdiagram/{feature}.dbml --postgres -o docs/{feature}/dbdiagram/{feature}.sql
# fail (exit≠0) → read the DBML syntax error (usually a ref with a wrong table name, an undeclared enum, a missing token), fix .dbml, rerun.
```

## L1 plan preview (BA-friendly template)

> I'll create the database schema (DBML) for feature **{feature}** at `docs/{feature}/dbdiagram/{feature}.dbml` (+ SQL `.sql`):
>
> **Tables ({N}):** {list: users, decks, cards, review_logs...}
> **Key relationships ({M}):** {e.g. "users have many decks", "decks contain many cards", "cards have many review_logs"}
> {**Enum/Index** if any: "review status (forgot/fuzzy/remembered)", "index (card_id, reviewed_at)"}
>
> Source: {srs/{feature}-erd.md | srs/{feature}-spec.md | provided by you}.
> Import: paste into dbdiagram.io to view the diagram, or use `.sql` to create the DB.
>
> **Recorded:** activity log "{note}".
>
> Apply? (Y / edit)

## Output report

```
✅ DBML schema: docs/{feature}/dbdiagram/{feature}.dbml (+ {feature}.sql)
   Tables: {N} | Relationships: {M} | Enum: {E} | dbml2sql: OK

View diagram: open dbdiagram.io → paste the contents of {feature}.dbml (or import into dbdocs.io).
Create DB:    use {feature}.sql (PostgreSQL).
Need edits?   /dbdiagram --feature {feature} (skill auto-enters update mode)
```

## Gotchas

- **dbml2sql not installed** → stop, print 1 line: `npm install -g @dbml/cli` (install once, like mmdc/d2). Do NOT write the file then leave it unvalidated.
- **DBML has NO .dbdiagram extension** — dbdiagram.io is the *tool* name; the language is DBML with a `.dbml` extension. The skill command is `/dbdiagram` (a mnemonic for the tool) but the generated file is `.dbml` (importable). Don't use a `.dbdiagram` extension — the toolchain won't accept it.
- **This is the layer ALLOWED to have real DB detail** — unlike `/erd`/`/d2-erd` (concise types). DBML uses `uuid`/`varchar`/`timestamp`, index, enum, default. Because `.dbml` is produced for devs to import the DB. But STILL do not ask the user about DB types — the skill infers them (see [[feedback_erd_technical_ok]]).
- **Ref direction** — `[ref: > users.id]` on the `user_id` column of the `decks` table means "many decks point to 1 user" (many-to-one). Mixing up the `<`/`>` direction → the diagram draws the cardinality backwards. Remember: `>` points "toward the one".
- **Enum must be declared BEFORE use** — a `status order_status` column without an `Enum order_status {...}` → dbml2sql fails. You can declare the enum at the top or the bottom of the file, as long as it exists.
- **The best source is srs/{feature}-erd.md** — if present, map 1-1 (each Mermaid entity → 1 DBML Table). DB types: upgrade from Mermaid's concise types to real DB types (`string id PK` → `id uuid [pk]`). Don't invent tables beyond the spec.
- **Don't invent indexes** — only add indexes with a business rationale (unique to prevent duplicates, columns often filtered/sorted). Don't scatter indexes "just because".
- **Update mode (feature already has .dbml)** → Read the old source, L2 diff, re-validate + regenerate .sql after the user says Y.
- **Don't over-use** — a small feature of 2-3 tables that just needs to show relationships → `/erd` is enough. `/dbdiagram` shines when you need a dev handoff, SQL export, or a schema with many enums/indexes.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @./references/example-dbdiagram.dbml (canonical example, validated via dbml2sql)
