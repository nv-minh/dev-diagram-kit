import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  lintKit,
  parseFrontmatter,
  skillsInPaths,
  docTypesFromNaming,
  coverageClaim,
  STALE_TOTAL_COUNT_RE,
  FORBIDDEN_STALE_PHRASES,
} from '../../scripts/kit-lint.ts';

// ── unit: parsers ──
describe('parseFrontmatter', () => {
  it('parses simple key/value frontmatter', () => {
    const fm = parseFrontmatter('---\nname: journey\nuser-invocable: true\n---\nbody');
    expect(fm?.name).toBe('journey');
    expect(fm?.['user-invocable']).toBe('true');
  });
  it('returns null when there is no frontmatter', () => {
    expect(parseFrontmatter('# just a doc')).toBeNull();
  });
});

describe('skillsInPaths', () => {
  it('extracts skill dir names from paths globs', () => {
    const src = '---\npaths:\n  - ".claude/skills/sequence/**"\n  - ".claude/skills/ba/**"\n  - "docs/**/srs/*.md"\n---';
    expect(skillsInPaths(src)).toEqual(['sequence', 'ba']);
  });
});

describe('docTypesFromNaming', () => {
  it('collects backticked types from the doc-type table, skipping removed rows', () => {
    const src = ['## Doc type values', '', '| Type | Use for |', '|---|---|',
      '| `srs` | spec |', '| `urd` / `brd` / `prd` | reqs |', '| ~~`usecase-traceability`~~ | removed |',
      '', '## Next section'].join('\n');
    const types = docTypesFromNaming(src);
    expect(types.has('srs')).toBe(true);
    expect(types.has('brd')).toBe(true);
    expect(types.has('usecase-traceability')).toBe(false);
  });
});

describe('coverageClaim', () => {
  it('detects full-coverage and fractional claims', () => {
    expect(coverageClaim('all 63 skills covered via family docs')).toEqual({ kind: 'all', n: 63 });
    expect(coverageClaim('phủ đủ 63 skill (song ngữ)')).toEqual({ kind: 'all', n: 63 });
    expect(coverageClaim('đủ 28/63 skill')).toEqual({ kind: 'fraction', m: 28, n: 63 });
  });
});

describe('stale detectors', () => {
  it('matches historical totals and forbidden phrases', () => {
    STALE_TOTAL_COUNT_RE.lastIndex = 0;
    expect(STALE_TOTAL_COUNT_RE.test('Done — 14 commands available')).toBe(true);
    STALE_TOTAL_COUNT_RE.lastIndex = 0;
    expect(STALE_TOTAL_COUNT_RE.test('all 63 commands')).toBe(false);
    expect(FORBIDDEN_STALE_PHRASES.some(re => re.test('more waves landing soon'))).toBe(true);
    expect(FORBIDDEN_STALE_PHRASES.some(re => re.test('and later waves) live in'))).toBe(true);
  });
});

// ── integration: a synthetic kit tree ──
describe('lintKit on a synthetic tree', () => {
  let root: string;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'kit-lint-'));
    const w = (p: string, c: string) => { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), c); };
    mkdirSync(join(root, 'skills/good'), { recursive: true });
    mkdirSync(join(root, 'skills/bad-name'), { recursive: true });
    mkdirSync(join(root, '.claude-plugin'), { recursive: true });
    mkdirSync(join(root, 'rules'), { recursive: true });
    mkdirSync(join(root, 'explain-skills'), { recursive: true });
    mkdirSync(join(root, 'guides'), { recursive: true });
    mkdirSync(join(root, 'huong-dan'), { recursive: true });
    mkdirSync(join(root, 'templates'), { recursive: true });
    w('skills/good/SKILL.md', '---\nname: good\ndescription: Use when testing.\nuser-invocable: true\n---\n');
    w('skills/bad-name/SKILL.md', '---\nname: mismatch\ndescription: x\nuser-invocable: true\n---\n');
    w('README.md', 'has 2 skills · `/good` and `/bad-name`');
    w('README.vi.md', 'có 2 skill · `/good` và `/bad-name`');
    w('rules/diagram-selection.md', '---\npaths:\n  - ".claude/skills/good/**"\n  - ".claude/skills/bad-name/**"\n---\n');
    w('rules/doc-selection.md', '---\npaths: []\n---\n| x | `/ghost` | ✓ |');
    w('rules/naming-conventions.md', '## Doc type values\n| Type | Use |\n|---|---|\n| `brd` | x |\n');
    w('explain-skills/good.md', 'about /good and /bad-name');
    w('explain-skills/good.vi.md', 'về /good và /bad-name');
    w('guides/01-a.md', 'x'); w('huong-dan/01-a.md', 'x');
    w('package.json', JSON.stringify({ version: '2.0.0' }));
    w('.claude-plugin/plugin.json', JSON.stringify({ version: '2.0.0' }));
    w('.claude-plugin/marketplace.json', JSON.stringify({ metadata: { version: '1.0.0' } }));
    w('templates/doc-brd.md', '---\ntype: brd\n---\n{{name}}');
    w('templates/doc-bogus.md', '---\ntype: nope\n---\n{{a}} }}');
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('finds the planted errors and passes the clean skill', () => {
    const f = lintKit(root);
    const msgs = f.map(x => `${x.level}:${x.check}:${x.msg}`).join('\n');
    expect(msgs).toMatch(/error:frontmatter:.*bad-name.*≠ dir name/);
    expect(msgs).toMatch(/error:version:.*drift/);
    expect(msgs).toMatch(/error:template:.*"nope"/);
    expect(msgs).toMatch(/error:template:.*unbalanced/);
    expect(msgs).not.toMatch(/error:.*skills\/good.*description/);
    // counts match (2 skills claimed, 2 real) → no count error
    expect(msgs).not.toMatch(/error:count/);
  });

  it('description length caps fire at the right thresholds', () => {
    writeFileSync(join(root, 'skills/good/SKILL.md'),
      `---\nname: good\ndescription: ${'x'.repeat(800)}\nuser-invocable: true\n---\n`);
    let f = lintKit(root);
    expect(f.some(x => x.level === 'warn' && x.check === 'frontmatter' && x.msg.includes('good'))).toBe(true);
    writeFileSync(join(root, 'skills/good/SKILL.md'),
      `---\nname: good\ndescription: ${'x'.repeat(1300)}\nuser-invocable: true\n---\n`);
    f = lintKit(root);
    expect(f.some(x => x.level === 'error' && x.check === 'frontmatter' && x.msg.includes('good'))).toBe(true);
  });

  it('flags stale guide totals and forbidden phrases', () => {
    writeFileSync(join(root, 'guides/01-a.md'), 'Done — 14 commands are available right away. more waves landing.\n');
    writeFileSync(join(root, 'huong-dan/01-a.md'), 'x');
    writeFileSync(join(root, 'README.md'), 'has 2 skills · `/good` and `/bad-name` · covering all 2 skills');
    writeFileSync(join(root, 'README.vi.md'), 'có 2 skill · `/good` và `/bad-name` · đủ 1/2 skill');
    writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '1.0.0' }));
    writeFileSync(join(root, '.claude-plugin/plugin.json'), JSON.stringify({ version: '1.0.0' }));
    writeFileSync(join(root, '.claude-plugin/marketplace.json'), JSON.stringify({ metadata: { version: '1.0.0' } }));
    const f = lintKit(root);
    const msgs = f.map(x => `${x.level}:${x.check}:${x.msg}`).join('\n');
    expect(msgs).toMatch(/error:count:.*14 commands/);
    expect(msgs).toMatch(/error:stale:.*more waves landing/i);
    expect(msgs).toMatch(/error:stale:.*1\/2 skill/i);
    expect(msgs).toMatch(/error:parity:.*full coverage.*1\/2/);
  });
});

// ── the real repo must be lint-clean ──
describe('lintKit on this repo', () => {
  it('reports zero errors', () => {
    const repoRoot = join(__dirname, '../..');
    const errs = lintKit(repoRoot).filter(x => x.level === 'error');
    expect(errs.map(x => `[${x.check}] ${x.msg}`)).toEqual([]);
  });
});
