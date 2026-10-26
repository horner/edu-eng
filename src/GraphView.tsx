import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  Button,
  ButtonGroup,
  Badge,
  Checkbox,
  Alert,
  Card,
  CardContent,
  Accordion,
} from "@mieweb/ui";
import { ArrowLeft, ArrowRight, BookOpen, Compass, Flag } from "lucide-react";
import type { Curriculum, Program } from "./data/types";
import { makeGraph, recordMap, type MapNode } from "./graph";
import { StudioView } from "./DetailPanel";
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
    <div className={"learning-node " + (data.selected ? "is-selected" : "")}>
      <Handle type="target" position={Position.Top} />
      <Button
        data-map-id={id}
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
  program,
  termNumber,
  ids,
  filtering,
  selected,
  onSelect,
  focused,
  onFocus,
  onTerm,
  onOverview,
}: {
  data: Curriculum;
  program: Program;
  termNumber: number;
  ids: string[];
  filtering: boolean;
  selected: string;
  onSelect: (id: string) => void;
  focused: boolean;
  onFocus: (value: boolean) => void;
  onTerm: (number: number) => void;
  onOverview: () => void;
}) {
  const [includePrereqs, setIncludePrereqs] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showList, setShowList] = useState(false);
  const selectDependency = useCallback(
    (id: string) => {
      setIncludePrereqs(false);
      setShowConnections(false);
      onSelect(id);
    },
    [onSelect],
  );
  const records = useMemo(() => recordMap(data), [data]);
  const selectedRecord = records.get(selected);
  const selectedTerm = program.semesters.find(
    (term) => term.number === termNumber,
  );
  const studio = data.studios.find((item) => item.id === selectedTerm?.studio);
  const years = [
    ...new Set(program.semesters.map((term) => Math.ceil(term.number / 2))),
  ];
  const matching = new Set(ids);
  const dependencyMode = focused && Boolean(selectedRecord);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousLevel = useRef({ termNumber, dependencyMode });
  const previousSelection = useRef(selected);
  useEffect(() => {
    const previous = previousLevel.current;
    previousLevel.current = { termNumber, dependencyMode };
    if (
      previous.termNumber === termNumber &&
      previous.dependencyMode === dependencyMode
    )
      return;
    if (dependencyMode || termNumber) headingRef.current?.focus();
    else
      sectionRef.current
        ?.querySelector<HTMLButtonElement>(
          '[aria-label="' + copy.mapExploreTerm(previous.termNumber) + '"]',
        )
        ?.focus();
  }, [termNumber, dependencyMode]);
  useEffect(() => {
    const previous = previousSelection.current;
    previousSelection.current = selected;
    if (!previous || selected) return;
    const trigger = sectionRef.current?.querySelector<HTMLButtonElement>(
      '[data-map-id="' + previous + '"]',
    );
    if (trigger) trigger.focus();
    else headingRef.current?.focus();
  }, [selected]);
  const graph = useMemo(() => {
    if (!focused || !selectedRecord) return { nodes: [], edges: [] };
    const immediate = [selectedRecord.id, ...selectedRecord.prerequisites];
    if (showConnections)
      immediate.push(
        ...((selectedRecord.related || []) as string[]),
        ...((selectedRecord.concurrent || []) as string[]),
      );
    const result = makeGraph(data, immediate, includePrereqs);
    return {
      ...result,
      edges: result.edges.filter(
        (edge) => showConnections || edge.relationship === "prerequisite",
      ),
    };
  }, [data, selectedRecord, focused, includePrereqs, showConnections]);
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
          onSelect: selectDependency,
        },
        draggable: false,
      })),
    [graph, selected, selectDependency],
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
          stroke: "var(--map-" + edge.relationship + ")",
          strokeWidth: edge.relationship === "prerequisite" ? 1.8 : 1.2,
          strokeDasharray:
            edge.relationship === "concurrent"
              ? "3 4"
              : edge.relationship === "related"
                ? "8 5"
                : undefined,
        },
        ariaLabel:
          edge.relationship +
          ": " +
          records.get(edge.source)?.name +
          " → " +
          records.get(edge.target)?.name,
      })),
    [graph, records],
  );

  return (
    <section ref={sectionRef} className="map-section" aria-label={copy.graph}>
      {(selectedTerm || selectedRecord) && (
        <nav className="map-breadcrumb" aria-label={copy.graph}>
          <Button variant="link" size="sm" onClick={onOverview}>
            <ArrowLeft size={15} aria-hidden="true" />
            {copy.mapOverview}
          </Button>
          {selectedTerm && (
            <span>
              {copy.yearN(Math.ceil(selectedTerm.number / 2))} /{" "}
              {copy.term(selectedTerm.number)}
            </span>
          )}
          {dependencyMode && (
            <Button variant="link" size="sm" onClick={() => onFocus(false)}>
              {copy.mapBackTerm}
            </Button>
          )}
        </nav>
      )}
      {!dependencyMode && !selectedTerm && (
        <div className="program-roadmap" data-testid="program-roadmap">
          <div className="roadmap-goal">
            <Flag size={22} aria-hidden="true" />
            <div>
              <span className="eyebrow">{copy.mapGraduateGoal}</span>
              <p>{program.roadmap_goal || program.summary}</p>
            </div>
          </div>
          <p className="roadmap-sequence">{copy.mapSequence}</p>
          {filtering && (
            <p className="small-muted" role="status">
              {copy.mapSearchHint}
            </p>
          )}
          {filtering && !ids.length && <Alert>{copy.noResults}</Alert>}
          <ol className="roadmap-years">
            {years.map((year) => (
              <li key={year}>
                <Card className="roadmap-year">
                  <CardContent>
                    <span className="roadmap-year-number">
                      {copy.yearN(year)}
                    </span>
                    <h2>
                      {program.roadmap_years?.find(
                        (stage) => stage.year === year,
                      )?.title || copy.yearN(year)}
                    </h2>
                    <ol className="roadmap-semesters">
                      {program.semesters
                        .filter((term) => Math.ceil(term.number / 2) === year)
                        .map((term) => {
                          const count = new Set(
                            [...term.chapters, ...term.competencies].filter(
                              (id) => matching.has(id),
                            ),
                          ).size;
                          return (
                            <li key={term.id}>
                              <Button
                                variant="ghost"
                                className="roadmap-milestone"
                                onClick={() => onTerm(term.number)}
                                aria-label={copy.mapExploreTerm(term.number)}
                              >
                                <span className="roadmap-milestone-copy">
                                  <small>{copy.term(term.number)}</small>
                                  <strong>{term.theme}</strong>
                                  {filtering && (
                                    <span className="roadmap-match">
                                      {copy.mapMatches(count)}
                                    </span>
                                  )}
                                </span>
                                <ArrowRight size={16} aria-hidden="true" />
                              </Button>
                            </li>
                          );
                        })}
                    </ol>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      )}
      {!dependencyMode && selectedTerm && (
        <div className="semester-map stack" data-testid="semester-map">
          <div className="map-semester-heading">
            <h2 ref={headingRef} tabIndex={-1}>
              {selectedTerm.theme}
            </h2>
            <p>{selectedTerm.independence}</p>
            <p className="small-muted">{copy.mapSemesterHint}</p>
          </div>
          <div className="map-capabilities">
            {selectedTerm.competencies.map((id) => {
              const record = records.get(id)!;
              const team = data.assessments.some(
                (assessment) =>
                  assessment.mode === "team" &&
                  assessment.competencies.includes(id),
              );
              return (
                <Card key={id}>
                  <CardContent>
                    <span className="eyebrow">
                      {team ? copy.team : copy.technical}
                    </span>
                    <Button
                      variant={selected === id ? "primary" : "outline"}
                      className="map-capability-button"
                      data-map-id={id}
                      onClick={() => onSelect(id)}
                      aria-pressed={selected === id}
                    >
                      {record.name}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {studio && (
            <Accordion
              items={[
                {
                  id: studio.id,
                  title: copy.studio + ": " + studio.name,
                  content: <StudioView data={data} studio={studio} />,
                },
              ]}
            />
          )}
          <details
            className="map-foundations"
            data-testid="map-foundations"
            open={filtering || undefined}
          >
            <summary>{copy.foundations}</summary>
            <div className="map-foundation-list">
              {selectedTerm.chapters
                .filter((id) => !filtering || matching.has(id))
                .map((id) => (
                  <Button
                    key={id}
                    data-map-id={id}
                    variant="outline"
                    onClick={() => onSelect(id)}
                    aria-pressed={selected === id}
                  >
                    {records.get(id)?.name}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Button>
                ))}
              {filtering &&
                !selectedTerm.chapters.some((id) => matching.has(id)) && (
                  <p className="small-muted">{copy.noResults}</p>
                )}
            </div>
          </details>
        </div>
      )}
      {!dependencyMode && selectedRecord && (
        <div className="map-selected">
          <div>
            <span className="small-muted">{copy.mapSelected}</span>
            <strong>{selectedRecord.name}</strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIncludePrereqs(false);
              setShowConnections(false);
              onFocus(true);
            }}
          >
            {copy.mapDependencies}
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>
      )}
      {dependencyMode && (
        <>
          <h2 ref={headingRef} tabIndex={-1} className="map-dependency-title">
            {selectedRecord!.name}
          </h2>
          <p className="small-muted">{copy.focusHint}</p>
          <div className="map-actions">
            <div className="map-options">
              <Checkbox
                checked={includePrereqs}
                onChange={(event) => setIncludePrereqs(event.target.checked)}
                label={copy.showPrereqs}
              />
              <Checkbox
                checked={showConnections}
                onChange={(event) => setShowConnections(event.target.checked)}
                label={copy.mapConnections}
              />
            </div>
            <ButtonGroup>
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
            {showConnections && (
              <>
                <span className="legend-related">{copy.relatedEdge}</span>
                <span className="legend-concurrent">{copy.concurrentEdge}</span>
              </>
            )}
            <Badge variant="secondary">{copy.unitsCount(nodes.length)}</Badge>
          </div>
          <div className="graph-canvas" data-testid="graph-canvas">
            <ReactFlow
              key={[selected, includePrereqs, showConnections].join(":")}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.15}
              maxZoom={1.2}
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
                    <Button variant="link" onClick={() => selectDependency(node.id)}>
                      {node.label}
                    </Button>
                    <span className="small-muted">
                      {graph.edges
                        .filter(
                          (edge) =>
                            edge.target === node.id &&
                            edge.relationship === "prerequisite",
                        )
                        .map((edge) => records.get(edge.source)?.name)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
