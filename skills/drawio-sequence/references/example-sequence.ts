// /drawio-sequence build-script template — UML sequence (lifelines × time-ordered messages).
// Copy this, then edit participants + messages. Regenerate: drawio-build --dir . --cloud aws.
export function build({ Diagram, renderSequence }) {
  const d = new Diagram("uml_sequence");

  // Participants left→right in call order. actor:true → stick-figure header.
  d.participant("u", "User", { actor: true });
  d.participant("api", "API Gateway");
  d.participant("svc", "Service");
  d.participant("bus", "Event bus");

  // Messages top→bottom = time. Default = sync (solid, filled block); reply:true = return (dashed, open);
  // async:true = signal (solid, open).
  d.message("u", "api", "request");
  d.message("api", "svc", "call (sync)");
  d.message("svc", "api", "result", { reply: true });
  d.message("svc", "bus", "domain.event", { async: true });
  d.message("api", "u", "200 OK", { reply: true });

  renderSequence(d, [40, 40]);          // places lifelines + messages — call BEFORE d.title (sets page size)
  d.title("Sequence — request / response + async event");
  return d;
}
