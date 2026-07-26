// Atlas Re on Azure — draw.io architecture (Azure is the platform's primary cloud).
// Redis is the only fabricated piece here (proposed). Regenerate: drawio-build --dir . --cloud azure.
// Stencil names resolved via `drawio-build search … --cloud azure`.
export function build({ Diagram, icon, group, frame, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");

  const tree = phantom("root", "", { dir: "row", gap: 180, routeGap: 130, align: "center", header: 0, pad: 36 }, [
    box("uw", "Underwriter", { w: 120, h: 64, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    icon("agw", "azure_application_gateway_containers", "Application Gateway"),
    group("aks", "group_availability_zone", "AKS cluster", { dir: "col", gap: 110, routeGap: 120, fill: "#FFFFFF", stroke: "#999999" }, [
      icon("sub", "azure_aks_automatic", "submission-svc"),
      icon("pri", "azure_aks_automatic", "pricing-svc"),
      icon("con", "azure_aks_automatic", "contract-svc"),
      icon("clm", "azure_aks_automatic", "claim-svc"),
    ]),
    phantom("data", "", { dir: "col", gap: 72, routeGap: 100, header: 0 }, [
      icon("db", "azure_azure_database_postgresql_server_group", "PostgreSQL"),
      icon("cache", "azure_cache_redis", "Redis (proposed)"),
      icon("bus", "azure_azure_service_bus", "Service Bus"),
      icon("blob", "azure_storage_accounts", "Blob storage"),
      icon("ad", "azure_active_directory_connect_health", "Azure AD"),
    ]),
  ]);
  renderTree(d, tree, [40, 70]);
  d.title("Atlas Re — Azure architecture (App Gateway → AKS → Postgres + Redis + Service Bus + Blob + AD)");

  d.link("uw", "agw", "1 · HTTPS");
  d.link("agw", "sub", "2 · route");
  d.link("agw", "con", "3 · route");
  d.link("agw", "clm", "4 · route");
  d.link("sub", "db", "5 · read/write");
  d.link("con", "db", "6 · read/write");
  d.link("sub", "cache", "7 · lookup (proposed)");
  d.link("con", "bus", "8 · events");
  d.link("clm", "bus", "9 · events");
  d.link("sub", "blob", "10 · SoV upload");
  d.link("agw", "ad", "11 · verify token");
  // service ↔ service (sync REST) + a bus consumer — see ../DOMAIN.md "Service interactions".
  // (Services call each other; the Service Bus is a backbone with subscribers, not a sink.)
  d.link("sub", "pri", "rate");
  d.link("con", "pri", "final rate");
  d.link("con", "sub", "fetch");
  d.link("clm", "con", "coverage");
  d.link("bus", "clm", "subscribe");
  return d;
}
