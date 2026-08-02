---
name: api-map
description: Use when you need the 3-layer field mapping — provider payload ↔ our data model ↔ UI — with source-of-truth ownership per field. Written to integration/api-map.md, converges under the api-design blueprint. Trigger with `/api-map <feature> [--provider <name>]`. Step [3] of the API chain; needs the summary (+ design). Skippable for pure trigger/webhook integrations with no data mapping. Differs from /erd (the data model; this is the cross-system field mapping).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--provider <name>]"
---

# /api-map — 3-layer field mapping (API chain [3])

## Goal

Map every field end to end across three layers — the **provider payload** (their request/response shape) ↔ **our data model** (the entity fields from the ERD) ↔ the **UI** (what the user sees/edits) — with the source-of-truth owner per field (ours / theirs / derived). **Single output**: `docs/{feature}/integration/api-map.md` (type `api-map`).

## Constraints

- **Step [3], skippable** (`api-integration.md`): a pure trigger/webhook integration with no data to map → tell the user it's skippable; otherwise needs `api-summary*.md` (+ the design's source-of-truth decisions).
- **Reads the ERD/DBML** — our-model column names come from `srs/{feature}-erd.md` / `dbdiagram/`; mismatched names are a finding, not silent fixes. ERD missing → soft warn.
- **Three columns, one row per field** — provider field · our model field · UI element; plus the owner + transform (if any) + direction.
- **Source-of-truth owner is mandatory** — every row declares ours / theirs / derived (+ the derivation if derived). No owner → flag (a drift field).
- **Direction per row** — `out` (we send) / `in` (we receive) / `bi` (both, e.g. an id we send and they echo back).
- **Transforms explicit** — unit conversion, date format, enum mapping, currency rounding: name the transform, don't hide it.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — L2 diff.
- **Template** — `@../../templates/doc-api-map.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-map <feature>                       # map all summary endpoints
/api-map <feature> --provider catmodel   # one provider (multi-partner)
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
Contract summaries (required): !`ls docs/*/integration/api-summary*.md 2>/dev/null | head -10`
Data models: !`ls docs/*/srs/*-erd.md docs/*/dbdiagram/*.dbml 2>/dev/null | head -10`
Existing maps: !`ls docs/*/integration/api-map.md 2>/dev/null | head -10`

## Approach

1. **Gate.** No summary → refuse + route `/api-doc`. Read the summary (payload shapes) + the design (source-of-truth decisions) + the ERD/DBML (our field names).
2. **Per endpoint → field rows** — request fields (out) + response fields (in); each row: provider field · our-model field · UI element · owner · direction · transform.
3. **Owner + transform interview** — only the gaps (owners the design didn't decide, transforms the ERD/types imply); one batched round.
4. **Fact-list** — every mapping + owner + transform + source.
5. **Draft** the 3-layer table per the template; flag ownerless + name-mismatch rows.
6. **L1 plan preview** — field count + ownerless flags + name-mismatches + transforms.
7. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-map` + note + author.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/integration/api-map.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — coverage + ownerless/mismatch flags + next (`/api-checklist`).

## L1 plan preview

> I'll write the field map for **{feature}** to `integration/api-map.md`: **{F} fields** across {E} endpoints, 3 layers (provider ↔ model ↔ UI).
> Owners: {ownerless} flagged ownerless · {mismatch} model-name mismatches vs ERD · {transforms} transforms.
> Apply? (Y / edit)

## Output report

```
✅ Field map written: integration/api-map.md
   Fields: {F} | Ownerless (need an owner): {list | none} | ERD name mismatches: {list | none} | doc-validate: OK

Next: /api-checklist {feature} (the test outline over these endpoints + the map).
```

## Gotchas

- **Name mismatches are findings, not edits** — if the provider calls it `cust_id` and we call it `customer_id`, map them; don't silently rename our field.
- **Derived fields need the formula** — "total = subtotal + tax" written as "derived" with no formula is useless; spell out the derivation.
- **Skip honestly** — a webhook-only integration with no payload to persist has no map; say so and move to `/api-checklist`.
- **Enums map, not rename** — their `status: 'A'|'I'` → our `active|inactive` is a transform row, not a data-model change.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/project-context.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-map.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
