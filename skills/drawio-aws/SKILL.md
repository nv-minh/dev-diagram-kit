---
name: drawio-aws
description: Use when you need to draw an AWS CLOUD ARCHITECTURE as a draw.io diagram with REAL AWS stencils (mxgraph.aws4.*) — S3, Lambda, DynamoDB, VPC, RDS, etc. — validated against a ground-truth stencil catalog (no hallucinated icons). Trigger `/drawio-aws "<architecture>"` or `/drawio-aws --feature <slug>`. Output is a `.drawio` file (open in draw.io app / web / VS Code). Differs from `/system-design` + `/d2-architect` (C4 logical architecture, rendered with D2, generic boxes) — this skill draws CLOUD-BRAND-ACCURATE AWS architecture in draw.io XML using official AWS service icons.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[\"<architecture description>\"] [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence] [--no-render]"
---

# /drawio-aws — AWS cloud architecture in draw.io (real stencils)

> Architecture family: `/d2-architect` (quick 1-level context, D2, generic boxes) · `/system-design` (multi-level C4, D2, presentation) · **`/drawio-aws` (cloud-brand-accurate AWS, draw.io XML, official AWS icons — this skill)**. Use this when the diagram must show the actual AWS services with their official icons (e.g. for an AWS architecture review / Well-Architected discussion), not a generic logical picture.

## Goal

Draw an **AWS cloud architecture** as a **draw.io `.drawio` file** using **official AWS stencils** (`mxgraph.aws4.*`) looked up from a ground-truth catalog, with a **validator** that guarantees every stencil exists + the layout/design principles hold before delivery.

Output in `docs/{feature}/drawio/` (or `docs/_shared/drawio/` for whole-system architecture):

1. `{slug}.src.ts` — the build-script you write (declares the topology via the engine DSL; no coordinates).
2. `{slug}.drawio` — the emitted draw.io XML (the deliverable; open in draw.io app / diagrams.net / VS Code drawio extension).
3. `{slug}.svg` *(optional, only if the draw.io desktop app is installed + not `--no-render`)* — for embedding in docs.

## Constraints

- **Fixed output** in `docs/{feature}/drawio/` (or `docs/_shared/drawio/` if cross-feature).
- **Stencils come ONLY from the catalog** — never recall/invent an AWS service name. Resolve every icon first via `drawio-build search "s3, lambda, …" --cloud aws`, then use the returned `name` in `icon(id, name, label)`.
- **No coordinates** — the layout engine computes x/y. You declare topology (`icon`/`group`/`frame`/`phantom`/`box`/`grid` + `renderTree`), the engine places everything.
- **Validate is a HARD GATE** — `drawio-build` runs `validateDiagram` (stencils exist, no duplicate ids, no dangling edges, AWS nesting order, Well-Architected advice, geometry/edge audits). A diagram with errors is NOT written; fix and rerun.
- **Run via the shared entry**: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts …`. Do NOT call node/drawio directly.
- **`--feature` optional** — auto-detect from context; whole-system architecture with no `--feature` → `docs/_shared/drawio/`. File already exists → update mode.
- **PNG/SVG export is optional** — needs the draw.io DESKTOP app. Without it, the `.drawio` is still the deliverable (open it in draw.io). Don't block on rendering.
- **Bilingual (mirror input — @../../rules/language.md)**: service labels kept per the real AWS name; flow/role labels mirror the input language.
- **L1 approval** before Write — BA-friendly prose (which services + the main flow + topology type).
- **Idempotent** — 1 slug = 1 file set; re-run → update.

## Inputs

```
/drawio-aws "<architecture description>"                     # e.g. "serverless image processing pipeline"
/drawio-aws --feature <slug> "<description>"                 # attach to a feature
/drawio-aws --feature <slug> --type network "<description>"  # force topology type
/drawio-aws "<whole-system arch>"                            # → docs/_shared/drawio/
```

Topology `--type` (the diagram's flow shape → drives edge style + numbering):
- `pipeline` (default) — left→right data/request flow.
- `hierarchy` — top→bottom tiered.
- `network` — multi-AZ / VPC layout (Region→VPC→AZ→Subnet official groups).
- `hubspoke` — central hub + radial spokes.
- `mesh` — multi-account / service mesh.
- `sequence` — numbered request walkthrough (edges numbered 1., 2., …).

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
aws catalog present?: !`test -f "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/drawio/catalog/aws.json" && echo "✅ aws.json" || echo "❌ missing"`
draw.io desktop (for PNG/SVG)?: !`command -v drawio >/dev/null 2>&1 && echo "✅ $(command -v drawio)" || (test -x /Applications/draw.io.app/Contents/MacOS/draw.io && echo "✅ /Applications/draw.io.app" || echo "⚠️ not found — .drawio still produced, only PNG/SVG export skipped")`

## Flow runtime

```
User calls /drawio-aws [--feature X] [--type T] "<description>"
   │  aws catalog missing? → stop, hint: it ships in-repo (shouldn't happen)
   ▼
1. Read sources by priority: docs/_shared/system-overview.md → docs/X/srs/{feature}-spec.md.
   NO source: interview to EXACTLY the architecture SCOPE (business-language):
   • which AWS services + their role · the main request/data flow · VPC/networking scope (if relevant).
   Don't invent services/flows. Ambiguous → ask.
   ▼
2. L1 plan preview (prose: N services, the flow, topology type). User Y → continue.
   ▼
3. Resolve stencils (ANTI-HALLUCINATION): run ONE batch search for every service:
     bash tsrun.sh skills/drawio/engine/drawio-build.ts search "s3, lambda, dynamodb, …" --cloud aws
   Pick the right `name` for each (the top match is usually it; verify the label).
   ▼
4. Write {slug}.src.ts — a build-script exporting build({ Diagram, icon, group, frame, phantom, box, grid, renderTree, THEME })
   that returns a Diagram. Copy the shape from references/example-aws.ts; swap topology + stencils.
   ▼
5. Build + validate (HARD GATE):
     bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud aws [--render]
   Error → fix the .src.ts, rerun (at most 2–3 times). Advice (warnings) → fix aesthetics before delivering.
   ▼
6. Report: open the .drawio. Tell the user it opens in draw.io app / web / VS Code drawio extension.
```

## How to build

### Step 1 — The build-script `{slug}.src.ts`

Copy `references/example-aws.ts`. Structure:
```ts
export function build({ Diagram, icon, group, frame, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");              // or network/hierarchy/hubspoke/mesh/sequence
  const tree = phantom("root", "", { dir: "row", gap: 60, header: 0 }, [
    icon("s3",   "s3",       "S3 (uploads)"),     // name MUST come from `drawio-build search`
    icon("lam",  "lambda",   "Lambda (process)"),
    icon("ddb",  "dynamodb", "DynamoDB (store)"),
  ]);
  renderTree(d, tree, [40, 40]);
  d.title("Image processing pipeline");
  d.link("s3", "lam", "1 · object created");
  d.link("lam", "ddb", "2 · write record");
  return d;
}
```

**Network/VPC layout** uses official groups in the right nesting order (AWS Cloud→Region→VPC→AZ→Subnet):
```ts
const vpc = group("vpc", "group_vpc", "VPC 10.0.0.0/16", { dir: "row", gap: 30 }, [
  group("az1", "group_availability_zone", "AZ-A", { dir: "col", gap: 20 }, [
    group("priv", "group_subnet", "Private subnet", {}, [ icon("lam","lambda","Lambda") ]),
  ]),
]);
```
The validator enforces the Cloud→Region→VPC→AZ→Subnet→SG nesting order (per `@../drawio/rules/aws-architecture.md`).

### Step 2 — Build + validate

```bash
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts \
  --dir docs/{feature}/drawio --cloud aws [--render]
# validation error → usually a typo'd stencil name. Re-search the name, fix the .src.ts, rerun.
```

## L1 plan preview (BA-friendly template)

> I'll draw the **{name} AWS architecture** as a draw.io diagram at `docs/{...}/drawio/`:
>
> **Services ({N}):** {e.g. Route 53, CloudFront, S3, API Gateway, Lambda, DynamoDB}
> **Flow:** {e.g. "Browser → Route 53 → CloudFront → S3 (static); Browser → API GW → Lambda → DynamoDB (dynamic)"}
> **Topology:** {pipeline | network (VPC) | …}
> **Output:** `{slug}.drawio` {+ `.svg` if draw.io desktop present}.
>
> Apply? (Y / edit)

## Output report

```
✅ AWS architecture (draw.io): docs/{...}/drawio/
   Services: {N} | Topology: {type}
   {slug}.drawio  ← open in draw.io app / web / VS Code drawio extension
   {slug}.svg (if rendered)

Need changes? /drawio-aws --feature {feature} (enters update mode)
```

## Gotchas

- **Stencils only from the catalog** — `drawio-build search` first. A typo'd name (e.g. `s3_storage`) → validation error "Stencil not found" with suggestions; fix and rerun.
- **No coordinates** — `renderTree` places everything. Hand-set x/y violates the model and the validator flags overlaps.
- **Nesting order** — VPC/AZ/Subnet groups must nest Cloud→Region→VPC→AZ→Subnet (the validator enforces it; see `aws-architecture.md`).
- **Don't recolor icons** — AWS service icons keep their category color (the validator flags recoloring; it kills recognizability).
- **Well-Architected advice** — the validator flags real design smells present in the diagram (DB in a public subnet; single NAT across AZs). These are advice, not errors — surface them to the user.
- **`.drawio` is the deliverable** — PNG/SVG export needs the draw.io desktop app (optional). Without it the file still opens everywhere.
- **Just need a generic logical picture?** → use `/system-design` (C4, D2) or `/d2-architect`. This skill is for cloud-brand-accurate AWS with official icons.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/language.md
- @../../rules/diagram-selection.md
- @../../rules/diagram-principles.md (cross-engine validation gate — run before "done")
- @../drawio/rules/aws-architecture.md (AWS-specific: containers, nesting, managed-vs-self-managed)
- @../drawio/rules/principles.md (shared draw.io layout principles)
- @../drawio/rules/diagram-types.md (topology types + when to use each)
- @../drawio/NOTICE.md (engine + catalog provenance — MIT sparklabx; AWS icons © Amazon)
- @./references/example-aws.ts (build-script template — copy its shape)
