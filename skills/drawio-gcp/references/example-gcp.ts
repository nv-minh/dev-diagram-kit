// REFERENCE for /drawio-gcp — {slug}.src.ts build-script (see /drawio-aws for the full model).
// Stencil NAMES below come from `drawio-build search … --cloud gcp` — never invent them.
// NOTE: gcp.json is large (~1.9MB) and NOT shipped in-repo; the skill runs
// `scripts/drawio-catalog-ensure.sh gcp` first (see doctor.sh).

export function build({ Diagram, icon, phantom, renderTree }) {
  const d = new Diagram("pipeline");

  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0, pad: 10 }, [
    icon("lb", "application_load_balancer", "Cloud Load Balancing"),
    icon("gke", "gcp_gke_on_prem", "GKE (services)"),
    icon("sql", "gcp_cloud_sql", "Cloud SQL"),
    icon("gcs", "gcp_cloud_storage", "Cloud Storage"),
    icon("bq", "bigquery", "BigQuery (analytics)"),
  ]);
  renderTree(d, tree, [40, 60]);
  d.title("GCP microservices — LB → GKE → Cloud SQL + BigQuery");

  d.link("lb", "gke", "1 · route");
  d.link("gke", "sql", "2 · transactional read/write");
  d.link("gke", "gcs", "3 · objects");
  d.link("gcs", "bq", "4 · batch load for analytics");
  return d;
}
