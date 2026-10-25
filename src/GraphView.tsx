import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { Button, ButtonGroup, Badge, Checkbox, Alert } from "@mieweb/ui";
import { BookOpen, Compass } from "lucide-react";
import type { Curriculum } from "./data/types";
import { makeGraph, type MapNode } from "./graph";
import { copy } from "./i18n";

type LearningNode = Node<
  {
    label: string;
    kind: MapNode["kind"];
    selected: boolean;
    onSelect: (id: string) => void;
  },
  "learning"
>;
function LearningNodeCard({ id, data }: NodeProps<LearningNode>) {
  const Icon = data.kind === "chapter" ? BookOpen : Compass;
  return (
    <div className={`learning-node ${data.selected ? "is-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      <Button
        variant={data.selected ? "primary" : "outline"}
        className="learning-node-button"
        onClick={() => data.onSelect(id)}
        aria-pressed={data.selected}
      >
        <Icon size={16} aria-hidden="true" />
        <span>{data.label}</span>
      </Button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { learning: LearningNodeCard };
export function GraphView({
  data,
  ids,
  selected,
  onSelect,
  focused,
  onFocus,
}: {
  data: Curriculum;
  ids: string[];
  selected: string;
  onSelect: (id: string) => void;
  focused: boolean;
  onFocus: (value: boolean) => void;
}) {
  const [includePrereqs, setIncludePrereqs] = useState(false);
  const [showList, setShowList] = useState(false);
  const graph = useMemo(
    () =>
      makeGraph(
        data,
        focused && selected ? [selected] : ids,
        includePrereqs || focused,
      ),
    [data, ids, selected, focused, includePrereqs],
  );
  const nodes: LearningNode[] = useMemo(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        type: "learning",
        position: node.position,
        data: {
          label: node.label,
          kind: node.kind,
          selected: node.id === selected,
          onSelect,
        },
        draggable: false,
      })),
    [graph, selected, onSelect],
  );
  const edges = useMemo(
    () =>
      graph.edges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        label:
          edge.relationship === "concurrent"
            ? copy.concurrentEdge
            : edge.relationship === "related"
              ? copy.relatedEdge
              : undefined,
        markerEnd:
          edge.relationship === "prerequisite"
            ? { type: MarkerType.ArrowClosed }
            : undefined,
        style: {
          stroke: `var(--map-${edge.relationship})`,
          strokeWidth: edge.relationship === "prerequisite" ? 1.8 : 1.2,
          strokeDasharray:
            edge.relationship === "concurrent"
              ? "3 4"
              : edge.relationship === "related"
                ? "8 5"
                : undefined,
        },
        ariaLabel: `${edge.relationship}: ${edge.source} → ${edge.target}`,
      })),
    [graph],
  );
  if (!nodes.length) return <Alert>{copy.noResults}</Alert>;
  return (
    <section className="map-section" aria-label={copy.graph}>
      <div className="map-actions">
        <Checkbox
          checked={includePrereqs}
          onChange={(event) => setIncludePrereqs(event.target.checked)}
          label={copy.showPrereqs}
        />
        <ButtonGroup>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFocus(!focused)}
            disabled={!selected}
          >
            {focused ? copy.clearFocus : copy.focusMap}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowList(!showList)}
            aria-expanded={showList}
          >
            {copy.orderedList}
          </Button>
        </ButtonGroup>
      </div>
      <div className="map-legend" aria-label={copy.mapLegend}>
        <span className="legend-prerequisite">{copy.prerequisiteEdge}</span>
        <span className="legend-related">{copy.relatedEdge}</span>
        <span className="legend-concurrent">{copy.concurrentEdge}</span>
        <Badge variant="secondary">{copy.unitsCount(nodes.length)}</Badge>
      </div>
      {focused && <p className="small-muted">{copy.focusHint}</p>}
      <div className="graph-canvas" data-testid="graph-canvas">
        <ReactFlow
          key={`${focused}:${includePrereqs}:${ids.join(",")}`}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.15}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          proOptions={{ hideAttribution: true }}
          aria-label={copy.graph}
        >
          <Background gap={22} size={1} color="var(--mieweb-border)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {showList && (
        <ol className="map-list">
          {[...graph.nodes]
            .sort(
              (a, b) =>
                a.position.y - b.position.y || a.position.x - b.position.x,
            )
            .map((node) => (
              <li key={node.id}>
                <Button variant="link" onClick={() => onSelect(node.id)}>
                  {node.label}
                </Button>
                <span className="small-muted">
                  {graph.edges
                    .filter(
                      (edge) =>
                        edge.target === node.id &&
                        edge.relationship === "prerequisite",
                    )
                    .map(
                      (edge) =>
                        graph.nodes.find((n) => n.id === edge.source)?.label,
                    )
                    .join(" · ")}
                </span>
              </li>
            ))}
        </ol>
      )}
      <p className="small-muted">{copy.graphNote}</p>
    </section>
  );
}
