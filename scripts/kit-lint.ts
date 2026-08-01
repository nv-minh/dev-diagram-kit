#!/usr/bin/env -S tsx
// kit-lint.ts — repo-integrity gate. Machine-checks the index surfaces that CONTRIBUTING.md
// requires to stay in sync when a skill is added/renamed. No network, no LLM — safe for CI.
//
//   tsrun.sh scripts/kit-lint.ts [--root <dir>]
//
// Checks:
//   1. SKILL.md frontmatter — name matches dir, description present, user-invocable present;
//      description length ≤700 (warn) / ≤1200 (error) to keep skill discovery cheap.
//   2. Index-surface sync — every skill appears in README.md + README.vi.md, in exactly one
//      selection rule's `paths:` (diagram-selection.md or doc-selection.md), and in at least
//      one explain-skills doc. Reverse: no ✓ row in doc-selection.md for a nonexistent skill;
//      no existing skill still marked `planned`.
//   3. EN/VI parity — every explain-skills/*.md has a .vi.md twin (and vice versa);
//      guides/ and huong-dan/ have the same file count; README.vi.md exists.
//   4. Version trio — package.json == .claude-plugin/plugin.json == .claude-plugin/marketplace.json.
//   5. Skill-count claims — every "N skills"/"N skill"/"All N commands"/"Cả N lệnh" in the
//      READMEs *and* guides/ + huong-dan/ equals the real count of skills/*/SKILL.md.
//   6. Stale-phrase / coverage-claim — forbidden phrases on README + guides/huong-dan;
//      fractional "M/N skill" claims with M≠N; EN/VI coverage claim parity.
//   7. Template schema — every templates/doc-*.md frontmatter `type:` exists in
//      rules/naming-conventions.md's doc-type table.
//
// Exit 0 = clean (warnings allowed), 1 = errors.

import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type Level = 'error' | 'warn';
export type Finding = { level: Level; check: string; msg: string };

const DESC_WARN = 700;
const DESC_ERROR = 1200;

// ── helpers ──
function read(p: string): string { return readFileSync(p, 'utf8'); }
function listDirs(p: string): string[] {
  if (!existsSync(p)) return [];
  return readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
}
function listFiles(p: string): string[] {
  if (!existsSync(p)) return [];
  return readdirSync(p, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name);
}

/** Parse the simple single-line-value frontmatter used by SKILL.md / templates. */
export function parseFrontmatter(src: string): Record<string, string> | null {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

/** Skill dir names declared in a selection rule's frontmatter `paths:` globs. */
export function skillsInPaths(ruleSrc: string): string[] {
  return [...ruleSrc.matchAll(/^\s*-\s*"\.claude\/skills\/([a-z0-9-]+)\/\*\*"/gm)].map(m => m[1]);
}

/** All backticked lowercase tokens in the "Doc type values" table of naming-conventions.md. */
export function docTypesFromNaming(src: string): Set<string> {
  const section = src.split(/^## Doc type values$/m)[1]?.split(/^## /m)[0] ?? '';
  const types = new Set<string>();
  for (const line of section.split('\n')) {
    if (!line.startsWith('|') || line.includes('~~')) continue;
    const firstCell = line.split('|')[1] ?? '';
    for (const t of firstCell.matchAll(/`([a-z][a-z0-9-]*)`/g)) types.add(t[1]);
  }
  return types;
}

/**
 * Total-kit size claims — these MUST equal the real skill count.
 * Deliberately narrow so subset phrases like "2 skills" / "4 draw.io skills" stay valid.
 */
export const TOTAL_COUNT_CLAIM_RES: RegExp[] = [
  /\ball\s+(\d+)\s+(?:`\/\.\.\.`\s+)?commands\b/gi,
  /\bcả\s+(\d+)\s+lệnh\b/gi,
  /(\d+)\s+`\/\.\.\.`\s+commands\b/gi,
  /(\d+)\s+lệnh\s+`\/\.\.\.`/gi,
  /\ball\s+(\d+)\s+skills\b/gi,
  /(\d+)\s+skills\s+sounds like/gi,
  /(\d+)\s+skill\s+nghe nhiều/gi,
  /\ball\s+(\d+)\s+skills\s+follow/gi,
  /\bcả\s+(\d+)\s+skills?\s+theo/gi,
  // README layout / badge-style "63 skills" / "63 skill" only on README surfaces (see checkReadmeCounts)
  /skills\/\s+(\d+)\s+skills?\b/gi,
];

/** Historical totals that must not appear as skill/command counts on surface docs. */
export const STALE_TOTAL_NUMBERS = [14, 22, 27, 28, 35];
export const STALE_TOTAL_COUNT_RE = new RegExp(
  `\\b(${STALE_TOTAL_NUMBERS.join('|')})\\s+(skills?|commands?|lệnh)\\b`,
  'gi',
);

/** Phrases that mean docs have not caught up with a shipped release. */
export const FORBIDDEN_STALE_PHRASES: RegExp[] = [
  /more waves landing/i,
  /\blater waves\b/i,
  /\bwave sau\b/i,
  /đang lên sóng/i,
  /will extend this guide as they land/i,
];

/** Fractional coverage like "đủ 28/63 skill" — M must equal N when present. */
export const FRACTION_COVERAGE_RE = /(?:đủ\s+)?(\d+)\s*\/\s*(\d+)\s+skills?\b/gi;

export type CoverageKind = { kind: 'all'; n: number } | { kind: 'fraction'; m: number; n: number };

/** Best-effort coverage claim from a README layout/blurb line. */
export function coverageClaim(src: string): CoverageKind | null {
  const frac = [...src.matchAll(/(?:đủ\s+)?(\d+)\s*\/\s*(\d+)\s+skills?\b/gi)];
  if (frac.length) {
    const m = parseInt(frac[0][1], 10);
    const n = parseInt(frac[0][2], 10);
    return { kind: 'fraction', m, n };
  }
  const all = src.match(/(?:all|covering all|phủ đủ|đủ)\s+(\d+)\s+skills?\b/i)
    ?? src.match(/cover(?:ing|ed)?\s+all\s+(\d+)\s+skills?\b/i);
  if (all) return { kind: 'all', n: parseInt(all[1], 10) };
  return null;
}

function checkTotalCountClaims(label: string, src: string, actual: number, err: (c: string, m: string) => void): void {
  for (const re of TOTAL_COUNT_CLAIM_RES) {
    re.lastIndex = 0;
    for (const m of src.matchAll(re)) {
      if (parseInt(m[1], 10) !== actual) {
        err('count', `${label} claims "${m[0]}" but the kit has ${actual} skills`);
      }
    }
  }
  STALE_TOTAL_COUNT_RE.lastIndex = 0;
  for (const m of src.matchAll(STALE_TOTAL_COUNT_RE)) {
    err('count', `${label} uses stale total "${m[0]}" — kit has ${actual} skills`);
  }
}

/** README still uses the broad "N skills"/"N skill" check (badge + layout lines). */
function checkReadmeCounts(label: string, src: string, actual: number, err: (c: string, m: string) => void): void {
  const res = label.endsWith('.vi.md')
    ? [/(\d+)\s+skill\b/g, /\bcả\s+(\d+)\s+lệnh\b/gi]
    : [/(\d+)\s+skills\b/g, /\ball\s+(\d+)\s+commands\b/gi];
  for (const re of res) {
    re.lastIndex = 0;
    for (const m of src.matchAll(re)) {
      if (parseInt(m[1], 10) !== actual) {
        err('count', `${label} claims "${m[0]}" but the kit has ${actual} skills`);
      }
    }
  }
}

export function lintKit(root: string): Finding[] {
  const f: Finding[] = [];
  const err = (check: string, msg: string) => f.push({ level: 'error', check, msg });
  const warn = (check: string, msg: string) => f.push({ level: 'warn', check, msg });

  // ── collect skills (dirs under skills/ that contain SKILL.md; drawio engine dir has none) ──
  const skillDirs = listDirs(join(root, 'skills')).filter(d => existsSync(join(root, 'skills', d, 'SKILL.md')));

  // ── 1. SKILL.md frontmatter ──
  for (const name of skillDirs) {
    const p = join(root, 'skills', name, 'SKILL.md');
    const fm = parseFrontmatter(read(p));
    if (!fm) { err('frontmatter', `skills/${name}/SKILL.md has no frontmatter`); continue; }
    if (fm.name !== name) err('frontmatter', `skills/${name}/SKILL.md name "${fm.name}" ≠ dir name "${name}"`);
    if (!fm.description) err('frontmatter', `skills/${name}/SKILL.md has an empty description`);
    if (!('user-invocable' in fm)) err('frontmatter', `skills/${name}/SKILL.md missing user-invocable`);
    const len = (fm.description ?? '').length;
    if (len > DESC_ERROR) err('frontmatter', `skills/${name} description is ${len} chars (> ${DESC_ERROR}) — trim it; long descriptions bloat skill discovery`);
    else if (len > DESC_WARN) warn('frontmatter', `skills/${name} description is ${len} chars (> ${DESC_WARN}) — consider trimming`);
  }

  // ── 2. index-surface sync ──
  const readmeEn = existsSync(join(root, 'README.md')) ? read(join(root, 'README.md')) : '';
  const readmeVi = existsSync(join(root, 'README.vi.md')) ? read(join(root, 'README.vi.md')) : '';
  const diagSel = existsSync(join(root, 'rules/diagram-selection.md')) ? read(join(root, 'rules/diagram-selection.md')) : '';
  const docSel = existsSync(join(root, 'rules/doc-selection.md')) ? read(join(root, 'rules/doc-selection.md')) : '';
  const diagSkills = new Set(skillsInPaths(diagSel));
  const docSkills = new Set(skillsInPaths(docSel));
  const explainDir = join(root, 'explain-skills');
  const explainAll = listFiles(explainDir).filter(n => n.endsWith('.md')).map(n => read(join(explainDir, n))).join('\n');

  const mentions = (haystack: string, name: string) => new RegExp(`/${name}(?![a-z0-9-])`).test(haystack);

  for (const name of skillDirs) {
    if (!mentions(readmeEn, name)) err('index', `/${name} missing from README.md`);
    if (!mentions(readmeVi, name)) err('index', `/${name} missing from README.vi.md`);
    if (!mentions(explainAll, name)) err('index', `/${name} not mentioned in any explain-skills/*.md`);
    const inDiag = diagSkills.has(name);
    const inDoc = docSkills.has(name);
    if (!inDiag && !inDoc) err('paths', `skills/${name} is in neither diagram-selection.md nor doc-selection.md \`paths:\``);
    if (inDiag && inDoc && name !== 'ba') err('paths', `skills/${name} is in BOTH selection rules' \`paths:\` — pick one class`);
    // router-table presence (warning — /gallery is deliberately excluded from /diagram)
    const routerPath = inDoc ? 'skills/ba/SKILL.md' : 'skills/diagram/SKILL.md';
    if (name !== 'ba' && name !== 'diagram' && existsSync(join(root, routerPath))) {
      if (!mentions(read(join(root, routerPath)), name)) warn('router', `/${name} not in ${routerPath} routing table`);
    }
    // an existing doc skill must not still be marked planned in the matrix
    if (inDoc && name !== 'ba') {
      const rows = docSel.split('\n').filter(l => l.startsWith('|') && mentions(l, name));
      if (rows.length && rows.every(l => l.includes('planned'))) err('matrix', `/${name} exists but every doc-selection.md row still says "planned"`);
    }
  }
  // reverse: ✓ rows in doc-selection for nonexistent skills
  for (const line of docSel.split('\n')) {
    if (!line.startsWith('|') || !/\|\s*✓\s*\|/.test(line)) continue;
    for (const m of line.matchAll(/`\/([a-z0-9-]+)`/g)) {
      const name = m[1];
      if (docSkills.has(name) && !skillDirs.includes(name)) err('matrix', `doc-selection.md marks /${name} ✓ but skills/${name}/SKILL.md does not exist`);
    }
  }
  // paths entries for nonexistent dirs
  for (const name of [...docSkills]) {
    if (!existsSync(join(root, 'skills', name)) && !docSel.includes(`/${name}\``)) continue; // reserved slots are fine while planned
  }

  // ── 3. EN/VI parity ──
  const explainFiles = listFiles(explainDir).filter(n => n.endsWith('.md'));
  for (const n of explainFiles) {
    if (n.endsWith('.vi.md')) {
      const en = n.replace(/\.vi\.md$/, '.md');
      if (!explainFiles.includes(en)) err('parity', `explain-skills/${n} has no EN twin ${en}`);
    } else {
      const vi = n.replace(/\.md$/, '.vi.md');
      if (!explainFiles.includes(vi)) err('parity', `explain-skills/${n} has no VI twin ${vi}`);
    }
  }
  const guides = listFiles(join(root, 'guides')).filter(n => n.endsWith('.md'));
  const huongDan = listFiles(join(root, 'huong-dan')).filter(n => n.endsWith('.md'));
  if (guides.length !== huongDan.length) err('parity', `guides/ has ${guides.length} files but huong-dan/ has ${huongDan.length} — every EN guide needs a VI twin`);
  if (readmeEn && !readmeVi) err('parity', 'README.md exists but README.vi.md is missing');

  // ── 4. version trio ──
  try {
    const pkg = JSON.parse(read(join(root, 'package.json')));
    const plugin = JSON.parse(read(join(root, '.claude-plugin/plugin.json')));
    const market = JSON.parse(read(join(root, '.claude-plugin/marketplace.json')));
    if (pkg.version !== plugin.version || plugin.version !== market.metadata?.version) {
      err('version', `version trio drift — package.json=${pkg.version} plugin.json=${plugin.version} .claude-plugin/marketplace.json=${market.metadata?.version}`);
    }
  } catch (e: unknown) { err('version', `cannot read version trio: ${(e as Error).message}`); }

  // ── 5. skill-count claims (README broad; guides/huong-dan total-claim + stale denylist) ──
  const actual = skillDirs.length;
  checkReadmeCounts('README.md', readmeEn, actual, err);
  checkReadmeCounts('README.vi.md', readmeVi, actual, err);
  const surfaceDocs: Array<[string, string]> = [];
  for (const n of guides) surfaceDocs.push([`guides/${n}`, read(join(root, 'guides', n))]);
  for (const n of huongDan) surfaceDocs.push([`huong-dan/${n}`, read(join(root, 'huong-dan', n))]);
  for (const [label, src] of surfaceDocs) checkTotalCountClaims(label, src, actual, err);

  // ── 6. stale phrases + coverage claim parity ──
  const surfaces: Array<[string, string]> = [
    ['README.md', readmeEn],
    ['README.vi.md', readmeVi],
    ...surfaceDocs,
  ];
  for (const [label, src] of surfaces) {
    if (!src) continue;
    for (const re of FORBIDDEN_STALE_PHRASES) {
      if (re.test(src)) err('stale', `${label} contains forbidden phrase matching ${re}`);
    }
    FRACTION_COVERAGE_RE.lastIndex = 0;
    for (const m of src.matchAll(FRACTION_COVERAGE_RE)) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (a !== b) err('stale', `${label} claims partial coverage "${m[0]}" — use a full-coverage claim or drop the fraction`);
    }
  }
  if (readmeEn && readmeVi) {
    const enCov = coverageClaim(readmeEn);
    const viCov = coverageClaim(readmeVi);
    if (enCov && viCov) {
      if (enCov.kind === 'all' && viCov.kind === 'fraction' && viCov.m < viCov.n) {
        err('parity', `README.md claims full coverage of ${enCov.n} but README.vi.md claims only ${viCov.m}/${viCov.n}`);
      }
      if (viCov.kind === 'all' && enCov.kind === 'fraction' && enCov.m < enCov.n) {
        err('parity', `README.vi.md claims full coverage of ${viCov.n} but README.md claims only ${enCov.m}/${enCov.n}`);
      }
      if (enCov.kind === 'all' && viCov.kind === 'all' && enCov.n !== viCov.n) {
        err('parity', `README coverage count drift — EN all ${enCov.n} vs VI all ${viCov.n}`);
      }
    }
  }

  // ── 7. template schema ──
  const naming = existsSync(join(root, 'rules/naming-conventions.md')) ? read(join(root, 'rules/naming-conventions.md')) : '';
  const validTypes = docTypesFromNaming(naming);
  for (const n of listFiles(join(root, 'templates')).filter(n => n.startsWith('doc-') && n.endsWith('.md'))) {
    const body = read(join(root, 'templates', n));
    // Templates for zero-frontmatter content files (uc-*, us-*) declare it on line 1.
    const isZeroFm = body.startsWith('<!-- zero-frontmatter');
    if (!isZeroFm) {
      const fm = parseFrontmatter(body);
      if (!fm?.type) { err('template', `templates/${n} has no frontmatter type: (zero-frontmatter templates must start with "<!-- zero-frontmatter")`); continue; }
      if (!validTypes.has(fm.type)) err('template', `templates/${n} type "${fm.type}" is not in rules/naming-conventions.md's doc-type table`);
    }
    // {{placeholders}} must be well-formed (no stray single braces)
    const opens = (body.match(/\{\{/g) || []).length;
    const closes = (body.match(/\}\}/g) || []).length;
    if (opens !== closes) err('template', `templates/${n} has unbalanced {{placeholders}} (${opens} "{{" vs ${closes} "}}")`);
  }

  return f;
}

// ── CLI ──
const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag !== -1 ? argv[rootFlag + 1] : join(dirname(fileURLToPath(import.meta.url)), '..');
  const findings = lintKit(root);
  const errs = findings.filter(x => x.level === 'error');
  const warns = findings.filter(x => x.level === 'warn');
  for (const x of errs) console.log(`❌ [${x.check}] ${x.msg}`);
  for (const x of warns) console.log(`⚠️  [${x.check}] ${x.msg}`);
  console.log(errs.length
    ? `\n❌ kit-lint: ${errs.length} error(s), ${warns.length} warning(s).`
    : `\n✅ kit-lint: clean (${warns.length} warning(s)).`);
  process.exit(errs.length ? 1 : 0);
}
