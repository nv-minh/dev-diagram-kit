---
type: skill-explainer
skill: delivery-family
updated: 2026-08-01
---

# The delivery family — /jira /confluence /export /userguide /meeting /inbox /doc-review /dashboard

**English** · [Tiếng Việt](delivery-family.vi.md)

## 1. Why this family exists

The BA docs are done — now they have to *leave the vault*: into Jira for the team, Confluence for stakeholders, a package for a review, a manual for users, and a status pulse for you. Plus the capture/review skills that feed back into the chain. These eight skills are the kit's outbound + feedback layer.

## 2. Quick pick

| You need to… | Run |
|---|---|
| Push stories to Jira (and pull status back) | `/jira <feature>` |
| Publish docs as a Confluence page tree | `/confluence <feature>` |
| Bundle docs for a stakeholder review | `/export --scope <feature> --format pdf` |
| Write the end-user manual | `/userguide --feature <slug>` |
| Capture structured meeting minutes | `/meeting "<title>"` |
| Dump a raw note fast / triage the pile | `/inbox "<note>"` / `/inbox --triage` |
| Run a quality review of the docs | `/doc-review <feature>` |
| See the vault's status pulse | `/dashboard` |

## 3. The two external-write gates

`/jira` and `/confluence` write **outside** the vault — irreversible-ish (a Jira issue / Confluence page isn't rolled back by git). Both are **hard HITL** (`rules/atlassian-sync.md`): preview every write, explicit Y, no auto-approve. They detect drift (the artifact changed outside the kit since last sync → warn + review). `/jira` additionally refuses `status: stale` stories.

## 4. `/confluence` vs `/sync-confluence`

Both touch Confluence, different jobs:
- `/confluence` (this wave) — publish kit-generated docs as **new/owned pages**, mapping state tracked.
- `/sync-confluence` (shipped in 1.x) — update an **existing page in-place** from a **code diff / conversation**.

The disambiguation is mandatory in both skills' descriptions.

## 5. The capture → triage → review loop

- `/inbox` captures raw (excluded from the activity log — a half-thought isn't a business event) and triages via the `/ba` table into the right doc skill.
- `/meeting` captures structured minutes (decisions/blockers/actions as in-file tables; actions need owners).
- `/doc-review` runs a multi-agent quality audit (agents return findings, never edit; the orchestrator applies accepted fixes). Renamed from `/review` to avoid colliding with the user-level pre-landing PR review.

## 6. `/dashboard` is the pulse, `/gap` is the proof

`/dashboard` = "where are we?" (statuses, staleness, OQ debt, recent activity — one HTML file + regenerates feature-list.md). `/gap` = "what's missing in the chain?" (traceability coverage). Different questions, both useful — the dashboard's OQ-debt callout often sends you to `/gap`.

## 7. Worked example

`example/atlas-re/meetings/` carries a sample review meeting whose Decisions table links `FR-atlas-re-006` — showing how a meeting decision connects back into the traceability spine (and would, if it changed scope, route to `/cr`).

## See also

- `explain-skills/traceability-family.md` — `/gap` (coverage) that complements `/dashboard` (status)
- `rules/atlassian-sync.md` — the HITL + drift contract `/jira` and `/confluence` share
- `rules/doc-selection.md` — the full matrix (now fully ✓)
