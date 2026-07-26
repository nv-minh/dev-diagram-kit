// @ts-nocheck
// kit-native UML sequence layout for the draw.io engine (NOT vendored — see ../NOTICE.md).
//
// Sequence diagrams are a different paradigm from the tree/cloud engine: N vertical lifelines (one per
// participant) on a top-to-bottom TIME axis, with horizontal "message" arrows pinned at each step's Y.
//
// How messages bypass the orthogonal A* router: they are RAW edges — `d.link(src, tgt, label, { style })`
// records a spec, and builder.ts `_buildEdges` flags any `opts.style` edge `{raw:true}` (line ~424) so
// `_emitEdge` appends the caller's style verbatim instead of routing. Each message is therefore a straight
// horizontal line between two dashed lifeline "spines", pinned at a shared fractional Y (exitY == entryY).
//
// Usage (build-script):
//   const d = new Diagram("uml_sequence");
//   d.participant("uw", "Underwriter", { actor: true });
//   d.participant("con", "contract-svc");
//   d.participant("pri", "pricing-svc");
//   d.message("uw", "con", "bind");                         // sync  — solid, filled block arrow
//   d.message("con", "pri", "final rate");                  // sync
//   d.message("pri", "con", "rate", { reply: true });       // return — dashed, open arrow
//   d.message("con", "bus", "contract.bound", { async: true }); // async — solid, open arrow
//   renderSequence(d, [40, 40]);
//   d.title("Bind flow");   // call AFTER renderSequence (it sets the page size)
//   return d;

export function renderSequence(d, [x, y] = [40, 40], opts = {}) {
  const {
    laneW = 180, headerW = 120, headerH = 48, stepH = 44, pad = 24,
    stroke = "#5A6B7B", headerFill = "#E8F0FE", actorFill = "#E8F0FE",
  } = opts;

  const parts = d.seqParticipants || [];
  const msgs = d.seqMessages || [];
  if (!parts.length) throw new Error("renderSequence: declare participants first via d.participant(id, label).");

  const ids = new Set(parts.map((p) => p.id));
  for (const m of msgs) {
    if (!ids.has(m.from)) throw new Error(`renderSequence: message from unknown participant "${m.from}"`);
    if (!ids.has(m.to)) throw new Error(`renderSequence: message to unknown participant "${m.to}"`);
  }
  const idx = {}; parts.forEach((p, i) => (idx[p.id] = i));

  const n = parts.length;
  const totalW = pad * 2 + n * laneW;
  const totalH = pad + headerH + Math.max(msgs.length, 1) * stepH + pad;
  d.page = [totalW, totalH];           // title() / toXML read this for the page size

  const top = y + pad;
  const spineTop = top + headerH;
  const spineBottom = y + totalH - pad;
  const spineH = Math.max(spineBottom - spineTop, stepH);

  // 1. lifelines — header box + dashed spine (ob:false → not a router obstacle; long arrows may pass over
  //    neighbouring lifelines, which is correct for sequence diagrams).
  for (let i = 0; i < n; i++) {
    const p = parts[i];
    const cx = x + pad + i * laneW + laneW / 2;   // lane centre = lifeline centre
    const hx = cx - headerW / 2;                   // header centred on the lifeline → gap = laneW - headerW between headers
    if (p.actor) {
      const aw = 36;
      d._put(p.id, "1", cx - aw / 2, top, aw, headerH,
        `shape=umlActor;whiteSpace=wrap;html=1;fillColor=${actorFill};strokeColor=${stroke};fontColor=#1A1A1A;fontSize=10;verticalAlign=bottom;`, p.label);
    } else {
      d._put(p.id, "1", hx, top, headerW, headerH,
        `rounded=0;whiteSpace=wrap;html=1;fillColor=${headerFill};strokeColor=${stroke};fontColor=#1A1A1A;fontSize=10;fontStyle=1;`, p.label);
    }
    d.R[p.id].ob = false;
    // dashed lifeline spine. A 2px-wide white-filled rect with a dashed stroke reads as a dashed vertical
    // line (the white fill is invisible against the page, only the dashed border shows). White fill (not
    // fillColor=none) so the geometry audit doesn't treat the spine as a "transparent leaf" the messages
    // wrongly anchor to — the dashed border IS the visible lifeline.
    d._put(`${p.id}_spine`, "1", cx - 1, spineTop, 2, spineH,
      `rounded=0;fillColor=#FFFFFF;strokeColor=${stroke};strokeWidth=1;dashed=1;dashPattern=4 3;`, "");
    d.R[`${p.id}_spine`].ob = false;
  }

  // 2. messages — horizontal arrows, one per time-step, pinned at a shared fractional Y (straight line).
  for (let s = 0; s < msgs.length; s++) {
    const m = msgs[s];
    const yMid = spineTop + (s + 0.5) * stepH;
    const fy = (yMid - spineTop) / spineH;   // identical on both spines → drawio draws a straight horizontal
    const head = m.reply ? "endArrow=open;dashed=1;" : m.async ? "endArrow=open;" : "endArrow=block;";
    const src = `${m.from}_spine`, tgt = `${m.to}_spine`;
    let style;
    if (m.from === m.to) {
      // self-call: a small loop to the right of the lifeline, anchored near this step's Y.
      style = `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=1;exitY=${(fy - 0.015).toFixed(4)};exitDx=0;exitDy=0;entryX=1;entryY=${(fy + 0.015).toFixed(4)};entryDx=0;entryDy=0;${head}fontSize=10;fontColor=#1A1A1A;strokeColor=${stroke};strokeWidth=1;labelBackgroundColor=#FFFFFF;verticalLabelPosition=right;verticalAlign=middle;`;
    } else {
      const right = idx[m.to] >= idx[m.from];
      const ex = right ? 1 : 0, en = right ? 0 : 1;
      style = `edgeStyle=none;rounded=0;html=1;exitX=${ex};exitY=${fy.toFixed(4)};exitDx=0;exitDy=0;entryX=${en};entryY=${fy.toFixed(4)};entryDx=0;entryDy=0;${head}fontSize=10;fontColor=#1A1A1A;strokeColor=${stroke};strokeWidth=1;labelBackgroundColor=#FFFFFF;verticalLabelPosition=top;verticalAlign=bottom;`;
    }
    d.link(src, tgt, m.label || "", { style });
  }
}
