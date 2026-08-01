import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ATLAS_DIAGRAM_ALLOWLIST, resolveAllowlist } from '../../scripts/validate-example-diagrams.ts';

const REPO = join(__dirname, '../..');
const TSRUN = join(REPO, 'scripts/tsrun.sh');
const VALIDATE = join(REPO, 'scripts/diagram-validate.ts');

function runValidate(...files: string[]) {
  return spawnSync('bash', [TSRUN, VALIDATE, ...files], {
    encoding: 'utf8',
    cwd: REPO,
    maxBuffer: 10 * 1024 * 1024,
  });
}

describe('validate-example-diagrams allowlist', () => {
  it('resolves every allowlisted atlas path', () => {
    expect(ATLAS_DIAGRAM_ALLOWLIST.length).toBeGreaterThan(10);
    const abs = resolveAllowlist(REPO);
    expect(abs).toHaveLength(ATLAS_DIAGRAM_ALLOWLIST.length);
  });
});

describe('diagram-validate smoke', () => {
  it('passes the atlas BPMN IR (no external render tools)', () => {
    const ir = join(REPO, 'example/atlas-re/bpmn/claim-approval.ir.json');
    const r = runValidate(ir);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toMatch(/compile:\s*ok/);
  });

  it('fails a planted broken D2 file when d2 is available', () => {
    const which = spawnSync('bash', ['-lc', 'command -v d2 || test -x "$HOME/.local/bin/d2"'], { encoding: 'utf8' });
    if (which.status !== 0) {
      // Local/CI without d2: skip — the CI workflow installs d2 for the allowlist step.
      return;
    }
    const dir = mkdtempSync(join(tmpdir(), 'dv-bad-'));
    const bad = join(dir, 'bad.d2');
    try {
      writeFileSync(bad, 'this is not { valid d2\n');
      const r = runValidate(bad);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toMatch(/d2 compile failed|error/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
