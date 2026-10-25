import { describe, expect, it } from "vitest";
import { makeGraph } from "../src/graph";
import { graphContract } from "../src/data/graph-contract";
import type { Chapter, Curriculum } from "../src/data/types";

function chapter(id: string, prerequisites: string[] = []): Chapter {
  return {
    id,
    name: id,
    category: "Test",
    level: 1,
    priority: "core",
    summary: "",
    prerequisites,
    related: [],
    topics: [],
    discipline: "test",
    ownership: "local",
  };
}
function dataset(chapters: Chapter[]): Curriculum {
  return {
    schema_version: 1,
    revision: "test",
    upstream_revision: "test",
    chapters,
    competencies: [],
    disciplines: [],
    resources: [],
    assessments: [],
    studios: [],
    programs: [],
    institutions: [],
    brands: [],
    crosswalks: [],
    baselines: [],
    roadmaps: [],
    redirects: { chapters: {}, topics: {} },
    validation: [],
    ledgers: [],
  };
}

describe("roadmap-style graph semantics", () => {
  it("uses exactly the semantic contract exported for source inspection", () => {
    const data = dataset([chapter("a"), chapter("b", ["a"])]);
    const view = makeGraph(data, ["a", "b"]);
    const exported = graphContract(data, ["a", "b"]);
    expect(
      view.nodes.map(({ id, label, kind }) => ({ id, label, kind })),
    ).toEqual(exported.nodes);
    expect(view.edges).toEqual(exported.edges);
  });
  it("keeps prerequisite, related, and concurrent relationships distinct", () => {
    const a = chapter("a");
    const b = chapter("b", ["a"]);
    const c = chapter("c");
    b.related = ["c"];
    c.concurrent = ["b"];
    const graph = makeGraph(dataset([a, b, c]), ["a", "b", "c"]);
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "a",
          target: "b",
          relationship: "prerequisite",
        }),
        expect.objectContaining({ relationship: "related" }),
        expect.objectContaining({ relationship: "concurrent" }),
      ]),
    );
    expect(
      graph.nodes.find((node) => node.id === "a")!.position.y,
    ).toBeLessThan(graph.nodes.find((node) => node.id === "b")!.position.y);
  });
  it("expands only the requested prerequisite closure and never mutates the source", () => {
    const data = dataset([
      chapter("a"),
      chapter("b", ["a"]),
      chapter("unrelated"),
    ]);
    const original = JSON.stringify(data);
    expect(makeGraph(data, ["b"]).nodes.map((node) => node.id)).toEqual(["b"]);
    const expanded = makeGraph(data, ["b"], true);
    expect(expanded.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(JSON.stringify(data)).toBe(original);
    expect(makeGraph(data, ["b"], true)).toEqual(expanded);
  });
  it("lays out a representative 100-node curriculum within a two-second smoke budget", () => {
    const data = dataset(
      Array.from({ length: 100 }, (_, i) =>
        chapter(`n${i}`, i ? [`n${i - 1}`] : []),
      ),
    );
    const started = performance.now();
    const graph = makeGraph(
      data,
      data.chapters.map((record) => record.id),
    );
    expect(graph.nodes).toHaveLength(100);
    expect(graph.edges).toHaveLength(99);
    expect(performance.now() - started).toBeLessThan(2000);
  });
});
