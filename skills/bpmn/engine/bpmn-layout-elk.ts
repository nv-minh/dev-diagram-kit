// @ts-nocheck — ported .mjs → .ts 1:1 (see repo policy in drawio/engine/builder.ts header):
// engine files migrated from plain JS skip the type-audit; kit-native .ts files stay fully checked.
// bpmn-layout-elk.ts — BPMN layout engine using ELK (replaces the custom-built bpmn-layout.ts).
// IR { process, lanes[], nodes[], flows[] } → BPMN 2.0 XML (semantic + BPMNDiagram).
//
// Why ELK: the old custom-built engine routed back-edges by shooting up to the top of the canvas → messy.
// ELK (Sugiyama layered) computes coordinates + routing properly. We just declare the structure.
//
// Techniques inherited from Stieges/bpmn-generator (MIT):
//   1. partitioning → swimlane (nodes in the same lane go into the same band, ELK handles X/Y)
//   2. MULTI_EDGE wrapping → reduces crossings when there are many edges
//   3. topo-sort + order lanes by flow → happy path runs left→right, fewer diagonal jumps
//   4. orthogonal endpoint clipping → arrows attach exactly to the circle/diamond/rect boundary
//
// lanes optional: IR without lanes (or noLanes=true) → flat layout, no swimlane.
import ELK from 'elkjs/lib/elk.bundled.js';

const SIZE = { start: [36, 36], end: [36, 36], gateway: [50, 50], task: [120, 70] };
const dim = k => SIZE[k] || SIZE.task;

const LANE_HEADER_W = 30;   // room reserved for the lane name (vertical, on the left)
const LANE_PADDING = 24;
const POOL_MARGIN = 20;

// ── Topological order + order lanes by flow ──
// Sort nodes in flow order (BFS from start) so ELK prioritizes the happy path.
// Returns: sorted nodes, lanes ordered by first appearance in the flow.
function orderByFlow(ir) {
  const adj = {};
  ir.nodes.forEach(n => { adj[n.id] = []; });
  ir.flows.forEach(f => { (adj[f.src] ||= []).push(f.tgt); });
  const starts = ir.nodes.filter(n => n.kind === 'start').map(n => n.id);
  const seedIds = starts.length ? starts : (ir.nodes[0] ? [ir.nodes[0].id] : []);
  const seen = new Set(), order = [];
  const q = [...seedIds];
  while (q.length) {
    const id = q.shift();
    if (seen.has(id)) continue;
    seen.add(id); order.push(id);
    for (const t of (adj[id] || [])) if (!seen.has(t)) q.push(t);
  }
  // unreachable (orphan) nodes are still kept, at the end
  for (const n of ir.nodes) if (!seen.has(n.id)) order.push(n.id);
  const nodeById = Object.fromEntries(ir.nodes.map(n => [n.id, n]));
  // Fix (codex #3): a flow can point to an id that doesn't exist in nodes[] → order
  // ends up with garbage ids. Filter them out, keep only real nodes (avoids undefined when dereffed later).
  const sortedNodes = order.map(id => nodeById[id]).filter(Boolean);

  // order lanes by when a node from that lane first appears in the flow order
  const laneFirstSeen = {};
  sortedNodes.forEach((n, i) => { if (n.lane != null && laneFirstSeen[n.lane] == null) laneFirstSeen[n.lane] = i; });
  const orderedLanes = [...(ir.lanes || [])].sort(
    (a, b) => (laneFirstSeen[a.id] ?? 1e9) - (laneFirstSeen[b.id] ?? 1e9)
  );
  return { sortedNodes, orderedLanes };
}

// ── ELK layout ──
async function runElk(ir, sortedNodes, orderedLanes, noLanes) {
  const elk = new ELK();
  // Fix (codex #2, extended): ELK partitioning requires a CONTIGUOUS partition index starting at 0.
  // An empty lane (no nodes) creates a "hole" in the sequence → ELK throws "must not be negative".
  // → only partition by lanes that ACTUALLY have nodes, re-indexed contiguously.
  const lanesWithNodes = orderedLanes.filter(L => sortedNodes.some(n => n.lane === L.id));
  const useLanes = !noLanes && lanesWithNodes.length > 0;
  const lanePart = {};
  lanesWithNodes.forEach((l, i) => { lanePart[l.id] = i; });

  const children = sortedNodes.map(n => {
    const [w, h] = dim(n.kind);
    const lo = {};
    if (useLanes && lanePart[n.lane] != null) lo['elk.partitioning.partition'] = String(lanePart[n.lane]);
    return { id: n.id, width: w, height: h, layoutOptions: lo };
  });
  // Fix (codex #3, extended): ELK throws if an edge points to a node not present in children.
  // Filter out garbage flows (src/tgt not a real node) BEFORE feeding them into ELK.
  const nodeIdSet = new Set(sortedNodes.map(n => n.id));
  const edges = ir.flows
    .filter(f => nodeIdSet.has(f.src) && nodeIdSet.has(f.tgt))
    .map(f => ({ id: f.id, sources: [f.src], targets: [f.tgt] }));

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.partitioning.activate': useLanes ? 'true' : 'false',
      'elk.layered.spacing.nodeNodeBetweenLayers': '70',
      'elk.spacing.nodeNode': '50',
      'elk.spacing.edgeNode': '25',
      'elk.layered.wrapping.strategy': 'MULTI_EDGE',
      'elk.layered.wrapping.additionalEdgeSpacing': '40',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.padding': `[top=${LANE_PADDING},left=${LANE_PADDING + (useLanes ? LANE_HEADER_W : 0)},bottom=${LANE_PADDING},right=${LANE_PADDING}]`,
    },
    children, edges,
  };
  const laid = await elk.layout(graph);
  return { laid, useLanes, lanePart };
}

// ── Orthogonal endpoint clipping (following the EXACT geometry of each shape) ──
// Arrows must "stick" to the node boundary like in draw.io. ELK routes to the center; we clip the
// endpoint to the real boundary. IMPORTANT: a gateway is a DIAMOND — its edges are slanted, only
// touching the bounding box at the 4 mid-edge points. Clipping it like a rect → the arrow gap shows
// (the bug you saw). For a diamond we SNAP the attach point to the correct sharp vertex based on the
// incoming direction; for rect/circle we clip to the edge.
function clipToShape(shape, kind, endPt, prevPt) {
  const cx = shape.x + shape.w / 2, cy = shape.y + shape.h / 2;
  const x0 = shape.x, y0 = shape.y, x1 = shape.x + shape.w, y1 = shape.y + shape.h;
  const [ex, ey] = endPt, [px, py] = prevPt;
  const horiz = Math.abs(ex - px) >= Math.abs(ey - py);
  const dir = horiz ? Math.sign(ex - px || cx - px) : Math.sign(ey - py || cy - py);

  if (kind === 'gateway') {
    // Diamond: 4 vertices at (cx,y0)(cx,y1)(x0,cy)(x1,cy). The orthogonal arrow attaches
    // straight to the sharp vertex matching the incoming direction → always attaches cleanly, no gap.
    if (horiz) return dir >= 0 ? [x0, cy] : [x1, cy];   // entering from left/right → left/right vertex
    return dir >= 0 ? [cx, y0] : [cx, y1];              // entering from top/bottom → top/bottom vertex
  }
  if (kind === 'start' || kind === 'end') {
    // Circle: attach to the point on the circle along the main axis (stay orthogonal → use the center of the other axis).
    const r = Math.min(shape.w, shape.h) / 2;
    if (horiz) return dir >= 0 ? [cx - r, cy] : [cx + r, cy];
    return dir >= 0 ? [cx, cy - r] : [cx, cy + r];
  }
  // rect (task): clip to the edge, keep the perpendicular-axis coordinate (clamped inside the node so it doesn't drift outside).
  if (horiz) { const yy = Math.min(Math.max(ey, y0 + 4), y1 - 4); return dir >= 0 ? [x0, yy] : [x1, yy]; }
  const xx = Math.min(Math.max(ex, x0 + 4), x1 - 4);
  return dir >= 0 ? [xx, y0] : [xx, y1];
}

// Choose the OUTGOING vertex of a gateway (diamond) based on the direction to the target (dx,dy = target - gateway).
// Fan-out: each branch uses the vertex on the dominant axis of its direction → 2 branches going
// different directions exit via 2 different vertices, no stub overlap. Horizontal-dominant → left/right vertex; vertical-dominant → top/bottom.
function gatewayExitVertex(shape, dx, dy) {
  const cx = shape.x + shape.w / 2, cy = shape.y + shape.h / 2;
  const x0 = shape.x, y0 = shape.y, x1 = shape.x + shape.w, y1 = shape.y + shape.h;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? [x1, cy] : [x0, cy];  // right/left
  return dy >= 0 ? [cx, y1] : [cx, y0];                                     // bottom/top
}

// Insert an L-bend point so the segment from `neighbor` to the attach point `clip` is perpendicular.
// clip sits on the node boundary (diamond vertex / circle edge). If neighbor isn't aligned
// horizontally/vertically with clip → add 1 point so the final segment hits the node along an axis.
// Attach point on the left/right edge (fixed x) → elbow = (clip.x, neighbor.y): go vertical then horizontal.
// Attach point on the top/bottom edge (fixed y) → elbow = (neighbor.x, clip.y): go horizontal then vertical.
function orthoElbow(clip, neighbor) {
  const [cx, cy] = clip, [nx, ny] = neighbor;
  if (Math.abs(cx - nx) < 1 || Math.abs(cy - ny) < 1) return null; // already aligned
  // the final segment hits the node horizontally when |Δx|>|Δy| on the approach segment
  // → keep y = cy for the final horizontal segment: elbow at (nx, cy)
  return [nx, cy];
}

// ── Post-routing: remove overlapping segments between edges ──
// Group segments on the same axis/line into an overlap group, then assign a track once for the
// whole group. Middle segments are shifted whole; first/last segments use a dogleg to keep the
// anchor attached correctly to the node boundary.
const OVERLAP_TRACK = 12;   // shift step
const OVERLAP_MIN = 16;     // only handle overlap beyond this (ignore harmless short stubs)
const ENDPOINT_STUB = 10;   // short stub leaving the node before jogging to its own track
const EPS = 0.5;
const ovLen = (a1, a2, b1, b2) => Math.max(0, Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)));
const trackOffset = slot => {
  if (slot === 0) return 0;
  const step = Math.ceil(slot / 2);
  return (slot % 2 ? -1 : 1) * step * OVERLAP_TRACK;
};
const segKey = s => `${s.edgeId}:${s.i}`;

function collectSegments(edgeWps) {
  const refs = [];
  for (const [edgeId, pts] of Object.entries(edgeWps)) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const horiz = Math.abs(a[1] - b[1]) < EPS;
      const vert = Math.abs(a[0] - b[0]) < EPS;
      if (!horiz && !vert) continue;
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS) continue;
      const orient = horiz ? 'h' : 'v';
      const axis = horiz ? a[1] : a[0];
      const p1 = horiz ? a[0] : a[1];
      const p2 = horiz ? b[0] : b[1];
      refs.push({
        edgeId, i, orient,
        axis, axisKey: Math.round(axis),
        from: Math.min(p1, p2),
        to: Math.max(p1, p2),
        endpoint: i === 0 ? 'start' : (i === pts.length - 2 ? 'end' : 'mid'),
      });
    }
  }
  return refs;
}

function overlapGroups(edgeWps) {
  const byLine = new Map();
  for (const s of collectSegments(edgeWps)) {
    const key = `${s.orient}:${s.axisKey}`;
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(s);
  }

  const groups = [];
  for (const line of byLine.values()) {
    const n = line.length;
    if (n < 2) continue;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (line[i].edgeId === line[j].edgeId) continue;
      if (ovLen(line[i].from, line[i].to, line[j].from, line[j].to) > OVERLAP_MIN) union(i, j);
    }
    const buckets = new Map();
    for (let i = 0; i < n; i++) {
      const root = find(i);
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root).push(line[i]);
    }
    for (const g of buckets.values()) {
      const edgeCount = new Set(g.map(s => s.edgeId)).size;
      if (edgeCount > 1) groups.push(g);
    }
  }
  return groups;
}

function assignTrackOffsets(groups) {
  const offsets = new Map();
  for (const group of groups) {
    const ordered = [...group].sort((a, b) =>
      a.from - b.from || a.to - b.to || a.edgeId.localeCompare(b.edgeId) || a.i - b.i
    );
    ordered.forEach((s, slot) => {
      const off = trackOffset(slot);
      if (!off) return;
      const key = segKey(s);
      const prev = offsets.get(key);
      if (prev == null || Math.abs(off) > Math.abs(prev.offset)) offsets.set(key, { ...s, offset: off });
    });
  }
  return [...offsets.values()];
}

function shiftMiddleSegment(pts, i, orient, offset) {
  if (orient === 'h') {
    pts[i][1] += offset;
    pts[i + 1][1] += offset;
  } else {
    pts[i][0] += offset;
    pts[i + 1][0] += offset;
  }
}

function doglegEndpoint(pts, i, orient, offset) {
  if (!offset) return;
  const isStart = i === 0;
  const a = pts[i], b = pts[i + 1];
  if (isStart) {
    if (orient === 'h') {
      const dir = Math.sign(b[0] - a[0]) || 1;
      const stubLen = Math.min(ENDPOINT_STUB, Math.max(4, Math.abs(b[0] - a[0]) / 2));
      const stub = [a[0] + dir * stubLen, a[1]];
      const jog = [stub[0], a[1] + offset];
      b[1] += offset;
      pts.splice(1, 0, stub, jog);
    } else {
      const dir = Math.sign(b[1] - a[1]) || 1;
      const stubLen = Math.min(ENDPOINT_STUB, Math.max(4, Math.abs(b[1] - a[1]) / 2));
      const stub = [a[0], a[1] + dir * stubLen];
      const jog = [a[0] + offset, stub[1]];
      b[0] += offset;
      pts.splice(1, 0, stub, jog);
    }
  } else {
    if (orient === 'h') {
      const dir = Math.sign(a[0] - b[0]) || -1;
      const stubLen = Math.min(ENDPOINT_STUB, Math.max(4, Math.abs(b[0] - a[0]) / 2));
      const stub = [b[0] + dir * stubLen, b[1]];
      const jog = [stub[0], b[1] + offset];
      a[1] += offset;
      pts.splice(i + 1, 0, jog, stub);
    } else {
      const dir = Math.sign(a[1] - b[1]) || -1;
      const stubLen = Math.min(ENDPOINT_STUB, Math.max(4, Math.abs(b[1] - a[1]) / 2));
      const stub = [b[0], b[1] + dir * stubLen];
      const jog = [b[0] + offset, stub[1]];
      a[0] += offset;
      pts.splice(i + 1, 0, jog, stub);
    }
  }
}

function applyTrackOffset(edgeWps, s) {
  const pts = edgeWps[s.edgeId];
  if (!pts || s.i >= pts.length - 1) return;
  if (s.endpoint === 'mid') shiftMiddleSegment(pts, s.i, s.orient, s.offset);
  else doglegEndpoint(pts, s.i, s.orient, s.offset);
}

function normalizeWaypoints(pts) {
  for (let i = pts.length - 2; i >= 0; i--) {
    if (Math.abs(pts[i][0] - pts[i + 1][0]) < EPS && Math.abs(pts[i][1] - pts[i + 1][1]) < EPS) pts.splice(i + 1, 1);
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const sameH = Math.abs(a[1] - b[1]) < EPS && Math.abs(b[1] - c[1]) < EPS;
    const sameV = Math.abs(a[0] - b[0]) < EPS && Math.abs(b[0] - c[0]) < EPS;
    if (sameH || sameV) { pts.splice(i, 1); i--; }
  }
}

function deOverlapEdges(edgeWps) {
  for (let pass = 0; pass < 5; pass++) {
    const moves = assignTrackOffsets(overlapGroups(edgeWps));
    if (!moves.length) break;
    moves
      .sort((a, b) => a.edgeId.localeCompare(b.edgeId) || b.i - a.i)
      .forEach(m => applyTrackOffset(edgeWps, m));
    Object.values(edgeWps).forEach(normalizeWaypoints);
  }
}

// ── Place edge label avoiding overlap with other labels + nodes ──
// Default label at the edge midpoint; if it overlaps a placed box or a node → try shifting up/down.
function placeEdgeLabel(pts, text, placed, pos, kindById) {
  const w = Math.min(Math.max(text.length * 6, 24), 140), h = 14;
  const mid = pts[Math.floor(pts.length / 2)] || pts[0];
  const bx = mid[0] - w / 2, by = mid[1] - h - 4;   // default: above the midpoint
  // Node zone to avoid: includes the node's LABEL TEXT. For start/end/gateway the name is
  // displayed BELOW the shape (~28px, wider than the shape) → extend the avoidance box downward.
  const nodeBoxes = [];
  for (const id in pos) {
    const s = pos[id]; const k = kindById && kindById[id];
    if (k === 'start' || k === 'end' || k === 'gateway') {
      nodeBoxes.push({ x: s.x - 30, y: s.y, w: s.w + 60, h: s.h + 30 }); // + label band below
    } else {
      nodeBoxes.push({ x: s.x, y: s.y, w: s.w, h: s.h });
    }
  }
  const hit = (x, y, box) => x < box.x + box.w && x + w > box.x && y < box.y + box.h && y + h > box.y;
  const overlaps = (x, y) => placed.some(q => hit(x, y, q)) || nodeBoxes.some(b => hit(x, y, b));
  const cands = [[bx, by], [bx, mid[1] + 6], [bx, by - 16], [bx, mid[1] + 24],
                 [bx - w / 2 - 8, by], [bx + w / 2 + 8, by], [bx, by - 30], [bx, mid[1] + 40]];
  for (const [x, y] of cands) if (!overlaps(x, y)) return { x, y, w, h };
  return { x: bx, y: by, w, h };
}

// ── Build BPMN XML ──
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Fix (codex #5): id/ref must also be escaped — a quote or < in the IR would break the XML.
// A BPMN id should be an NCName; we escape it so it at least doesn't break the XML (attribute injection).
const escId = s => esc(s);
const bpmnTag = k => ({ start: 'startEvent', end: 'endEvent', gateway: 'exclusiveGateway', task: 'task' }[k] || 'task');

export async function layoutToBpmn(ir, opts = {}) {
  const noLanes = !!opts.noLanes;
  const { sortedNodes, orderedLanes } = orderByFlow(ir);
  const { laid, useLanes } = await runElk(ir, sortedNodes, orderedLanes, noLanes);

  const kindById = Object.fromEntries(ir.nodes.map(n => [n.id, n.kind]));
  const pos = {};
  for (const c of laid.children) pos[c.id] = { x: c.x, y: c.y, w: c.width, h: c.height };

  // waypoints from ELK sections + clip both ends
  const wp = {};
  for (const e of (laid.edges || [])) {
    const pts = [];
    for (const s of (e.sections || [])) {
      pts.push([s.startPoint.x, s.startPoint.y]);
      for (const b of (s.bendPoints || [])) pts.push([b.x, b.y]);
      pts.push([s.endPoint.x, s.endPoint.y]);
    }
    wp[e.id] = pts;
  }

  const esrc = {}, etgt = {};
  ir.flows.forEach(f => { esrc[f.id] = f.src; etgt[f.id] = f.tgt; });

  let flowEls = '', shapes = '', diEdges = '';
  const nodeIds = new Set(ir.nodes.map(n => n.id));
  for (const n of ir.nodes) {
    const inc = ir.flows.filter(f => f.tgt === n.id).map(f => `<bpmn:incoming>${escId(f.id)}</bpmn:incoming>`).join('');
    const out = ir.flows.filter(f => f.src === n.id).map(f => `<bpmn:outgoing>${escId(f.id)}</bpmn:outgoing>`).join('');
    flowEls += `    <bpmn:${bpmnTag(n.kind)} id="${escId(n.id)}" name="${esc(n.name)}">${inc}${out}</bpmn:${bpmnTag(n.kind)}>\n`;
    const p = pos[n.id];
    if (p) shapes += `      <bpmndi:BPMNShape bpmnElement="${escId(n.id)}"><dc:Bounds x="${Math.round(p.x)}" y="${Math.round(p.y)}" width="${p.w}" height="${p.h}"/></bpmndi:BPMNShape>\n`;
  }
  // ── Phase A: compute waypoints for every edge (clip + fan-out), XML NOT written yet ──
  const edgeWps = {};      // id → [[x,y],...]  (used for de-overlap + pool bounds)
  const validFlows = [];
  for (const f of ir.flows) {
    // Fix (codex #3): drop flows pointing to a nonexistent node (avoids crash + garbage XML)
    if (!nodeIds.has(f.src) || !nodeIds.has(f.tgt)) continue;
    validFlows.push(f);
    flowEls += `    <bpmn:sequenceFlow id="${escId(f.id)}" name="${esc(f.name)}" sourceRef="${escId(f.src)}" targetRef="${escId(f.tgt)}"/>\n`;
    let pts = (wp[f.id] || []).map(p => [...p]);
    const sp = pos[f.src], tp = pos[f.tgt];
    if (!pts || pts.length < 2) {
      pts = [[sp.x + sp.w, sp.y + sp.h / 2], [tp.x, tp.y + tp.h / 2]];
    }
    // Source-side clip. GATEWAY fan-out follows the target direction (target above→top vertex...).
    if (sp && kindById[f.src] === 'gateway' && tp) {
      const gcx = sp.x + sp.w / 2, gcy = sp.y + sp.h / 2;
      const tcx = tp.x + tp.w / 2, tcy = tp.y + tp.h / 2;
      const c = gatewayExitVertex(sp, tcx - gcx, tcy - gcy);
      const elbow = orthoElbow(c, pts[1]);
      pts[0] = c;
      if (elbow) pts.splice(1, 0, elbow);
    } else if (sp) {
      pts[0] = clipToShape(sp, kindById[f.src], pts[0], pts[1]);
    }
    // Target-side: always clip (the arrow must attach to the target node).
    if (tp) {
      const last = pts.length - 1;
      const c = clipToShape(tp, kindById[f.tgt], pts[last], pts[last - 1]);
      const elbow = orthoElbow(c, pts[last - 1]);
      pts[last] = c;
      if (elbow) pts.splice(last, 0, elbow);
    }
    edgeWps[f.id] = pts;
  }

  // ── Phase B: remove overlapping segments between edges (shift tracks) ──
  deOverlapEdges(edgeWps);

  // ── Phase C: write BPMNEdge XML + labels avoiding overlap ──
  const labelBoxes = [];   // placed label zones, to avoid overlapping each other
  for (const f of validFlows) {
    const pts = edgeWps[f.id];
    const w = pts.map(([x, y]) => `<di:waypoint x="${Math.round(x)}" y="${Math.round(y)}"/>`).join('');
    let labelXml = '';
    if (f.name) {
      const lb = placeEdgeLabel(pts, String(f.name), labelBoxes, pos, kindById);
      labelBoxes.push(lb);
      labelXml = `<bpmndi:BPMNLabel><dc:Bounds x="${Math.round(lb.x)}" y="${Math.round(lb.y)}" width="${Math.round(lb.w)}" height="${Math.round(lb.h)}"/></bpmndi:BPMNLabel>`;
    }
    diEdges += `      <bpmndi:BPMNEdge bpmnElement="${escId(f.id)}">${w}${labelXml}</bpmndi:BPMNEdge>\n`;
  }

  // lane set + pool DI (only when useLanes)
  let laneSet = '', poolDI = '', collab = '', planeEl = ir.process.id;
  if (useLanes) {
    const laneList = orderedLanes.map(L => {
      const refs = ir.nodes.filter(n => n.lane === L.id).map(n => `<bpmn:flowNodeRef>${escId(n.id)}</bpmn:flowNodeRef>`).join('');
      return `<bpmn:lane id="${escId(L.id)}" name="${esc(L.name)}">${refs}</bpmn:lane>`;
    }).join('\n        ');
    laneSet = `    <bpmn:laneSet id="LaneSet_1">\n        ${laneList}\n    </bpmn:laneSet>\n`;

    // Fix (codex #4): include waypoints in the point set so the pool/lane fully encloses the
    // edge, not just the nodes. ELK's back-edges/wrapped edges often extend outside node bounds.
    const allWpPts = Object.values(edgeWps).flat();
    const all = ir.nodes.map(n => ({ ...pos[n.id], lane: n.lane })).filter(p => p.x != null);
    const xsAll = [...all.map(p => p.x), ...all.map(p => p.x + p.w), ...allWpPts.map(p => p[0])];
    const minX = Math.min(...xsAll), maxX = Math.max(...xsAll);
    const poolX = minX - LANE_HEADER_W - POOL_MARGIN, poolW = (maxX - poolX) + POOL_MARGIN;
    // Fix (codex #2): an empty lane → ps=[] makes Math.min(...[])=Infinity. Fallback to the
    // nearest node bounds; if there's no node at all, drop that lane from the DI.
    const laneBounds = orderedLanes.map(L => {
      const ps = all.filter(p => p.lane === L.id);
      if (!ps.length) return { id: L.id, empty: true };
      return { id: L.id, top: Math.min(...ps.map(p => p.y)) - LANE_PADDING, bot: Math.max(...ps.map(p => p.y + p.h)) + LANE_PADDING };
    }).filter(b => !b.empty);
    if (laneBounds.length) {
      const poolTop = Math.min(...laneBounds.map(b => b.top)), poolBot = Math.max(...laneBounds.map(b => b.bot));
      poolDI = `      <bpmndi:BPMNShape bpmnElement="Participant_1" isHorizontal="true"><dc:Bounds x="${Math.round(poolX)}" y="${Math.round(poolTop)}" width="${Math.round(poolW)}" height="${Math.round(poolBot - poolTop)}"/></bpmndi:BPMNShape>\n`;
      laneBounds.forEach((b, i) => {
        const top = i === 0 ? poolTop : Math.round((laneBounds[i - 1].bot + b.top) / 2);
        const bot = i === laneBounds.length - 1 ? poolBot : Math.round((b.bot + laneBounds[i + 1].top) / 2);
        poolDI += `      <bpmndi:BPMNShape bpmnElement="${escId(b.id)}" isHorizontal="true"><dc:Bounds x="${Math.round(poolX + LANE_HEADER_W)}" y="${top}" width="${Math.round(poolW - LANE_HEADER_W)}" height="${bot - top}"/></bpmndi:BPMNShape>\n`;
      });
    }
    collab = `\n  <bpmn:collaboration id="Collaboration_1">\n    <bpmn:participant id="Participant_1" name="${esc(ir.process.title)}" processRef="${escId(ir.process.id)}"/>\n  </bpmn:collaboration>`;
    planeEl = 'Collaboration_1';
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Def_1" targetNamespace="http://bpmn.io/schema/bpmn">${collab}
  <bpmn:process id="${escId(ir.process.id)}" isExecutable="false">
${laneSet}${flowEls}  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diagram_1">
    <bpmndi:BPMNPlane id="Plane_1" bpmnElement="${planeEl}">
${poolDI}${shapes}${diEdges}    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}
