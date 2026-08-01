<!--
REFERENCE for /reverse-doc — simulated session (brownfield).
-->

## Command

```
/reverse-doc @legacy/claim-process.docx @src/claims/ --feature atlas-re
```

## Phase 1 — plan (HARD STOP)

**Skill:** scans sources · proposes feature slug `atlas-re` · lists 12-section reverse doc outline · confidence tagging rules.

```
[.reverse-plan.md written — STOP]

Sections to generate: personas (✅ from docx), FR candidates (🔵 from code), gaps (🟡 → OQ)
Proceed with generation? (Y / n):
```

**You:** `Y`

## L1 plan preview

```
[/reverse-doc] Will perform:
  1 | docs/atlas-re/reverse-atlas-re.md | create | 12 sections + Section 0 provenance
  (does NOT overwrite atlas-re-urd.md / brd / srs — sits alongside)

Apply? (Y / edit):
```

## Output excerpt

```markdown
## Section 0 — Provenance

| Claim | Confidence | Source |
|---|---|---|
| Handler queue sorted by state age | ✅ | claims.service.ts:142 + docx §3.2 |
| Committee quorum = any two members | 🟡 | mentioned once in docx footnote — OQ |
```

## Output report

```
✅ Reverse doc written | ✅ 12 | 🔵 8 | 🟡 3 OQs
Next: promote high-confidence sections via /srs or /urd with human review
```
