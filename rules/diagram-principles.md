# diagram-principles.md — what "valid" means for a diagram (the `diagram-validate` gate)

Every diagram a skill ships MUST pass `scripts/diagram-validate.ts` before reporting done. This rule
is the spec for what that gate checks, per engine. Run it as the last step:

```bash
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/diagram-validate.ts docs/{feature}/<file-or-dir>
```

- **exit 0** → clean. Ship it.
- **exit 2** → only warnings/advice (no errors). Ship, but surface the advice to the user.
- **exit 1** → ERRORS. Do NOT report done — fix the source and rerun.

## Shared principles (every engine)

These apply regardless of engine, where the source is parseable:

- **Compiles / renders.** The #1 audit — a diagram that doesn't render is broken. The validator runs
  the engine's compiler (mmdc / d2 / plantuml / bpmn-moddle / draw.io parse).
- **No placeholder labels.** `TODO`, `FIXME`, `xxx`, `…`, `TBD` left in a node/edge → warning. Fill in
  real text before delivering.
- **No unbalanced quotes.** A label with an unescaped `"` breaks rendering → error.
- **No empty node labels** (where detectable). A node with no text adds nothing.
- **Bilingual labels** (per `language.md`) when the doc is bilingual — the label mirror is the
  reviewer's job (auto-detection is unreliable; not machine-enforced).

## Per-engine depth (what the gate actually checks)

| Engine | Compile | Stencil/id integrity | Graph structure | Design principles |
|---|---|---|---|---|
| **draw.io** (`/drawio-*`) | parse `mxGraphModel` | stencil refs exist in catalog · duplicate cell id · dangling edge ref | full (via `parseCells`) | AWS nesting order · Well-Architected (DB in public subnet, single NAT across AZs) · palette ≤8 · font ≤4 sizes · icon-size consistency · edge routing/crossings/through-node · floating arrowheads |
| **BPMN** (`/bpmn`) | bpmn-moddle parse + `<BPMNDiagram>` | — | start/end reachability · gateway ≥2 branches · no orphan · actor↔lane coverage | swimlane membership · overlapping lines · task clipping |
| **Mermaid** (`/sequence /activity /state /erd /mindmap /journey /timeline`) | mmdc compile | — | — *(graph checks are NOT enforced on sequence/journey/mindmap/timeline — no node-graph semantics, would false-positive)* | placeholder/quote lint only |
| **D2** (`/d2-* /system-design /dfd`) | d2 compile | — | — | placeholder/quote lint only |
| **PlantUML** (`/activity-swimlane /usecase-diagram`) | plantuml compile (local jar) | — | — | placeholder/quote lint only |

## Why graph checks (orphan / undefined-ref) are full only for draw.io + BPMN

Orphan-node and undefined-edge-ref checks need a RELIABLE parse of the node/edge graph. draw.io
(`parseCells`) and BPMN (bpmn-moddle) give that. Mermaid flowchart/state/ER *could* be regex-parsed,
but the payoff is low (those engines already fail to compile on a dangling ref) and the false-positive
risk on sequence/journey/mindmap/timeline/plantuml is high — a diagram-time tool can't read intent,
and false positives erode trust faster than misses. So the gate enforces compile + lint there, and
relies on the skill's L1 review + the diagram-reviewer agent for content correctness. (See
`@./diagram-style.md` for the visual tokens, `@./diagram-selection.md` for which diagram to use.)
