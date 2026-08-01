#!/usr/bin/env -S tsx
// diagram-validate.ts — ONE audit gate across ALL diagram engines, run before a skill reports "done".
//   tsrun.sh scripts/diagram-validate.ts <file>            # auto-detect engine by extension
//   tsrun.sh scripts/diagram-validate.ts <dir>             # validate every diagram file in the dir
//   tsrun.sh scripts/diagram-validate.ts <file> --engine drawio   # force
//
// What it checks, per engine (delegates to the EXISTING tool — does not reinvent):
//   drawio  → FULL validator (imported from skills/drawio/engine/core.ts): stencil refs exist,
//             duplicate ids, dangling edges, AWS nesting order, Well-Architected advice, geometry
//             + edge audits. This is the richest check (render-free).
//   bpmn    → bpmn-semcheck (IR) / bpmn-build --verify (.bpmn).
//   mermaid → mermaid-verify (compile) + label-safety lint.
//   d2      → d2 compile + label-safety lint.
//   plantuml→ plantuml compile + label-safety lint.
//
// Shared principle layer (@../../rules/diagram-principles.md): no empty/placeholder labels, no
// unbalanced quotes — applied to the text engines. Graph checks (orphan/undefined-ref) are full
// for drawio/bpmn (where parsing is reliable) and intentionally NOT forced on sequence/journey/
// mindmap/timeline/plantuml (would false-positive — see diagram-principles.md).
//
// Report: "✅ compile · ✅/⚠️/❌ principles" per file; exit 0 clean / 2 warn-only / 1 error.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, dirname, basename, extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));   // .../scripts
const ROOT = join(HERE, '..');
const TSRUN = join(HERE, 'tsrun.sh');

const argv = process.argv.slice(2);
const flag = (k: string) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : null; };
const TARGETS = argv.filter(a => !a.startsWith('--') && !argv[argv.indexOf(a) - 1]?.startsWith('--engine'));
const ENGINE = flag('engine');
if (!TARGETS.length) { console.error('Usage: diagram-validate <file|dir> [--engine auto|mermaid|d2|plantuml|bpmn|drawio]'); process.exit(2); }

type Level = 'error' | 'warn' | 'info';
type Finding = { level: Level; msg: string };
type Result = { file: string; engine: string; compile: 'ok' | 'fail' | 'skip'; findings: Finding[] };

/** Match lines; use capture group 1 when present, else the full match (for patterns without groups). */
const find = (re: RegExp, s: string) => [...s.matchAll(re)].map(m => m[1] ?? m[0]).filter(Boolean);

// ── engine detection ──
function detectEngine(file: string): string {
  if (ENGINE) return ENGINE;
  const ext = extname(file);
  if (ext === '.drawio' || ext === '.xml') return 'drawio';
  if (ext === '.d2') return 'd2';
  if (ext === '.puml' || ext === '.plantuml' || ext === '.pu' || ext === '.uml') return 'plantuml';
  if (ext === '.bpmn') return 'bpmn';
  if (file.endsWith('.ir.json')) return 'bpmn';
  if (ext === '.md' || ext === '.mmd' || ext === '.mermaid') return 'mermaid';
  // sniff content for extensionless drawio/xml
  try { const c = readFileSync(file, 'utf8'); if (/<mxfile|<mxGraphModel/.test(c)) return 'drawio'; } catch {}
  return 'unknown';
}

// ── shared principle lint (text engines): empty/placeholder labels, unbalanced quotes ──
function textPrinciples(src: string, opts: { edgeLabelRe?: RegExp; nodeLabelRe?: RegExp }): Finding[] {
  const out: Finding[] = [];
  // unbalanced double quotes (a common break in mermaid/d2 labels)
  const q = (src.match(/"/g) || []).length;
  if (q % 2 !== 0) out.push({ level: 'error', msg: 'Unbalanced " in source — a label with an unescaped quote breaks rendering.' });
  // placeholder labels: TODO/FIXME/.../xxx
  if (/\b(TODO|FIXME|xxx|\.\.\.|TBD)\b/i.test(src)) out.push({ level: 'warn', msg: 'Placeholder label (TODO/FIXME/…) found — fill in the real text before delivering.' });
  return out;
}

// ── drawio: full validator (import the vendored engine) ──
async function validateDrawio(file: string): Promise<Result> {
  const findings: Finding[] = [];
  let compile: 'ok' | 'fail' | 'skip' = 'ok';
  try {
    const catPath = join(ROOT, 'skills/drawio/catalog/aws.json');
    if (!existsSync(catPath)) { return { file, engine: 'drawio', compile: 'skip', findings: [{ level: 'warn', msg: 'drawio catalog missing — cannot validate stencils.' }] }; }
    const { loadCatalog, validateDiagram } = await import(join(ROOT, 'skills/drawio/engine/core.ts'));
    const cat = loadCatalog(catPath);
    const xml = readFileSync(file, 'utf8');
    const res: any = validateDiagram(cat, xml, {});
    (res.errors || []).forEach((e: string) => findings.push({ level: 'error', msg: e }));
    (res.warnings || []).forEach((w: string) => findings.push({ level: 'warn', msg: w }));
    (res.audit?.advice || []).forEach((a: string) => findings.push({ level: 'info', msg: a }));
  } catch (e: any) {
    compile = 'fail'; findings.push({ level: 'error', msg: `validate failed: ${e.message}` });
  }
  return { file, engine: 'drawio', compile, findings };
}

// ── bpmn: delegate ──
async function validateBpmn(file: string): Promise<Result> {
  const findings: Finding[] = []; let compile: 'ok' | 'fail' | 'skip' = 'ok';
  try {
    if (file.endsWith('.ir.json')) {
      const { checkIR } = await import(join(ROOT, 'skills/bpmn/engine/bpmn-semcheck.ts'));
      const ir = JSON.parse(readFileSync(file, 'utf8'));
      const slug = file.replace(/\.ir\.json$/, '');
      const srcPath = `${slug}.src.json`;
      const source = existsSync(srcPath) ? JSON.parse(readFileSync(srcPath, 'utf8')) : {};
      const rep: any = checkIR(ir, source);
      (rep.errors || []).forEach((e: string) => findings.push({ level: 'error', msg: e }));
      (rep.warnings || []).forEach((w: string) => findings.push({ level: 'warn', msg: w }));
    } else {
      // .bpmn → bpmn-build --verify on its dir
      const dir = dirname(file);
      const r = spawnSync('bash', [TSRUN, 'skills/bpmn/engine/bpmn-build.ts', '--verify', '--dir', dir], { encoding: 'utf8' });
      const ok = /All \d+ files: layout clean/.test(r.stdout || '');
      compile = ok ? 'ok' : 'fail';
      if (!ok) find(/✗.*/g, r.stdout || '').concat(find(/Parse error.*/g, r.stderr || '')).forEach(l => findings.push({ level: 'error', msg: l.trim() }));
    }
  } catch (e: any) { compile = 'fail'; findings.push({ level: 'error', msg: `validate failed: ${e.message}` }); }
  return { file, engine: 'bpmn', compile, findings };
}

// ── mermaid: delegate compile to mermaid-verify + label lint ──
function validateMermaid(file: string): Result {
  const findings: Finding[] = []; let compile: 'ok' | 'fail' | 'skip' = 'ok';
  // mermaid-verify only understands ```mermaid fences in .md — wrap raw .mmd/.mermaid sources in one.
  let target = file;
  let tmp: string | null = null;
  if (/\.(mmd|mermaid)$/.test(file)) {
    tmp = mkdtempSync(join(tmpdir(), 'dv-mmd-'));
    target = join(tmp, basename(file) + '.md');
    writeFileSync(target, '```mermaid\n' + readFileSync(file, 'utf8').trimEnd() + '\n```\n');
  }
  const r = spawnSync('bash', [TSRUN, 'scripts/mermaid-verify.ts', '--file', target], { encoding: 'utf8' });
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  if (r.status === 2 && /not found|Chrome/i.test(r.stderr || r.stdout || '')) {
    compile = 'skip'; findings.push({ level: 'warn', msg: 'compile check skipped — Chrome/mmdc unavailable (syntax not verified).' });
  } else {
    const fails = find(/❌ Block.*$/gm, r.stdout || '');
    if (fails.length) {
      compile = 'fail';
      fails.forEach(f => findings.push({ level: 'error', msg: `mermaid block did not compile: ${String(f).trim()}` }));
    } else if (r.status && r.status !== 0) {
      compile = 'fail';
      const detail = (r.stderr || r.stdout || 'mermaid-verify failed').trim().split('\n').filter(Boolean).slice(0, 3).join(' · ');
      findings.push({ level: 'error', msg: `mermaid-verify exited ${r.status}: ${detail}` });
    } else {
      compile = 'ok';
    }
  }
  try { findings.push(...textPrinciples(readFileSync(file, 'utf8'), {})); } catch {}
  return { file, engine: 'mermaid', compile, findings };
}

// ── d2: compile via d2 binary + label lint ──
function validateD2(file: string): Result {
  const findings: Finding[] = []; let compile: 'ok' | 'fail' | 'skip' = 'ok';
  const d2 = existsSync(join(homedir(), '.local/bin/d2')) ? join(homedir(), '.local/bin/d2') : 'd2';
  const tmp = mkdtempSync(join(tmpdir(), 'dv-d2-'));
  try {
    const r = spawnSync(d2, ['--layout', 'elk', file, join(tmp, 'out.svg')], { encoding: 'utf8' });
    if (r.status === 0) compile = 'ok';
    else { compile = 'fail'; findings.push({ level: 'error', msg: `d2 compile failed: ${(r.stderr || r.stdout || '').split('\n').filter(Boolean).slice(0, 3).join(' · ')}` }); }
  } catch { compile = 'skip'; findings.push({ level: 'warn', msg: 'd2 binary unavailable.' }); }
  finally { rmSync(tmp, { recursive: true, force: true }); }
  try { findings.push(...textPrinciples(readFileSync(file, 'utf8'), {})); } catch {}
  return { file, engine: 'd2', compile, findings };
}

// ── plantuml: compile via local jar (offline) + label lint ──
function validatePlantuml(file: string): Result {
  const findings: Finding[] = []; let compile: 'ok' | 'fail' | 'skip' = 'ok';
  const jar = process.env.PLANTUML_JAR || join(ROOT, 'assets/plantuml/plantuml.jar');
  if (!existsSync(jar)) {
    compile = 'skip'; findings.push({ level: 'warn', msg: 'compile check skipped — no local plantuml.jar (run scripts/plantuml-ensure.sh).' });
  } else {
    const tmp = mkdtempSync(join(tmpdir(), 'dv-puml-'));
    try {
      const r = spawnSync('java', ['-jar', jar, '-tsvg', '-o', tmp, file], { encoding: 'utf8' });
      const ok = r.status === 0 && existsSync(join(tmp, basename(file).replace(/\.(pu|puml|plantuml|uml)$/, '.svg')));
      compile = ok ? 'ok' : 'fail';
      if (!ok) findings.push({ level: 'error', msg: `plantuml compile failed: ${(r.stderr || '').split('\n').filter(Boolean).slice(0, 3).join(' · ')}` });
    } catch { compile = 'skip'; findings.push({ level: 'warn', msg: 'java unavailable — plantuml not verified.' }); }
    finally { rmSync(tmp, { recursive: true, force: true }); }
  }
  try { findings.push(...textPrinciples(readFileSync(file, 'utf8'), {})); } catch {}
  return { file, engine: 'plantuml', compile, findings };
}

// ── expand target(s) to a file list (RECURSIVE: a dir validates every nested diagram) ──
const DIAGRAM_EXT = /\.(md|mmd|mermaid|d2|pu|uml|puml|plantuml|bpmn|drawio|xml)$|\.ir\.json$/;
const files: string[] = [];
// Walk a directory recursively, collecting files whose basename matches the diagram regex.
function walkDiagramFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDiagramFiles(full));
    else if (DIAGRAM_EXT.test(entry.name)) out.push(full);
  }
  return out;
}
for (const t of TARGETS) {
  const abs = isAbsolute(t) ? t : join(process.cwd(), t);
  if (!existsSync(abs)) { console.error(`Not found: ${t}`); process.exit(2); }
  const st = statSync(abs);
  if (st.isDirectory()) {
    files.push(...walkDiagramFiles(abs));
  } else {
    files.push(abs);
  }
}

// ── run + report ──
const results: Result[] = [];
for (const f of files) {
  const eng = detectEngine(f);
  let r: Result;
  switch (eng) {
    case 'drawio': r = await validateDrawio(f); break;
    case 'bpmn': r = await validateBpmn(f); break;
    case 'mermaid': r = validateMermaid(f); break;
    case 'd2': r = validateD2(f); break;
    case 'plantuml': r = validatePlantuml(f); break;
    default: r = { file: f, engine: 'unknown', compile: 'skip', findings: [{ level: 'warn', msg: 'Unknown diagram type — skipped.' }] };
  }
  results.push(r);
}

let totalErr = 0;
for (const r of results) {
  const errs = r.findings.filter(f => f.level === 'error');
  const warns = r.findings.filter(f => f.level === 'warn');
  const infos = r.findings.filter(f => f.level === 'info');
  totalErr += errs.length;
  const cIcon = r.compile === 'ok' ? '✅' : r.compile === 'fail' ? '❌' : '⚠️ ';
  console.log(`\n=== ${basename(r.file)} [${r.engine}] ===`);
  console.log(`${cIcon} compile: ${r.compile}`);
  if (errs.length) { console.log(`❌ principles: ${errs.length} error(s)`); errs.forEach(f => console.log('   • ' + f.msg)); }
  if (warns.length) { console.log(`⚠️  ${warns.length} warning(s)`); warns.forEach(f => console.log('   • ' + f.msg)); }
  if (infos.length) { console.log(`· ${infos.length} advice`); infos.forEach(f => console.log('   · ' + f.msg)); }
  if (!errs.length && !warns.length && !infos.length && r.compile === 'ok') console.log('✅ clean');
}

console.log(totalErr ? `\n❌ ${totalErr} error(s) across ${results.length} file(s) — fix before delivering.` : `\n✅ No errors across ${results.length} file(s) (warnings/advice shown above if any).`);
process.exit(totalErr ? 1 : 0);
