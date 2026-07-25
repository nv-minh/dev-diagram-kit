#!/usr/bin/env node
/*
 * gallery-build.ts — build ONE self-contained HTML gallery from a feature's diagrams.
 *
 * Scans docs/{feature} (+ docs/_shared) for:
 *   - every .svg artifact (D2 / PlantUML / BPMN already render to .svg)
 *   - every ```mermaid block in .md (rendered to SVG via mmdc if available)
 * Groups them into TABS by source folder, inlines every SVG into a tabbed dark-theme HTML whose
 * Copy/PNG/PDF export toolbar (html2canvas + jsPDF) is inherited from Cocoon AI (MIT) — same source
 * as skills/system-design/resources/c4-export-template.html, generalized to "tabs of diagrams".
 *
 * Usage:
 *   node skills/gallery/resources/gallery-build.ts --feature <slug> [--out path.html] [--root path]
 *
 * Output (default): docs/{feature}/{feature}-gallery.html — open it directly, hand it to a stakeholder.
 * No runtime network needed for SVGs; mermaid blocks need mmdc+Chrome at BUILD time (else skipped).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const FEATURE = flag('feature');
const ROOT = flag('root') || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const OUT = flag('out');
if (!FEATURE) { console.error('Missing --feature <slug>. Example: --feature online-shop'); process.exit(2); }

const FEATURE_DIR = path.join(ROOT, 'docs', FEATURE);
const SHARED_DIR = path.join(ROOT, 'docs', '_shared');
const TPL = path.join(ROOT, 'skills', 'gallery', 'resources', 'gallery-template.html');

if (!fs.existsSync(FEATURE_DIR)) { console.error(`Feature dir not found: ${FEATURE_DIR}`); process.exit(2); }
if (!fs.existsSync(TPL)) { console.error(`Template not found: ${TPL}`); process.exit(2); }

// ---------- tab label by source subfolder ----------
function tabOf(relPath) {
  const p = relPath.split(path.sep);
  if (p.includes('system-design') || p.includes('d2-architect')) return 'Architecture';
  if (p.includes('dfd')) return 'Data flow';
  if (p.includes('d2-erd') || p.includes('dbdiagram') || p.includes('erd')) return 'Data model';
  if (p.includes('bpmn')) return 'Process (BPMN)';
  if (p.includes('usecases')) return 'Use cases';
  if (p.includes('code-flow')) return 'Code flow';
  if (p.includes('srs')) return 'SRS diagrams';
  return 'Other';
}
const captionOf = (file) => path.basename(file).replace(/\.(svg|d2|puml|bpmn|dbml)$/i, '');

// ---------- walk ----------
function walk(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, pred, out);
    else if (pred(e.name)) out.push(p);
  }
  return out;
}
const isSvg = (n) => n.endsWith('.svg');
const isMd = (n) => n.endsWith('.md');

// skip generated HTML decks + index md so we don't inline a previous gallery into itself
const skip = (f) => /-gallery\.html$|-system-design\.html$|-architecture\.html$/i.test(f);

const svgs = [...walk(FEATURE_DIR, isSvg), ...walk(SHARED_DIR, isSvg)].filter((f) => !skip(f));

// ---------- extract ```mermaid blocks (same logic as mermaid-verify.ts) ----------
function extractMermaid(mdPath) {
  const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
  const blocks = [];
  let heading = '(no heading)', inB = false, buf = [];
  for (const line of lines) {
    if (/^##\s+/.test(line)) heading = line.replace(/^##\s+/, '').trim();
    if (line.trim() === '```mermaid') { inB = true; buf = []; continue; }
    if (inB && line.trim() === '```') { inB = false; blocks.push({ heading, code: buf.join('\n') }); continue; }
    if (inB) buf.push(line);
  }
  return blocks;
}

// ---------- resolve Chrome (same heuristic as mermaid-verify.ts) ----------
function findChrome() {
  // Search both puppeteer cache layouts (old < 22 and new >= 22) — same logic as mermaid-verify.ts.
  const roots = [
    path.join(os.homedir(), '.puppeteer-cache', 'chrome'),
    path.join(os.homedir(), '.cache', 'puppeteer', 'chrome'),
  ];
  for (const g of roots) {
    if (!fs.existsSync(g)) continue;
    for (const v of fs.readdirSync(g)) {
      const mac = path.join(g, v, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      if (fs.existsSync(mac)) return mac;
      const lin = path.join(g, v, 'chrome-linux64', 'chrome');
      if (fs.existsSync(lin)) return lin;
    }
  }
  return null;
}
const CHROME = findChrome();
const MMDC = (() => { try { const r = spawnSync('mmdc', ['--version'], { encoding: 'utf8' }); return r.status === 0; } catch { return false; } })();
function renderMermaid(code) {
  if (!CHROME || !MMDC) return null;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-mmd-'));
  const mmd = path.join(tmp, 'b.mmd'), svg = path.join(tmp, 'b.svg');
  fs.writeFileSync(mmd, code);
  const r = spawnSync('mmdc', ['-i', mmd, '-o', svg, '-s', '2', '-b', 'white'], {
    env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: CHROME },
  });
  let out = null;
  if (r.status === 0 && fs.existsSync(svg)) out = fs.readFileSync(svg, 'utf8');
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
const svgInner = (svg) => svg.replace(/^[\s\S]*?(<svg[\s\S]*<\/svg>)[\s\S]*$/, '$1').trim();

// ---------- collect artifacts ----------
const arts = [];
for (const f of svgs) {
  arts.push({ tab: tabOf(path.relative(ROOT, f)), caption: captionOf(f), svg: svgInner(fs.readFileSync(f, 'utf8')) });
}
let mmdOk = 0, mmdSkip = 0;
for (const md of walk(FEATURE_DIR, isMd)) {
  for (const b of extractMermaid(md)) {
    const svg = renderMermaid(b.code);
    if (!svg) { mmdSkip++; continue; }
    mmdOk++;
    arts.push({ tab: tabOf(path.relative(ROOT, md)), caption: b.heading || captionOf(md), svg: svgInner(svg) });
  }
}

if (!arts.length) {
  console.error(`No diagrams found under ${FEATURE_DIR} (or docs/_shared). Draw some first (e.g. /dfd, /system-design, /sequence), then rebuild.`);
  process.exit(1);
}

// ---------- group into tabs (first-seen order) ----------
const tabs = [];
for (const a of arts) if (!tabs.includes(a.tab)) tabs.push(a.tab);
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const nav = tabs.map((t, i) =>
  `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="selectTab(this,'tab-${i}')">${escapeHtml(t)}</button>`).join('');
const panels = tabs.map((t, i) => {
  const cards = arts.filter((a) => a.tab === t)
    .map((a) => `<div class="diagram-card"><div class="caption">${escapeHtml(a.caption)}</div><div class="diagram-container">${a.svg}</div></div>`)
    .join('');
  return `<div class="tab-panel${i === 0 ? ' active' : ''}" id="tab-${i}">${cards}</div>`;
}).join('');

// ---------- inject + write ----------
const date = new Date().toISOString().slice(0, 10);
let html = fs.readFileSync(TPL, 'utf8');
html = html
  .replace(/\[GALLERY TITLE\]/g, `${FEATURE} — diagram gallery`)
  .replace(/\[feature\]/g, FEATURE)
  .replace(/\[date\]/g, date)
  .replace('<!-- INJECT:nav -->', nav)
  .replace('<!-- INJECT:panels -->', panels);

const outPath = OUT || path.join(FEATURE_DIR, `${FEATURE}-gallery.html`);
fs.writeFileSync(outPath, html);

const skipNote = mmdSkip ? `, ${mmdSkip} mermaid block(s) skipped (install mmdc + Chrome to include them)` : '';
console.log(`✅ Gallery: ${outPath}`);
console.log(`   ${arts.length} diagrams across ${tabs.length} tab(s): ${tabs.join(' · ')}${mmdOk ? ` (incl. ${mmdOk} mermaid)` : ''}${skipNote}`);
