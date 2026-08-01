---
name: dashboard
description: Use when you need a one-file HTML status of the vault — features, doc statuses, staleness, activity, and Open-Question debt — plus regeneration of docs/feature-list.md. Trigger with `/dashboard [--open]`. Read-only scan; writes only the HTML + feature-list. Differs from /gap (traceability coverage; this is a status overview) and /export (a stakeholder package; this is an internal pulse).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--open]"
---

# /dashboard — Vault status (one-file HTML)

## Goal

Scan the vault and render one self-contained HTML status page — features and their doc statuses, staleness (from `staleness.log`), recent activity (from `activity.log`), and Open-Question debt (unresolved OQs across the chain) — plus regenerate `docs/feature-list.md` (the status-lifecycle `* → approved` automation). **Outputs**: `docs/_shared/dashboard.html` + `docs/feature-list.md`.

## Constraints

- **Group C** (`feature-bootstrap.md`): empty vault → write a placeholder dashboard ("nothing yet — start with `/brainstorm` or `/urd`").
- **Read-only over sources** — scans docs; the ONLY writes are `dashboard.html` + `feature-list.md` (L1-gated; `approval-gate.md` notes dashboard is NOT exempt — it writes an HTML file).
- **Self-contained HTML** — inline CSS, no CDN; the gallery skill's self-contained pattern.
- **`dashboard.html` path** — `docs/_shared/dashboard.html` (a `_shared/` singleton like `traceability.md`).
- **Feature-list regeneration** — `docs/feature-list.md` from each feature's docs' `status:` (the status-lifecycle `* → approved` transition triggers this; `/dashboard` does it on demand too).
- **OQ debt** — count unresolved OQs per feature (parse the checkbox lists); a feature with 5 open OQs is visibly riskier.
- **Bilingual (mirror input — @../../rules/language.md)**.
- **Idempotent** — re-run regenerates (L2 diff).
- **Validate before done** — doc-validate doesn't cover `.html`/`feature-list.md` (excluded types); self-check the HTML is well-formed.

## Inputs

```
/dashboard              # render + regenerate feature-list
/dashboard --open       # render, then open in browser
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | grep -v "^_" | head -20`
Activity log: !`ls docs/_shared/activity.log 2>/dev/null || echo "none"`

## Approach

1. **Scan the vault** — per feature: its docs + statuses + `updated:` dates; count OQs; recent activity from `activity.log`; staleness from `staleness.log` if present.
2. **Aggregate** — feature statuses (how many approved/in-review/draft), OQ debt per feature, stale docs, last-activity per feature.
3. **Render `dashboard.html`** — self-contained: a feature table (status pills, OQ count, last-updated, stale flag) + an activity feed (recent N events) + an OQ-debt callout. Light, no CDN.
4. **Regenerate `docs/feature-list.md`** — one row per feature: slug + status + doc count + OQ count + updated.
5. **L1 plan preview** — feature count + status mix + OQ debt + stale count.
6. **Write** both files. **Activity log** — `CLAUDE_SKILL_NAME=/dashboard` + note + author.
7. **Output report** — the dashboard path + the status mix + the riskiest feature (most OQs/stale) + next.

## L1 plan preview

> I'll render the dashboard to `docs/_shared/dashboard.html` + regenerate `docs/feature-list.md`: **{F} features** (approved {a} · in-review {r} · draft {d}).
> OQ debt: {total} ({per-feature worst}). Stale docs: {n}. Recent activity: {events}.
> Apply? (Y / edit)

## Output report

```
✅ Dashboard written: docs/_shared/dashboard.html + docs/feature-list.md regenerated
   Features: {F} (approved {a} / in-review {r} / draft {d}) | OQ debt: {total} | Stale: {n}
   Riskiest: {feature} ({reason}).
   Open: docs/_shared/dashboard.html. Coverage detail? /gap.
```

## Gotchas

- **Status, not coverage** — the dashboard answers "where are we?" (statuses, staleness, debt); `/gap` answers "what's missing in the chain?". Both, different jobs.
- **OQ debt is the leading indicator** — a feature with growing OQ debt is drifting from its sources; surface it, don't hide the count.
- **feature-list.md is auto-gen** — never hand-edit it; it's regenerated from the docs' statuses. (Excluded from the activity log like other auto-gen files.)
- **Self-contained matters** — a dashboard that fetches a CDN breaks offline/on intranet; inline everything.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/status-lifecycle.md
- @../../rules/changelog.md
- @../../rules/language.md
