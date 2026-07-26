// Atlas Re — FABRICATED AWS migration (the real platform is Azure). For the /drawio-aws example.
export function build({ Diagram, icon, group, phantom, box, renderTree }) {
  const d = new Diagram("pipeline");
  const tree = phantom("root", "", { dir: "row", gap: 130, routeGap: 90, align: "center", header: 0, pad: 24 }, [
    box("uw", "Underwriter", { w: 120, h: 64, fill: "#DAE8FC", stroke: "#6C8EBF", bold: true }),
    icon("agw", "api_gateway", "API Gateway"),
    group("compute", "group_availability_zone", "Lambda services", { dir: "col", gap: 48, routeGap: 60, fill: "#FFFFFF", stroke: "#999999" }, [
      icon("sub", "lambda", "submission-svc"),
      icon("con", "lambda", "contract-svc"),
      icon("clm", "lambda", "claim-svc"),
      icon("pri", "lambda", "pricing-svc"),
    ]),
    phantom("data", "", { dir: "col", gap: 48, routeGap: 60, header: 0 }, [
      icon("db", "rds", "RDS (Postgres)"),
      icon("cache", "elasticache", "ElastiCache"),
      icon("bus", "sqs", "SQS"),
      icon("blob", "s3", "S3"),
    ]),
  ]);
  renderTree(d, tree, [40, 70]);
  d.title("Atlas Re — AWS (fabricated migration): API GW → Lambda → RDS + ElastiCache + SQS + S3");
  d.link("uw", "agw", "1 · HTTPS");
  d.link("agw", "sub", "2 · route");
  d.link("agw", "con", "3 · route");
  d.link("agw", "clm", "4 · route");
  d.link("sub", "db", "5 · read/write");
  d.link("con", "db", "6 · read/write");
  d.link("sub", "cache", "7 · lookup");
  d.link("con", "bus", "8 · events");
  d.link("sub", "blob", "9 · SoV upload");
  return d;
}
