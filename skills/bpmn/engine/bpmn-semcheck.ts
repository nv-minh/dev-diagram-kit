// bpmn-semcheck.ts — Validates the IR (intermediate representation) before layout.
// 2 tiers:
//   (A) STRUCTURAL — 100% machine-checkable: IR is graph-valid (start/end, reachable, gateway branches, orphans...).
//   (B) COVERAGE   — cross-checks the IR against "source facts" (actors/branches/errors extracted from UC/SRS).
//                    The machine compares COUNTS + approximate names → warns on mismatch; final semantic judgment is left to the AI/user.
// Usage: import { checkIR } from './bpmn-semcheck.ts'; const rep = checkIR(ir, sourceFacts?);
//   ir: { process, lanes[], nodes[], flows[] }
//   sourceFacts (optional): { actors:[...], branches:[...], errors:[...], expectedEnds:[...] }
// Returns: { ok, errors:[], warnings:[], coverage:{...} }  (ok=false if there's a structural error)

export function checkIR(ir, source = {}) {
  const errors = [], warnings = [];
  const { lanes = [], nodes = [], flows = [] } = ir || {};
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
  const laneIds = new Set(lanes.map(l => l.id));

  // ───────── (A) STRUCTURAL ─────────
  // A1. valid references
  nodes.forEach(n => {
    if (!laneIds.has(n.lane)) errors.push(`Node "${n.id}" references a nonexistent lane: ${n.lane}`);
    if (!['start','task','gateway','end'].includes(n.kind)) errors.push(`Node "${n.id}" has an unknown kind: ${n.kind}`);
    if (!n.name || !String(n.name).trim()) warnings.push(`Node "${n.id}" is missing a name (will render empty)`);
  });
  flows.forEach(f => {
    if (!nodeById[f.src]) errors.push(`Flow "${f.id}" src does not exist: ${f.src}`);
    if (!nodeById[f.tgt]) errors.push(`Flow "${f.id}" tgt does not exist: ${f.tgt}`);
    if (f.src === f.tgt) errors.push(`Flow "${f.id}" is a self-loop (src==tgt)`);
  });

  // A2. start / end
  const starts = nodes.filter(n => n.kind === 'start');
  const ends   = nodes.filter(n => n.kind === 'end');
  if (starts.length === 0) errors.push('No startEvent — every process needs exactly 1 starting point');
  if (starts.length > 1) warnings.push(`There are ${starts.length} startEvents — consider merging into 1 (auto-layout picks 1 root)`);
  if (ends.length === 0) errors.push('No endEvent — the process must have at least 1 outcome');

  // A3. degree (in/out)
  const outOf = {}, inOf = {};
  nodes.forEach(n => { outOf[n.id] = []; inOf[n.id] = []; });
  flows.forEach(f => { if (nodeById[f.src] && nodeById[f.tgt]) { outOf[f.src].push(f); inOf[f.tgt].push(f); } });
  nodes.forEach(n => {
    const di = inOf[n.id].length, dout = outOf[n.id].length;
    if (n.kind === 'start' && dout === 0) errors.push(`startEvent "${n.id}" has no outgoing`);
    if (n.kind === 'start' && di > 0) warnings.push(`startEvent "${n.id}" has incoming (unusual)`);
    if (n.kind === 'end' && di === 0) errors.push(`endEvent "${n.id}" has no incoming (orphan)`);
    if (n.kind === 'end' && dout > 0) errors.push(`endEvent "${n.id}" has outgoing (an end must be a terminal point)`);
    if (n.kind === 'task' && (di === 0 || dout === 0)) errors.push(`task "${n.id}" is missing ${di===0?'incoming':'outgoing'} (broken chain)`);
    if (n.kind === 'gateway') {
      if (dout < 2) errors.push(`gateway "${n.id}" only has ${dout} outgoing branch(es) — a gateway needs ≥2 (if only 1, remove the gateway)`);
      // every outgoing branch of a gateway should have a label
      outOf[n.id].forEach(f => { if (!f.name || !String(f.name).trim()) warnings.push(`Branch "${f.id}" from gateway "${n.id}" is missing a label (set name= to clarify the condition)`); });
    }
  });

  // A4. reachability from start + can reach an end
  const reach = new Set();
  (function bfs(seed){ const q=[...seed]; while(q.length){const u=q.shift(); if(reach.has(u))continue; reach.add(u); outOf[u].forEach(f=>q.push(f.tgt));} })(starts.map(s=>s.id));
  nodes.forEach(n => { if (!reach.has(n.id)) errors.push(`Node "${n.id}" is NOT reachable from start (disconnected)`); });
  // reaches end: reverse bfs from ends
  const canEnd = new Set();
  (function rbfs(seed){ const q=[...seed]; while(q.length){const u=q.shift(); if(canEnd.has(u))continue; canEnd.add(u); inOf[u].forEach(f=>q.push(f.src));} })(ends.map(e=>e.id));
  nodes.forEach(n => { if (n.kind!=='end' && reach.has(n.id) && !canEnd.has(n.id)) warnings.push(`Node "${n.id}" doesn't lead to any end (dead-end branch?)`); });

  // ───────── (B) COVERAGE vs source ─────────
  const coverage = {};
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
  function fuzzyHas(haystack, needle) {
    const n = norm(needle);
    return haystack.some(h => { const x = norm(h); return x.includes(n) || n.includes(x); });
  }

  if (source.actors?.length) {
    const laneNames = lanes.map(l => l.name);
    const missing = source.actors.filter(a => !fuzzyHas(laneNames, a));
    coverage.actors = { total: source.actors.length, covered: source.actors.length - missing.length, missing };
    missing.forEach(a => warnings.push(`Actor "${a}" from the source has NO corresponding lane — missing role?`));
  }
  if (source.branches?.length) {
    const gwLabels = flows.filter(f => nodeById[f.src]?.kind === 'gateway').map(f => f.name).filter(Boolean);
    const missing = source.branches.filter(b => !fuzzyHas(gwLabels, b));
    coverage.branches = { total: source.branches.length, gatewayOutgoing: gwLabels.length, missing };
    if (missing.length) missing.forEach(b => warnings.push(`Business branch "${b}" has no matching gateway branch yet — missing a branch?`));
  }
  if (source.errors?.length) {
    // an error code (E-xxx) should appear at 1 end or in a branch label
    const haystack = [...nodes.map(n=>n.name), ...flows.map(f=>f.name).filter(Boolean)];
    const missing = source.errors.filter(e => !fuzzyHas(haystack, e) && !haystack.some(h=>norm(h).includes(norm(e))));
    coverage.errors = { total: source.errors.length, missing };
    missing.forEach(e => warnings.push(`Error "${e}" from the source isn't represented yet (end/branch) — missing error handling?`));
  }

  return { ok: errors.length === 0, errors, warnings, coverage };
}

// CLI: node bpmn-semcheck.ts <ir.json> [source.json]
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const ir = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const src = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : {};
  const r = checkIR(ir, src);
  console.log(r.ok ? '✅ IR structural OK' : `❌ ${r.errors.length} structural error`);
  r.errors.forEach(e => console.log('  ✗ ' + e));
  if (r.warnings.length) { console.log(`\n⚠ ${r.warnings.length} warnings:`); r.warnings.forEach(w => console.log('  • ' + w)); }
  if (Object.keys(r.coverage).length) console.log('\nCoverage:', JSON.stringify(r.coverage, null, 2));
  process.exit(r.ok ? 0 : 1);
}
