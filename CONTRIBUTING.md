# Contributing to dev-ba-kit

Thanks for helping improve the kit. This page covers the workflow and the few hard rules.

## Setup

```bash
npm install                 # tsx + typescript + vitest (dev-only)
bash scripts/doctor.sh      # check the render tools (node, mmdc, d2, java, …)
```

Scripts run as TypeScript via `tsx` — no build step (`bash scripts/tsrun.sh <file.ts>`).

## Before you open a PR

These must pass (CI runs the same gates):

```bash
npm run typecheck                                                           # tsc --noEmit — kit-native .ts files are fully typed
npm test                                                                    # vitest — engine + script unit tests
bash scripts/tsrun.sh scripts/kit-lint.ts                                   # index surfaces, EN/VI parity, counts, stale phrases
bash scripts/tsrun.sh scripts/doc-validate.ts example/atlas-re              # example documents
bash scripts/tsrun.sh scripts/validate-example-diagrams.ts --strict-tools   # allowlisted diagram-validate (needs d2/java/mmdc)
bash scripts/tsrun.sh skills/drawio/engine/drawio-build.ts --dir example/atlas-re/drawio
git diff --exit-code -- example/atlas-re/drawio                             # engine drift gate
```

The draw.io drift check matters most for engine PRs: **any change to the draw.io engine must either
produce byte-identical example output, or the rebuilt `.drawio` files must be committed together
with the engine change** (and the visual result eyeballed in draw.io). CI fails on silent drift.

## Repo conventions

- **Vendored vs kit-native code.** `skills/drawio/engine/{builder,core,layout,layout-engine,theme,types,cli-lib}.ts`
  and `skills/bpmn/engine/*.ts` are ported 1:1 from plain JS and carry `// @ts-nocheck` — keep their
  logic verbatim-style (surgical fixes only, no restructuring). Kit-native files (`sequence.ts`,
  `drawio-build.ts`, `scripts/*.ts`, tests) are fully type-checked — keep them that way.
- **Adding/renaming a skill** touches more than `skills/<name>/`:
  1. The class matrix (source of truth) **and** its router's condensed table — always both, in the
     same PR. Diagram skill → `rules/diagram-selection.md` + `skills/diagram/SKILL.md`;
     document skill → `rules/doc-selection.md` + `skills/ba/SKILL.md` (flip the matrix row
     `planned (wave N)` → `✓` in the PR that lands the skill).
  2. `README.md` + `README.vi.md` (skill table + count).
  3. A guide §-section: diagram skills in `guides/03-per-skill-guide.md` +
     `huong-dan/03-huong-dan-tung-skill.md`; document skills in `guides/06-ba-documents.md` +
     `huong-dan/06-tai-lieu-ba.md`.
  4. An `explain-skills/<name>.md` + `<name>.vi.md` pair (or extend the relevant family doc).
  5. Ideally an example under `example/atlas-re/`.
  6. Run `bash scripts/tsrun.sh scripts/kit-lint.ts` — CI fails on any index-surface drift
     (README tables, matrices, router tables, explain-skills mentions, EN/VI parity, counts).
- **Bilingual docs are pairs.** Every EN doc (`guides/`, `explain-skills/*.md`, `README.md`) has a VI
  twin (`huong-dan/`, `*.vi.md`, `README.vi.md`). Change one → change the other in the same PR.
- **Large assets stay out of git.** `assets/plantuml/plantuml.jar`, `skills/drawio/catalog/azure.json`,
  `gcp.json` are downloaded on demand (`scripts/plantuml-ensure.sh`, `scripts/drawio-catalog-ensure.sh`).
  Don't commit them; follow the same pattern for anything else over ~1 MB.
- **Versioning.** Bump `package.json`, `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together,
  and add a `CHANGELOG.md` entry.

## Commit style

Imperative subject, conventional prefix where it fits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
One logical change per commit — engine changes and their rebuilt examples belong in the same commit.

## License

MIT (see `LICENSE`). Vendored code attribution lives in `NOTICE` and `skills/drawio/NOTICE.md`.
