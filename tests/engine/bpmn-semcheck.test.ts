import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkIR } from '../../skills/bpmn/engine/bpmn-semcheck.ts';

const ATLAS_IR = join(__dirname, '../../example/atlas-re/bpmn/claim-approval.ir.json');

describe('checkIR (BPMN semantic check)', () => {
  it('accepts the atlas-re claim-approval IR', () => {
    const ir = JSON.parse(readFileSync(ATLAS_IR, 'utf8'));
    const rep = checkIR(ir, {});
    expect(rep.ok, (rep.errors || []).join('\n')).toBe(true);
    expect(rep.errors ?? []).toEqual([]);
  });

  it('rejects an IR with a dangling flow target', () => {
    const ir = JSON.parse(readFileSync(ATLAS_IR, 'utf8'));
    ir.flows.push({
      id: 'Flow_bogus',
      src: ir.nodes[0]?.id,
      tgt: 'Node_does_not_exist',
    });
    const rep = checkIR(ir, {});
    expect(rep.ok).toBe(false);
    expect((rep.errors || []).join('\n')).toMatch(/Node_does_not_exist/);
  });
});
