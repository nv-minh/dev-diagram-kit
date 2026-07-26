// Atlas Re — FABRICATED GCP migration (the real platform is Azure). For the /drawio-gcp example.
export function build({ Diagram, icon, group, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 180, routeGap: 130, align: "center", header: 0, pad: 36 }, [
    box("uw", "Underwriter", { w: 120, h: 64, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    icon("lb", "application_load_balancer", "Cloud Load Balancing"),
    group("run", "group_availability_zone", "Cloud Run services", { dir: "col", gap: 110, routeGap: 120, fill: "#FFFFFF", stroke: "#999999" }, [
      icon("sub", "gcp_cloud_run", "submission-svc"),
      icon("pri", "gcp_cloud_run", "pricing-svc"),
      icon("con", "gcp_cloud_run", "contract-svc"),
      icon("clm", "gcp_cloud_run", "claim-svc"),
    ]),
    phantom("data", "", { dir: "col", gap: 72, routeGap: 100, header: 0 }, [
      icon("db", "gcp_cloud_sql", "Cloud SQL (Postgres)"),
      icon("cache", "gcp_memorystore", "Memorystore (Redis)"),
      icon("bus", "gcp_pubsub", "Pub/Sub"),
      icon("blob", "gcp_cloud_storage", "Cloud Storage"),
    ]),
  ]);
  renderTree(d, tree, [40, 70]);
  d.title("Atlas Re — GCP (fabricated migration): LB → Cloud Run → Cloud SQL + Memorystore + Pub/Sub + GCS");
  d.link("uw", "lb", "1 · HTTPS");
  d.link("lb", "sub", "2 · route");
  d.link("lb", "con", "3 · route");
  d.link("lb", "clm", "4 · route");
  d.link("sub", "db", "5 · read/write");
  d.link("con", "db", "6 · read/write");
  d.link("sub", "cache", "7 · lookup");
  d.link("con", "bus", "8 · events");
  d.link("sub", "blob", "9 · SoV upload");
  // service ↔ service (sync REST) + a bus consumer — see ../DOMAIN.md "Service interactions".
  // (Services call each other; Pub/Sub is a backbone with subscribers, not a sink.)
  d.link("sub", "pri", "rate");
  d.link("con", "pri", "final rate");
  d.link("con", "sub", "fetch");
  d.link("clm", "con", "coverage");
  d.link("bus", "clm", "subscribe");
  return d;
}
