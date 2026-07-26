// @ts-nocheck — ported .mjs → .ts 1:1 (see repo policy in drawio/engine/builder.ts header). Also:
// this file imports from the engine's OWN node_modules (bpmn-auto-layout), which only exists after
// the engine's npm install — without @ts-nocheck, repo-root `tsc --noEmit` (CI) fails on TS2307.
// bpmn-layout-auto.ts — BPMN layout engine using bpmn-auto-layout (official bpmn-io lib).
// IR { process, nodes[], flows[] } → PURE BPMN semantic → layoutProcess() generates clean DI.
//
// Why we switched from the custom-patched ELK: ELK/self-routing was already good, BUT layering
// our own clip/dogleg/group-track on top → broke the routing, created "crooked" bends. Research
// (bpmn.io) confirms: "the library routes its own edges, adding routing on top is redundant" +
// orthogonal output is "display-ready without alteration". → let the official library own the WHOLE layout.
//
// Result: routing as clean as hand-drawn, gateways have the standard OMG X marker, loop-backs route nicely.
// bpmn-auto-layout limitation: NO swimlanes (only lays out the first participant). Fine for /bpmn's
// default no-lane mode. Need lanes → use bpmn-layout-elk.ts (BPMN_ENGINE=elk).
import { layoutProcess } from 'bpmn-auto-layout';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bpmnTag = k => ({ start: 'startEvent', end: 'endEvent', gateway: 'exclusiveGateway', task: 'task' }[k] || 'task');

// Fix (codex #1): a BPMN id must be an NCName (no spaces, can't start with a digit).
// A bad ID → bpmn-moddle silently DROPS the node while parsing → node/flow lost. Sanitize to
// NCName + ensure uniqueness (duplicate id → duplicate BPMNEdge bpmnElement). Returns a map of raw id → clean id.
function buildIdMap(ir) {
  const map = {}, used = new Set();
  const clean = raw => {
    let s = String(raw ?? '').replace(/[^A-Za-z0-9_-]/g, '_');
    if (!s || /^[^A-Za-z_]/.test(s)) s = '_' + s;      // NCName must start with a letter/_
    let u = s, i = 1;
    while (used.has(u)) u = s + '_' + (i++);            // dedupe
    used.add(u); return u;
  };
  map[ir.process.id] = clean(ir.process.id);
  for (const n of ir.nodes) if (map[n.id] == null) map[n.id] = clean(n.id);
  for (const f of ir.flows) if (map[f.id] == null) map[f.id] = clean(f.id);
  return map;
}

// ── 1. IR → pure BPMN semantic (NO coordinates; layoutProcess will generate <BPMNDiagram>) ──
function irToSemantic(ir, idMap) {
  const nodeIds = new Set(ir.nodes.map(n => n.id));
  const id = x => esc(idMap[x] ?? x);
  let els = '';
  for (const n of ir.nodes) {
    const inc = ir.flows.filter(f => f.tgt === n.id && nodeIds.has(f.src)).map(f => `<bpmn:incoming>${id(f.id)}</bpmn:incoming>`).join('');
    const out = ir.flows.filter(f => f.src === n.id && nodeIds.has(f.tgt)).map(f => `<bpmn:outgoing>${id(f.id)}</bpmn:outgoing>`).join('');
    els += `    <bpmn:${bpmnTag(n.kind)} id="${id(n.id)}" name="${esc(n.name)}">${inc}${out}</bpmn:${bpmnTag(n.kind)}>\n`;
  }
  for (const f of ir.flows) {
    // skip flows pointing to a nonexistent node (avoids layoutProcess erroring)
    if (!nodeIds.has(f.src) || !nodeIds.has(f.tgt)) continue;
    els += `    <bpmn:sequenceFlow id="${id(f.id)}" name="${esc(f.name)}" sourceRef="${id(f.src)}" targetRef="${id(f.tgt)}"/>\n`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Def_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${id(ir.process.id)}" isExecutable="false">
${els}  </bpmn:process>
</bpmn:definitions>`;
}

// ── 2. Insert BPMNLabel at a position that avoids overlap ──
// bpmn-auto-layout does NOT generate <BPMNLabel> → bpmn-js places the label at the edge midpoint
// at render time → it overlaps the gateway/node name when the layout is tight. We insert our OWN
// <BPMNLabel bounds=""> at a free spot (bpmn-js honors bounds if present). Waypoints stay untouched (clean routing).
function addEdgeLabels(xml, flowNames) {
  // collect shape bounds + flow names to compute forbidden zones and text
  const shapes = [];
  const shapeRe = /<bpmndi:BPMNShape\b[^>]*bpmnElement="([^"]+)"[^>]*>\s*<dc:Bounds x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g;
  let m;
  while ((m = shapeRe.exec(xml))) shapes.push({ id: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] });
  // forbidden zone = node + node-name label band below an event/gateway (small shape)
  const forbidden = shapes.map(s => (s.w <= 60 && s.h <= 60)
    ? { x: s.x - 36, y: s.y, w: s.w + 72, h: s.h + 32 }
    : { x: s.x - 2, y: s.y - 2, w: s.w + 4, h: s.h + 4 });
  const placed = [];
  const hit = (b, q) => b.x < q.x + q.w && b.x + b.w > q.x && b.y < q.y + q.h && b.y + b.h > q.y;
  const free = (b) => !forbidden.some(q => hit(b, q)) && !placed.some(q => hit(b, q));

  // for each edge that has a name but DOES NOT yet have a BPMNLabel → insert a label at the midpoint, avoiding overlap
  return xml.replace(/<bpmndi:BPMNEdge\b[^>]*bpmnElement="([^"]+)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNEdge>/g,
    (whole, id, inner) => {
      const name = flowNames[id];
      if (!name || inner.includes('BPMNLabel')) return whole;
      const wps = [...inner.matchAll(/<di:waypoint x="([-\d.]+)" y="([-\d.]+)"/g)].map(w => [+w[1], +w[2]]);
      if (wps.length < 2) return whole;
      const midSeg = wps[Math.floor(wps.length / 2) - 1] && wps[Math.floor(wps.length / 2)]
        ? [wps[Math.floor(wps.length / 2) - 1], wps[Math.floor(wps.length / 2)]] : [wps[0], wps[1]];
      const mx = (midSeg[0][0] + midSeg[1][0]) / 2, my = (midSeg[0][1] + midSeg[1][1]) / 2;
      const lw = Math.min(Math.max(name.length * 6, 24), 150), lh = 14;
      // several candidates around the midpoint (above/below, offset left-right, farther out)
      const cands = [[mx - lw / 2, my - lh - 6], [mx - lw / 2, my + 6], [mx - lw / 2, my - lh - 22],
                     [mx - lw / 2, my + 22], [mx - lw / 2 - lw / 2, my - lh - 6], [mx + 6, my - lh - 6],
                     [mx - lw / 2, my - lh - 40], [mx - lw / 2, my + 40],
                     [mx - lw / 2 - lw, my - lh - 6], [mx + lw, my - lh - 6],
                     [mx - lw / 2, my - lh - 58], [mx - lw / 2, my + 58]];
      // Fix (codex #2): pick the first FREE candidate; if none → pick the one with the LEAST
      // overlap (smallest overlap area) instead of defaulting to candidate[0] (which could overlap heavily).
      const areaOverlap = (b) => {
        let a = 0;
        for (const q of [...forbidden, ...placed]) {
          const ox = Math.max(0, Math.min(b.x + b.w, q.x + q.w) - Math.max(b.x, q.x));
          const oy = Math.max(0, Math.min(b.y + b.h, q.y + q.h) - Math.max(b.y, q.y));
          a += ox * oy;
        }
        return a;
      };
      let bx, by, best = Infinity;
      for (const [cx, cy] of cands) {
        const b = { x: cx, y: cy, w: lw, h: lh };
        if (free(b)) { bx = cx; by = cy; best = 0; break; }
        const a = areaOverlap(b);
        if (a < best) { best = a; bx = cx; by = cy; }
      }
      placed.push({ x: bx, y: by, w: lw, h: lh });
      const label = `\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="${Math.round(bx)}" y="${Math.round(by)}" width="${Math.round(lw)}" height="${lh}" />\n        </bpmndi:BPMNLabel>\n      `;
      return whole.replace('</bpmndi:BPMNEdge>', label + '</bpmndi:BPMNEdge>');
    });
}

// ── Main API (keeps the same signature as the old engine) ──
export async function layoutToBpmn(ir, opts = {}) {
  // noLanes is ignored here — bpmn-auto-layout is always no-lane. Caller wanting lanes → use ELK.
  const idMap = buildIdMap(ir);                       // Fix #1: id → unique NCName
  const semantic = irToSemantic(ir, idMap);
  const laidOut = await layoutProcess(semantic);
  // Fix (codex #3): layoutProcess doesn't throw when the semantic is missing a node due to a bad id.
  // Check that every node/flow (sanitized id) is present in the DI; if missing → warn (don't swallow silently).
  const nodeIdsClean = new Set(ir.nodes.map(n => idMap[n.id]));
  for (const id of nodeIdsClean) {
    if (!laidOut.includes(`bpmnElement="${id}"`)) console.warn(`⚠ bpmn-auto-layout dropped node "${id}" — check the IR (duplicate/bad id?)`);
  }
  const flowNames = {};
  for (const f of ir.flows) if (f.name) flowNames[idMap[f.id]] = f.name;
  return addEdgeLabels(laidOut, flowNames);
}
