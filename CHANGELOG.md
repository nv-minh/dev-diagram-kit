# Changelog

All notable changes to **dev-ba-kit** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org).
(`rules/changelog.md` is a different thing — it defines the activity-log convention for the BA artifacts the kit generates.)

## [2.4.0] — Unreleased

### Added
- **Wave 5 — API integration family (7 skills):** the 7-step chain `/api-assess → /api-doc →
  /api-design → /api-map → /api-checklist → /api-test → /api-readiness`. `/api-assess` (build-vs-buy,
  skippable when provider fixed), `/api-doc` (digest the contract, refuses to fabricate, provenance per
  row), `/api-design` (Integration Blueprint: orchestration/state-map/source-of-truth/webhook+reconciliation/
  retry/degraded-UX), `/api-map` (3-layer field map with owners, skippable for pure triggers),
  `/api-checklist` (test outline with `test_layer`/`direction` columns), `/api-test` (Bruno collection +
  test table, one collection per provider), `/api-readiness` (go-live gate, hard-refuses "go" without test
  evidence).
- `rules/api-integration.md` filled out (chain order, skip conditions, test_layer/direction semantics,
  provider-suffix rule, Bruno layout, go/no-go table).
- 7 templates `doc-api-{assess,summary,design,map,checklist,tests,readiness}.md`.
- `explain-skills/api-family.{md,vi.md}`; `guides/07-api-and-delivery.md` + VI twin (API chain; delivery
  placeholder for wave 6).
- atlas-re: the CatModel provider integration — `api-summary-catmodel.md` (digest) + `api-design.md`
  (blueprint with webhook⇄reconciliation pairing) + `api-map.md` (3-layer field map with owners).

## [2.3.0] — Unreleased

### Added
- **Wave 4 — verification, traceability & change (5 skills):** `/test-checklist` (categorized coverage
  outline, `CHK-`), `/test-cases` (full cases expanding each `CHK-` to `TC-`, refuses without a
  checklist — the canonical group-B example), `/gap` (cross-doc traceability matrix + coverage report;
  read-only except its one report, computes the spine UN→…→TC), `/cr` (record-then-apply Change
  Request with Impact Matrix + Rollback, `@change-tracker` agent computes the dependency-ordered
  Apply plan), `/reverse-doc` (reconstruct BA docs from legacy sources with 3-level confidence
  ✅/🔵/🟡, never overwrites the official docs).
- Rules: `rules/traceability.md` (the spine + 3 parse surfaces + coverage rules), `rules/test-conventions.md`
  (CHK/TC anatomy + expansion). `naming-conventions.md` gains `CHK-`/`TC-` ID rows; `doc-validate`
  checks their format.
- Agent `agents/change-tracker.md` (impact propagation, apply ordering, stale-target detection).
- Templates `doc-{test-checklist-index,testcase-index,cr,traceability,reverse-doc}.md`.
- `explain-skills/testing-family.{md,vi.md}` + `traceability-family.{md,vi.md}`; guides 06 EN/VI §17–§21.
- atlas-re: test checklist (9 CHK) + test cases (11 TC, boundary triples + per-E- cases) + a
  `traceability.md` from a real `/gap` run (spine intact, 3 deliberate unsliced-FR gaps surfaced) +
  `CR-20260801-001` (50k→60k threshold change with full impact + rollback).

## [2.2.0] — Unreleased

### Added
- **Wave 3 — UI design (4 skills):** `/wireframe-ascii` (ASCII frames + 5-column description tables,
  L3 iterate in chat; gates on the approved user flow), `/wireframe-html` (B&W static HTML per flow +
  navigation entry, renderer on par with ASCII), `/prototype-html` (one self-contained clickable
  prototype — every nav edge works, broken links BLOCKING), `/figma` (push wireframes to Figma via
  MCP, external-write hard gate, URLs into the screen index). All follow `ba-conventions.md` §6–8
  (description depth, device question first, one-screen-one-state).
- HTML shells in `skills/{wireframe-html,prototype-html}/resources/`; templates `doc-wireframe-index.md`,
  `doc-wireframe-html-index.md`.
- `explain-skills/wireframe-family.{md,vi.md}`; guides 06 EN/VI §13–§16.
- atlas-re: `ascii-wireframe/approve-claim.md` (screens `[1]…[4]` ASCII + 5-column tables citing the
  SRS FR/BR/E-) + `atlas-re-wireframe-index.md` (6 screens across 2 flows).

## [2.1.0] — Unreleased

### Added
- **Wave 2 — behavioral specification (4 skills):** `/usecase` (fully-dressed Cockburn text UCs,
  two-mode: discovery elicitation without an SRS / full traceability with one — un-breaks
  `/usecase-diagram`'s long-standing reference), `/userstory` (INVEST slices of FRs + the story
  index as the single source of status/priority/jira-key), `/ac` (Given-When-Then added in-place,
  always an L2 diff, coverage rule: happy + each E- code + each BR- boundary), `/user-flow`
  (screen-navigation map, numbered screens, the SOLE source of flow division the wave-3
  wireframe skills will read; stamps `stage: approved` + flow hash).
- Templates: `doc-usecase.md`, `doc-userstory.md` (zero-frontmatter content templates),
  `doc-story-index.md`, `doc-userflow.md`.
- `explain-skills/spec-family.{md,vi.md}`; guides 06 EN/VI §9–§12.
- atlas-re examples: `uc-approve-claim` + usecase index (traceability matrix + CRUD),
  `us-001…003` + story index with FR coverage map, the two-flow userflow with screens `[1]…[6]`.
- kit-lint: zero-frontmatter template convention (`<!-- zero-frontmatter` marker on line 1).

## [2.0.0] — Unreleased

### Changed (BREAKING)
- **Plugin renamed `dev-diagram-kit` → `dev-ba-kit`.** The plugin name is the install identity, so
  existing plugin-mode installs will not auto-update. Migration:
  `/plugin uninstall dev-diagram-kit` → `/plugin marketplace add https://github.com/nv-minh/dev-ba-kit`
  → `/plugin install dev-ba-kit`. Copy-mode (`install.sh`) users just re-run the installer.
  No generated-artifact changes: every doc/diagram already produced under `docs/` remains valid;
  `.claude/state/atlassian/sync-state.yaml` is untouched.
- Repositioned: **BA toolkit for developers — documents + diagrams.** The kit now covers the full
  BA document lifecycle (discovery → spec → UI design → API integration → testing → traceability →
  delivery) alongside the existing 22 diagram skills, under two routers: `/ba` (documents) and
  `/diagram` (diagrams).

### Added
- **Wave 1 — requirements spine (7 skills):** `/brainstorm`, `/urd`, `/brd`, `/prd-epic`, `/srs`,
  `/prd`, `/roadmap` — the discovery chain that mints the root IDs (`UN-`/`BO-`/`CAP-`/`FR-`/`NFR-`/`BR-`/`E-`)
  of the traceability spine.
- **`/ba` router** — the document-side twin of `/diagram`: ≤2 questions, routes to the right doc skill.
- **`rules/doc-selection.md`** — document-skill decision matrix (source of truth for `/ba`), with a
  document-vs-diagram fork cross-referencing `rules/diagram-selection.md`.
- **`rules/api-integration.md`** — the 7-step API integration chain contract (full content lands with Wave 5).
- **`scripts/kit-lint.ts`** — repo-integrity CI gate: SKILL.md frontmatter lint + description length cap,
  index-surface sync, EN/VI parity, version trio, skill-count claims, template `type:` schema.
- **`scripts/doc-validate.ts`** — the document twin of `diagram-validate.ts`: frontmatter schema, status,
  ID format regexes, wikilink/`links:` targets, zero-frontmatter rules. Exit 0/2/1.
- **`agents/doc-reviewer.md`** — document quality reviewer (mirrors `diagram-reviewer`), auto-spawned
  past complexity thresholds by the Wave-1+ document skills.
- **Wave-1 output templates** — `templates/doc-{brainstorm,urd,brd,prd,prd-product,roadmap,srs}.md`.
- Ported content (MIT, see NOTICE): BMAD-METHOD elicitation/template structures, ccpm PRD question set,
  spec-kit testable-requirement phrasing.

## [1.1.0] — 2026-07-26

### Added
- **`/drawio-sequence`** — UML sequence diagrams as editable `.drawio` files (lifelines × time-ordered
  messages: sync / return / async / self-call), backed by the new kit-native `renderSequence` engine.
- **Engine test suite** — first unit tests (vitest, 19 tests): XML escaping, edge router
  (straight / obstacle avoidance / fan-out port de-collision / determinism), `renderSequence`
  styles + error cases, and the `save()` kit-repo guard. `npm test` / `npm run typecheck`.
- **CI (GitHub Actions)** — typecheck + tests + an *engine drift gate*: every example
  `.src.ts` is rebuilt and the job fails if the output no longer matches the committed `.drawio`.
- **Docs: full explain-skills coverage** — 12 new bilingual deep-dives (EN + VI) close the gap for
  all 27 skills: `drawio-family` (the 5 draw.io skills), `system-design`, `scan-project`,
  `code-flow`, `dfd`, `journey`, `mindmap`, `timeline`, `orgchart`, `diagram`, `gallery`,
  `sync-confluence`. Per-skill guides (`guides/03`, `huong-dan/03`) extended §15–§23 to cover all skills.
- `CHANGELOG.md` + `CONTRIBUTING.md`.

### Changed
- `diagram-validate` accepts raw Mermaid files (`.mmd`/`.mermaid`, auto-wrapped for compile-check)
  and the `.pu`/`.uml` PlantUML extensions.
- `sequence.ts` is fully type-checked; `participant()`/`message()` validate at call time
  (empty id/label, duplicate id, unknown participant) instead of failing late at render time.
- `/diagram` router table completed (`/orgchart`, the cloud `/drawio-*` skills, `/drawio-sequence`)
  and kept in sync with `rules/diagram-selection.md`.
- `doctor.sh` is platform-aware (Linux users no longer see "macOS: preinstalled" hints).
- `install.sh` counts skills dynamically instead of printing a hardcoded number.
- Router magic numbers named (`COLLISION_MARGIN`, `BORDER_HUG_MARGIN`, `LANE_STEP`, `LANE_MARGIN`);
  example rebuild verified byte-identical.

### Fixed
- **`save()` kit-repo guard** only covered `skills/drawio/` — `KIT_ROOT` was still computed for the
  upstream `src/` layout. It now resolves to the kit root (repo checkout or a workspace's
  `.claude/`), so diagrams can no longer be written into the kit by accident.
- Enhanced diagram styles and node shapes; density-adaptive route gap for dense diagrams.

### Removed
- Vendored `drawio-ai-kit/` upstream clone (47 MB) — the engine was already ported to
  `skills/drawio/engine/`; the directory is now gitignored.

## [1.0.0] — 2026-07

Initial release: 26 skills for developers doing BA work — Mermaid (sequence, activity, state, ERD,
mindmap, journey, timeline), PlantUML (activity-swimlane, use case, offline jar), D2 (d2-activity,
d2-erd, d2-architect, dfd, orgchart, system-design C4 + HTML deck), BPMN 2.0 (engine + editor),
DBML (dbdiagram), draw.io cloud architecture (AWS/Azure/GCP/Databricks with validated stencil
catalogs), code-flow, scan-project, diagram router, gallery, sync-confluence — plus the unified
`diagram-validate` gate, bilingual EN/VI docs, and the atlas-re end-to-end example.
