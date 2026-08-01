#!/usr/bin/env -S tsx
// doc-validate.ts — ONE audit gate across ALL document types, run before a doc skill reports
// "done". The document twin of diagram-validate.ts.
//
//   tsrun.sh scripts/doc-validate.ts <file>          # validate one generated doc
//   tsrun.sh scripts/doc-validate.ts <dir>           # validate every known doc in the tree
//
// What it checks (per rules/naming-conventions.md + rules/status-lifecycle.md +
// rules/ba-conventions.md §0):
//   • Doc type inferred from the PATH (the naming table is the contract) — unknown paths skip.
//   • Frontmatter: required keys per type (full: type/feature/status/updated/links · slim:
//     type/feature/updated · product-level: no feature), no removed keys (owner/lang/tags/
//     created/changelog/stale_reason), `type:` value matches the path's expected type.
//   • status ∈ status-lifecycle (draft/in-review/revisions/approved/shipped · meeting:
//     captured/processed), `updated:` is an ISO date.
//   • Zero-frontmatter rule — content files (uc-*.md, us-*.md, ascii-wireframe/{flow}.md,
//     userguide pages) must NOT have frontmatter.
//   • ID formats — every BO/CAP/FR/NFR/BR/E/US/UC/AC/CR token in the body matches the
//     declared regex (feature prefix where required).
//   • Link targets — frontmatter `links:` entries and body wikilinks `[[path|label]]` must
//     exist on disk (relative to the vault root).
//   • Meta-text markers (ba-conventions §0) — "How to fill", writing-formula blockquotes.
//
// Report per file; exit 0 clean / 2 warn-only / 1 error.

import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from 'node:fs';
import { join, dirname, basename, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type Level = 'error' | 'warn';
export type Finding = { level: Level; msg: string };
export type Result = { file: string; docType: string; findings: Finding[] };

const STATUSES = new Set(['draft', 'in-review', 'revisions', 'approved', 'shipped']);
const MEETING_STATUSES = new Set(['captured', 'processed']);
const REMOVED_KEYS = ['owner', 'lang', 'tags', 'created', 'changelog', 'stale_reason'];

// ── doc-type inference from path (mirrors the naming-conventions table) ──
// kind: 'full' = type/feature/status/updated/links · 'slim' = type/feature/updated ·
// 'product' = type/status/updated/links (no feature) · 'zero' = must have NO frontmatter ·
// 'meeting' = meeting statuses.
type Spec = { type: string; kind: 'full' | 'slim' | 'product' | 'zero' | 'meeting' };

export function inferSpec(rel: string): Spec | null {
  const p = rel.split(sep).join('/');
  const b = basename(p);
  if (/^docs\/_product\/prd\.md$/.test(p)) return { type: 'prd-product', kind: 'product' };
  if (/^docs\/_product\/roadmap\.md$/.test(p)) return { type: 'roadmap', kind: 'product' };
  if (/^docs\/[^/_]+\/brainstorms\/[^/]+\.md$/.test(p)) return { type: 'brainstorm', kind: 'full' };
  if (/^docs\/([^/]+)\/\1-urd\.md$/.test(p)) return { type: 'urd', kind: 'full' };
  if (/^docs\/([^/]+)\/\1-brd\.md$/.test(p)) return { type: 'brd', kind: 'full' };
  if (/^docs\/([^/]+)\/\1-prd\.md$/.test(p)) return { type: 'prd', kind: 'full' };
  if (/^docs\/([^/]+)\/srs\/\1-spec\.md$/.test(p)) return { type: 'srs', kind: 'full' };
  if (/^docs\/([^/]+)\/reverse-\1\.md$/.test(p)) return { type: 'reverse-feature', kind: 'full' };
  if (/^docs\/[^/]+\/usecases\/uc-[^/]+\.md$/.test(p)) return { type: 'use-case', kind: 'zero' };
  if (/^docs\/([^/]+)\/usecases\/\1-usecase-index\.md$/.test(p)) return { type: 'usecase-index', kind: 'full' };
  if (/^docs\/[^/]+\/userstories\/us-\d{3}\.md$/.test(p)) return { type: 'user-story', kind: 'zero' };
  if (/^docs\/([^/]+)\/userstories\/\1-story-index\.md$/.test(p)) return { type: 'userstory-index', kind: 'full' };
  if (/^docs\/([^/]+)\/srs\/\1-userflow\.md$/.test(p)) return { type: 'srs-userflow', kind: 'slim' };
  if (/^docs\/([^/]+)\/ascii-wireframe\/\1-wireframe-index\.md$/.test(p)) return { type: 'screen-index', kind: 'full' };
  if (/^docs\/[^/]+\/ascii-wireframe\/[^/]+\.md$/.test(p)) return { type: 'screen', kind: 'zero' };
  if (/^docs\/([^/]+)\/test\/checklist\/\1-checklist-index\.md$/.test(p)) return { type: 'test-checklist-index', kind: 'full' };
  if (/^docs\/([^/]+)\/test\/testcases\/\1-testcase-index\.md$/.test(p)) return { type: 'test-cases-index', kind: 'full' };
  if (/^docs\/[^/]+\/integration\/api-assess\.md$/.test(p)) return { type: 'api-assess', kind: 'full' };
  if (/^docs\/[^/]+\/integration\/api-summary(-[^/]+)?\.md$/.test(p)) return { type: 'api-summary', kind: 'full' };
  if (/^docs\/[^/]+\/integration\/api-design\.md$/.test(p)) return { type: 'api-design', kind: 'full' };
  if (/^docs\/[^/]+\/integration\/api-map\.md$/.test(p)) return { type: 'api-map', kind: 'full' };
  if (/^docs\/[^/]+\/integration\/api-readiness\.md$/.test(p)) return { type: 'api-readiness', kind: 'full' };
  if (/^docs\/[^/]+\/test\/api\/api-checklist\.md$/.test(p)) return { type: 'api-checklist', kind: 'full' };
  if (/^docs\/[^/]+\/test\/api\/api-tests\.md$/.test(p)) return { type: 'api-tests', kind: 'full' };
  if (/^docs\/cr\/CR-\d{8}-\d{3}\.md$/.test(p)) return { type: 'change-request', kind: 'full' };
  if (/^docs\/_shared\/traceability\.md$/.test(p)) return { type: 'traceability', kind: 'slim' };
  if (/^docs\/meetings\/\d{4}-\d{2}-\d{2}-[^/]+\.md$/.test(p)) return { type: 'meeting', kind: 'meeting' };
  if (/^docs\/inbox\/\d{4}-\d{2}-\d{2}-[^/]+\.md$/.test(p)) return { type: 'inbox', kind: 'slim' };
  if (/^docs\/userguide\/[^/]+\/pages\/[^/]+\.md$/.test(p)) return { type: 'userguide-section', kind: 'zero' };
  if (/^docs\/userguide\/[^/]+\/index\.md$/.test(p)) return { type: 'userguide-index', kind: 'full' };
  if (b === 'uc-index.md' || b.endsWith('-usecase-index.md')) return { type: 'usecase-index', kind: 'full' };
  return null; // unknown → skipped (diagram files etc. belong to diagram-validate)
}

// ── frontmatter parse (values may be lists for links:) ──
export function parseFm(src: string): { raw: string; keys: Map<string, string>; links: string[] } | null {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const keys = new Map<string, string>();
  const links: string[] = [];
  let inLinks = false;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) {
      inLinks = kv[1] === 'links';
      keys.set(kv[1], kv[2].trim());
      if (inLinks && kv[2].trim().startsWith('[')) {
        // inline list: links: [a, b]
        kv[2].trim().replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean).forEach(l => links.push(l));
      }
    } else if (inLinks) {
      const item = line.match(/^\s+-\s+(.*)$/);
      if (item) links.push(item[1].trim());
      else if (line.trim()) inLinks = false;
    }
  }
  return { raw: m[1], keys, links };
}

// ── ID format checks ──
// Feature-prefixed: BO/CAP (2-3 digits ok), FR/NFR/BR/E (3 digits). Path-scoped: US/AC (3 digits),
// UC-{slug}. CR: date-based.
const ID_RULES: Array<{ re: RegExp; valid: RegExp; name: string }> = [
  { re: /\bFR-[\w-]+/g, valid: /^FR-[a-z0-9-]+-\d{3}$/, name: 'FR-{feature}-{NNN}' },
  { re: /\bNFR-[\w-]+/g, valid: /^NFR-[a-z0-9-]+-\d{3}$/, name: 'NFR-{feature}-{NNN}' },
  { re: /\bBR-[\w-]+/g, valid: /^BR-[a-z0-9-]+-\d{3}$/, name: 'BR-{feature}-{NNN}' },
  { re: /\bBO-[\w-]+/g, valid: /^BO-[a-z0-9-]+-\d{2,3}$/, name: 'BO-{feature}-{NN}' },
  { re: /\bCAP-[\w-]+/g, valid: /^CAP-[a-z0-9-]+-\d{2,3}$/, name: 'CAP-{feature}-{NN}' },
  { re: /\bUN-[\w-]+/g, valid: /^UN-[a-z0-9-]+-\d{3}$/, name: 'UN-{feature}-{NNN}' },
  { re: /\bUS-[\w-]+/g, valid: /^US-\d{3}$/, name: 'US-{NNN}' },
  { re: /\bAC-[\w-]+/g, valid: /^AC-\d{3}$/, name: 'AC-{NNN}' },
  { re: /\bCR-[\w-]+/g, valid: /^CR-\d{8}-\d{3}$/, name: 'CR-{YYYYMMDD}-{NNN}' },
];
// E- is too collision-prone as a bare regex (E-commerce…): only check E- tokens that look like IDs.
const E_ID = { re: /\bE-[a-z0-9-]+-\d+\b/g, valid: /^E-[a-z0-9-]+-\d{3}$/, name: 'E-{feature}-{NNN}' };

export function checkIds(body: string): Finding[] {
  const out: Finding[] = [];
  const flagged = new Set<string>();
  for (const rule of [...ID_RULES, E_ID]) {
    for (const m of body.matchAll(rule.re)) {
      const tok = m[0].replace(/[.,;:)\]]+$/, '');
      if (!rule.valid.test(tok) && !flagged.has(tok)) {
        flagged.add(tok);
        // ignore obvious prose (uppercase following segment => not an ID attempt, e.g. "US-based")
        if (/^(US|AC|CR|E)-[A-Za-z]/.test(tok) && !/\d/.test(tok)) continue;
        out.push({ level: 'warn', msg: `ID "${tok}" does not match ${rule.name}` });
      }
    }
  }
  return out;
}

// ── meta-text markers (ba-conventions §0) ──
const META_MARKERS = [/how to fill/i, /hướng dẫn điền/i, /run `\/[a-z-]+` to fill/i, /điền theo công thức/i];

export function validateDoc(file: string, vaultRoot: string): Result | null {
  const rel = relative(vaultRoot, file);
  const spec = inferSpec(rel);
  if (!spec) return null;
  const src = readFileSync(file, 'utf8');
  const findings: Finding[] = [];
  const fm = parseFm(src);
  const body = fm ? src.slice(src.indexOf('---', 4) + 3) : src;

  if (spec.kind === 'zero') {
    if (fm) findings.push({ level: 'error', msg: `${spec.type} files are zero-frontmatter by design — remove the frontmatter (metadata lives in the index file)` });
  } else {
    if (!fm) findings.push({ level: 'error', msg: 'missing frontmatter' });
    else {
      const t = fm.keys.get('type');
      if (t !== spec.type) findings.push({ level: 'error', msg: `type: "${t}" — expected "${spec.type}" for this path` });
      if (!fm.keys.get('updated')) findings.push({ level: 'error', msg: 'missing updated:' });
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.keys.get('updated')!)) findings.push({ level: 'error', msg: `updated: "${fm.keys.get('updated')}" is not an ISO date (YYYY-MM-DD)` });
      const needFeature = spec.kind === 'full' || spec.kind === 'slim';
      if (needFeature && !fm.keys.get('feature') && !rel.includes('_shared') && !rel.startsWith('docs/inbox') && !rel.startsWith('docs/cr') && !rel.startsWith('docs/meetings')) {
        findings.push({ level: 'error', msg: 'missing feature:' });
      }
      if (spec.kind === 'full' || spec.kind === 'product') {
        const st = fm.keys.get('status');
        if (!st) findings.push({ level: 'error', msg: 'missing status:' });
        else if (!STATUSES.has(st)) findings.push({ level: 'error', msg: `status: "${st}" not in lifecycle (${[...STATUSES].join('/')})` });
      }
      if (spec.kind === 'meeting') {
        const st = fm.keys.get('status');
        if (st && !MEETING_STATUSES.has(st)) findings.push({ level: 'error', msg: `meeting status "${st}" not in (captured/processed)` });
      }
      for (const k of REMOVED_KEYS) {
        if (fm.keys.has(k)) findings.push({ level: 'error', msg: `frontmatter key "${k}:" was removed by convention — drop it` });
      }
      // links: targets exist
      for (const l of fm.links) {
        const target = l.split('#')[0];
        if (target && !existsSync(join(vaultRoot, target))) findings.push({ level: 'error', msg: `links: target not found: ${target}` });
      }
    }
  }

  // body wikilinks
  for (const m of body.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const target = m[1].trim();
    if (target && !existsSync(join(vaultRoot, target))) findings.push({ level: 'error', msg: `wikilink target not found: ${target}` });
  }

  // ID formats
  findings.push(...checkIds(body));

  // meta-text
  for (const re of META_MARKERS) {
    if (re.test(body)) { findings.push({ level: 'warn', msg: 'meta-text marker found (ba-conventions §0) — templates/docs carry structure + content only' }); break; }
  }

  return { file, docType: spec.type, findings };
}

// ── CLI ──
const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const targets = argv.filter(a => !a.startsWith('--'));
  if (!targets.length) { console.error('Usage: doc-validate <file|dir> [--vault <root>]'); process.exit(2); }
  const vaultFlag = argv.indexOf('--vault');

  const results: Result[] = [];
  for (const t of targets) {
    const abs = isAbsolute(t) ? t : join(process.cwd(), t);
    if (!existsSync(abs)) { console.error(`Not found: ${t}`); process.exit(2); }
    // Vault root = the dir containing docs/ (for example/atlas-re the example root acts as a feature,
    // so the vault is the parent that makes rel paths start with docs/ … or the target itself).
    const findVault = (p: string): string => {
      let cur = statSync(p).isDirectory() ? p : dirname(p);
      while (cur !== dirname(cur)) {
        if (existsSync(join(cur, 'docs')) && statSync(join(cur, 'docs')).isDirectory()) return cur;
        cur = dirname(cur);
      }
      return statSync(p).isDirectory() ? p : dirname(p);
    };
    const vault = vaultFlag !== -1 ? argv[vaultFlag + 1] : findVault(abs);
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, e.name);
        if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') walk(full);
        else if (e.isFile() && e.name.endsWith('.md')) files.push(full);
      }
    };
    if (statSync(abs).isDirectory()) walk(abs); else files.push(abs);
    for (const f of files) {
      const r = validateDoc(f, vault);
      if (r) results.push(r);
    }
  }

  let totalErr = 0, totalWarn = 0;
  for (const r of results) {
    const errs = r.findings.filter(x => x.level === 'error');
    const warns = r.findings.filter(x => x.level === 'warn');
    totalErr += errs.length; totalWarn += warns.length;
    if (!errs.length && !warns.length) continue;
    console.log(`\n=== ${r.file} [${r.docType}] ===`);
    errs.forEach(x => console.log('   ❌ ' + x.msg));
    warns.forEach(x => console.log('   ⚠️  ' + x.msg));
  }
  console.log(totalErr
    ? `\n❌ doc-validate: ${totalErr} error(s), ${totalWarn} warning(s) across ${results.length} doc(s).`
    : `\n✅ doc-validate: ${results.length} doc(s) checked, ${totalWarn} warning(s).`);
  process.exit(totalErr ? 1 : totalWarn ? 2 : 0);
}
