# Changelog

All notable changes to **dev-ba-kit** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org).
(`rules/changelog.md` is a different thing — it defines the activity-log convention for the BA artifacts the kit generates.)

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
