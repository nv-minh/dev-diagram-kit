// Tests for the kit-native UML sequence renderer (skills/drawio/engine/sequence.ts)
// and the participant()/message() call-time validation added to builder.ts.
import { describe, it, expect } from "vitest";
import { Diagram } from "../../skills/drawio/engine/builder.ts";
import { renderSequence } from "../../skills/drawio/engine/sequence.ts";

const build = () => {
  const d: any = new Diagram("uml_sequence");
  d.participant("uw", "Underwriter", { actor: true });
  d.participant("con", "contract-svc");
  d.participant("pri", "pricing-svc");
  d.message("uw", "con", "bind");
  d.message("con", "pri", "final rate");
  d.message("pri", "con", "rate", { reply: true });
  d.message("con", "con", "persist", {});
  d.message("con", "uw", "contract.bound", { async: true });
  renderSequence(d, [40, 40]);
  d.title("Bind flow");
  return d;
};

describe("renderSequence", () => {
  it("renders lifelines, spines and one edge per message", () => {
    const xml = build().toXML();
    expect(xml).toContain("shape=umlActor");                       // actor header
    expect(xml).toContain('id="con_spine"');                       // dashed spine per participant
    expect(xml).toContain("dashPattern=4 3");
    // 5 messages → ed1..ed5
    for (let i = 1; i <= 5; i++) expect(xml).toContain(`id="ed${i}"`);
    expect(xml).not.toContain('id="ed6"');
  });

  it("styles sync / reply / async / self-call messages distinctly", () => {
    const xml = build().toXML();
    expect(xml).toMatch(/endArrow=block/);                         // sync
    expect(xml).toMatch(/endArrow=open;dashed=1/);                 // reply
    expect(xml).toMatch(/endArrow=open;(?!dashed)/);               // async
    expect(xml).toMatch(/edgeStyle=orthogonalEdgeStyle[^"]*exitX=1[^"]*entryX=1/); // self-call loop
  });

  it("pins each cross message at a shared fractional Y (straight horizontal line)", () => {
    const xml = build().toXML();
    const edges = [...xml.matchAll(/<mxCell id="ed\d+"[^>]*style="([^"]*edgeStyle=none[^"]*)"/g)].map((m) => m[1]);
    expect(edges.length).toBeGreaterThan(0);
    for (const st of edges) {
      const exitY = st.match(/exitY=([\d.]+)/)?.[1];
      const entryY = st.match(/entryY=([\d.]+)/)?.[1];
      expect(exitY).toBeDefined();
      expect(exitY).toBe(entryY);
    }
  });

  it("sets the page size from participants × messages", () => {
    const d = build();
    // 3 participants × laneW 180 + 2×24 pad; 5 messages × stepH 44 + header 48 + 2×24 pad
    expect(d.page).toEqual([588, 316]);
  });

  it("is deterministic — same build gives identical XML", () => {
    expect(build().toXML()).toBe(build().toXML());
  });

  it("throws without participants", () => {
    const d: any = new Diagram("uml_sequence");
    expect(() => renderSequence(d)).toThrow(/declare participants first/);
  });
});

describe("participant()/message() call-time validation", () => {
  it("rejects an empty participant id", () => {
    const d: any = new Diagram("uml_sequence");
    expect(() => d.participant("", "Label")).toThrow(/non-empty id/);
  });

  it("rejects an empty participant label", () => {
    const d: any = new Diagram("uml_sequence");
    expect(() => d.participant("a", "")).toThrow(/needs a non-empty label/);
  });

  it("rejects a duplicate participant id", () => {
    const d: any = new Diagram("uml_sequence");
    d.participant("a", "A");
    expect(() => d.participant("a", "A again")).toThrow(/duplicate id "a"/);
  });

  it("rejects a message from/to an undeclared participant", () => {
    const d: any = new Diagram("uml_sequence");
    d.participant("a", "A");
    expect(() => d.message("ghost", "a", "hi")).toThrow(/unknown participant "ghost"/);
    expect(() => d.message("a", "ghost", "hi")).toThrow(/unknown participant "ghost"/);
  });
});
