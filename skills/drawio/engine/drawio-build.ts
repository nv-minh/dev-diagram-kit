#!/usr/bin/env -S tsx
// drawio-build.ts — draw.io XML build + validate pipeline (kit-native entry; runs via tsx — see scripts/tsrun.sh).
//   tsrun.sh skills/drawio/engine/drawio-build.ts search "s3, lambda, dynamodb" --cloud aws
//       → batch stencil lookup (the AI resolves real stencil NAMES before writing the build-script)
//   tsrun.sh skills/drawio/engine/drawio-build.ts --dir <feature>/drawio --cloud aws
//       → every {slug}.src.ts: inject engine DSL → build() → validateDiagram HARD GATE → write {slug}.drawio
//   tsrun.sh skills/drawio/engine/drawio-build.ts --verify --dir <feature>/drawio
//       → re-validate every .drawio (render-free), print ✅/⚠️/❌ report, exit non-zero on error
//   [--render]  also export PNG/SVG via the draw.io desktop app if present (optional)
//
// MODEL (mirrors /bpmn): the AI writes a declarative-ish build-script {slug}.src.ts that exports
// `build(engine)` returning a Diagram. drawio-build.ts injects the engine DSL symbols (so the
// script needs NO imports — it lives anywhere, e.g. docs/{feature}/drawio/), runs validateDiagram
// as a hard gate (stencils exist + design principles + geometry), then emits the .drawio.
// Catalog data (skills/drawio/catalog/) is the ground truth that stops the AI inventing stencils.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, isAbsolute, basename } from 'node:path';
// Vendored engine (see ../NOTICE.md — ported from drawio-ai-kit, MIT, sparklabx).
import { loadCatalog, searchIcon, validateDiagram } from './core.ts';
import { Diagram } from './builder.ts';
import { icon, box, group, grid, frame, phantom, pool, renderTree } from './layout-engine.ts';
import { renderSequence } from './sequence.ts';
import { THEME } from './theme.ts';
import { findDrawioCli, buildRenderArgs } from './cli-lib.ts';

const HERE = dirname(fileURLToPath(import.meta.url));   // skills/drawio/engine/
const CATALOG_DIR = join(HERE, '..', 'catalog');

// ── args ──
const argv = process.argv.slice(2);
const flag = (k: string) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : null; };
const has = (k: string) => argv.includes(`--${k}`);
const POSITIONAL = argv.filter(a => !a.startsWith('--') && !argv[argv.indexOf(a) - 1]?.startsWith('--cloud') && !argv[argv.indexOf(a) - 1]?.startsWith('--dir'));
const CLOUD = (flag('cloud') || 'aws') as 'aws' | 'azure' | 'gcp' | 'databricks';
const VERIFY = has('verify');
const RENDER = has('render');
const dirArg = argv.indexOf('--dir');
const WORK = dirArg !== -1 && argv[dirArg + 1]
  ? (isAbsolute(argv[dirArg + 1]) ? argv[dirArg + 1] : join(process.cwd(), argv[dirArg + 1]))
  : null;

// Catalog file per cloud. azure.json + gcp.json are large → gitignored, downloaded by
// scripts/drawio-catalog-ensure.sh. loadCatalog() also merges every sibling catalog/*.json
// (so aws picks up the tooling packs: bigdata/cicd/database/network/…).
const CATALOG_FILE = join(CATALOG_DIR, `${CLOUD}.json`);

function loadCloudCatalog() {
  if (!existsSync(CATALOG_FILE)) {
    if (CLOUD === 'azure' || CLOUD === 'gcp') {
      console.error(`❌ ${CLOUD}.json not found (large catalog, not shipped in-repo).`);
      console.error(`   Run: bash "${process.env.CLAUDE_PLUGIN_ROOT || '<kit>'}/scripts/drawio-catalog-ensure.sh" ${CLOUD}`);
    } else {
      console.error(`❌ ${CLOUD}.json not found at ${CATALOG_FILE} (catalog data missing).`);
    }
    process.exit(1);
  }
  return loadCatalog(CATALOG_FILE);
}

// ── "search" subcommand: batch stencil lookup ──
// The AI MUST resolve real stencil names via this BEFORE writing the build-script (anti-hallucination).
if (POSITIONAL[0] === 'search') {
  const q = POSITIONAL.slice(1).join(' ');
  if (!q) { console.error('A query is required. Example: drawio-build search "s3, lambda, dynamodb" --cloud aws'); process.exit(1); }
  const cat = loadCloudCatalog();
  const queries = q.split(',').map(s => s.trim()).filter(Boolean);
  const out: Record<string, unknown> = {};
  for (const one of queries) {
    out[one] = searchIcon(cat, one, { limit: 6, full: false }).map((r: any) => ({ name: r.name, label: r.label, category: r.category }));
  }
  process.stdout.write(JSON.stringify(out) + '\n');
  process.exit(0);
}

// ── Engine DSL injected into every build-script (the script needs no imports) ──
const ENGINE = { Diagram, icon, box, group, grid, frame, phantom, pool, renderTree, renderSequence, THEME };

type ValidateResult = { ok: boolean; errors: string[]; warnings: string[]; audit: { advice: string[] } };

// ── BUILD mode: every {slug}.src.ts → Diagram → validate → .drawio ──
if (!VERIFY) {
  if (!WORK || !existsSync(WORK)) { console.error('Need --dir <feature>/drawio (an existing dir holding *.src.ts).'); process.exit(1); }
  const srcs = readdirSync(WORK).filter(f => f.endsWith('.src.ts'));
  if (!srcs.length) {
    console.error(`No *.src.ts build-scripts in ${WORK}.`);
    console.error('   The skill writes one {slug}.src.ts exporting build({ Diagram, icon, phantom, renderTree, … }) → Diagram.');
    process.exit(1);
  }
  let fail = 0;
  for (const f of srcs) {
    const slug = f.replace(/\.src\.ts$/, '');
    let d: InstanceType<typeof Diagram>;
    try {
      const mod: any = await import(pathToFileURL(join(WORK, f)).href);
      const build = mod.default ?? mod.build;
      if (typeof build !== 'function') throw new Error(`${f} must export build(engine) (default or named) returning a Diagram.`);
      d = build(ENGINE);
    } catch (e: any) {
      console.error(`✗ ${f}: build failed — ${e.message}`); fail++; continue;
    }
    const res = (d as any).validate() as ValidateResult;
    if (!res.ok) {
      console.error(`✗ ${slug}: ${res.errors.length} validation error(s) — NOT writing .drawio:`);
      res.errors.forEach((e: string) => console.error('    • ' + e));
      fail++; continue;
    }
    const warns = res.warnings.length, advice = res.audit.advice.length;
    writeFileSync(join(WORK, `${slug}.drawio`), (d as any).mxfile(slug));
    const tag = warns || advice ? ` ⚠️ ${warns} warn · ${advice} advice` : '';
    console.log(`✓ ${slug}.drawio${tag}`);
    const dd = d as any;   // router self-report (set by _buildEdges during validate) — density/overlap without rendering
    if (typeof dd._cross === "number" || typeof dd._overlaps === "number")
      console.log(`  · router: ${dd._cross ?? 0} crossings, ${dd._overlaps ?? 0} overlaps`);

    // Optional PNG/SVG export via the draw.io desktop app (not a blocker).
    if (RENDER) {
      const cli = findDrawioCli(process.env);
      if (!cli) console.log(`  (skip render — draw.io desktop app not found; .drawio is the output)`);
      else {
        for (const fmt of ['svg'] as const) {
          const out = join(WORK, `${slug}.${fmt}`);
          try { execFileSync(cli, buildRenderArgs({ file: join(WORK, `${slug}.drawio`), out, scale: 1 }), { encoding: 'utf8', timeout: 60000 }); console.log(`  → ${slug}.${fmt}`); }
          catch (e: any) { console.error(`  ⚠ render ${fmt} failed: ${e.message}`); }
        }
      }
    }
    // Surface non-blocking advice so the skill can fix aesthetics before delivering.
    if (advice) { console.log(`  advice (${advice}):`); res.audit.advice.forEach(a => console.log('    · ' + a)); }
  }
  if (fail) { console.error(`\n❌ ${fail} diagram(s) failed validation. Fix the .src.ts then rerun.`); process.exit(1); }
  process.exit(0);
}

// ── VERIFY mode: re-validate every existing .drawio (render-free) ──
if (!WORK || !existsSync(WORK)) { console.error('Need --dir <feature>/drawio to --verify.'); process.exit(1); }
const cat = loadCloudCatalog();
const files = readdirSync(WORK).filter(f => f.endsWith('.drawio') || f.endsWith('.xml'));
if (!files.length) { console.error(`No .drawio files in ${WORK}.`); process.exit(1); }
let totalErr = 0;
for (const f of files) {
  const xml = readFileSync(join(WORK, f), 'utf8');
  const res = validateDiagram(cat, xml, {}) as ValidateResult;
  const slug = basename(f).replace(/\.(drawio|xml)$/, '');
  if (res.ok && !res.warnings.length && !res.audit.advice.length) {
    console.log(`✓ ${slug}: clean`); continue;
  }
  res.errors.forEach(e => { console.log(`✗ ${slug}: ${e}`); totalErr++; });
  res.warnings.forEach(w => console.log(`⚠ ${slug}: ${w}`));
  res.audit.advice.forEach(a => console.log(`· ${slug}: ${a}`));
}
console.log(totalErr ? `\n❌ ${totalErr} error(s).` : `\n✅ All ${files.length} .drawio valid (warnings/advice shown above if any).`);
process.exit(totalErr ? 1 : 0);
