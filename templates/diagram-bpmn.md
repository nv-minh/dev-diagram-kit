# BPMN Template — IR-driven (2-layer architecture)

## Principles

## IR schema (`{slug}.ir.json`)

```jsonc
{
  "process": { "id": "Process_{slug}", "title": "Display process name" },
  "lanes": [                                  // order = order of horizontal bands (top→bottom)
    { "id": "Lane_learner", "name": "Learner" },
    { "id": "Lane_system",  "name": "Auth system" }
  ],
  "nodes": [
    { "id": "Start_1",  "kind": "start",   "lane": "Lane_learner", "name": "Start trigger" },
    { "id": "Task_a",   "kind": "task",    "lane": "Lane_system",  "name": "Verb + business object" },
    { "id": "GW_a",     "kind": "gateway", "lane": "Lane_system",  "name": "Decision question?" },
    { "id": "End_ok",   "kind": "end",     "lane": "Lane_learner", "name": "Success outcome" },
    { "id": "End_err",  "kind": "end",     "lane": "Lane_system",  "name": "Error outcome" }
  ],
  "flows": [
    { "id": "Flow_1", "src": "Start_1", "tgt": "Task_a" },
    { "id": "Flow_2", "src": "GW_a", "tgt": "End_ok",  "name": "Pass" },     // name REQUIRED for gateway branch
    { "id": "Flow_3", "src": "GW_a", "tgt": "End_err", "name": "Fail" }
  ]
}
```

## Source facts (`{slug}.src.json`) — for semcheck to cross-check the source

```json
{
  "actors":   ["Learner", "Auth system", "Email service"],
  "branches": ["Fail", "Email exists", "Token expired"],
  "errors":   ["Email already registered", "Link expired"]
}
```

- `actors` = every actor in UC Section b → semcheck verifies each one has a lane.
- `branches` = every branch in UC Section d → semcheck verifies a corresponding gateway-branch exists.
- `errors` = related E-codes → semcheck verifies an end/handling branch exists.
- Semcheck matches approximately (strip accents, lowercase) → warns if the IR is missing something, does NOT block (final judgment is business).

## How to infer IR from a UC (gap-driven, no invention)

| Source in the UC | → IR |
|---|---|
| Section b Actors (primary + supporting) | `lanes[]` |
| Section a/c trigger | `start` node |
| Each step in Section d Expected result | `task` node (lane = the actor doing that step) |
| Each "If... then..." in Section d Branches | `gateway` + `flow`s whose `name` = the condition |
| Main result + each error-path | `end` node (one per outcome) |
| Section g Related FR / Error Matrix | cross-check errors in src.json |

**Set the lane for a node** = whoever is responsible for that step (learner enters, system validates, email service sends...). Column/coordinate NOT declared — the longest-path engine computes it automatically.

## IR rules (semcheck-enforced — structural, MUST pass)

- Exactly 1 `start`; ≥1 `end`.
- `gateway` has ≥2 outgoing; each outgoing has a `name`.
- Every node reachable from start + can reach an end.
- No self-loop; unique id; lane/src/tgt references valid.
- Loop (e.g. revise→draft, retry) is valid — the engine accepts a back-edge and routes it around an empty band.

## Pipeline (the engine handles it, the AI only runs commands)

```
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/bpmn/engine/bpmn-build.ts  # every .ir.json → semcheck → layout → .bpmn → _viewer.html
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/bpmn/engine/bpmn-build.ts --verify  # semcheck (structural+coverage) + validate layout of every .bpmn
```

## File `bpmn/{feature}-bpmn-index.md`

```yaml
---
type: bpmn-index
feature: {{feature}}
status: draft
updated: {{date}}
---
# {{feature}} — BPMN Index
| Process | File | Lanes | Gateways | Viewer |
|---|---|---|---|---|
| {{title}} | `{{slug}}.bpmn` | {{n}} | {{k}} | `_viewer.html#{{slug}}` |
```

## Cross-ref

- `srs/{{feature}}-flows.md` — Mermaid activity (lightweight, renders in Obsidian). BPMN for the OMG standard + import into BPM tools.
- `.claude/rules/diagram-selection.md` — when to use `/activity` vs `/bpmn`.
