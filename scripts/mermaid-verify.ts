#!/usr/bin/env node
/*
 * mermaid-verify.ts — compile-verify every ```mermaid block in a .md file via mmdc.
 *
 * Used by /sequence /activity /erd /state AFTER Write — mermaid doesn't render in chat
 * (Mermaid syntax safety, diagram-selection.md), so syntax errors used to only surface once the
 * user opened an IDE/Obsidian/GitHub. This script catches errors IMMEDIATELY, before the skill reports "done".
 *
 * Usage:
 *   node .claude/scripts/mermaid-verify.ts --file docs/{feature}/srs/flows.md
 *   node .claude/scripts/mermaid-verify.ts --file docs/x/srs/x-erd.md --png /tmp/erd-review
 *
 * Output: each block's PASS/FAIL with the nearest heading (## ...) so you know where the error is in the file.
 * Exit code = number of FAIL blocks (0 if all pass).
 *
 * --png <dir>: besides the compile-check, keep a PNG image per block at <dir>/block-N.png so the
 * skill can Read it itself to spot business-logic errors (missing entity, wrong cardinality) —
 * the compile-check only catches syntax errors, not content errors. Prints each image path to stdout.
 *
 * mmdc needs PUPPETEER_EXECUTABLE_PATH pointing at an available Chrome (~/.puppeteer-cache) — by
 * default mmdc looks for Chrome at ~/.cache/puppeteer (nothing there in this environment) and fails immediately if it's missing.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const FILE = flag('file');
const PNG_DIR = flag('png');
if (!FILE) {
  console.error('Missing --file <path.md>. Example: --file docs/authentication/srs/flows.md');
  process.exit(2);
}
if (!fs.existsSync(FILE)) {
  console.error(`File not found: ${FILE}`);
  process.exit(2);
}

function findChrome() {
  // Search both the old (puppeteer < 22) and new (puppeteer >= 22) cache layouts, since
  // @mermaid-js/mermaid-cli pulls whatever puppeteer is current and its cache root moves over time.
  const roots = [
    path.join(os.homedir(), '.puppeteer-cache', 'chrome'),
    path.join(os.homedir(), '.cache', 'puppeteer', 'chrome'),
  ];
  for (const glob of roots) {
    if (!fs.existsSync(glob)) continue;
    for (const versionDir of fs.readdirSync(glob)) {
      const candidate = path.join(glob, versionDir, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      if (fs.existsSync(candidate)) return candidate;
      // linux/x64 layout fallback (best-effort — a machine with a different architecture may need a different path)
      const linuxCandidate = path.join(glob, versionDir, 'chrome-linux64', 'chrome');
      if (fs.existsSync(linuxCandidate)) return linuxCandidate;
    }
  }
  return null;
}

function findMmdc() {
  const which = spawnSync('bash', ['-lc', 'command -v mmdc'], { encoding: 'utf8' });
  const p = (which.stdout || '').trim();
  return which.status === 0 && p ? p : null;
}

const MMDC = findMmdc();
if (!MMDC) {
  console.error('⚠️  mmdc (@mermaid-js/mermaid-cli) not found on PATH.');
  console.error('   Install via: npm i -g @mermaid-js/mermaid-cli');
  process.exit(2);
}

const CHROME = findChrome();
if (!CHROME) {
  console.error('⚠️  Chrome for Testing not found at ~/.puppeteer-cache/chrome — mmdc will fail on launch.');
  console.error('   Install via: npx puppeteer browsers install chrome-headless-shell (or use the Chrome already installed by D2 render.sh).');
  process.exit(2);
}

// ---------- extract ```mermaid blocks + nearest heading ----------
function extractBlocks(mdPath) {
  const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
  const blocks = [];
  let heading = '(no heading)';
  let inBlock = false;
  let buf = [];
  for (const line of lines) {
    if (/^##\s+/.test(line)) heading = line.replace(/^##\s+/, '').trim();
    if (line.trim() === '```mermaid') { inBlock = true; buf = []; continue; }
    if (inBlock && line.trim() === '```') { inBlock = false; blocks.push({ heading, code: buf.join('\n') }); continue; }
    if (inBlock) buf.push(line);
  }
  return blocks;
}

const blocks = extractBlocks(FILE);
if (!blocks.length) {
  console.log(`No \`\`\`mermaid block found in ${FILE} — nothing to verify.`);
  process.exit(0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-verify-'));
if (PNG_DIR) fs.mkdirSync(PNG_DIR, { recursive: true });
let failCount = 0;
const results = [];

blocks.forEach((b, i) => {
  const mmdPath = path.join(tmpDir, `block-${i}.mmd`);
  // --png → output PNG (viewable via the Read tool like an image) into PNG_DIR; else SVG into tmp (compile-check only).
  const outPath = PNG_DIR
    ? path.join(PNG_DIR, `block-${i}.png`)
    : path.join(tmpDir, `block-${i}.svg`);
  fs.writeFileSync(mmdPath, b.code);
  const res = spawnSync(MMDC, ['-i', mmdPath, '-o', outPath, '-s', '2'], {
    encoding: 'utf8',
    env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: CHROME },
  });
  const ok = res.status === 0 && fs.existsSync(outPath);
  if (!ok) failCount++;
  results.push({ index: i, heading: b.heading, ok, pngPath: PNG_DIR && ok ? outPath : null, stderr: (res.stderr || '').split('\n').slice(0, 6).join('\n') });
});

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n=== mermaid-verify: ${FILE} (${blocks.length} block) ===`);
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} Block ${r.index + 1} — "${r.heading}"`);
  if (r.pngPath) console.log(`   🖼  ${r.pngPath}`);
  if (!r.ok) console.log(r.stderr.split('\n').map(l => '   ' + l).join('\n'));
}
console.log(`\n${blocks.length - failCount}/${blocks.length} block compile OK${failCount ? `, ${failCount} FAIL` : ''}`);
if (PNG_DIR && failCount === 0) console.log(`\n→ PNG images saved at ${PNG_DIR}. Read each image to check for missing entities/wrong cardinality before reporting done.`);
process.exit(failCount);
