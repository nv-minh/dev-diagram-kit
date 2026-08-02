---
type: project-context
status: draft
version: 0.1.0
updated: {{date}}
profile_hash: {{sha_of_scanned_inputs}}
source_watermark: {{git_head_sha_at_scan}}
staleness_budget_commits: 200
human_edited: []
links: []
---

# Project context — {{project_name}}

> Tier 1 — ALWAYS loaded. **Hard cap 60 lines of content** (excl. frontmatter); `doc-validate` fails a 61-line file. If `grep` answers it in 2 seconds, it doesn't belong here. Tag every claim: ✅ read · 🔵 inferred · 🟡 guessed (+ `file:path`).

## 1. What it does & who pays (2–3 sentences)

{{what_the_system_does_and_who_pays}} ✅ `file:path`

## 2. Stack (one line)

{{stack_oneliner}} ✅ `file:path`

## 3. Actors (comma-separated; detail → `context/actors.md`)

{{actor_roles}}

## 4. Glossary — collisions only (business word ≠ code identifier)

| Business term | Code / model | Note |
|---|---|---|
| {{Booking}} | {{reservations.tbl_res}} | ✅ `file:path` |

## 5. Gotchas (max 5)

- {{non_obvious_trap}} ✅/🔵/🟡 `file:path`

## 6. Pointers (Tier 2 — read on demand)

- `context/glossary.md` — full glossary; read when naming/terms are ambiguous.
- `context/domain-rules.md` — business rules/invariants not visible in code; read when drafting specs/rules.
- `context/actors.md` — actor detail + real-world authority; read for stories/use cases.
- `context/entities.md` — entity pointers (defers to ERD); read for `/erd`.
- `context/architecture.md` — architecture pointers (defers to `/scan-project` output); read for `/system-design`.
