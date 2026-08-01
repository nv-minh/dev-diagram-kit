---
paths:
  - ".claude/skills/gap/**"
  - ".claude/skills/cr/**"
  - ".claude/skills/dashboard/**"
  - ".claude/skills/jira/**"
  - "docs/_shared/traceability.md"
  - "docs/cr/**"
---

# Traceability — the spine and the coverage contract

> Shared rule for `/gap`, `/cr`, `/dashboard`, `/jira` — the skills that parse the ID spine across docs. Codifies what the spine IS, how IDs link, and what `/gap` reports. Referenced by the traceability skill family.

## The spine (the chain every project should be able to trace)

```
UN-{f}-NNN ──▶ BO-{f}-NN ──▶ CAP-{f}-NN ──▶ FR-/NFR-/BR-/E-{f}-NNN ──▶ UC-{slug} ─┐
 (/urd)        (/brd)        (/prd-epic)     (/srs, srs/{f}-spec.md)              ├─▶ US-NNN ──▶ AC-NNN ──▶ CHK-NNN ──▶ TC-NNN
                                                                 screens ────────┘ (/userstory) (/ac)   (/test-checklist) (/test-cases)
                         CR-{YYYYMMDD}-{NNN} cuts across everything (/cr)
```

Each skill mints ONLY its own ID type (`naming-conventions.md`); every ID traces to the one upstream of it. The spine is the contract `/gap` computes coverage against.

## Three parse surfaces (how an ID links to another)

`/gap` (and the delivery skills) join IDs through three surfaces, all defined in `naming-conventions.md` §Cross-references:

1. **Frontmatter `links:`** — the flat list of full paths a doc declares it consumes (`links: [docs/payment/srs/payment-spec.md, …]`). Cheap graph edge; the stale-detection hook reads the same field.
2. **Body wikilinks** — `[[docs/payment/srs/payment-spec.md#FR-payment-001|FR-payment-001]]`. Anchored references inside prose.
3. **Index tables** — the **primary join surface** for path-scoped IDs. `{f}-usecase-index.md` (UC↔FR↔Screen↔Error↔OQ columns), `{f}-story-index.md` (US↔FR↔screens↔jira-key), `{f}-wireframe-index.md` (screens↔Figma/HTML). Content files (`uc-*.md`, `us-*.md`) are zero-frontmatter by design, so the join must go via the index + body wikilinks.

## Coverage rules `/gap` emits

A finding per rule violation (read-only analysis; the only write is `docs/_shared/traceability.md`):

- **UN without BO** — a user need no business objective covers.
- **BO without CAP** — an objective no capability delivers.
- **CAP without FR** — a capability with no functional requirement (under-specified).
- **FR without UC or US** — an FR no use case or story exercises.
- **US without AC** — a story with no acceptance criteria (also caught by `/ac`'s coverage rule, but `/gap` is cross-doc).
- **US without ≥2 AC** — a story with only one criterion (thin).
- **AC without CHK/TC** — an acceptance criterion no test covers.
- **E- uncited** — an error code defined in the SRS Error Matrix that no wireframe Description column, AC, or extension references (a documented error nobody handles).
- **Orphan doc** — a generated doc with no inbound `links:` from any other doc.
- **Stale chain** — a doc whose `links:` target was updated more recently than the doc itself (via `staleness.log`).
- **CR apply-order gap** — a Change Request whose Apply order references a doc that doesn't exist or wasn't touched.

## CR cross-cutting semantics

`CR-{YYYYMMDD}-{NNN}` is the only project-wide (not per-feature) ID. It cuts across the spine: a CR records a change, its Impact Matrix lists the affected IDs (FR-/US-/E-…), and its Apply order is a sequence of per-doc L2 diffs. `/gap` reports a CR whose Impact Matrix names an ID that no longer exists (drift after a partial apply).

## What `/gap` does NOT do

- It does not judge quality (that's `/doc-review` + `@doc-reviewer`) — only coverage and linkage.
- It does not edit the docs it scans (read-only); the single write is the `traceability.md` report itself (L1-gated per `approval-gate.md`'s named exception).
- It does not fabricate missing IDs — it reports the gap; the owning skill (`/srs`, `/userstory`…) fills it on the next run.
