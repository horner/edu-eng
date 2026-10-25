import { expect, it } from "vitest";
import { graphView, loadCatalog } from "../../scripts/lib/model.ts";
import { makeGraph } from "../../src/graph.ts";

it("build export and browser graph retain the same selected competency, nodes and edges", () => {
  const data = loadCatalog(process.cwd());
  const ids = [
    "edu-bme-calculus",
    "edu-bme-linear-algebra-differential-equations",
    "edu-bme-signals",
    "edu-bme-c04-technical",
    "edu-bme-c05-technical",
  ];
  const exported = graphView(data, ids),
    browser = makeGraph(data, ids);
  expect(browser.nodes.map(({ position: _position, ...node }) => node)).toEqual(
    exported.nodes,
  );
  expect(browser.edges).toEqual(exported.edges);
  expect(
    browser.nodes.some(
      (node) =>
        node.id === "edu-bme-c05-technical" && node.kind === "competency",
    ),
  ).toBe(true);
  expect(exported.nodes.every((node) => !("position" in node))).toBe(true);
});
