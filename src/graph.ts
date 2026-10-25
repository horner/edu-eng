import dagre from "@dagrejs/dagre";
import type { Curriculum } from "./data/types";
import {
  graphContract,
  type LearningRecord,
  type SemanticEdge,
} from "./data/graph-contract";
export type { LearningRecord } from "./data/graph-contract";
export interface MapNode {
  id: string;
  label: string;
  kind: "chapter" | "competency";
  position: { x: number; y: number };
}
export function recordMap(data: Curriculum): Map<string, LearningRecord> {
  return new Map(
    [...data.chapters, ...data.competencies].map((record) => [
      record.id,
      record,
    ]),
  );
}

export function prerequisiteClosure(
  ids: string[],
  records: Map<string, LearningRecord>,
): string[] {
  const seen = new Set<string>();
  function visit(id: string) {
    if (seen.has(id) || !records.has(id)) return;
    seen.add(id);
    records.get(id)!.prerequisites.forEach(visit);
  }
  ids.forEach(visit);
  return [...seen];
}

/** Local roadmap-view contract: semantic IDs/edges plus a disposable layout. */
export function makeGraph(
  data: Curriculum,
  ids: string[],
  includePrerequisites = false,
): { nodes: MapNode[]; edges: SemanticEdge[] } {
  const records = recordMap(data);
  const contract = graphContract(
    data,
    includePrerequisites ? prerequisiteClosure(ids, records) : ids,
  );
  const edges = contract.edges;
  // Pack disconnected prerequisite components instead of shrinking a whole
  // semester's independent subjects into one unreadable horizontal strip.
  const adjacent = new Map(
    contract.nodes.map((node) => [node.id, new Set<string>()]),
  );
  for (const edge of edges)
    if (edge.relationship === "prerequisite") {
      adjacent.get(edge.source)!.add(edge.target);
      adjacent.get(edge.target)!.add(edge.source);
    }
  const visited = new Set<string>();
  const components: string[][] = [];
  for (const node of contract.nodes) {
    if (visited.has(node.id)) continue;
    const component: string[] = [],
      queue = [node.id];
    while (queue.length) {
      const id = queue.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      component.push(id);
      queue.push(...adjacent.get(id)!);
    }
    components.push(component.sort());
  }
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  const positions = new Map<string, { x: number; y: number }>();
  let offsetX = 0,
    offsetY = 0,
    rowHeight = 0;
  for (const component of components) {
    const members = new Set(component);
    const layout = new dagre.graphlib.Graph()
      .setGraph({
        rankdir: "TB",
        nodesep: 35,
        ranksep: 70,
        marginx: 20,
        marginy: 20,
      })
      .setDefaultEdgeLabel(() => ({}));
    component.forEach((id) => layout.setNode(id, { width: 238, height: 88 }));
    for (const edge of edges)
      if (
        edge.relationship === "prerequisite" &&
        members.has(edge.source) &&
        members.has(edge.target)
      )
        layout.setEdge(edge.source, edge.target);
    dagre.layout(layout);
    const width = layout.graph().width || 278,
      height = layout.graph().height || 128;
    if (offsetX && offsetX + width > 950) {
      offsetX = 0;
      offsetY += rowHeight + 40;
      rowHeight = 0;
    }
    for (const id of component) {
      const node = layout.node(id);
      positions.set(id, {
        x: node.x - 119 + offsetX,
        y: node.y - 44 + offsetY,
      });
    }
    offsetX += width + 35;
    rowHeight = Math.max(rowHeight, height);
  }
  return {
    nodes: contract.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id)!,
    })),
    edges,
  };
}
