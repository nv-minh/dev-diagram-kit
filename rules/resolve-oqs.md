---
paths:
  - "docs/**/*.md"
  - ".claude/skills/brainstorm/**"
  - ".claude/skills/urd/**"
  - ".claude/skills/brd/**"
  - ".claude/skills/prd-epic/**"
  - ".claude/skills/srs/**"
  - ".claude/skills/usecase/**"
  - ".claude/skills/userguide/**"
---

# Resolve Open Questions (Phase E)

> Canonical pattern for every BA skill (`/prd`, `/brainstorm`, `/urd`, `/brd`, `/prd-epic`, `/srs`) running AFTER writing a doc, BEFORE suggesting downstream skills. Goal: do not let OQ debt accumulate across stages — force resolution or acknowledge a hold immediately.

## Trigger

The skill runs Phase E right after a successful doc Write (both create + update mode).

## Step 1 — Collect OQs

The skill gathers OQs from 2 sources:

1. **Own OQs** — just written in the current doc (parse the "Open Questions" section).
2. **Inherited OQs** — from the upstream chain that are still `status: hold` or `[ ]`. The upstream chain depends on the skill:

| Skill | Upstream chain to inherit OQs from |
|---|---|
| `/prd` | (none — the product PRD is the product-level root; only own OQs in Section 11) |
| `/brainstorm` | (none — brainstorm is the feature-level root) |
| `/urd` | the "Open Questions" section of `docs/{feature}/brainstorms/*.md` |
| `/brd` | brainstorm + `{feature}-urd.md` |
| `/prd-epic` | brainstorm + `{feature}-urd.md` + `{feature}-brd.md` |
| `/srs` | brainstorm + `{feature}-urd.md` + `{feature}-brd.md` + `{feature}-prd.md` |

The skill scans the "Open Questions" section of each upstream doc, extracting OQs still `[ ]` (unresolved) or `[~]` (deferred but not closed). Skip `[x]` (resolved).

## Step 2 — Prompt user

Print the OQ list in this format:

```
📋 {N} open questions still to handle:

From {current_doc_type}:
  - OQ-{id}: {text}
  - OQ-{id}: {text}

Inherited from {upstream_doc} (unresolved):
  - OQ-{id}: {text}  (source: {path})
  - OQ-{id}: {text}  (source: {path})

Resolve now before moving to {next_skill}?
  Y       → I will ask one OQ at a time
  skip    → keep the OQs, the downstream skill will inherit them again
  <ids>   → resolve only specific OQs (e.g. "OQ-3" or "OQ-3,OQ-4")
```

If `N == 0` → skip Phase E entirely, go straight to the final report.

## Step 3 — Resolve loop (one-at-a-time)

User picks `Y` or `<ids>` → loop over each targeted OQ:

1. Print the OQ + context (1-2 lines from the relevant section of the source doc if applicable).
2. Wait for the user reply. The reply has 4 forms:
   - **A concrete answer** → mark `[x]`, format "Resolved: {answer}", write into the doc.
   - **`skip` / `hold`** → keep `[ ]`, note "hold until {next_skill}".
   - **`not needed` / `OOS`** → mark `[~]`, note "out of scope".
   - **`don't know` / `ask later`** → keep `[ ]`, do not retry in this session.
3. **Side-effect detection (within the current doc)** — propose an L2 diff for the section affected by the OQ answer. See the Step 3.5 mapping.
4. If the OQ is inherited from upstream → the skill **also updates the upstream doc** (mark `[x]`/`[~]` + add a note "resolved via /{current_skill}"). One L2 diff per upstream edit. Set `CLAUDE_CHANGELOG_NOTE` before each edit — the hook auto-writes the event to `docs/_shared/activity.log`.

## Step 3.5 — Cascade scan (CRITICAL — do not skip)

After the user accepts an answer for an OQ, the skill **MUST** scan beyond the checkbox marker to propagate the business change into related docs/sections. Do NOT leave an OQ resolved while sections still state the old assumption.

### 3.5.1 — Scan within the current doc

The skill greps the entire current doc for:

1. **Direct reference**: patterns `OQ-{id}`, `see Section {N} OQ-{id}`, `awaiting OQ-{id}`, `pending OQ-{id}`. Each match → propose an L2 diff: delete the reference or replace it with the resolution.
2. **Next Steps bullet**: pattern `- Resolve OQ-{id}` in the Next Steps section. Match → propose deleting the bullet.
3. **Topic-based scan**: use the mapping table (Section 3.5.3) to identify sections that may contain the old assumption. Read that section's content, compare it against the OQ answer, and if there is a conflict → propose an L2 diff to update the content.

### 3.5.2 — Scan downstream docs

If the current doc is not the end of the chain, the skill scans downstream docs in the same feature folder. The downstream chain is the reverse of the upstream one:

| Resolving via skill | Scan downstream docs |
|---|---|
| `/prd` (project-level) | cascade scan **within `docs/_product/prd.md` itself** (Assumptions/Risks/Constraints/Feature Map — per topic map 3.5.3); do NOT scan feature docs (they don't exist at product-PRD time). `docs/_product/roadmap.md` reads one-way from the Feature Map, so do NOT cascade OQs into it — to sync it, re-run `/roadmap`. |
| `/brainstorm` | `{feature}-urd.md`, `{feature}-brd.md`, `{feature}-prd.md`, `srs/{feature}-spec.md` (if it exists) |
| `/urd` | `{feature}-brd.md`, `{feature}-prd.md`, `srs/{feature}-spec.md` |
| `/brd` | `{feature}-prd.md`, `srs/{feature}-spec.md` |
| `/prd-epic` | `srs/{feature}-spec.md`, `srs/{feature}-flows.md`, `srs/{feature}-erd.md`, `ascii-wireframe/*.md` |
| `/srs` | `userstories/*.md`, `usecases/*.md` |

Each downstream doc: apply the same 3.5.1 pattern (direct ref + topic scan). One L2 diff per match.

### 3.5.3 — Topic → Section mapping (heuristic)

When an OQ contains the following keywords, scan the corresponding section:

| OQ topic keywords | Sections to check (in every related doc) |
|---|---|
| region, compliance, GDPR, PDPA, country, EU, VN, global | BRD Business Scope (assumptions/constraints), BRD Business Rules, BRD Risks, NFR security/privacy, PRD Non-goals |
| platform, mobile, iOS, Android, web, desktop | BRD Business Scope, Capabilities (P0/P1/P2), OOS, NFR usability |
| timeline, budget, deadline, Q1/Q2/release | BRD Risks, BRD Cost-Benefit, BRD Executive Summary, Capabilities priority, PRD Release plan |
| vendor, third-party, SDK, BaaS, build-vs-buy | BRD Business Scope (dependencies), BRD Risks, BRD Cost-Benefit, PRD/SRS Dependencies |
| scope, include, exclude, feature inclusion | BRD Business Scope, Capabilities, OOS, PRD Goals/Non-goals |
| data, privacy, retention, PII, storage | Assumptions, NFR security, Risks compliance, ERD entities |
| auth, security, encryption, hash, lockout | NFR security, Business Rules, Error Matrix |
| performance, latency, throughput, scale | NFR performance, Capabilities (rate limits) |
| user role, permission, RBAC, admin | User Types, Capabilities, Business Rules |
| pricing, payment, billing, subscription | BRD Business Objectives & Success Measures, BRD Cost-Benefit, Capabilities, BRD Business Scope (dependencies), NFR availability |

This mapping is a hint — the skill may detect other topics from the semantics of the answer. If uncertain, ask the user "Which sections are still relevant?".

### 3.5.4 — L2 diff aggregation

After scanning for an OQ, print an impact summary before looping through the diffs:

```
🔗 OQ-{id} resolved → found {K} sections/docs to update:

Current doc ({path}):
  - Section {N} {section}: {1-line change preview}
  - Section {N} {section}: {preview}

Downstream:
  - {downstream_path} Section {N}: {preview}

Apply each L2 diff in turn? (Y / skip-all / pick id)
```

Then loop through the L2 diffs one item at a time, user Y/n on each.

### 3.5.5 — Activity log cascade

Each updated doc (current + upstream + downstream) → its own line in `docs/_shared/activity.log` (the hook writes it automatically when the skill sets the env note before the edit):

```
{date} | /{current_skill} | {@author} | {file-path} | cascade from OQ-{id} resolved: {section list} updated
```

## Step 4 — Activity log

After the loop finishes (≥1 OQ resolved), the event for the current doc is already in `activity.log` (written by the hook). Standard note:

```
{date} | /{current_skill} | {@author} | {file-path} | resolved OQ-{ids}: {short summary}
```

Each updated upstream doc also gets a corresponding line (automatically via the hook).

## Step 5 — Final report

```
✅ {Doc_type} finalized: docs/{feature}/{path}
   Resolved OQs this session: {R}/{N}
   Still on hold: {M} (will be inherited when running {next_skill})

Recommended next:
  - /{next_skill_1} {feature}   — {description}
  - /{next_skill_2} {feature}   — {description}
```

If the user skips Phase E:
```
⚠️  {N} OQs still on hold. When running {next_skill}, I will inherit this list
    and ask again in the context of {next_skill}.
```

## Constraints

- **Resolve loop one-at-a-time** — do NOT batch 5 questions into one prompt.
- **L2 diff** before every Edit (current doc + upstream doc + downstream doc).
- **Push exact values** — a vague answer ("later", "unclear") → retry once with a more specific question. Still vague → keep `[ ]`, do not force.
- **Side-effect updates are NOT silent** — always propose the L2 first.
- **Cascade scan is MANDATORY** — Step 3.5 is not optional. Marking `[x]` without scanning = an OQ "resolved" on paper while other sections still state the old assumption → a business BUG.
- **An inherited OQ resolved via a given doc means that doc gets updated** — not just written into the current doc.
- **No-re-ask** — an OQ already `[x]` resolved upstream → do NOT ask again.

## Anti-patterns

- ❌ Outputting the report right after Write while skipping OQs.
- ❌ Folding "Resolve OQs" into the "Recommended next" list (loses its priority).
- ❌ Forcing the user to resolve everything — the user may `skip` or `hold`.
- ❌ Updating an upstream OQ silently (no L2 diff).
- ❌ Asking an OQ already resolved upstream.
- ❌ **Marking `[x]` but skipping the cascade scan** — Assumptions/Risks/Next Steps still stating the old assumption is pointless.
- ❌ Skipping downstream docs — an OQ resolved in `/brainstorm` but the already-written URD still has "OQ-3 pending resolution" in Next Steps.

## Summary

After Write → **Collect OQs (own + inherited) → Prompt Y/skip/ids → Loop 1-by-1: [answer → cascade scan the whole doc + downstream → L2 diff per impacted section] → Activity log via hook → Final report**.
