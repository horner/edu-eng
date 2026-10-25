import type { Chapter, Competency, Curriculum } from "./types";

export type LearningRecord = Chapter | Competency;
export interface SemanticNode {
  id: string;
  label: string;
  kind: "chapter" | "competency";
}
export interface SemanticEdge {
  id: string;
  source: string;
  target: string;
  relationship: "prerequisite" | "related" | "concurrent";
}
export interface GraphContract {
  schema_version: 1;
  format: "edu-eng-roadmap-view";
  native_roadmap_sh: false;
  nodes: SemanticNode[];
  edges: SemanticEdge[];
}

/** Shared browser/build semantic adapter. Layout is deliberately absent. */
export function graphContract(
  data: Pick<Curriculum, "chapters" | "competencies">,
  ids?: readonly string[],
): GraphContract {
  const records = new Map<string, LearningRecord>(
    [...data.chapters, ...data.competencies].map((record) => [
      record.id,
      record,
    ]),
  );
  const visible = new Set(
    (ids || [...records.keys()]).filter((id) => records.has(id)),
  );
  const chapterIds = new Set(data.chapters.map((chapter) => chapter.id));
  const nodes = [...visible]
    .sort()
    .map((id) => ({
      id,
      label: records.get(id)!.name,
      kind: (chapterIds.has(id)
        ? "chapter"
        : "competency") as SemanticNode["kind"],
    }));
  const edges = new Map<string, SemanticEdge>();
  for (const id of [...visible].sort()) {
    const record = records.get(id)!;
    for (const [relationship, keys] of [
      ["prerequisite", record.prerequisites],
      ["related", record.related],
      ["concurrent", record.concurrent],
    ] as const) {
      if (!Array.isArray(keys)) continue;
      for (const key of keys as string[]) {
        if (!visible.has(key) || key === id) continue;
        const [source, target] =
          relationship === "prerequisite" ? [key, id] : [key, id].sort();
        const edgeId = `${relationship}:${source}:${target}`;
        edges.set(edgeId, { id: edgeId, source, target, relationship });
      }
    }
  }
  return {
    schema_version: 1,
    format: "edu-eng-roadmap-view",
    native_roadmap_sh: false,
    nodes,
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}
