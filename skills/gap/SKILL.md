---
name: gap
description: Use when you need the cross-document traceability matrix — coverage of the ID spine (UN→BO→CAP→FR→UC/US→AC→CHK/TC), orphan docs, uncited error codes, and stale chains — written to docs/_shared/traceability.md. Trigger with `/gap [--feature <slug>]`. Read-only except for that one report. Differs from the per-feature usecase-index matrix (quick single-feature read; /gap aggregates the whole vault) and `/doc-review` (quality, not coverage).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug>]"
---

# /gap — Cross-doc traceability matrix + coverage report

## Goal

Walk the entire ID spine across the vault, compute coverage, and write one report: `docs/_shared/traceability.md` (type `traceability`) — the gaps, orphans, uncited error codes, and stale chains. Read-only analysis; the **only** write is that report (L1-gated per `approval-gate.md`'s named exception).

## Constraints

- **Group C** (`feature-bootstrap.md`): empty vault → friendly abort ("Start with `/brainstorm` or `/urd`"). `--feature <slug>` scopes the walk to one feature.
- **Read-only on the docs it scans** — never edits URDs/SRSes/stories; it reports gaps, the owning skill fills them.
- **Parse the 3 surfaces** (`traceability.md`): frontmatter `links:`, body wikilinks, and index tables (usecase-index, story-index, wireframe-index) — content files are zero-frontmatter, so the join goes via indexes + body.
- **Emit exactly the coverage rules** in `traceability.md` §"Coverage rules": UN-without-BO, BO-without-CAP, CAP-without-FR, FR-without-UC/US, US-without-AC, US-without-≥2-AC, AC-without-CHK/TC, E-uncited, orphan-doc, stale-chain, CR-apply-order-gap.
- **No fabrication** — every finding cites the concrete ID/path; never invent a "missing" ID that doesn't exist upstream (only report breaks in the *declared* chain).
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run regenerates the report (L2 diff).
- **Template** — `@../../templates/doc-traceability.md`.
- **Validate before done** — doc-validate on the report (step 7).

## Inputs

```
/gap                          # whole vault
/gap --feature atlas-re       # one feature
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`
Existing report: !`ls docs/_shared/traceability.md 2>/dev/null || echo "none — will create"`

## Approach

1. **Scope.** Empty vault → friendly abort. `--feature` → that folder; else every `docs/{feature}/`.
2. **Index the IDs** — scan each doc for its IDs (UN/BO/CAP/FR/NFR/BR/E/UC/US/AC/CHK/TC/CR) and its `links:` + body wikilinks + index-table rows. Build the graph.
3. **Run the coverage rules** (`traceability.md`) — for each, collect the violations with their concrete IDs.
4. **Stale check** — compare `links:` target `updated:` vs the doc's own (via `staleness.log` if present).
5. **Draft `traceability.md`** — the spine diagram + a findings table per rule (ID + where + suggested owner skill) + an orphan-doc list + a CR-apply-order check.
6. **L1 plan preview** — finding counts per rule + the worst gaps called out.
7. **Write `docs/_shared/traceability.md`.** **Activity log** — `CLAUDE_SKILL_NAME=/gap` + note + author before Write.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/_shared/traceability.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — the gap summary + the single highest-leverage fix per category.

## L1 plan preview

> I'll write the traceability report to `docs/_shared/traceability.md` ({scope}): **{N} findings** across {R} rules.
> Worst gaps: {e.g. "3 FR without UC/US", "E-atlas-re-002 uncited"}. Orphans: {count}. Stale: {count}.
> Logged: activity log "gap report {N} findings".
> Apply? (Y / edit)

## Output report

```
✅ Traceability report written: docs/_shared/traceability.md
   Findings: {N} | By rule: FR-without-UC/US {a} · US-without-AC {b} · E-uncited {c} · orphans {d} · stale {e}
   Highest leverage: {e.g. "run /usecase atlas-re (3 FR unexercised) → unblocks /userstory"}

Fix a gap by running its owning skill (/srs, /usecase, /userstory, /ac, /test-checklist…).
```

## Gotchas

- **Coverage ≠ quality** — `/gap` proves the chain is *complete*, not that it's *correct*; correctness is `/doc-review`'s job.
- **Don't chase 100%** — a deliberately deferred need (UN with no BO, phased out) is a finding, not a defect; the report lists it, the user decides.
- **E-uncited is the sneaky one** — error codes defined in the SRS but referenced nowhere are the most common real gap; they're why this skill exists.
- **The index tables are the cheap join** — prefer them over re-parsing every zero-frontmatter content file; body wikilinks are the fallback.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/traceability.md
- @../../rules/language.md
- @../../templates/doc-traceability.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
