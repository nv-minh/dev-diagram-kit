# Contributing to dev-ba-kit

Thanks for helping improve the kit. This page covers the workflow and the few hard rules.

## Setup

```bash
npm install                 # tsx + typescript + vitest (dev-only)
bash scripts/doctor.sh      # check the render tools (node, mmdc, d2, java, …)
```

Scripts run as TypeScript via `tsx` — no build step (`bash scripts/tsrun.sh <file.ts>`).

## Before you open a PR

All three must pass (CI runs the same gates):

```bash
npm run typecheck    # tsc --noEmit — kit-native .ts files are fully typed
npm test             # vitest — engine unit tests
bash scripts/tsrun.sh skills/drawio/engine/drawio-build.ts --dir example/atlas-re/drawio
git diff --exit-code -- example/atlas-re/drawio    # engine drift gate
```

The last check matters most: **any change to the draw.io engine must either produce byte-identical
example output, or the rebuilt `.drawio` files must be committed together with the engine change**
(and the visual result eyeballed in draw.io). CI fails on silent drift.

## Repo conventions

- **Vendored vs kit-native code.** `skills/drawio/engine/{builder,core,layout,layout-engine,theme,types,cli-lib}.ts`
  and `skills/bpmn/engine/*.ts` are ported 1:1 from plain JS and carry `// @ts-nocheck` — keep their
  logic verbatim-style (surgical fixes only, no restructuring). Kit-native files (`sequence.ts`,
  `drawio-build.ts`, `scripts/*.ts`, tests) are fully type-checked — keep them that way.
- **Adding/renaming a skill** touches more than `skills/<name>/`:
  1. `rules/diagram-selection.md` (decision matrix — the source of truth) **and** the condensed
     routing table in `skills/diagram/SKILL.md` — always both, in the same PR.
  2. `README.md` + `README.vi.md` (skill table + count).
  3. `guides/03-per-skill-guide.md` + `huong-dan/03-huong-dan-tung-skill.md` (a §-section each).
  4. An `explain-skills/<name>.md` + `<name>.vi.md` pair (or extend the relevant family doc).
  5. Ideally an example under `example/atlas-re/`.
- **Bilingual docs are pairs.** Every EN doc (`guides/`, `explain-skills/*.md`, `README.md`) has a VI
  twin (`huong-dan/`, `*.vi.md`, `README.vi.md`). Change one → change the other in the same PR.
- **Large assets stay out of git.** `assets/plantuml/plantuml.jar`, `skills/drawio/catalog/azure.json`,
  `gcp.json` are downloaded on demand (`scripts/plantuml-ensure.sh`, `scripts/drawio-catalog-ensure.sh`).
  Don't commit them; follow the same pattern for anything else over ~1 MB.
- **Versioning.** Bump `package.json`, `.claude-plugin/plugin.json` and `marketplace.json` together,
  and add a `CHANGELOG.md` entry.

## Commit style

Imperative subject, conventional prefix where it fits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
One logical change per commit — engine changes and their rebuilt examples belong in the same commit.

## License

MIT (see `LICENSE`). Vendored code attribution lives in `NOTICE` and `skills/drawio/NOTICE.md`.
