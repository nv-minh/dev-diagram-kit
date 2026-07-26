// Atlas Re on Azure — draw.io architecture (Azure is the platform's primary cloud).
// Redis is the only fabricated piece here (proposed). Regenerate: drawio-build --dir . --cloud azure.
// Stencil names resolved via `drawio-build search … --cloud azure`.
export function build({ Diagram, icon, group, frame, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");

  const tree = phantom("root", "", { dir: "row", gap: 130, routeGap: 90, align: "center", header: 0, pad: 24 }, [
    box("uw", "Underwriter", { w: 120, h: 64, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    icon("agw", "azure_application_gateway_containers", "Application Gateway"),
    group("aks", "group_availability_zone", "AKS cluster", { dir: "col", gap: 48, routeGap: 60, fill: "#FFFFFF", stroke: "#999999" }, [
      icon("sub", "azure_aks_automatic", "submission-svc"),
      icon("con", "azure_aks_automatic", "contract-svc"),
      icon("clm", "azure_aks_automatic", "claim-svc"),
      icon("pri", "azure_aks_automatic", "pricing-svc"),
    ]),
    phantom("data", "", { dir: "col", gap: 48, routeGap: 60, header: 0 }, [
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
  return d;
}
