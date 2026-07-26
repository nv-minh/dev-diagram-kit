---
name: drawio-databricks
description: Use when you need to draw a DATABRICKS LAKEHOUSE / data-platform architecture as a draw.io diagram with REAL Databricks stencils — Workspace, Delta Lake, SQL Warehouse, MLflow/ML, Unity Catalog, etc. — validated against a ground-truth stencil catalog (no hallucinated icons). Trigger `/drawio-databricks "<architecture>"` or `/drawio-databricks --feature <slug>`. Output is a `.drawio` file. Differs from `/system-design` + `/d2-architect` (C4 logical, D2, generic boxes) — this draws a Databricks-brand-accurate lakehouse with official Databricks icons.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[\"<lakehouse description>\"] [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence] [--no-render]"
---

# /drawio-databricks — Databricks lakehouse in draw.io (real stencils)

> Sibling of `/drawio-aws`. Same engine + model; this one targets Databricks. Use for lakehouse / data-platform / ML architecture. For a generic logical picture → `/system-design` / `/d2-architect`.

## Goal

Draw a **Databricks lakehouse architecture** as a draw.io `.drawio` file using **official Databricks stencils** from a ground-truth catalog, validated before delivery. Output in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`): `{slug}.src.ts` + `{slug}.drawio` (+ optional `{slug}.svg`).

## Catalog

`databricks.json` **ships in-repo** (~400KB) — no download needed (unlike azure/gcp). Loaded alongside the tooling packs (bigdata/database/…).

## Constraints

- **Fixed output** in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`).
- **Stencils only from the catalog** — `drawio-build search "…" --cloud databricks` first; use the returned `name`. Never invent.
- **No coordinates** — `renderTree` places everything.
- **Validate is a HARD GATE** — errors → not written, fix + rerun.
- **Run via the shared entry**: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts …`.
- **PNG/SVG export optional** — needs draw.io desktop; `.drawio` is the deliverable.
- **Bilingual** (mirror input — @../../rules/language.md).
- **L1 approval** before Write. **Idempotent**.

## Inputs

```
/drawio-databricks "<lakehouse description>" [--feature <slug>] [--type pipeline|hierarchy|hubspoke|sequence]
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
databricks catalog present?: !`test -f "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/drawio/catalog/databricks.json" && echo "✅ databricks.json ready" || echo "❌ missing"`
draw.io desktop (PNG/SVG)?: !`command -v drawio >/dev/null 2>&1 && echo "✅ $(command -v drawio)" || echo "⚠️ not found — .drawio still produced"`

## Flow runtime (same shape as /drawio-aws)

1. Read sources → interview the lakehouse SCOPE (ingest sources → bronze/silver/gold → serving/BI + ML; governance via Unity Catalog).
2. L1 plan preview (prose). User Y → continue.
3. **Resolve stencils**: `bash tsrun.sh skills/drawio/engine/drawio-build.ts search "workspace, delta, sql warehouse, machine learning, unity catalog" --cloud databricks`.
4. Write `{slug}.src.ts` exporting `build({ Diagram, icon, group, frame, phantom, box, renderTree })` → Diagram (copy `references/example-databricks.ts`).
5. Build + validate (hard gate): `bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud databricks [--render]`.
6. Report — open `.drawio`.

## How to build — the build-script

Copy `references/example-databricks.ts`:
```ts
export function build({ Diagram, icon, phantom, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0 }, [
    icon("ws", "azure_workspace_gateway", "Databricks Workspace"),
    icon("delta", "delta", "Delta Lake"),
    icon("sqlw", "azure_sql_data_warehouses", "SQL Warehouse"),
    icon("ml", "machine_learning", "MLflow / ML"),
    icon("uc", "unity_catalog", "Unity Catalog"),
  ]);
  renderTree(d, tree, [40, 60]);
  d.link("ws", "delta", "1 · write");
  d.link("delta", "sqlw", "2 · BI queries");
  d.link("delta", "ml", "3 · train");
  d.link("uc", "delta", "4 · governs");
  return d;
}
```

## L1 preview / Output / Gotchas

Same shape as `/drawio-aws`. Databricks-specific:
- **databricks.json ships in-repo** — no download (unlike azure/gcp).
- **Stencils only from catalog** — typo'd name → validation error with suggestions.
- **`.drawio` is the deliverable**; PNG/SVG optional (draw.io desktop).

## References

- @../../rules/ba-conventions.md · @../../rules/approval-gate.md · @../../rules/naming-conventions.md · @../../rules/language.md · @../../rules/diagram-selection.md
- @../../rules/diagram-principles.md (cross-engine validation gate)
- @../drawio/rules/databricks-architecture.md (lakehouse layers + medallion)
- @../drawio/rules/principles.md · @../drawio/rules/diagram-types.md
- @../drawio/NOTICE.md (provenance — MIT sparklabx; Databricks icons © Databricks)
- @./references/example-databricks.ts (build-script template)
