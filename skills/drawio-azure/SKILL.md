---
name: drawio-azure
description: Use when you need to draw an AZURE cloud architecture as a draw.io diagram with REAL Azure stencils (mxgraph.azure.*) — AKS, Cosmos DB, App Gateway, Storage, Key Vault, etc. — validated against a ground-truth stencil catalog (no hallucinated icons). Trigger `/drawio-azure "<architecture>"` or `/drawio-azure --feature <slug>`. Output is a `.drawio` file. Differs from `/system-design` + `/d2-architect` (C4 logical, D2, generic boxes) — this draws CLOUD-BRAND-ACCURATE Azure architecture with official Azure service icons.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[\"<architecture description>\"] [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence] [--no-render]"
---

# /drawio-azure — Azure cloud architecture in draw.io (real stencils)

> Sibling of `/drawio-aws`. Same engine + model; this one targets Azure (`mxgraph.azure.*`). Use when the diagram must show actual Azure services with their official icons. For a generic logical picture → `/system-design` / `/d2-architect`.

## Goal

Draw an **Azure cloud architecture** as a draw.io `.drawio` file using **official Azure stencils** looked up from a ground-truth catalog, validated (stencils exist + design principles) before delivery. Output in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`): `{slug}.src.ts` (build-script) + `{slug}.drawio` (+ optional `{slug}.svg`).

## Catalog — must be downloaded first

`azure.json` is **large (~13MB, mostly embedded icon bitmaps) and NOT shipped in-repo**. On first use, ensure it:
```
bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/drawio-catalog-ensure.sh azure"
```
The Context check below tells you if it's present. If missing → run the script (or hint the user), then proceed. `doctor.sh` also checks this.

## Constraints

- **Fixed output** in `docs/{feature}/drawio/` (or `docs/_shared/drawio/`).
- **Stencils only from the catalog** — resolve every icon via `drawio-build search "…" --cloud azure` first; use the returned `name` in `icon(id, name, label)`. Never invent.
- **No coordinates** — the layout engine places everything via `renderTree`.
- **Validate is a HARD GATE** — `drawio-build` runs `validateDiagram`; errors → not written, fix + rerun.
- **Run via the shared entry**: `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" skills/drawio/engine/drawio-build.ts …`.
- **PNG/SVG export optional** — needs draw.io desktop app; without it the `.drawio` is the deliverable.
- **Bilingual** (mirror input — @../../rules/language.md); service names kept per real Azure names.
- **L1 approval** before Write. **Idempotent**.

## Inputs

```
/drawio-azure "<architecture description>" [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence]
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
azure catalog present?: !`test -f "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/drawio/catalog/azure.json" && echo "✅ azure.json ready" || echo "❌ missing — run: bash scripts/drawio-catalog-ensure.sh azure"`
draw.io desktop (PNG/SVG)?: !`command -v drawio >/dev/null 2>&1 && echo "✅ $(command -v drawio)" || echo "⚠️ not found — .drawio still produced"`

## Flow runtime (same shape as /drawio-aws)

1. Read sources → interview the architecture SCOPE (which Azure services + roles + main flow).
2. L1 plan preview (prose). User Y → continue.
3. **Resolve stencils** (anti-hallucination): `bash tsrun.sh skills/drawio/engine/drawio-build.ts search "app gateway, aks, cosmos db, …" --cloud azure`.
4. Write `{slug}.src.ts` exporting `build({ Diagram, icon, group, frame, phantom, box, renderTree })` → Diagram (copy `references/example-azure.ts`).
5. Build + validate (hard gate): `bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud azure [--render]`.
6. Report — open `.drawio`.

## How to build — the build-script

Copy `references/example-azure.ts`:
```ts
export function build({ Diagram, icon, phantom, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0 }, [
    icon("agw", "azure_application_gateway_containers", "Application Gateway"),
    icon("aks", "azure_aks_automatic", "AKS"),
    icon("cosmos", "cosmosdb", "Cosmos DB"),
  ]);
  renderTree(d, tree, [40, 60]);
  d.link("agw", "aks", "1 · route");
  d.link("aks", "cosmos", "2 · read/write");
  return d;
}
```
Then `bash tsrun.sh skills/drawio/engine/drawio-build.ts --dir docs/{feature}/drawio --cloud azure`.

## L1 preview / Output / Gotchas

Same shape as `/drawio-aws` (see `@../drawio-aws/SKILL.md`). Azure-specific:
- **azure.json not shipped** — `drawio-catalog-ensure.sh azure` first (13MB download).
- **Stencils only from catalog** — typo'd name → validation error with suggestions.
- **Nesting** — Resource Group → VNet → Subnet per `@../drawio/rules/azure-architecture.md`.
- **`.drawio` is the deliverable**; PNG/SVG optional (draw.io desktop).

## References

- @../../rules/ba-conventions.md · @../../rules/approval-gate.md · @../../rules/naming-conventions.md · @../../rules/language.md · @../../rules/diagram-selection.md
- @../../rules/diagram-principles.md (cross-engine validation gate)
- @../drawio/rules/azure-architecture.md (Azure containers + nesting)
- @../drawio/rules/principles.md · @../drawio/rules/diagram-types.md
- @../drawio/NOTICE.md (provenance — MIT sparklabx; Azure icons © Microsoft)
- @./references/example-azure.ts (build-script template)
