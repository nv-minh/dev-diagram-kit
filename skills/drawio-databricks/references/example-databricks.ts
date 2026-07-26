// REFERENCE for /drawio-databricks — {slug}.src.ts build-script (see /drawio-aws for the full model).
// Stencil NAMES below come from `drawio-build search … --cloud databricks` — never invent them.

export function build({ Diagram, icon, phantom, renderTree }) {
  const d = new Diagram("pipeline");

  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0, pad: 10 }, [
    icon("ws", "azure_workspace_gateway", "Databricks Workspace"),
    icon("delta", "delta", "Delta Lake (tables)"),
    icon("sqlw", "azure_sql_data_warehouses", "SQL Warehouse"),
    icon("ml", "machine_learning", "MLflow / ML"),
    icon("uc", "unity_catalog", "Unity Catalog (governance)"),
  ]);
  renderTree(d, tree, [40, 60]);
  d.title("Databricks Lakehouse — ingest → serve + ML, governed by Unity Catalog");

  d.link("ws", "delta", "1 · write (bronze/silver/gold)");
  d.link("delta", "sqlw", "2 · BI / serving queries");
  d.link("delta", "ml", "3 · feature + train");
  d.link("uc", "delta", "4 · governs tables/access");
  return d;
}
