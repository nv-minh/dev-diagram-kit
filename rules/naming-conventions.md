# Naming Conventions

## Slugs (folder & file names)

- All lowercase, kebab-case
- ASCII only (avoid Vietnamese diacritics — use English/transliteration)
- No spaces, no underscores, no special chars
- Strip leading/trailing dashes
- Max 50 chars

| Input | Slug |
|-------|------|
| "User Login" | `user-login` |
| "Forgot Password (v2)" | `forgot-password-v2` |
| "Thanh toán đơn hàng" | `payment-checkout` (preferred) |
| "2FA / OTP" | `two-factor-auth` |

## File path patterns

> **Prefix principle (2026-07-12):** EVERY per-feature file with a **fixed name** (not a business slug) carries the `{feature}-` prefix — reason: bare names (`spec.md`, `flows.md`, `preview.html`...) collide on basename across features (measured: `preview.html` ×8, `spec.md` ×4), indistinguishable when searching/opening tabs in Obsidian/IDE. This extends the decision already made for index files (`_index.md` ×18 → `{feature}-{domain}-index.md`). Files with a **naturally distinct business slug** (uc-{slug}.md, us-{NNN}.md, {flow-slug}.md, checklist-{slug}.md, brainstorms/{idea}.md, {process}.bpmn) get NO prefix — the slug already distinguishes them, a prefix would only lengthen the name.

| Doc type | Path |
|----------|------|
| Product PRD (project-level) | `docs/_product/prd.md` (singleton, NO feature prefix — under `_product/` like `_shared/`). Output of `/prd`. |
| Roadmap (project-level) | `docs/_product/roadmap.md` (singleton). Output of `/roadmap`. |
| URD | `docs/{feature}/{feature}-urd.md` |
| BRD | `docs/{feature}/{feature}-brd.md` |
| PRD | `docs/{feature}/{feature}-prd.md` |
| SRS spec | `docs/{feature}/srs/{feature}-spec.md` |
| SRS flows (sequence + activity, 1 merged file) | `docs/{feature}/srs/{feature}-flows.md` — each flow is one `## Flow: {title}` section with inline mermaid sequence/flowchart. Fixed output of `/sequence` and `/activity`. |
| SRS states (state diagrams, 1 merged file) | `docs/{feature}/srs/{feature}-states.md` — each entity is one `## State: {Entity}` section with mermaid `stateDiagram-v2`. Fixed output of `/state`. |
| SRS ERD | `docs/{feature}/srs/{feature}-erd.md` |
| DBML schema (source) | `docs/{feature}/dbdiagram/{feature}.dbml` — native DBML (no frontmatter). Import into dbdiagram.io/dbdocs.io. Output of `/dbdiagram`. |
| DBML SQL export | `docs/{feature}/dbdiagram/{feature}.sql` — SQL generated via `dbml2sql` (PostgreSQL). |
| DBML index (master metadata) | `docs/{feature}/dbdiagram/{feature}-dbdiagram-index.md` — type `dbdiagram-index`, table listing. |
| System Design C4 — source by layer | `docs/{feature}/system-design/{slug}-context.d2` + `{slug}-container.d2` + `{slug}-component-{container}.d2` (optional) + `.svg` per file. D2 source, git-friendly. Cross-feature → `docs/_shared/system-design/`. Output of `/system-design`. |
| System Design C4 — presentation | `docs/{feature}/system-design/{feature}-system-design.html` (or `_shared`) — self-contained, dark-theme + PNG/PDF export toolbar, inline SVG of each layer embedded. **Entry point** double-click for stakeholders. |
| System Design index (master metadata) | `docs/{feature}/system-design/{feature-or-shared}-system-design-index.md` — type `system-design-index`, standard frontmatter + layer table (layer/file/main blocks/updated). |
| Architecture scan (from code) — source | `docs/_shared/architecture/{proj}-context.d2` + `{proj}-container.d2` + `{proj}-modules.d2` + `{proj}-module-{name}.d2` + `{proj}-erd.d2` (+ `.svg` per file) + `{proj}-flows.md` (Mermaid sequence). Output of `/scan-project` (reverse-engineered from the codebase, cross-project → `_shared/`). |
| Architecture scan — plan (Phase 1) | `docs/_shared/architecture/scan-plan.md` — type `scan-plan`, detected modules + proposed diagrams (tick) + gap/confidence. HARD STOP before generating diagrams. |
| Architecture scan — index + gallery | `docs/_shared/architecture/{proj}-architecture-index.md` (type `architecture-index`) + `{proj}-architecture.html` (self-contained presentation deck). |
| SRS user flow (the SOLE source of flow division) | `docs/{feature}/srs/{feature}-userflow.md` — mermaid `flowchart`/mindmap covering happy/error/edge cases, numbering `[n]` per screen. Pre-divides the feature into **flows** (flow-slug + list of screens/use-cases per flow) — both `ascii-wireframe/` and `html-wireframe/` read this file to know which screens each flow contains. Fixed output of `/user-flow`, runs BEFORE wireframes (ASCII or HTML). |
| Screen index (master metadata) | `docs/{feature}/ascii-wireframe/{feature}-wireframe-index.md` — standard frontmatter + Screens table (status/owning flow/used-by/Figma+HTML designs/updated) + `## Descriptions` section (H3 per screen, 1-2 sentence purpose). **Single source of metadata + descriptions** for all screens of the feature. Filename has the `{feature}` prefix to distinguish when searching/opening many tabs (Obsidian quick-switcher no longer returns a list full of same-named `_index.md`). |
| Screen content (minimal, merged by flow) | `docs/{feature}/ascii-wireframe/{flow-slug}.md` — **zero frontmatter**, 1 file/flow containing N screens (each screen one `## Screen: {screen-slug} — {name}` block with 2 sub-sections: ASCII Wireframe / Screen description table with **5 columns** `# / Items / Control type / Data type / Description`, format `• `+`<br>`). NO emoji inside the ASCII frame (breaks the border alignment). Divide flows per `srs/{feature}-userflow.md`. Output of `/wireframe-ascii`. |
| HTML mockup | `docs/{feature}/html-design/{screen-slug}.html` (separate folder) — path stored in `{feature}-wireframe-index.md` column `HTML`. |
| Figma frame URL | URL stored in `{feature}-wireframe-index.md` column `Figma` (output of `/figma`). NO local file. |
| HTML prototype | `docs/{feature}/html-design/{feature}-prototype.html` (output of `/prototype-html`, multi-screen clickable, self-contained). Referenced in `{feature}-wireframe-index.md` column `HTML prototype` as `{feature}-prototype.html#{slug}`. |
| HTML wireframe — navigation index | `docs/{feature}/html-wireframe/{feature}-wireframe.html` — **entry point** (double-click opens in browser): sidebar TOC (flow → screen) + Overview tab is a clickable flow map + iframe loading each flow. Self-contained, B&W. Output of `/wireframe-html` Phase G.5. Used to navigate multi-flow features. |
| HTML wireframe index (metadata) | `docs/{feature}/html-wireframe/{feature}-wireframe-html-index.md` (master metadata: type `wireframe-html-index`, Flows table — for git/Obsidian, NOT the main entry point). Output of `/wireframe-html`. |
| HTML wireframe per flow | `docs/{feature}/html-wireframe/{flow-slug}.html` (B&W static, frame width matches the device — mobile 375/tablet 768/desktop 1024, screens wrap automatically, no JS/color). Each screen has `id="s{n}"` for index deep-linking. 1 file = 1 flow, divided per `srs/{feature}-userflow.md`. Renderer on par with `/wireframe-ascii`. |
| BPMN index (master metadata) | `docs/{feature}/bpmn/{feature}-bpmn-index.md` — type `bpmn-index`, standard frontmatter + process table (file/lanes/gateways/viewer). Output of `/bpmn`. |
| BPMN process (full XML) | `docs/{feature}/bpmn/{process-slug}.bpmn` — OMG-standard BPMN 2.0 XML **including `<bpmndi:BPMNDiagram>`** (coordinates + waypoints generated from the IR by the **shared engine**, NOT by the AI). Import into Camunda/Bizagi/draw.io. |
| BPMN editor | `docs/{feature}/bpmn/{feature}-bpmn-editor.html` (bpmn-js **modeler** — drag-and-drop editing like bpmn.io + Download/Save buttons; multi-process dropdown). Regenerated by the shared engine. Follows the `{feature}-{domain}-...` pattern to avoid Obsidian tab collisions. |
| BPMN engine (shared, NOT per-feature) | `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/` — `bpmn-build.ts` + `bpmn-layout-{auto,elk}.ts` + `bpmn-layout.ts` + `bpmn-semcheck.ts` + `_viewer_template.html` + `node_modules` (installed once; plugin mode: the hook auto-installs into `${CLAUDE_PLUGIN_DATA}`). Run: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/bpmn/engine/bpmn-build.ts --dir docs/{feature}/bpmn`. |
| API assessment (partner evaluation) | `docs/{feature}/integration/api-assess.md` — type `api-assess`, build-vs-buy/provider-selection scorecard. Output of `/api-assess` (conditional step [0]). Bare name in `integration/` (consistent with the api-summary/api-map family). |
| API summary (understand 3rd-party contract) | `docs/{feature}/integration/api-summary.md` (or `api-summary-{provider}.md` when there are multiple partners) — type `api-summary`. Output of `/api-doc`. |
| API design (Integration Blueprint) | `docs/{feature}/integration/api-design.md` — type `api-design`, orchestration/state-map/source-of-truth/webhook/retry/reconciliation/degraded-UX. Output of `/api-design` (step [2]). `/api-map` is a part underneath it. |
| API map (3-layer field mapping) | `docs/{feature}/integration/api-map.md` — type `api-map`. Output of `/api-map`, converges under `api-design` before `/api-checklist`. |
| API checklist (test outline) | `docs/{feature}/test/api/api-checklist.md` — type `api-checklist`, columns `test_layer`(own/3rd/mixed) + `direction`(out/in). Output of `/api-checklist`. |
| API tests (Bruno) | `docs/{feature}/test/api/api-tests.md` + `bruno/` — type `api-tests`. Output of `/api-test`. Legacy 3rd-party still under `integration/` will migrate to `test/api/` on rerun. |
| API readiness (go-live gate) | `docs/{feature}/integration/api-readiness.md` — type `api-readiness`, cutover/flag/monitoring/rollback/SLA-deprecation checklist + go/no-go table. Output of `/api-readiness` (step [5]). |

> **Integration family (7 skills):** `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`. Shared rule: `.claude/rules/api-integration.md`. Fixed-name files in `integration/` + `test/api/` use a **bare name** (no `{feature}-` prefix) — consistent with the existing family (api-summary/api-map/api-tests), and the `integration/`+`test/api/` folders already distinguish enough via the feature path.

| Brainstorm | `docs/{feature}/brainstorms/{idea-slug}.md` |
| Reverse-doc (reconstruct from source) | `docs/{feature}/reverse-{feature}.md` — 1 file/feature, 12-section brainstorm framework + Section 0 (source/3-level confidence/cross-check). Written **alongside** the official doc, does NOT overwrite `urd/brd/srs`. Output of `/reverse-doc`. Intermediate plan: `docs/.reverse-plan.md`; temporary convert files: `docs/.reverse-convert/`. |
| User story index (master metadata) | `docs/{feature}/userstories/{feature}-story-index.md` — standard frontmatter + Stories table (ID/title/persona/FR/screens/priority/status/jira-key/updated). **Single source of metadata + status + jira key** for all stories of the feature. |
| User story content (minimal) | `docs/{feature}/userstories/us-{NNN}.md` — **zero frontmatter**, only prose sections (User Story / Context / Linked Requirements / Acceptance Criteria inline / UI refs / Error refs / Dependencies / OQs). Metadata + status + jira **live in `{feature}-story-index.md`**. |
| Use case (fully-dressed Cockburn) | `docs/{feature}/usecases/uc-{slug}.md` — zero frontmatter: Scope · Level · Primary Actor · (Stakeholders optional) · Trigger · Preconditions · Minimal+Success Guarantee · Main Success Scenario (numbered) · Extensions (`{step}{letter}`) · Related Requirements (links FR/BR). The UC↔FR↔Screen↔Error↔OQ traceability matrix is in the `## Use cases` table of `{feature}-usecase-index.md` (no separate traceability file anymore); canonical OQ in `srs/{feature}-spec.md`. Diagrams do NOT embed UC — they belong to `srs/{feature}-flows.md` / `srs/{feature}-states.md`. |
| Use case index (master metadata) | `docs/{feature}/usecases/{feature}-usecase-index.md` — standard frontmatter + Use cases table (slug/status/actor/FR/screens/priority/updated). |
| Use case traceability (relationship matrix) | **No separate file anymore** (removed 2026-07-13) — the UC↔FR↔Screen↔Error↔OQ matrix is the `## Use cases` table in `{feature}-usecase-index.md`. Quick per-feature read; distinct from `/gap` (cross-doc `docs/_shared/traceability.md`). |
| Use Case diagram (visual scope) | `docs/{feature}/usecases/{feature}-usecase-diagram.puml` (native PlantUML source) + `{feature}-usecase-diagram.svg` (rendered via `plantuml.com`). **No more `.md` wrapper file** (removed 2026-07-13) — the `<img>` image + Actors/Relationships table are embedded directly into `{feature}-usecase-index.md` (section `## Diagram/Actors/Relationships`). Output of `/usecase-diagram`. |
| Test checklist index | `docs/{feature}/test/checklist/{feature}-checklist-index.md` — master metadata for the entire checklist. Output of `/test-checklist`. |
| Test cases index | `docs/{feature}/test/testcases/{feature}-testcase-index.md` — master metadata for all test cases. Output of `/test-cases`. |
| Traceability | `docs/_shared/traceability.md` (auto from /gap) |
| Atlassian sync-state (MERGED Jira+Confluence mapping) | `.claude/state/atlassian/sync-state.yaml` (config + mapping + watermark/hash, 1 entry/artifact, key `mappings.jira`/`mappings.confluence`) + `base/*.json` (3-way snapshot) + `locks/`. **Fully replaces** the old `docs/_shared/jira-map.md` + `confluence-map.md` (migrated + deleted). Output of `/jira` + `/confluence`. See `.claude/rules/atlassian-sync.md`. |
| Meeting | `docs/meetings/YYYY-MM-DD-{type}-{slug}.md` (project-level). Decisions/blockers/action items live as tables WITHIN this file — NO separate file for decisions/blockers. |
| Inbox capture | `docs/inbox/YYYY-MM-DD-{slug}.md` (project-level) |
| Change Request | `docs/cr/CR-{YYYYMMDD}-{NNN}.md` (project-level) |
| Impact assessment | **Section within the CR record** (`docs/cr/CR-*.md` — Impact Matrix + Detailed Impact + Rollback Plan). No more separate `docs/impacts/` file — 1 CR = 1 self-contained file. |
| Export package | `docs/exports/{date}-{scope}{-feature}-package.{md|html|pdf|docx}` |
| User guide — open file (the SOLE externally-exposed entry point) | `docs/userguide/userguide.html` (whole product) or `docs/userguide/{feature}-userguide.html` (filtered to 1 feature) — self-contained, no CDN, **light mode only** (docs-style black/white + blue highlight, NO dark mode). This is the only file the user double-clicks; everything else sits in a bundle folder of the same name. |
| User guide — bundle (all supporting files in one folder) | `docs/userguide/userguide/` (whole product) or `docs/userguide/{feature}-userguide/` (feature) containing: `index.md` (master metadata) · `data.js` (content embedded for the open file) · `pages/*.md` (pages, **zero frontmatter**) · `images/*.png` (screenshots). Keeps top-level `docs/userguide/` tidy — only `*.html` files are visible. |

> **Compact structure (entry point + bundle):** each `/userguide` run produces **1 exposed `.html` file** + **1 bundle folder of the same name** holding data/pages/images. The user only opens the `.html` file. `docs/userguide/` is the SOLE project-level folder for the whole product (like `_shared`/`_product`): running for the **whole product** → `userguide.html` + `userguide/`; running **filtered to 1 feature** → `{feature}-userguide.html` + `{feature}-userguide/`. Do NOT use bare names `preview.html`/`index.md` at top-level.

> **Index filename convention:** every "master metadata" file in a domain folder (usecases, userstories, ascii-wireframe, html-wireframe, bpmn, test/checklist, test/testcases) uses the `{feature}-{domain}-index.md` pattern instead of a bare `_index.md`. From 2026-07-12 the prefix principle applies to **every fixed-name file** (see top of table) — including `{feature}-usecase-diagram.*`, `{feature}-prototype.html`, `{feature}-preview.html`, and the per-feature api files (`{feature}-api-map.md`, `{feature}-api-summary.md`, `{feature}-api-checklist.md`, `{feature}-api-tests.md`).

## Wikilinks

Format: `[[docs/payment/srs/payment-spec.md|Payment SRS]]`

- Use full path from project root (Obsidian + GitHub render correctly)
- Optional display text after `|`
- Don't use `[[Login Feature]]` (Obsidian-only style) — breaks on GitHub

## Frontmatter requirements

Every doc-type file MUST have YAML frontmatter at the top:

```yaml
---
type: srs                   # see types below
feature: payment            # feature slug = folder name
status: draft               # see status-lifecycle.md
updated: 2026-05-09         # ISO date
links:                      # flat list of full paths (source for reverse-graph stale hook)
  - docs/payment/brainstorms/checkout-idea.md
---
```

Recommended optional fields:
- `priority`: P0 / P1 / P2
- `version`: semver (e.g. `0.1.0`)

**REMOVED fields (do not re-add):** `lang`/`tags`/`stale_reason` (trimmed round 1, 2026-07-11); `created` (git knows), `owner` (the performer is recorded per-event in `docs/_shared/activity.log`), `changelog` (history lives in `activity.log` — see `.claude/rules/changelog.md`) — trimmed round 2, 2026-07-12.

## Doc type values

| Type | Use for |
|------|---------|
| `srs` | `docs/{feature}/srs/{feature}-spec.md` (FULL frontmatter: status/links/...) |
| `srs-flows` | `docs/{feature}/srs/{feature}-flows.md` (sequence + activity diagrams, 1 merged file). **Slim frontmatter**: only `type`/`feature`/`updated`. Lifecycle inherited from {feature}-spec.md. |
| `srs-states` | `docs/{feature}/srs/{feature}-states.md` (state diagrams, 1 merged file per entity). **Slim frontmatter**: only `type`/`feature`/`updated`. |
| `srs-erd` | `docs/{feature}/srs/{feature}-erd.md` (Mermaid `erDiagram`). **Slim frontmatter**: only `type`/`feature`/`updated`. |
| `dbdiagram-index` | `docs/{feature}/dbdiagram/{feature}-dbdiagram-index.md` (master metadata + table listing). The `.dbml` file is native DBML (no separate frontmatter), `.sql` is the SQL export. Output of `/dbdiagram`. |
| `srs-userflow` | `docs/{feature}/srs/{feature}-userflow.md` (mermaid flowchart/mindmap, shared source of flow division). **Slim frontmatter**: `type`/`feature`/`updated` + state fields `stage`/`flow_approved_at`/`flow_hash`. Output of `/user-flow`. |
| `screen-index` | `docs/{feature}/ascii-wireframe/{feature}-wireframe-index.md` (master metadata + designs map for all screens) |
| `screen` | `docs/{feature}/ascii-wireframe/{flow-slug}.md` (minimal content file, **zero frontmatter**, merges N screens/flow per `srs/{feature}-userflow.md` — no `type:` field in the file; this type is only used to classify when grepping is needed) |
| `urd` / `brd` / `prd` | per-feature requirements docs (`docs/{feature}/{feature}-{urd,brd,prd}.md`) |
| `prd-product` | `docs/_product/prd.md` (project-level PRD singleton: pitch/problem/users/value/goals/themes/Feature Map/metrics/constraints/risks/OQ). Minimal frontmatter `type`/`status`/`updated`/`links` (no `feature` — project-level). Output of `/prd`. |
| `roadmap` | `docs/_product/roadmap.md` (project-level singleton: RICE-lite prioritization + Now/Next/Later or by quarter + Dependency Map). Frontmatter `type`/`status`/`updated`/`format`/`links`. Output of `/roadmap`. |
| `brainstorm` | `docs/{feature}/brainstorms/*.md` |
| `reverse-feature` | `docs/{feature}/reverse-{feature}.md` (reconstruct business logic from source, brainstorm framework + Section 0 provenance/confidence). Output of `/reverse-doc`. |
| `reverse-plan` | `docs/.reverse-plan.md` (Step 1 conversion plan of `/reverse-doc` — planned features + source map + clarifying questions). |
| `userstory-index` | `docs/{feature}/userstories/{feature}-story-index.md` (master metadata + status/priority/jira-key for all stories) |
| `user-story` | `docs/{feature}/userstories/us-{NNN}.md` (minimal content file, **zero frontmatter** — this type is only used to classify when grepping is needed) |
| `use-case` | `docs/{feature}/usecases/uc-*.md` (minimal content file, **zero frontmatter**, 4 sections a–d) |
| `usecase-index` | `docs/{feature}/usecases/{feature}-usecase-index.md` (master metadata + `## Use cases` table = **traceability matrix** UC↔FR↔Screen↔Error↔OQ + `## Actors/Diagram/Relationships` section embedding the use-case diagram image). Absorbs the old traceability role. Output of `/usecase` + `/usecase-diagram`. |
| ~~`usecase-traceability`~~ | **Removed 2026-07-13** — the UC↔FR↔Screen↔Error↔OQ matrix is merged into the `## Use cases` table of `{feature}-usecase-index.md` (6/8 columns overlapped, causing drift). No more separate `{feature}-traceability.md` file. |
| ~~`diagram-usecase`~~ | **Removed 2026-07-13** — no more separate `.md` wrapper file. The real source is `{feature}-usecase-diagram.puml` + rendered `.svg`; image + table embedded in `{feature}-usecase-index.md`. |

> **Note:** the old `diagram-sequence` / `diagram-activity` / `diagram-state` / `diagram-erd` types are removed — the container file uses the `srs-flows` / `srs-states` / `srs-erd` type. Each diagram is one section in the merged file, with NO separate frontmatter.
| `wireframe-html-index` | `docs/{feature}/html-wireframe/{feature}-wireframe-html-index.md` (master metadata + flows table) |
| `bpmn-index` | `docs/{feature}/bpmn/{feature}-bpmn-index.md` (master metadata + process table). The `.bpmn` file is full OMG-standard XML (semantic + BPMNDiagram swimlane), with no separate frontmatter. |
| `system-design-index` | `docs/{feature}/system-design/{feature-or-shared}-system-design-index.md` (master metadata + C4 layer table). The `.d2` file is D2 source, `.svg` is pre-rendered, `.html` is the presentation (self-contained). Output of `/system-design`. |
| `architecture-index` | `docs/_shared/architecture/{proj}-architecture-index.md` (master metadata + diagram table + provenance/confidence). Output of `/scan-project`. |
| `scan-plan` | `docs/_shared/architecture/scan-plan.md` (Phase 1 plan of `/scan-project`: modules + proposed diagrams + gap; HARD STOP). |
| `test-checklist-index` | `docs/{feature}/test/checklist/{feature}-checklist-index.md` (master metadata for the entire checklist) |
| `test-cases-index` | `docs/{feature}/test/testcases/{feature}-testcase-index.md` (master metadata for all test cases) |
| `change-request` | `docs/cr/CR-*.md` |
| `impact-report` | *(deprecated as standalone)* — impact assessment is now a section within `docs/cr/CR-*.md`. Type value kept to classify old content if legacy files remain. |
| `traceability` | `docs/_shared/traceability.md` |
| ~~`jira-map`~~ / ~~`confluence-map`~~ | **Removed** — mapping MERGED into `.claude/state/atlassian/sync-state.yaml` (YAML, no frontmatter). No more 2 separate `.md` files in `docs/_shared/`. |
| `export-package` | `docs/exports/*.md` |
| `userguide-index` | `docs/userguide/{userguide|{feature}-userguide}/index.md` (user guide master metadata + Sections table). Frontmatter `type/scope/audience/lang/status/updated/links`. Output of `/userguide`. |
| `userguide-section` | `docs/userguide/{userguide|{feature}-userguide}/pages/{slug}.md` (user guide page, **zero frontmatter** — this type is only used to classify when grepping is needed). |
| `api-assess` | `docs/{feature}/integration/api-assess.md` (partner-evaluation scorecard). Output of `/api-assess`. |
| `api-summary` | `docs/{feature}/integration/api-summary.md` (understand 3rd-party contract). Output of `/api-doc`. |
| `api-design` | `docs/{feature}/integration/api-design.md` (Integration Blueprint: orchestration/state/webhook). Output of `/api-design`. |
| `api-map` | `docs/{feature}/integration/api-map.md` (3-layer field mapping). Output of `/api-map`. |
| `api-checklist` | `docs/{feature}/test/api/api-checklist.md` (test outline + test_layer + direction). Output of `/api-checklist`. |
| `api-tests` | `docs/{feature}/test/api/api-tests.md` (Bruno test-case table). Output of `/api-test`. |
| `api-readiness` | `docs/{feature}/integration/api-readiness.md` (go-live gate + go/no-go). Output of `/api-readiness`. |
| `meeting` | `docs/meetings/*.md` |
| `inbox` | `docs/inbox/*.md` |

## ID conventions (cross-doc references)

Every ID in the `links:` frontmatter or body must follow the format below. This format ensures the `/gap` traceability matrix has no collisions when cross-aggregating across features.

### General format

| Type | Format | Example | Scope |
|------|--------|-------|-------|
| User Need | `UN-{feature}-{NNN}` | `UN-payment-001` | Per-feature, in `{feature}-urd.md` User needs section |
| Business Objective | `BO-{feature}-{NNN}` | `BO-payment-01` | Per-feature, in `{feature}-brd.md` Business Objectives & Success Measures section |
| PRD Capability | `CAP-{feature}-{NNN}` | `CAP-payment-01` | Per-feature, in `{feature}-prd.md` Capabilities section |
| Functional Requirement | `FR-{feature}-{NNN}` | `FR-payment-001` | Per-feature, in `srs/{feature}-spec.md` Section 2 |
| Non-Functional Requirement | `NFR-{feature}-{NNN}` | `NFR-payment-001` | Per-feature, in `srs/{feature}-spec.md` Section 3 |
| Business Rule | `BR-{feature}-{NNN}` | `BR-payment-001` | Per-feature, in `srs/{feature}-spec.md` Section 4 |
| Error Code | `E-{feature}-{NNN}` | `E-payment-001` | Per-feature, in `srs/{feature}-spec.md` Section 5 |
| User Story | `US-{NNN}` | `US-001` | Per-feature folder (`docs/payment/userstories/us-001.md`) — feature implied by the path |
| Use Case | `UC-{slug}` | `UC-checkout` | Per-feature folder, human-readable slug |
| Acceptance Criterion | `AC-{NNN}` | `AC-001` | Per-user-story (scoped within the `us-{NNN}.md` file) |
| Change Request | `CR-{YYYYMMDD}-{NNN}` | `CR-20260512-001` | Project-wide (`docs/cr/`) |

### Rules

- **Feature prefix required** for UN/BO/CAP/FR/NFR/BR/E. Purpose: avoid collisions when `/gap` aggregates cross-feature (e.g. `FR-001` is ambiguous across 2 features).
- **US/AC/UC scoped by path** (no feature prefix needed in the ID) since they always sit within the feature folder.
- **NNN = 3-digit zero-pad** for BO/CAP/FR/NFR/BR/E (e.g. `001`, `042`). NN is also OK for BO/CAP (`01`, `02`) since there are usually fewer.
- **CR/D/B prefixed by date** since they are time-based events, ordered by date.
- IDs are not reused after deletion — always increment max + 1.
- Slug in the ID is kebab-case, max 30 chars.

### Cross-references

When one doc references an ID from another doc:
- Frontmatter `links:` flat list with full paths: `links: [docs/payment/srs/payment-spec.md, docs/payment/userstories/us-001.md]`
- Body inline reference: `[[docs/payment/srs/payment-spec.md#FR-payment-001|FR-payment-001]]` (Obsidian-compatible anchor).
- `/gap` parses both forms to build the relationship graph.
