<!--
REFERENCE for delivery skills — simulated sessions (atlas-re context).
-->

## /confluence

**Command:** `/confluence atlas-re confluence:https://acme.atlassian.net/wiki/spaces/ATLAS`

**L1 hard gate:** page tree preview (URD, BRD, PRD, SRS, use cases, stories…) · explicit Y per page batch.

**Output:** Confluence pages + `sync-state.yaml` mappings.confluence · drift warning if page edited outside kit.

---

## /export

**Command:** `/export --scope atlas-re --format pdf`

**L1:**

```
[/export] Will perform:
  1 | docs/exports/2026-08-01-atlas-re-package.pdf | create | bundle + change-history section
```

**Output report:** snapshot path · source docs remain truth in `docs/atlas-re/`.

---

## /userguide

**Command:** `/userguide atlas-re`

**Phased HARD STOP:** outline → sample chapter → full manual. Light mode (task-oriented, not spec dump).

**Output:** `docs/atlas-re/userguide/atlas-re-guide.html` entry + bundled sections.

---

## /inbox

**Command:** `/inbox "committee quorum still undefined — blocks US-001 committee ACs"`

**Skill:** captures raw note · triage table · routes to `/ba` suggestion: resolve OQ via meeting or `/cr` if decision made.

**Output:** `docs/inbox/inbox.md` append (excluded from activity log by design).

---

## /doc-review

**Command:** `/doc-review docs/atlas-re/srs/atlas-re-spec.md`

**Skill spawns reviewers · returns findings table (BLOCKING / SUGGESTION) · apply accepted fixes as L2 diffs.

**Sample finding:** `BLOCKING — FR-atlas-re-004 has no error path for Finance queue timeout → add E- row or OQ`.

---

## /dashboard

**Command:** `/dashboard`

**Output:** regenerates `docs/_product/feature-list.md` + writes `docs/_product/dashboard.html` — vault pulse (status, staleness, OQ debt per feature). Open in browser for internal overview.
