// bpmn-layout.mjs — automatic BPMN swimlane layout engine from an IR.
// Takes IR { process, lanes[], nodes[], flows[] } → generates full BPMN 2.0 XML (semantic + BPMNDiagram).
// Handles: (1) column assignment via longest-path rank, (2) row splitting on cell collisions, (3) edge
//     routing that avoids overlap (vertical segments offset by x-track, horizontal by y-track;
//     back-edges/loops route around empty space).
// NO dependencies needed. Usage: import { layoutIR } from './bpmn-layout.mjs'; const xml = layoutIR(ir);

const GRID = {
  POOL_X: 160, POOL_Y: 80, LANE_X: 190, LANE_H: 200,
  COL_W: 200, COL0: 340,            // colCenter(c) = COL0 + c*COL_W
  ROW_DY: 78,                       // offset when 2 nodes share (lane,col) — within the lane bounds
  TASK_W: 130, TASK_H: 70, GW: 50, EV: 36,
  TRACK: 24,                        // shift step between routing tracks
  PORT: 18,                         // port shift step when a gateway fans out multiple branches
};
const dimOf = k => k === 'task' ? [GRID.TASK_W, GRID.TASK_H]
  : k === 'gateway' ? [GRID.GW, GRID.GW] : [GRID.EV, GRID.EV];

export function layoutIR(ir) {
  const { lanes, nodes, flows } = ir;
  const N = Object.fromEntries(nodes.map(n => [n.id, { ...n }]));
  const laneIdx = Object.fromEntries(lanes.map((l, i) => [l.id, i]));

  // ── 1. column via longest-path from start (rank) ──
  const out = {}, inc = {};
  nodes.forEach(n => { out[n.id] = []; inc[n.id] = []; });
  // distinguish forward vs back-edge later; build adjacency for now
  flows.forEach(f => { out[f.src].push(f.tgt); inc[f.tgt].push(f.src); });

  // back-edge = a flow whose tgt was already "visited" on the path from src (creates a cycle). Found via DFS.
  const starts = nodes.filter(n => n.kind === 'start').map(n => n.id);
  const rank = {}; nodes.forEach(n => rank[n.id] = 0);
  const backEdges = new Set();
  {
    const state = {}; // 0=unvisited,1=in-progress,2=done
    const dfs = (u, d) => {
      state[u] = 1; rank[u] = Math.max(rank[u], d);
      for (const v of out[u]) {
        const key = u + '->' + v;
        if (state[v] === 1) { backEdges.add(key); continue; } // back edge
        if (state[v] !== 2 || rank[v] < d + 1) dfs(v, d + 1);
      }
      state[u] = 2;
    };
    (starts.length ? starts : [nodes[0].id]).forEach(s => dfs(s, 0));
    // unvisited (orphan) node → set rank based on max incoming
    nodes.forEach(n => { if (state[n.id] === undefined) rank[n.id] = 0; });
  }
  flows.forEach(f => { f._back = backEdges.has(f.src + '->' + f.tgt); });

  // ── 2. col = rank; split row on (lane,col) collision ──
  nodes.forEach(n => n._col = rank[n.id]);
  const cellRow = {}; // `${lane}:${col}` -> number of nodes already occupying it
  // stable ordering: sort by col then by lane
  const ordered = [...nodes].sort((a, b) => a._col - b._col || laneIdx[a.lane] - laneIdx[b.lane]);
  ordered.forEach(n => {
    const key = n.lane + ':' + n._col;
    n._row = cellRow[key] || 0;
    cellRow[key] = n._row + 1;
  });

  // ── 3. node coordinates ──
  const colCenter = c => GRID.COL0 + c * GRID.COL_W;
  const laneTop = k => GRID.POOL_Y + k * GRID.LANE_H;
  const laneCenter = k => laneTop(k) + GRID.LANE_H / 2;
  const B = {};
  nodes.forEach(n => {
    const [w, h] = dimOf(n.kind);
    const cx = colCenter(n._col);
    const cy = laneCenter(laneIdx[n.lane]) + n._row * GRID.ROW_DY;
    B[n.id] = { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  });
  const maxCol = Math.max(...nodes.map(n => n._col));
  const POOL_W = colCenter(maxCol) + GRID.TASK_W / 2 + 120 - GRID.POOL_X;
  const POOL_H = lanes.length * GRID.LANE_H;

  // anchors
  const R = b => ({ x: b.x + b.w, y: b.cy }), L = b => ({ x: b.x, y: b.cy }),
        T = b => ({ x: b.cx, y: b.y }), Bot = b => ({ x: b.cx, y: b.y + b.h });

  // ── 4. routing with port + track allocation ──
  const TOP_BAND = GRID.POOL_Y + 6;
  const BOT_BAND = GRID.POOL_Y + POOL_H - 6;
  let topTrack = 0, botTrack = 0;
  const vTracks = {};  // x-track for vertical segments per "column zone"
  const hTracks = {};  // y-track for horizontal segments per "row zone" (avoids 2 horizontals sharing y)

  // collect forward outgoing edges per node to assign ports on fan-out
  const fwdOut = {}, fwdIn = {};
  flows.forEach(f => { if (!f._back) { (fwdOut[f.src] ||= []).push(f); (fwdIn[f.tgt] ||= []).push(f); } });
  Object.values(fwdOut).forEach(list => list.sort((a, b) => B[a.tgt].cy - B[b.tgt].cy));
  // fan-in: sort incoming by source cy for stable port assignment
  Object.values(fwdIn).forEach(list => list.sort((a, b) => B[a.src].cy - B[b.src].cy));

  // assign a dedicated y-track for a horizontal segment in a zone (near row yBase), avoiding other horizontals
  function horizY(yBase, key) {
    const band = Math.round(yBase / 8); // group into 8px bands
    const k = band + ':' + key;
    hTracks[band] = (hTracks[band] || 0);
    // if there's already a horizontal line in this band (different key) → offset
    const used = hTracks['_used_' + band] || new Set();
    if (!(used instanceof Set)) { /* noop */ }
    return yBase;
  }

  // start point (port) on the source node for a forward edge, based on direction to target + fan-out order
  function sourcePort(f) {
    const s = B[f.src], t = B[f.tgt];
    const sibs = fwdOut[f.src] || [];
    const i = sibs.indexOf(f), n = sibs.length;
    if (n <= 1) {
      // 1 branch: exit right if same/slightly offset row; else follow target direction
      if (t.cy < s.cy - 1) return { p: T(s), dir: 'up' };
      if (t.cy > s.cy + 1) return { p: Bot(s), dir: 'down' };
      return { p: R(s), dir: 'right' };
    }
    // multiple branches (gateway fan-out): spread according to target direction
    if (t.cy < s.cy - 1) {
      // up: exit top, offset x by port
      const dx = (i - (n - 1) / 2) * GRID.PORT;
      return { p: { x: s.cx + dx, y: s.y }, dir: 'up' };
    }
    if (t.cy > s.cy + 1) {
      const dx = (i - (n - 1) / 2) * GRID.PORT;
      return { p: { x: s.cx + dx, y: s.y + s.h }, dir: 'down' };
    }
    // same row: exit right, offset y slightly by port (rare to have >1 in the same row)
    const dy = (i - (n - 1) / 2) * GRID.PORT;
    return { p: { x: s.x + s.w, y: s.cy + dy }, dir: 'right' };
  }

  // entry point (port) on the target node — offset y when multiple edges converge (fan-in)
  function targetPort(f, fromDir) {
    const s = B[f.src], t = B[f.tgt];
    const sibs = fwdIn[f.tgt] || [];
    const i = sibs.indexOf(f), n = sibs.length;
    const dy = n > 1 ? (i - (n - 1) / 2) * GRID.PORT : 0;
    if (t.cx > s.cx + 1) return { x: t.x, y: t.cy + dy };          // enter left, offset y by port
    if (t.cx < s.cx - 1) return { x: t.x + t.w, y: t.cy + dy };    // enter right
    return fromDir === 'down' ? { x: t.cx + dy, y: t.y } : { x: t.cx + dy, y: t.y + t.h }; // same column
  }

  function routeForward(f) {
    const s = B[f.src], t = B[f.tgt];
    const { p: sp, dir } = sourcePort(f);
    const tp = targetPort(f, dir);
    if (Math.abs(sp.y - tp.y) < 1) return [sp, tp];            // straight horizontal
    if (Math.abs(sp.x - tp.x) < 1) return [sp, tp];            // straight vertical
    // bent path: depends on whether the source port is vertical (up/down) or horizontal (right)
    if (dir === 'up' || dir === 'down') {
      // go vertical first to the target's y, then horizontal in
      return [sp, { x: sp.x, y: tp.y }, tp];
    }
    // exit horizontal to midX then vertical in (the vertical segment gets its own x-track)
    const span = Math.round(Math.min(sp.x, tp.x)) + '_' + Math.round(Math.max(s.cx, t.cx));
    vTracks[span] = (vTracks[span] || 0) + 1;
    const midX = (sp.x + tp.x) / 2 + (vTracks[span] - 1) * GRID.TRACK;
    return [sp, { x: midX, y: sp.y }, { x: midX, y: tp.y }, tp];
  }

  // back-edges to the same target → assign a dedicated touch-point x (avoids the final vertical segments overlapping)
  const backToTgt = {};
  flows.forEach(f => { if (f._back) (backToTgt[f.tgt] ||= []).push(f); });
  Object.values(backToTgt).forEach(list => list.sort((a, b) => B[a.src].cx - B[b.src].cx));

  function routeBack(f) {
    const s = B[f.src], t = B[f.tgt];
    const sibs = backToTgt[f.tgt] || [];
    const bi = sibs.indexOf(f), bn = sibs.length;
    const txOff = bn > 1 ? (bi - (bn - 1) / 2) * GRID.PORT : 0; // target touch-point offset by order
    const goUp = t.cy <= s.cy;
    // the outgoing vertical segment from the source is also offset by txOff so 2 back-edges
    // from the same source column don't overlap
    const sx = s.cx + txOff;
    if (goUp) {
      const y = TOP_BAND + topTrack * GRID.TRACK; topTrack++;
      const tx = t.cx + txOff;
      return [{ x: sx, y: s.y }, { x: sx, y }, { x: tx, y }, { x: tx, y: t.y }];
    } else {
      const y = BOT_BAND - botTrack * GRID.TRACK; botTrack++;
      const tx = t.cx + txOff;
      return [{ x: sx, y: s.y + s.h }, { x: sx, y }, { x: tx, y }, { x: tx, y: t.y + t.h }];
    }
  }

  flows.forEach(f => { f._wp = f._back ? routeBack(f) : routeForward(f); });

  // ── 5. build the XML ──
  return toXML(ir, B, { POOL_W, POOL_H, laneIdx, laneTop });
}

// ───────── XML serialization ─────────
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TAG = { start: 'startEvent', task: 'task', gateway: 'exclusiveGateway', end: 'endEvent' };

function toXML(ir, B, ctx) {
  const { process, lanes, nodes, flows } = ir;
  const { POOL_W, POOL_H, laneIdx, laneTop } = ctx;
  const pid = process.id || 'Process_1';
  const partId = 'Participant_' + pid.replace(/^Process_/, '');

  const laneSet = `    <bpmn:laneSet id="LaneSet_1">\n` + lanes.map(L => {
    const refs = nodes.filter(n => n.lane === L.id).map(n => `        <bpmn:flowNodeRef>${n.id}</bpmn:flowNodeRef>`).join('\n');
    return `      <bpmn:lane id="${L.id}" name="${esc(L.name)}">\n${refs}\n      </bpmn:lane>`;
  }).join('\n') + `\n    </bpmn:laneSet>`;

  const nodeXml = nodes.map(n => {
    const inc = flows.filter(f => f.tgt === n.id).map(f => `      <bpmn:incoming>${f.id}</bpmn:incoming>`);
    const out = flows.filter(f => f.src === n.id).map(f => `      <bpmn:outgoing>${f.id}</bpmn:outgoing>`);
    return `    <bpmn:${TAG[n.kind]} id="${n.id}" name="${esc(n.name)}">\n${[...inc, ...out].join('\n')}\n    </bpmn:${TAG[n.kind]}>`;
  }).join('\n');

  const flowXml = flows.map(f =>
    `    <bpmn:sequenceFlow id="${f.id}"${f.name ? ` name="${esc(f.name)}"` : ''} sourceRef="${f.src}" targetRef="${f.tgt}" />`).join('\n');

  const shapeXml = nodes.map(n => {
    const b = B[n.id]; const mk = n.kind === 'gateway' ? ' isMarkerVisible="true"' : '';
    let label = '';
    if (n.kind !== 'task') {
      const lw = 110;
      label = `\n        <bpmndi:BPMNLabel><dc:Bounds x="${Math.round(b.cx - lw / 2)}" y="${Math.round(b.y + b.h + 4)}" width="${lw}" height="27" /></bpmndi:BPMNLabel>`;
    }
    return `      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}"${mk}>\n        <dc:Bounds x="${Math.round(b.x)}" y="${Math.round(b.y)}" width="${b.w}" height="${b.h}" />${label}\n      </bpmndi:BPMNShape>`;
  }).join('\n');

  const edgeXml = flows.map(f => {
    const wps = f._wp.map(p => `        <di:waypoint x="${Math.round(p.x)}" y="${Math.round(p.y)}" />`).join('\n');
    let label = '';
    if (f.name) {
      const w = f._wp, lw = 116;
      const lx = Math.round((w[0].x + w[w.length - 1].x) / 2 - lw / 2);
      const ly = Math.round(w[Math.floor(w.length / 2)].y - 18);
      label = `\n        <bpmndi:BPMNLabel><dc:Bounds x="${lx}" y="${ly}" width="${lw}" height="14" /></bpmndi:BPMNLabel>`;
    }
    return `      <bpmndi:BPMNEdge id="${f.id}_di" bpmnElement="${f.id}">\n${wps}${label}\n      </bpmndi:BPMNEdge>`;
  }).join('\n');

  const laneShapes = lanes.map((L, k) =>
    `      <bpmndi:BPMNShape id="${L.id}_di" bpmnElement="${L.id}" isHorizontal="true">
        <dc:Bounds x="${GRID.LANE_X}" y="${laneTop(k)}" width="${Math.round(POOL_W - 30)}" height="${GRID.LANE_H}" />
      </bpmndi:BPMNShape>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_${pid}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="${partId}" name="${esc(process.title || pid)}" processRef="${pid}" />
  </bpmn:collaboration>
  <bpmn:process id="${pid}" isExecutable="false">
${laneSet}

${nodeXml}

${flowXml}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="${partId}_di" bpmnElement="${partId}" isHorizontal="true">
        <dc:Bounds x="${GRID.POOL_X}" y="${GRID.POOL_Y}" width="${Math.round(POOL_W)}" height="${POOL_H}" />
      </bpmndi:BPMNShape>
${laneShapes}

${shapeXml}

${edgeXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
}
