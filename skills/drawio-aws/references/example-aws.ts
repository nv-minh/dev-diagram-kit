// REFERENCE for /drawio-aws — a {slug}.src.ts build-script the AI writes into docs/{feature}/drawio/.
// It exports build(engine) and returns a Diagram. drawio-build.ts injects the engine DSL (NO imports
// needed here), runs validateDiagram as a hard gate, and writes {slug}.drawio. Copy this shape, swap
// the topology + stencils. Stencil NAMES (e.g. "s3", "lambda") MUST come from `drawio-build search`
// first — never invent them.
//
// Topology helpers: icon(id, stencilName, label, opts?) · box(id, label, opts) ·
//   frame(id, label, opts, children) · phantom(id, label, opts, children) · group(id, gname, label, opts, children) ·
//   grid(id, gname, label, opts, children) · pool(id, label, opts, children) · renderTree(d, root, [x,y]).
// Diagram type → numbering/edge style: "pipeline"|"hierarchy"|"network"|"hubspoke"|"hybrid"|"mesh"|"sequence".

export function build({ Diagram, icon, box, phantom, frame, renderTree }) {
  const d = new Diagram("sequence");   // numbered request walkthrough

  const tree = phantom("root", "", { dir: "row", gap: 80, align: "center", header: 0, pad: 10 }, [
    box("browser", "Browser", { w: 120, h: 60, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    phantom("paths", "", { dir: "col", gap: 60, header: 0 }, [
      frame("static", "Static content path", { dir: "row", gap: 50, fill: "#FFFFFF", stroke: "#999999" }, [
        icon("r53", "route_53", "Route 53"),
        icon("cf", "cloudfront", "CloudFront"),
        icon("s3", "s3", "S3 (static files)"),
      ]),
      frame("dynamic", "Dynamic API path", { dir: "row", gap: 50, fill: "#FFFFFF", stroke: "#999999" }, [
        icon("apigw", "api_gateway", "API Gateway"),
        icon("lambda", "lambda", "Lambda"),
        icon("ddb", "dynamodb", "DynamoDB"),
      ]),
    ]),
  ]);
  renderTree(d, tree, [40, 80]);
  d.title("Serverless web app — AWS (sequence: numbered request walkthrough)");

  d.link("browser", "r53", "1 · resolve example.com");
  d.link("r53", "cf", "2 · route");
  d.link("cf", "s3", "3 · fetch assets");
  d.link("browser", "apigw", "4 · API call");
  d.link("apigw", "lambda", "5 · invoke");
  d.link("lambda", "ddb", "6 · read/write");
  return d;
}
