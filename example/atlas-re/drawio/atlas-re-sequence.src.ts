// Atlas Re — UML sequence (draw.io) for the realistic bind flow. Exercises engine/sequence.ts
// (lifelines + time-ordered messages). Regenerate: drawio-build --dir . --cloud aws.
// DB writes + gateway auth are omitted to focus on service-to-service calls + the event bus (see
// ../DOMAIN.md "Service interactions"). The same flow in Mermaid form is in ../srs/atlas-re-flows.md.
export function build({ Diagram, renderSequence }) {
  const d = new Diagram("uml_sequence");

  d.participant("uw", "Underwriter", { actor: true });
  d.participant("web", "Atlas Re Web");
  d.participant("api", "API Gateway");
  d.participant("sub", "submission-svc");
  d.participant("pri", "pricing-svc");
  d.participant("con", "contract-svc");
  d.participant("bus", "Kafka (proposed)");
  d.participant("clm", "claim-svc");

  // quote
  d.message("uw", "web", "open new submission");
  d.message("web", "api", "POST /submissions");
  d.message("api", "sub", "create");
  d.message("sub", "pri", "request rating (sync)");
  d.message("pri", "sub", "quote", { reply: true });
  d.message("sub", "bus", "publish submission.quoted", { async: true });
  d.message("bus", "con", "pre-stage draft (async)", { async: true });
  d.message("sub", "api", "201 + quote", { reply: true });

  // bind — driven by contract-svc, which owns the Contract entity
  d.message("uw", "web", "bind");
  d.message("web", "api", "POST /contracts");
  d.message("api", "con", "bind");
  d.message("con", "sub", "fetch submission (sync)");
  d.message("sub", "con", "submission (QUOTED)", { reply: true });
  d.message("con", "pri", "final rate (sync)");
  d.message("pri", "con", "rate", { reply: true });
  d.message("con", "bus", "publish contract.bound", { async: true });
  d.message("bus", "clm", "in-force — claims admissible (async)", { async: true });
  d.message("con", "api", "contract id", { reply: true });

  renderSequence(d, [40, 40]);
  d.title("Atlas Re — bind flow (UML sequence): quote → bind, service-to-service calls + event fan-out");
  return d;
}
