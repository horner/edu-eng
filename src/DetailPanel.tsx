import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Select,
  Textarea,
  Accordion,
} from "@mieweb/ui";
import { BookOpen, Compass, ExternalLink, Sparkles, X } from "lucide-react";
import type { Assessment, Curriculum, Studio, Topic } from "./data/types";
import { prerequisitePath } from "./data/load";
import { recordMap, type LearningRecord } from "./graph";
import { ResourceCard } from "./ResourceCard";
import { copy, list, statusLabel, text } from "./i18n";
import type { Entry } from "./state";

export function EvidenceList({ items }: { items: string[] }) {
  return (
    <ul className="evidence-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
function Topics({ topics }: { topics: Topic[] }) {
  return (
    <ul className="topic-outline">
      {topics.map((topic) => (
        <li key={topic.id}>
          {topic.name}
          {topic.sub?.length ? <Topics topics={topic.sub} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function AssessmentView({ assessment }: { assessment: Assessment }) {
  return (
    <Card className="assessment-card">
      <CardContent>
        <Badge
          variant={assessment.mode === "individual" ? "default" : "secondary"}
        >
          {assessment.mode === "individual" ? copy.individual : copy.teamMode}
        </Badge>
        <h4>{assessment.name}</h4>
        <p>{assessment.task}</p>
        <h5>{copy.evidence}</h5>
        <EvidenceList items={assessment.evidence} />
        <h5>{copy.rubric}</h5>
        <EvidenceList items={assessment.rubric} />
        {text(assessment.pass_interpretation) && (
          <p className="small-muted">{text(assessment.pass_interpretation)}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StudioView({
  studio,
  data,
}: {
  studio: Studio;
  data: Curriculum;
}) {
  const assessments = data.assessments.filter((assessment) =>
    assessment.competencies.some((id) => studio.competencies.includes(id)),
  );
  return (
    <div className="studio-body">
      <p>{studio.summary}</p>
      <h4>{copy.need}</h4>
      <p>{studio.need}</p>
      <Accordion
        type="multiple"
        items={[
          {
            id: "deliverables",
            title: copy.deliverables,
            content: <EvidenceList items={studio.deliverables} />,
          },
          {
            id: "decomposition",
            title: copy.decomposition,
            content: <EvidenceList items={studio.decomposition} />,
          },
          {
            id: "interfaces",
            title: copy.interfaces,
            content: <EvidenceList items={studio.interfaces} />,
          },
          {
            id: "roles",
            title: copy.roles,
            content: <EvidenceList items={studio.roles} />,
          },
          {
            id: "experiments",
            title: copy.experiments,
            content: <EvidenceList items={studio.experiments} />,
          },
          {
            id: "root-cause",
            title: copy.rootCause,
            content: <p>{studio.root_cause}</p>,
          },
          {
            id: "defense",
            title: copy.defense,
            content: <p>{studio.individual_defense}</p>,
          },
          {
            id: "assessments",
            title: copy.assessment,
            content: (
              <div className="stack">
                {assessments.map((assessment) => (
                  <AssessmentView key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export function resourcesFor(record: LearningRecord, data: Curriculum) {
  const ids = new Set(list(record.resources));
  for (const chapter of data.chapters)
    if (
      list(record.chapters).includes(chapter.id) ||
      list(chapter.competencies).includes(record.id)
    )
      list(chapter.resources).forEach((id) => ids.add(id));
  const byId = new Map(
    data.resources.map((resource) => [resource.id, resource]),
  );
  return [
    ...[...ids].flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])),
    ...data.resources.filter(
      (resource) =>
        !ids.has(resource.id) && resource.topics.includes(record.id),
    ),
  ];
}

export function DetailPanel({
  data,
  selected,
  onSelect,
  onClose,
  entry,
  onEntry,
}: {
  data: Curriculum;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  entry: Entry;
  onEntry: (entry: Entry) => void;
}) {
  const [tab, setTab] = useState<"learn" | "evidence" | "notes">("learn");
  const heading = useRef<HTMLHeadingElement>(null);
  const records = recordMap(data);
  const record = records.get(selected);
  useEffect(() => {
    setTab("learn");
    if (record)
      heading.current?.focus({
        preventScroll: window.matchMedia("(min-width: 1101px)").matches,
      });
  }, [selected]); // Selection opens the corresponding accessible heading.
  if (!record)
    return (
      <aside className="detail-panel detail-placeholder">
        <Compass size={32} aria-hidden="true" />
        <h2>{copy.detailEmpty}</h2>
        <p>{copy.detailEmptyBody}</p>
      </aside>
    );
  const resources = resourcesFor(record, data);
  const sparks = resources.filter(
    (resource) => resource.learning_role === "spark",
  );
  const deeper = resources.filter(
    (resource) => resource.learning_role !== "spark",
  );
  const assessmentIds = new Set(list(record.assessments));
  const assessments = data.assessments.filter(
    (assessment) =>
      assessmentIds.has(assessment.id) ||
      assessment.competencies.includes(record.id),
  );
  const path = prerequisitePath(record.id, data).filter(
    (id) => id !== record.id,
  );
  const chapter = "topics" in record;
  return (
    <aside
      className="detail-panel"
      aria-label={record.name}
      data-testid="detail-panel"
    >
      <div className="detail-top">
        <Badge variant="secondary">
          {chapter ? copy.learningAreas : copy.capabilities}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          aria-label={copy.closeDetail}
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </Button>
      </div>
      <h2 ref={heading} tabIndex={-1}>
        {record.name}
      </h2>
      <p className="detail-summary">{record.summary}</p>
      <div className="detail-tabs">
        <ButtonGroup>
          <Button
            size="sm"
            variant={tab === "learn" ? "primary" : "ghost"}
            onClick={() => setTab("learn")}
            aria-pressed={tab === "learn"}
          >
            {copy.learn}
          </Button>
          <Button
            size="sm"
            variant={tab === "evidence" ? "primary" : "ghost"}
            onClick={() => setTab("evidence")}
            aria-pressed={tab === "evidence"}
          >
            {copy.demonstrate}
          </Button>
          <Button
            size="sm"
            variant={tab === "notes" ? "primary" : "ghost"}
            onClick={() => setTab("notes")}
            aria-pressed={tab === "notes"}
          >
            {copy.note}
          </Button>
        </ButtonGroup>
      </div>
      {tab === "learn" && (
        <div className="stack">
          {sparks.length > 0 && (
            <section
              className="curiosity-section"
              data-testid="curiosity-resources"
            >
              <h3>
                <Sparkles size={18} aria-hidden="true" />
                {copy.curiosity}
              </h3>
              <p className="small-muted">{copy.curiosityIntro}</p>
              <div className="stack">
                {sparks.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h3>{copy.prerequisites}</h3>
            {path.length ? (
              <ol className="prerequisite-list">
                {path.map((id) => (
                  <li key={id}>
                    <Button variant="link" onClick={() => onSelect(id)}>
                      {records.get(id)?.name || id}
                    </Button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="small-muted">{copy.noPrereqs}</p>
            )}
          </section>
          {chapter &&
            Array.isArray(record.topics) &&
            record.topics.length > 0 && (
              <Accordion
                items={[
                  {
                    id: "topics",
                    title: copy.learningAreas,
                    content: <Topics topics={record.topics as Topic[]} />,
                  },
                ]}
              />
            )}
          <section>
            <h3>
              <BookOpen size={18} aria-hidden="true" />
              {sparks.length ? copy.goDeeper : copy.learn}
            </h3>
            {deeper.length ? (
              <div className="stack">
                {deeper.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <Alert variant="warning">{copy.resourceGap}</Alert>
            )}
          </section>
          {list(record.related).length > 0 && (
            <section>
              <h3>{copy.related}</h3>
              <div className="link-stack">
                {list(record.related).map((id) => (
                  <Button key={id} variant="link" onClick={() => onSelect(id)}>
                    {records.get(id)?.name || id}
                  </Button>
                ))}
              </div>
            </section>
          )}
          <section className="provenance">
            <h3>{copy.sourceOwnership}</h3>
            <p>
              {record.ownership === "upstream"
                ? copy.upstreamContent
                : copy.localContent}
            </p>
            <Badge variant="outline" size="sm">
              {statusLabel(record.review_status)}
            </Badge>
            <a
              href={
                record.ownership === "upstream"
                  ? `https://mohamedmuneerm.github.io/knowledge-navigator/#/?c=${encodeURIComponent(record.id)}`
                  : `https://github.com/horner/edu-eng/tree/main/data/${chapter ? "chapters" : "competencies"}`
              }
              target="_blank"
              rel="noreferrer"
            >
              {copy.sourceFile}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </section>
        </div>
      )}
      {tab === "evidence" && (
        <div className="stack">
          {list(record.performance_criteria).length > 0 && (
            <section>
              <h3>{copy.criteria}</h3>
              <EvidenceList items={list(record.performance_criteria)} />
            </section>
          )}
          {assessments.map((assessment) => (
            <AssessmentView key={assessment.id} assessment={assessment} />
          ))}
          {!assessments.length && (
            <Alert variant="warning">{copy.reviewPending}</Alert>
          )}
        </div>
      )}
      {tab === "notes" && (
        <div className="stack">
          <Alert variant="info">{copy.localNotice}</Alert>
          <Select
            label={copy.state}
            value={entry.activity}
            onValueChange={(activity) =>
              onEntry({ ...entry, activity: activity as Entry["activity"] })
            }
            options={[
              { value: "", label: copy.notStarted },
              ...(["planned", "studied", "practiced", "assessed"] as const).map(
                (value) => ({ value, label: copy[value] }),
              ),
            ]}
          />
          <Textarea
            label={copy.note}
            placeholder={copy.notePlaceholder}
            value={entry.note}
            onChange={(event) =>
              onEntry({ ...entry, note: event.target.value })
            }
            maxLength={50000}
            rows={7}
          />
          <p className="small-muted">{copy.completionWarning}</p>
        </div>
      )}
    </aside>
  );
}
