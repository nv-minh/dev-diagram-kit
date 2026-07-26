// Tests for the vendored draw.io Diagram builder (skills/drawio/engine/builder.ts):
// XML escaping, link() guards, the orthogonal edge router, and the save() kit-repo guard.
import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Diagram } from "../../skills/drawio/engine/builder.ts";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("XML escaping", () => {
  it("escapes user labels in node values and edge labels", () => {
    const d: any = new Diagram("pipeline", { page: [800, 400] });
    d.box("a", [50, 100], [120, 60], `O'Reilly & <Co> "quoted"`);
    d.box("b", [400, 100], [120, 60], "B");
    d.link("a", "b", `calls & <checks>`);
    const xml = d.toXML();
    expect(xml).toContain("O'Reilly &amp; &lt;Co&gt; &quot;quoted&quot;");
    expect(xml).toContain("calls &amp; &lt;checks&gt;");
    // no raw special chars may survive inside a value attribute
    expect(xml).not.toMatch(/value="[^"]*<[^"]*"/);
  });

  it("passes the engine validator with special characters in labels", () => {
    const d: any = new Diagram("pipeline", { page: [800, 400] });
    d.box("a", [50, 100], [120, 60], `A & <B>`);
    d.box("b", [400, 100], [120, 60], "B");
    d.link("a", "b", "x");
    const res = d.validate();
    expect(res.errors).toEqual([]);
  });
});

describe("link() guards", () => {
  it("throws when the source or target does not exist", () => {
    const d: any = new Diagram("pipeline");
    d.box("a", [50, 100], [120, 60], "A");
    expect(() => d.link("a", "ghost")).toThrow(/target does not exist yet "ghost"/);
    expect(() => d.link("ghost", "a")).toThrow(/source does not exist yet "ghost"/);
  });
});

describe("edge router", () => {
  it("emits an empty page for a diagram with no nodes", () => {
    const xml: string = new Diagram("pipeline").toXML() as any;
    expect(xml).toContain("<mxGraphModel");
    expect(xml).not.toContain("edge=\"1\"");
  });

  it("routes a straight edge with exit/entry pins and no crossings", () => {
    const d: any = new Diagram("pipeline", { page: [800, 400] });
    d.box("a", [50, 100], [120, 60], "A");
    d.box("b", [400, 100], [120, 60], "B");
    d.link("a", "b", "");
    const xml = d.toXML();
    expect(xml).toMatch(/edge="1"[^>]*source="a"[^>]*target="b"/);
    expect(xml).toMatch(/exitX=1;exitY=0\.5.*entryX=0;entryY=0\.5/);
    expect(d._cross).toBe(0);
    expect(d._overlaps).toBe(0);
  });

  it("routes around an obstacle sitting between source and target", () => {
    const d: any = new Diagram("pipeline", { page: [900, 500] });
    d.box("a", [50, 200], [100, 60], "A");
    d.box("wall", [300, 190], [100, 80], "Wall");   // dead centre between a and b
    d.box("b", [600, 200], [100, 60], "B");
    d.link("a", "b", "");
    d.toXML();
    expect(d._cross).toBe(0);   // router self-report: no segment clips an obstacle
  });

  it("de-collides fan-out ports — 1→N edges leave at distinct fractions", () => {
    const d: any = new Diagram("pipeline", { page: [900, 700] });
    d.box("hub", [50, 300], [100, 60], "Hub");
    d.box("t1", [500, 80], [100, 60], "T1");
    d.box("t2", [500, 300], [100, 60], "T2");
    d.box("t3", [500, 520], [100, 60], "T3");
    d.link("hub", "t1"); d.link("hub", "t2"); d.link("hub", "t3");
    const xml = d.toXML();
    const ys = [...xml.matchAll(/<mxCell id="ed\d+"[^>]*style="([^"]*)"/g)]
      .map((m) => m[1].match(/exitY=([\d.]+)/)?.[1])
      .filter(Boolean);
    expect(ys.length).toBe(3);
    expect(new Set(ys).size).toBe(3);
    expect(d._cross).toBe(0);
    expect(d._overlaps).toBe(0);
  });

  it("is deterministic — identical builds emit identical XML", () => {
    const mk = () => {
      const d: any = new Diagram("pipeline", { page: [900, 500] });
      d.box("a", [50, 200], [100, 60], "A");
      d.box("wall", [300, 190], [100, 80], "Wall");
      d.box("b", [600, 200], [100, 60], "B");
      d.link("a", "b", "flow");
      return d.toXML();
    };
    expect(mk()).toBe(mk());
  });
});

describe("save() kit-repo guard", () => {
  it("refuses to write inside the kit repo", () => {
    const d: any = new Diagram("pipeline");
    d.box("a", [50, 100], [120, 60], "A");
    expect(() => d.save("guard-test.drawio", REPO_ROOT)).toThrow(/Refusing to save into the kit repo/);
  });
});
