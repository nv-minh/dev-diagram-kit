---
type: project-context-detail
status: draft
version: 0.1.0
updated: {{date}}
profile_hash: {{sha_of_scanned_inputs}}
source_watermark: {{git_head_sha_at_scan}}
staleness_budget_commits: 200
human_edited: []
links: []
---

# {{glossary | domain-rules | actors | entities | architecture}} — {{project_name}}

> Tier 2 — ON-DEMAND detail (one file per aspect under `docs/_shared/context/`). No line cap, but keep **pointer-heavy** where depth lives elsewhere (ERD / architecture diagrams) — duplicated structure is drift waiting to happen. Tag every claim: ✅ read · 🔵 inferred · 🟡 guessed (+ `file:path`).

## Detail

{{content_with_confidence_and_provenance}}

- {{claim}} ✅ `file:path`
- {{claim}} 🔵 `file:path` (inferred from …)
- {{claim}} 🟡 `file:path` (→ OQ)

## Pointers (where the canonical depth lives)

- {{erd_or_architecture_path}} — {{what it holds}}

## Open Questions

- [ ] OQ-1: {{gap}}
