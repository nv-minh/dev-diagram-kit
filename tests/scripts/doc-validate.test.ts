import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { inferSpec, parseFm, checkIds, validateDoc } from '../../scripts/doc-validate.ts';

describe('inferSpec', () => {
  it('maps naming-convention paths to doc types', () => {
    expect(inferSpec('docs/payment/payment-brd.md')?.type).toBe('brd');
    expect(inferSpec('docs/payment/srs/payment-spec.md')?.type).toBe('srs');
    expect(inferSpec('docs/_product/prd.md')).toEqual({ type: 'prd-product', kind: 'product' });
    expect(inferSpec('docs/payment/usecases/uc-checkout.md')?.kind).toBe('zero');
    expect(inferSpec('docs/payment/userstories/us-001.md')?.kind).toBe('zero');
    expect(inferSpec('docs/cr/CR-20260801-001.md')?.type).toBe('change-request');
    expect(inferSpec('docs/payment/brainstorms/wallet-idea.md')?.type).toBe('brainstorm');
    expect(inferSpec('docs/_shared/project-context.md')).toEqual({ type: 'project-context', kind: 'slim' });
    expect(inferSpec('docs/_shared/context/glossary.md')).toEqual({ type: 'project-context-detail', kind: 'slim' });
  });
  it('rejects mismatched feature prefixes and unknown paths', () => {
    expect(inferSpec('docs/payment/other-brd.md')).toBeNull();      // prefix must equal feature dir
    expect(inferSpec('docs/payment/srs/payment-flows.md')).toBeNull(); // diagram file → diagram-validate's job
    expect(inferSpec('README.md')).toBeNull();
  });
});

describe('parseFm', () => {
  it('parses keys and multi-line links lists', () => {
    const fm = parseFm('---\ntype: brd\nfeature: payment\nlinks:\n  - docs/payment/payment-urd.md\n  - docs/payment/srs/payment-spec.md\n---\nbody');
    expect(fm?.keys.get('type')).toBe('brd');
    expect(fm?.links).toEqual(['docs/payment/payment-urd.md', 'docs/payment/srs/payment-spec.md']);
  });
});

describe('checkIds', () => {
  it('accepts well-formed IDs', () => {
    expect(checkIds('FR-payment-001 BO-payment-01 US-001 AC-002 CR-20260801-001 E-payment-003')).toEqual([]);
  });
  it('flags malformed IDs', () => {
    const msgs = checkIds('FR-001 mentioned, also CAP-1').map(f => f.msg).join('\n');
    expect(msgs).toMatch(/FR-001/);   // missing feature prefix
    expect(msgs).toMatch(/CAP-1/);    // too few digits
  });
  it('ignores prose lookalikes', () => {
    expect(checkIds('US-based team, E-commerce checkout').filter(f => f.msg.includes('US-based'))).toEqual([]);
  });
});

describe('validateDoc end-to-end', () => {
  let vault: string;
  const w = (rel: string, content: string) => {
    const p = join(vault, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    return p;
  };
  beforeAll(() => { vault = mkdtempSync(join(tmpdir(), 'doc-validate-')); });
  afterAll(() => rmSync(vault, { recursive: true, force: true }));

  it('passes a clean BRD and catches every planted violation', () => {
    w('docs/payment/payment-urd.md', '---\ntype: urd\nfeature: payment\nstatus: draft\nupdated: 2026-08-01\n---\n# URD');
    const clean = w('docs/payment/payment-brd.md', [
      '---', 'type: brd', 'feature: payment', 'status: draft', 'updated: 2026-08-01',
      'links:', '  - docs/payment/payment-urd.md', '---',
      '# BRD', 'BO-payment-01 traces to [[docs/payment/payment-urd.md|URD]].',
    ].join('\n'));
    expect(validateDoc(clean, vault)!.findings).toEqual([]);

    const dirty = w('docs/checkout/checkout-brd.md', [
      '---', 'type: urd', 'status: wip', 'updated: yesterday', 'owner: bob',
      'links:', '  - docs/nope.md', '---',
      'BO-1 and [[docs/missing.md]] and\n> How to fill: put objectives here',
    ].join('\n'));
    const msgs = validateDoc(dirty, vault)!.findings.map(f => `${f.level}:${f.msg}`).join('\n');
    expect(msgs).toMatch(/error:type: "urd" — expected "brd"/);
    expect(msgs).toMatch(/error:status: "wip"/);
    expect(msgs).toMatch(/error:updated: "yesterday"/);
    expect(msgs).toMatch(/error:missing feature:/);
    expect(msgs).toMatch(/error:.*"owner:" was removed/);
    expect(msgs).toMatch(/error:links: target not found: docs\/nope.md/);
    expect(msgs).toMatch(/error:wikilink target not found: docs\/missing.md/);
    expect(msgs).toMatch(/warn:ID "BO-1"/);
    expect(msgs).toMatch(/warn:meta-text/);
  });

  it('enforces the zero-frontmatter rule both ways', () => {
    const uc = w('docs/payment/usecases/uc-checkout.md', '---\ntype: use-case\n---\n# UC');
    expect(validateDoc(uc, vault)!.findings.some(f => f.msg.includes('zero-frontmatter'))).toBe(true);
    const ucOk = w('docs/payment/usecases/uc-refund.md', '# UC Refund\nMain Success Scenario…');
    expect(validateDoc(ucOk, vault)!.findings).toEqual([]);
  });

  it('meeting docs accept the meeting lifecycle', () => {
    const m = w('docs/meetings/2026-08-01-standup-kickoff.md', '---\ntype: meeting\nstatus: captured\nupdated: 2026-08-01\n---\nnotes');
    expect(validateDoc(m, vault)!.findings).toEqual([]);
    const bad = w('docs/meetings/2026-08-01-standup-two.md', '---\ntype: meeting\nstatus: draft\nupdated: 2026-08-01\n---\nnotes');
    expect(validateDoc(bad, vault)!.findings.some(f => f.msg.includes('captured/processed'))).toBe(true);
  });

  it('returns null for files outside the naming table', () => {
    const x = w('docs/payment/srs/payment-flows.md', '```mermaid\nflowchart TD\n```');
    expect(validateDoc(x, vault)).toBeNull();
  });

  it('enforces the Tier-1 project-context 60-line cap', () => {
    const fm = ['---', 'type: project-context', 'status: approved', 'updated: 2026-08-02',
      'profile_hash: abc', 'source_watermark: deadbeef', 'staleness_budget_commits: 200',
      'human_edited: []', 'links: []', '---'];
    const p = 'docs/_shared/project-context.md';
    const ok = w(p, fm.concat(Array(60).fill('- bullet')).join('\n'));
    expect(validateDoc(ok, vault)!.findings.some(f => f.msg.includes('hard cap is 60'))).toBe(false);
    const over = w(p, fm.concat(Array(61).fill('- bullet')).join('\n'));
    expect(validateDoc(over, vault)!.findings.some(f => f.msg.includes('hard cap is 60'))).toBe(true);
  });
});
