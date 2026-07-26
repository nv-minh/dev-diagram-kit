---
name: drawio-gcp
description: Use when you need to draw a GOOGLE CLOUD architecture as a draw.io diagram with REAL GCP stencils (mxgraph.google_cloud.*) — GKE, Cloud SQL, Cloud Storage, Load Balancing, BigQuery, Cloud Functions, etc. — validated against a ground-truth stencil catalog (no hallucinated icons). Trigger `/drawio-gcp "<architecture>"` or `/drawio-gcp --feature <slug>`. Output is a `.drawio` file. Differs from `/system-design` + `/d2-architect` (C4 logical, D2, generic boxes) — this draws CLOUD-BRAND-ACCURATE GCP architecture with official Google Cloud service icons.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[\"<architecture description>\"] [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence] [--no-render]"
---

# /drawio-gcp — Google Cloud architecture in draw.io (real stencils)

> Sibling of `/drawio-aws`. Same engine + model; this one targets Google Cloud (`mxgraph.google_cloud.*`). Use when the diagram must show actual GCP services with their official icons. For a generic logical picture → `/system-design` / `/d2-architect`.

## Goal

Draw a **Google Cloud architecture** as a draw.io `.drawio` file using **official GCP stencils** from a ground-truth catalog, validated (stencils exist + design principles) before delivery. Output in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`): `{slug}.src.ts` + `{slug}.drawio` (+ optional `{slug}.svg`).

## Catalog — must be downloaded first

`gcp.json` is **large (~1.9MB) and NOT shipped in-repo**. On first use:
```
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/drawio-catalog-ensure.sh gcp"
```

## Constraints

- **Fixed output** in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`).
- **Stencils only from the catalog** — `drawio-build search "…" --cloud gcp` first; use the returned `name`. Never invent.
- **No coordinates** — `renderTree` places everything.
- **Validate is a HARD GATE** — errors → not written, fix + rerun.
- **Run via the shared entry**: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts …`.
- **PNG/SVG export optional** — needs draw.io desktop; `.drawio` is the deliverable.
- **Bilingual** (mirror input — @../../rules/language.md); service names kept per real GCP names.
- **L1 approval** before Write. **Idempotent**.

## Inputs

```
/drawio-gcp "<architecture description>" [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence]
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
gcp catalog present?: !`test -f "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/drawio/catalog/gcp.json" && echo "✅ gcp.json ready" || echo "❌ missing — run: bash scripts/drawio-catalog-ensure.sh gcp"`
draw.io desktop (PNG/SVG)?: !`command -v drawio >/dev/null 2>&1 && echo "✅ $(command -v drawio)" || echo "⚠️ not found — .drawio still produced"`

## Flow runtime (same shape as /drawio-aws)

1. Read sources → interview the architecture SCOPE (which GCP services + roles + main flow).
2. L1 plan preview (prose). User Y → continue.
3. **Resolve stencils**: `bash tsrun.sh skills/drawio/engine/drawio-build.ts search "load balancer, gke, cloud sql, …" --cloud gcp`.
4. Write `{slug}.src.ts` exporting `build({ Diagram, icon, group, frame, phantom, box, renderTree })` → Diagram (copy `references/example-gcp.ts`).
5. Build + validate (hard gate): `bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud gcp [--render]`.
6. Report — open `.drawio`.

## How to build — the build-script

Copy `references/example-gcp.ts`:
```ts
export function build({ Diagram, icon, phantom, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0 }, [
    icon("lb", "application_load_balancer", "Cloud Load Balancing"),
    icon("gke", "gcp_gke_on_prem", "GKE"),
    icon("sql", "gcp_cloud_sql", "Cloud SQL"),
    icon("bq", "bigquery", "BigQuery"),
  ]);
  renderTree(d, tree, [40, 60]);
  d.link("lb", "gke", "1 · route");
  d.link("gke", "sql", "2 · read/write");
  d.link("gke", "bq", "3 · analytics");
  return d;
}
```

## L1 preview / Output / Gotchas

Same shape as `/drawio-aws`. GCP-specific:
- **gcp.json not shipped** — `drawio-catalog-ensure.sh gcp` first.
- **Stencils only from catalog** — typo'd name → validation error with suggestions.
- **`.drawio` is the deliverable**; PNG/SVG optional (draw.io desktop).

## References

- @../../rules/ba-conventions.md · @../../rules/approval-gate.md · @../../rules/naming-conventions.md · @../../rules/language.md · @../../rules/diagram-selection.md
- @../../rules/diagram-principles.md (cross-engine validation gate)
- @../drawio/rules/gcp-architecture.md (GCP containers + nesting)
- @../drawio/rules/principles.md · @../drawio/rules/diagram-types.md
- @../drawio/NOTICE.md (provenance — MIT sparklabx; GCP icons © Google)
- @./references/example-gcp.ts (build-script template)
