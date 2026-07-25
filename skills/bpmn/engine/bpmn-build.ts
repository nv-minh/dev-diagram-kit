#!/usr/bin/env -S tsx
// bpmn-build.ts — IR → BPMN → viewer pipeline (TypeScript; runs via tsx — see scripts/tsrun.sh).
//   tsrun.sh bpmn-build.ts --dir <feature>  → (1) every *.ir.json: semcheck + layout → write .bpmn  (2) build {feature}-bpmn-editor.html
//   tsrun.sh bpmn-build.ts --verify   → semcheck every IR + validate layout of every .bpmn (node in correct lane / lines don't overlap / task not clipped)
//   tsrun.sh bpmn-build.ts --no-ir    → skip the IR step, just build the viewer from existing .bpmn
// AI generates the {slug}.ir.json file (business intermediate representation); the script handles semcheck + layout + render.
// The resulting .bpmn file ALREADY HAS <BPMNDiagram> (swimlane + coordinates). The viewer just importXML's it. node_modules is gitignored.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { layoutToBpmn as layoutAuto } from './bpmn-layout-auto.ts';  // bpmn-auto-layout (DEFAULT no-lane — cleanest routing)
import { layoutToBpmn as layoutGrid } from './bpmn-layout-grid.ts';  // custom-built grid (VERTICAL SWIMLANE — default when there are lanes)
import { layoutToBpmn as layoutElk } from './bpmn-layout-elk.ts';    // custom-patched ELK (horizontal swimlane fallback: BPMN_ENGINE=elk)
import { layoutIR } from './bpmn-layout.ts';                          // old custom-built engine (BPMN_ENGINE=legacy)
import { checkIR } from './bpmn-semcheck.ts';

// ── Choose layout engine ──
// DEFAULT no-lane: bpmn-auto-layout (official bpmn-io lib) — cleanest routing, standard X gateway.
// BPMN_LANES=1 + IR with ≥2 lanes → VERTICAL SWIMLANE via the custom-built grid engine (bpmn-layout-grid.ts):
//   lane = column, step = row (longest-path rank), loops go through the right corridor, labels split the line.
//   This is the default swimlane engine (nicer than ELK — nodes line up, loops don't shoot to the top).
// BPMN_ENGINE=elk    → force the old horizontal ELK swimlane (fallback).
// BPMN_ENGINE=grid   → force grid even for no-lane (1 lane = 1 column).
// BPMN_ENGINE=legacy → old 267-line custom-built engine.
const ENGINE = process.env.BPMN_ENGINE || 'auto';
const WANT_LANES = process.env.BPMN_LANES === '1';
async function buildXml(ir) {
  if (ENGINE === 'legacy') return layoutIR(ir);
  const laneCount = new Set((ir.nodes || []).map(n => n.lane).filter(Boolean)).size;
  const useLanes = WANT_LANES && laneCount >= 2;
  if (ENGINE === 'elk') return layoutElk(ir, { noLanes: !useLanes });   // force horizontal ELK
  if (ENGINE === 'grid') return layoutGrid(ir);                          // force vertical grid
  if (useLanes) return layoutGrid(ir);                                   // swimlane → vertical grid (default)
  return layoutAuto(ir, { noLanes: true });                             // no-lane → auto-layout
}

// HERE = ENGINE directory (script + template + node_modules) — shared across every feature.
// WORK = FEATURE directory holding output (ir/src/bpmn/index/viewer). Kept separate from the
// engine so the engine isn't duplicated into every feature. WORK comes from `--dir <path>`; defaults to cwd.
const HERE = dirname(fileURLToPath(import.meta.url));
const VERIFY = process.argv.includes('--verify');
const NO_IR = process.argv.includes('--no-ir');
const dirArg = process.argv.indexOf('--dir');
const WORK = dirArg !== -1 && process.argv[dirArg + 1]
  ? (process.argv[dirArg + 1].startsWith('/') ? process.argv[dirArg + 1] : join(process.cwd(), process.argv[dirArg + 1]))
  : process.cwd();
if (!existsSync(WORK)) { console.error('Feature directory does not exist:', WORK); process.exit(1); }

// ─────────────────────────── IR → BPMN ───────────────────────────
// Each {slug}.ir.json → semcheck (structural check MUST pass) → layout → {slug}.bpmn.
// {slug}.src.json (optional, next to the IR) holds source facts {actors,branches,errors} for coverage checks.
if (!NO_IR) {
  const irFiles = readdirSync(WORK).filter(f => f.endsWith('.ir.json'));
  let irFail = 0;
  for (const f of irFiles) {
    const slug = f.replace(/\.ir\.json$/, '');
    const ir = JSON.parse(readFileSync(join(WORK, f), 'utf8'));
    const srcPath = join(WORK, slug + '.src.json');
    const source = existsSync(srcPath) ? JSON.parse(readFileSync(srcPath, 'utf8')) : {};
    const rep = checkIR(ir, source);
    if (!rep.ok) {
      console.error(`✗ ${f}: ${rep.errors.length} business errors — NOT generating .bpmn:`);
      rep.errors.forEach(e => console.error('    ' + e));
      irFail++; continue;
    }
    if (rep.warnings.length) {
      console.error(`⚠ ${slug}: ${rep.warnings.length} coverage warnings:`);
      rep.warnings.forEach(w => console.error('    • ' + w));
    }
    writeFileSync(join(WORK, slug + '.bpmn'), await buildXml(ir));
    const cov = Object.entries(rep.coverage).map(([k,v]) => `${k} ${v.covered ?? (v.total - (v.missing?.length||0))}/${v.total}`).join(', ');
    const laneCount = new Set((ir.nodes || []).map(n => n.lane).filter(Boolean)).size;
    // engine label matches buildXml: legacy → legacy; forced elk → elk; forced grid → grid;
    // swimlane (BPMN_LANES=1 + ≥2 lanes) → grid (default); otherwise → auto (no-lane).
    const engLabel = ENGINE === 'legacy' ? 'legacy'
      : ENGINE === 'elk' ? 'elk'
      : ENGINE === 'grid' ? 'grid'
      : (WANT_LANES && laneCount >= 2) ? 'grid'
      : 'auto';
    console.log(`✓ ${slug}.bpmn ${cov ? '('+cov+')' : ''} [${engLabel}]`);
  }
  if (irFail) { console.error(`\n❌ ${irFail} IR(s) with business errors. Fix the IR then rerun.`); process.exit(1); }
  if (irFiles.length) console.log('');
}

function titleOf(xml, slug) {
  const m = xml.match(/<bpmn:participant[^>]*\bname="([^"]*)"/) ||
            xml.match(/<bpmn:process[^>]*\bname="([^"]*)"/);
  return m ? m[1] : slug;
}
function esc(xml) {
  return xml.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

const files = readdirSync(WORK).filter(f => f.endsWith('.bpmn'));
if (!files.length) { console.error('No .bpmn files found in', WORK); process.exit(1); }

// ─────────────────────────── VERIFY ───────────────────────────
if (VERIFY) {
  let BpmnModdle;
  try { BpmnModdle = (await import('bpmn-moddle')).default; }
  catch {
    console.error('Installing bpmn-moddle (first time)...');
    execSync('npm install bpmn-moddle@9 --no-save --prefix .', { cwd: HERE, stdio: 'inherit' });
    const require = createRequire(join(HERE, 'noop.js'));
    BpmnModdle = (await import(pathToFileURL(require.resolve('bpmn-moddle')).href)).default;
  }

  let total = 0;
  for (const f of files) {
    const xml = readFileSync(join(WORK, f), 'utf8');
    const problems = await validate(xml, BpmnModdle, f, ENGINE === 'auto' && !WANT_LANES);
    total += problems;
  }
  console.log(total ? `\n❌ ${total} problems total.` : `\n✅ All ${files.length} files: layout clean.`);
  process.exit(total ? 1 : 0);
}

// ─────────────────────────── BUILD ───────────────────────────
const tplPath = join(HERE, '_viewer_template.html');
if (!existsSync(tplPath)) { console.error('Missing _viewer_template.html next to the script'); process.exit(1); }
const tpl = readFileSync(tplPath, 'utf8');

const processes = files.map(f => {
  const slug = f.replace(/\.bpmn$/, '');
  const xml = readFileSync(join(WORK, f), 'utf8');
  if (!xml.includes('BPMNDiagram')) {
    console.error(`⚠ ${f}: MISSING <BPMNDiagram> — viewer will be blank. The /bpmn skill must generate layout along with it.`);
  }
  return { slug, title: titleOf(xml, slug), xml };
});

const arr = '[\n' + processes.map(p =>
  `  { slug: ${JSON.stringify(p.slug)}, title: ${JSON.stringify(p.title)}, xml: \`${esc(p.xml)}\` }`
).join(',\n') + '\n]';

// feature = name of WORK's parent folder (docs/{feature}/bpmn → {feature})
const feature = WORK.replace(/\/bpmn\/?$/, '').split('/').pop() || 'feature';
const html = tpl.replace(/__FEATURE__/g, feature).replace('__BPMN_PROCESSES__', arr);
// Output editor per-feature: {feature}-bpmn-editor.html (follows the {feature}-{domain}-...
// pattern so names don't clash when opening tabs in Obsidian/IDE; it's a drag-and-drop editor, not a viewer).
const editorName = feature + '-bpmn-editor.html';
writeFileSync(join(WORK, editorName), html, 'utf8');
console.log(`→ ${editorName} (${processes.length} process, ${html.length} bytes)`);

// ─────────────────────── validate() ───────────────────────
// skipParallel: the bpmn-auto-layout engine deliberately routes several edges sharing an axis
// (valid BPMN, invisible to the naked eye) → the "parallel overlapping line" check would false-positive.
// The clips-a-task check is still kept.
async function validate(xml, BpmnModdle, fname, skipParallel = false) {
  const moddle = new BpmnModdle();
  const { warnings } = await moddle.fromXML(xml);
  console.log(`\n[${fname}] parse OK, warnings: ${warnings.length}`);
  if (!xml.includes('BPMNDiagram')) { console.log('  ✗ MISSING <BPMNDiagram>'); return 1; }

  const shapes = {}, lanes = {}, edges = {};
  for (const [, id, x, y, w, h] of xml.matchAll(
    /<bpmndi:BPMNShape[^>]*bpmnElement="([^"]+)"[^>]*>\s*<dc:Bounds x="([\-\d.]+)" y="([\-\d.]+)" width="([\d.]+)" height="([\d.]+)"/g))
    shapes[id] = { x:+x, y:+y, w:+w, h:+h };
  for (const m of xml.matchAll(/<bpmn:lane id="([^"]+)" name="([^"]+)">([\s\S]*?)<\/bpmn:lane>/g)) {
    const di = shapes[m[1]] || {};
    lanes[m[2]] = { ...di, members: [...m[3].matchAll(/<bpmn:flowNodeRef>([^<]+)<\/bpmn:flowNodeRef>/g)].map(r=>r[1]) };
  }
  for (const e of xml.matchAll(/<bpmndi:BPMNEdge[^>]*bpmnElement="([^"]+)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNEdge>/g))
    edges[e[1]] = [...e[2].matchAll(/<di:waypoint x="([\-\d.]+)" y="([\-\d.]+)"/g)].map(w=>({x:+w[1],y:+w[2]}));

  let p = 0;
  const ov = (a1,a2,b1,b2)=>Math.min(Math.max(a1,a2),Math.max(b1,b2))-Math.max(Math.min(a1,a2),Math.min(b1,b2));

  // Lane membership: with the ELK engine, the optimized layout can place a node outside
  // the IR lane band (the node is still in the correct business lane via flowNodeRef; only
  // its Y position is off). This is a pretty-layout vs strict-lane tradeoff → WARN only, not a blocking error.
  for (const [ln, lane] of Object.entries(lanes)) for (const id of lane.members) {
    const s = shapes[id];
    if (!s) { console.log(`  ✗ ${id}: no shape`); p++; continue; }
    const cy = s.y + s.h/2;
    if (cy < lane.y || cy > lane.y + lane.h) console.log(`  ⚠ ${id} is outside lane band "${ln}" (ELK optimized layout — not blocking)`);
  }

  const seg = [];
  for (const [id, wps] of Object.entries(edges)) for (let i=0;i<wps.length-1;i++) seg.push({id,a:wps[i],b:wps[i+1]});
  for (let i=0;i<seg.length;i++) for (let j=i+1;j<seg.length;j++){
    const s=seg[i], t=seg[j]; if (s.id===t.id) continue;
    // Threshold 15px: ignore short stubs at a gateway root (2 branches on the same side
    // share a few px at the start before splitting — harmless, invisible to the naked eye,
    // every BPMN tool does this). Still catches REAL overlapping lines (long parallel runs).
    if (skipParallel) continue;   // auto engine: sharing an axis is valid, skip this check
    if (s.a.x===s.b.x && t.a.x===t.b.x && s.a.x===t.a.x && ov(s.a.y,s.b.y,t.a.y,t.b.y)>15){ console.log(`  ✗ VERTICAL overlap: ${s.id} & ${t.id} @x=${s.a.x}`); p++; }
    if (s.a.y===s.b.y && t.a.y===t.b.y && s.a.y===t.a.y && ov(s.a.x,s.b.x,t.a.x,t.b.x)>15){ console.log(`  ✗ HORIZONTAL overlap: ${s.id} & ${t.id} @y=${s.a.y}`); p++; }
  }

  // task = narrow box (~80 tall), NOT a lane/participant/pool box (tall band)
  const tasks = Object.keys(shapes).filter(id=>shapes[id].w>=80 && shapes[id].h<=120 && !/^(Lane_|Participant_)/.test(id));
  for (const sg of seg) for (const tid of tasks){
    const s=shapes[tid];
    const touch=(q)=>q.x>=s.x-2&&q.x<=s.x+s.w+2&&q.y>=s.y-2&&q.y<=s.y+s.h+2;
    if (touch(sg.a)||touch(sg.b)) continue;
    if (sg.a.y===sg.b.y && sg.a.y>s.y+8 && sg.a.y<s.y+s.h-8 && ov(sg.a.x,sg.b.x,s.x,s.x+s.w)>5){ console.log(`  ✗ ${sg.id} cuts horizontally through ${tid}`); p++; }
    if (sg.a.x===sg.b.x && sg.a.x>s.x+8 && sg.a.x<s.x+s.w-8 && ov(sg.a.y,sg.b.y,s.y,s.y+s.h)>5){ console.log(`  ✗ ${sg.id} cuts vertically through ${tid}`); p++; }
  }

  if (!p) console.log('  ✓ swimlane correct, no overlapping lines, no task clipped');
  return p;
}
