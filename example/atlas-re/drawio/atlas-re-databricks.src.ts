// Atlas Re — FABRICATED Databricks analytics lakehouse. For the /drawio-databricks example.
export function build({ Diagram, icon, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 180, routeGap: 130, align: "center", header: 0, pad: 36 }, [
    box("src", "Submissions / Claims (OLTP)", { w: 160, h: 64, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    icon("ws", "azure_workspace_gateway", "Databricks Workspace"),
    icon("delta", "delta", "Delta Lake"),
    icon("sqlw", "azure_sql_data_warehouses", "SQL Warehouse (BI)"),
    icon("ml", "machine_learning", "MLflow (loss models)"),
    icon("uc", "unity_catalog", "Unity Catalog"),
  ]);
  renderTree(d, tree, [40, 70]);
  d.title("Atlas Re — analytics lakehouse (fabricated): OLTP → Delta Lake → BI + ML, governed by Unity Catalog");
  d.link("src", "ws", "1 · ingest (CDC)");
  d.link("ws", "delta", "2 · bronze/silver/gold");
  d.link("delta", "sqlw", "3 · BI queries");
  d.link("delta", "ml", "4 · train loss models");
  d.link("uc", "delta", "5 · governs tables/access");
  return d;
}
