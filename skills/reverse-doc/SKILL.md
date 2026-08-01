---
name: reverse-doc
description: Use when you need to reconstruct BA documents (URD/BRD/SRS-shaped) from legacy sources — docx/pdf/images/code — into a reverse-{feature}.md with a 12-section framework + Section 0 provenance and 3-level confidence (✅/🔵/🟡), plus a conversion plan. Trigger with `/reverse-doc <source-path...> [--feature <slug>]`. Can create multiple features at once; never overwrites the official urd/brd/srs. Differs from `/scan-project` (architecture diagrams from code; this is business docs from any source).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<source-path...> [--feature <slug>]"
---

# /reverse-doc — Reconstruct BA docs from legacy sources

## Goal

Read legacy sources (docx/pdf/images/code/emails) and reconstruct the business logic as a `docs/{feature}/reverse-{feature}.md` (type `reverse-feature`) — a 12-section framework + Section 0 (source map + 3-level confidence ✅/🔵/🟡). Produces a `docs/.reverse-plan.md` (type `reverse-plan`) conversion plan first. **Never overwrites** the official `urd/brd/srs` — it sits alongside, as a reverse-engineered view.

## Constraints

- **Group A-variant** (`feature-bootstrap.md`): derives the slug from the SOURCE (not from interviewing the user); can create MULTIPLE features at once; asks only about GAPS (where the source is missing), never interviews the business from scratch.
- **scan-project shape, 2 HARD STOPs** — Phase 1: read sources → cluster into features → write `.reverse-plan.md` (HARD STOP, confirm). Phase 2: generate the reverse docs per confirmed plan (HARD STOP only if a gap blocks generation).
- **3-level confidence on every claim** (`naming-conventions.md` line 66): ✅ directly stated in source · 🔵 inferred from source · 🟡 gap/assumption (must become an OQ). No claim without a confidence marker.
- **No fabrication** — anything not in the source is 🟡 + an OQ, never a confident ✅. This is the skill's defining discipline.
- **Provenance per section** — Section 0 records which source(s) fed which section, so an auditor can trace back.
- **Alongside, not replacing** — `reverse-{feature}.md` is a reconstruction; the official `urd/brd/srs` (if they exist) stay untouched. The user may later promote reverse content into them via `/cr` or manual edit.
- **Temp convert files** under `docs/.reverse-convert/` are scratch (gitignored/cleaned); only the reverse docs + plan persist.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Template** — `@../../templates/doc-reverse-doc.md`.
- **Validate before done** — doc-validate (step 9).

## Inputs

```
/reverse-doc ./legacy/claim-system-spec.docx --feature claim-legacy
/reverse-doc ./legacy/*.pdf ./src/claims/           # cluster sources → propose features
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Existing reverse docs: !`ls docs/*/reverse-*.md 2>/dev/null | head -10`
Existing reverse plan: !`ls docs/.reverse-plan.md 2>/dev/null || echo "none"`

## Approach

1. **Read the sources** — extract text/structure (docx/pdf via available tooling; code via Read/Grep; images via the vision/OCR available). Note per-source: what it covers, its authority (a signed spec > an email).
2. **Cluster → features** — group source content by business domain; propose feature slugs (from the source, not invented). Write `docs/.reverse-plan.md`: the feature list + per-feature source map + the clarifying questions for gaps. **HARD STOP** — confirm the plan before generating.
3. **On confirm → per feature** draft `reverse-{feature}.md`: Section 0 (source map + confidence legend) + the 12 sections (problem/users/objectives/scope/rules/data/flows/states/errors/screens/OQs/…), every claim tagged ✅/🔵/🟡.
4. **Gap interview** — only the 🟡 items the source can't resolve; one batched round; unresolved → OQ in the doc.
5. **L1 plan preview** (per feature) — section coverage + confidence mix (✅/🔵/🟡 counts) + OQ count.
6. **Write the reverse docs** (after the per-feature L1). Clean `docs/.reverse-convert/`. **Activity log** — `CLAUDE_SKILL_NAME=/reverse-doc` + note + author.
7. **If a gap blocks a section** → HARD STOP, ask; never fill with a guess.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/reverse-{feature}.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — features reconstructed + confidence mix + next (`/srs` to formalize from the reverse view; `/scan-project` if code needs architecture diagrams).

## L1 plan preview (per feature)

> I'll reconstruct **{feature}** to `docs/{feature}/reverse-{feature}.md` from {sources}: 12 sections, confidence ✅ {a} · 🔵 {b} · 🟡 {c}.
> Gaps needing your input: {list | none}. OQs captured: {n}.
> This sits ALONGSIDE the official docs — it does not overwrite urd/brd/srs.
> Apply? (Y / edit)

## Output report

```
✅ Reverse docs written: {feature list} → reverse-{slug}.md each
   Confidence: ✅ {a} · 🔵 {b} · 🟡 {c} | OQs: {n} | doc-validate: OK

Formalize? /srs {feature} (promote the ✅/🔵 into the official spec). /scan-project if code → architecture.
```

## Gotchas

- **Confidence honesty is the whole skill** — a reconstruction full of ✅ that were actually 🔵/🟡 is worse than useless; it looks authoritative and isn't. When unsure, drop a level.
- **Source authority matters** — a vendor's signed spec is ✅-grade; a Slack screenshot is 🔵 at best; tag accordingly.
- **Don't promote silently** — moving reverse content into the official urd/brd/srs is a `/cr` (it changes the source of truth); keep them separate until then.
- **Images need OCR/vision** — if neither is available, the section stays 🟡 with an OQ rather than skipped.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-reverse-doc.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
