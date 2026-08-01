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
//   4. Version trio — package.json == .claude-plugin/plugin.json == marketplace.json.
//   5. Skill-count claims — every "N skills"/"N skill"/"All N commands"/"Cả N lệnh" in the
//      READMEs equals the real count of skills/*/SKILL.md.
//   6. Template schema — every templates/doc-*.md frontmatter `type:` exists in
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
    const market = JSON.parse(read(join(root, 'marketplace.json')));
    if (pkg.version !== plugin.version || plugin.version !== market.metadata?.version) {
      err('version', `version trio drift — package.json=${pkg.version} plugin.json=${plugin.version} marketplace.json=${market.metadata?.version}`);
    }
  } catch (e: unknown) { err('version', `cannot read version trio: ${(e as Error).message}`); }

  // ── 5. skill-count claims ──
  const actual = skillDirs.length;
  const claims: Array<[string, RegExp[]]> = [
    ['README.md', [/(\d+)\s+skills\b/g, /All (\d+) commands\b/g]],
    ['README.vi.md', [/(\d+)\s+skill\b/g, /Cả (\d+) lệnh\b/g]],
  ];
  for (const [file, res] of claims) {
    const src = file === 'README.md' ? readmeEn : readmeVi;
    for (const re of res) {
      for (const m of src.matchAll(re)) {
        if (parseInt(m[1], 10) !== actual) err('count', `${file} claims "${m[0]}" but the kit has ${actual} skills`);
      }
    }
  }

  // ── 6. template schema ──
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
