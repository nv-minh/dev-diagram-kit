#!/usr/bin/env -S tsx
// validate-example-diagrams.ts — run diagram-validate on an allowlist of atlas-re
// diagram artifacts (NOT the whole tree — walking every .md treats docs as Mermaid).
//
//   tsrun.sh scripts/validate-example-diagrams.ts [--root <repo>] [--strict-tools]
//
// --strict-tools: treat compile:skip as failure (CI should install d2/java/mmdc so
// engines are actually checked, not silently skipped).

import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(HERE, '..');

/** Relative to example/atlas-re — files and dirs passed to diagram-validate. */
export const ATLAS_DIAGRAM_ALLOWLIST: string[] = [
  // D2
  'd2-activity/atlas-re.d2',
  'd2-architect/atlas-re.d2',
  'd2-erd/atlas-re.d2',
  'dfd/atlas-re-dfd-l0.d2',
  'dfd/atlas-re-dfd-l1.d2',
  'orgchart/atlas-re-orgchart.d2',
  'system-design/atlas-re-context.d2',
  'system-design/atlas-re-container.d2',
  // BPMN
  'bpmn/claim-approval.ir.json',
  'bpmn/claim-approval.bpmn',
  // PlantUML
  'activity-swimlane/atlas-re-claim-approval-swimlane.puml',
  'usecases/atlas-re-usecase-diagram.puml',
  // draw.io
  'drawio/atlas-re-aws.drawio',
  'drawio/atlas-re-azure.drawio',
  'drawio/atlas-re-gcp.drawio',
  'drawio/atlas-re-databricks.drawio',
  'drawio/atlas-re-sequence.drawio',
  // Mermaid-bearing markdown
  'srs/atlas-re-flows.md',
  'srs/atlas-re-states.md',
  'srs/atlas-re-erd.md',
  'srs/atlas-re-journey.md',
  'srs/atlas-re-userflow.md',
  'orgchart/atlas-re-stakeholder.md',
];

export function resolveAllowlist(root: string): string[] {
  const base = join(root, 'example/atlas-re');
  const out: string[] = [];
  for (const rel of ATLAS_DIAGRAM_ALLOWLIST) {
    const abs = join(base, rel);
    if (!existsSync(abs)) {
      console.error(`Allowlist path missing: example/atlas-re/${rel}`);
      process.exit(1);
    }
    out.push(abs);
  }
  return out;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag !== -1 ? argv[rootFlag + 1] : DEFAULT_ROOT;
  const strictTools = argv.includes('--strict-tools');

  const targets = resolveAllowlist(root);
  const tsrun = join(root, 'scripts/tsrun.sh');
  const validator = join(root, 'scripts/diagram-validate.ts');

  const r = spawnSync('bash', [tsrun, validator, ...targets], {
    encoding: 'utf8',
    cwd: root,
    maxBuffer: 20 * 1024 * 1024,
  });

  const stdout = r.stdout || '';
  const stderr = r.stderr || '';
  process.stdout.write(stdout);
  process.stderr.write(stderr);

  let exit = r.status ?? 1;

  if (strictTools) {
    const skipLines = stdout.split('\n').filter(l => /compile:\s*skip/i.test(l));
    if (skipLines.length) {
      console.error(`\n❌ --strict-tools: ${skipLines.length} file(s) skipped compile (install d2 / Java+plantuml.jar / mmdc+Chrome).`);
      for (const l of skipLines.slice(0, 20)) console.error(`   ${l.trim()}`);
      exit = 1;
    }
  }

  process.exit(exit === 0 ? 0 : 1);
}
