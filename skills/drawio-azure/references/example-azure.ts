// REFERENCE for /drawio-azure — {slug}.src.ts build-script (see /drawio-aws for the full model).
// Stencil NAMES below come from `drawio-build search … --cloud azure` — never invent them.
// NOTE: azure.json is large (~13MB) and NOT shipped in-repo; the skill runs
// `scripts/drawio-catalog-ensure.sh azure` first (see doctor.sh).

export function build({ Diagram, icon, group, frame, phantom, renderTree }) {
  const d = new Diagram("pipeline");

  const tree = phantom("root", "", { dir: "row", gap: 70, header: 0, pad: 10 }, [
    icon("agw", "azure_application_gateway_containers", "Application Gateway"),
    icon("aks", "azure_aks_automatic", "AKS (workloads)"),
    icon("cosmos", "cosmosdb", "Cosmos DB"),
    phantom("shared", "", { dir: "col", gap: 40, header: 0 }, [
      icon("sa", "azure_storage_accounts", "Storage Account"),
      icon("kv", "azure_key_vaults", "Key Vault"),
    ]),
  ]);
  renderTree(d, tree, [40, 60]);
  d.title("Azure web app — App Gateway → AKS → Cosmos DB");

  d.link("agw", "aks", "1 · route traffic");
  d.link("aks", "cosmos", "2 · read/write");
  d.link("aks", "sa", "3 · blobs");
  d.link("aks", "kv", "4 · secrets");
  return d;
}
