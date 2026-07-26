---
name: drawio-sequence
description: Use when you need a UML SEQUENCE diagram as a draw.io `.drawio` file — participants as vertical lifelines, messages flowing top-to-bottom over time (who calls whom, in order). Sync calls, returns, async signals, self-calls. Trigger `/drawio-sequence "<flow>"` or `/drawio-sequence --feature <slug>`. Differs from `/sequence` (Mermaid, inline in Markdown) — this is a standalone, editable, brand-neutral draw.io diagram. For architecture, NOT sequence → use `/d2-architect` or the cloud `/drawio-*` skills.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[\"<flow description>\"] [--feature <slug>] [--no-render]"
---

# /drawio-sequence — UML sequence diagram in draw.io

> Sibling of the `/drawio-*` cloud skills, same engine — but this one draws **UML sequence** (lifelines ×
> time-ordered messages), not a cloud topology. Use for request/response flows, integration sequences, and
> "who-calls-whom-in-what-order" walkthroughs. For inline sequence in a Markdown doc → `/sequence` (Mermaid).

## Goal

Draw a **UML sequence diagram** as a draw.io `.drawio` file: N vertical **lifelines** (one per participant)
on a top-to-bottom **time axis**, with horizontal **message** arrows (sync call / return / async signal /
self-call) at increasing depths. Output in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`):
`{slug}.src.ts` + `{slug}.drawio` (+ optional `{slug}.svg`).

## Why draw.io for sequence

The draw.io engine lays a sequence out declaratively — you declare participants + an ordered message list,
`renderSequence` (engine/sequence.ts) computes every coordinate. Messages are **raw edges** pinned at a shared
fractional Y, so they are straight horizontals (the orthogonal A* router is bypassed entirely). No cloud
stencils are needed; participants are plain labelled headers (actors get a stick-figure `umlActor`).

## Constraints

- **Fixed output** in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`).
- **No coordinates** — `renderSequence` places the lifelines + messages.
- **No cloud stencils** — participants are headers, not cloud icons (use the cloud `/drawio-*` skills for
  brand-accurate architecture). A catalog is still loaded for validation; pass `--cloud aws` (any shipped
  cloud works — it is unused here).
- **Validate is a HARD GATE** — errors → not written, fix + rerun.
- **Run via the shared entry**: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts …`.
- **PNG/SVG export optional** — needs draw.io desktop; `.drawio` is the deliverable.
- **Bilingual** (mirror input — @../../rules/language.md).
- **L1 approval** before Write. **Idempotent**.

## Inputs

```
/drawio-sequence "<flow description>" [--feature <slug>]
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
draw.io desktop (PNG/SVG)?: !`command -v drawio >/dev/null 2>&1 && echo "✅ $(command -v drawio)" || echo "⚠️ not found — .drawio still produced"`

## Flow

1. Read sources → identify the **participants** (human actors + services/systems) and the **ordered message
   flow**: synchronous calls, their returns, async events, and self-calls. Order participants left→right in
   call locality; order messages top→bottom in time.
2. L1 plan preview (prose: the participant list + the message walkthrough). User Y → continue.
3. Write `{slug}.src.ts` exporting `build({ Diagram, renderSequence })` → Diagram (copy
   `references/example-sequence.ts`).
4. Build + validate (hard gate):
   `bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud aws [--render]`.
5. Report — open `.drawio`.

## How to build — the build-script

Copy `references/example-sequence.ts`:
```ts
export function build({ Diagram, renderSequence }) {
  const d = new Diagram("uml_sequence");

  // Participants left→right in call order. actor:true → stick-figure header.
  d.participant("u", "User", { actor: true });
  d.participant("api", "API Gateway");
  d.participant("svc", "Service");
  d.participant("bus", "Event bus");

  // Messages top→bottom = time.
  d.message("u", "api", "request");                       // sync — solid, filled block arrow
  d.message("api", "svc", "call (sync)");
  d.message("svc", "api", "result", { reply: true });     // return — dashed, open arrow
  d.message("svc", "bus", "domain.event", { async: true }); // async — solid, open arrow
  d.message("api", "u", "200 OK", { reply: true });

  renderSequence(d, [40, 40]);   // places lifelines + messages — call BEFORE d.title (it sets the page size)
  d.title("Sequence — request / response + async event");
  return d;
}
```

### Message kinds
| Opt | Arrow | Meaning |
|---|---|---|
| *(default)* | solid + filled block | synchronous call |
| `{ reply: true }` | dashed + open | return / reply |
| `{ async: true }` | solid + open | asynchronous signal (e.g. publish to a bus) |
| `from === to` | small rightward loop | self-call |

Direction is automatic (left/right from the participants' order). Keep the flow to one main scenario per
diagram; split alternates into a second `.drawio`.

## L1 preview / Output / Gotchas

- **Order participants by call locality** (caller near callee) → fewer long arrows spanning many lifelines.
- **Reply messages go back** — declare them with `{ reply: true }` so they draw dashed/open in UML convention.
- **`.drawio` is the deliverable**; PNG/SVG optional (draw.io desktop).
- **No activation bars / notes in v1** — lifelines + messages only (activation bars are a future addition).

## References

- @../../rules/ba-conventions.md · @../../rules/approval-gate.md · @../../rules/naming-conventions.md · @../../rules/language.md · @../../rules/diagram-selection.md
- @../../rules/diagram-principles.md (cross-engine validation gate)
- @../drawio/engine/sequence.ts (the layout — `renderSequence`, `participant`, `message`)
- @../drawio/rules/principles.md · @../drawio/rules/diagram-types.md
- @../drawio/NOTICE.md (provenance — engine ported MIT sparklabx; sequence.ts is kit-native)
- @./references/example-sequence.ts (build-script template)
