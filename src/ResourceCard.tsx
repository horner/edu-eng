import { Badge, Card, CardContent } from "@mieweb/ui";
import {
  ExternalLink,
  PlayCircle,
  BookOpen,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import type { Resource } from "./data/types";
import { copy, statusLabel, text } from "./i18n";

export const inspectedResource = (resource: Resource) =>
  /reviewed|inspected|source_checked/.test(resource.review_status) &&
  !/pending|metadata|candidate/.test(resource.review_status);

function ReviewEvidence({ resource }: { resource: Resource }) {
  return (
    <dl className="review-evidence">
      <dt>{copy.accuracy}</dt>
      <dd>{resource.accuracy_evidence}</dd>
      <dt>{copy.engagement}</dt>
      <dd>{resource.engagement_rationale}</dd>
      {text(resource.review_scope) && (
        <>
          <dt>{copy.reviewScope}</dt>
          <dd>{text(resource.review_scope)}</dd>
        </>
      )}
      {text(resource.limitations) && (
        <>
          <dt>{copy.limitations}</dt>
          <dd>{text(resource.limitations)}</dd>
        </>
      )}
      <dt>{copy.checked}</dt>
      <dd>{resource.date_checked}</dd>
    </dl>
  );
}

export function ResourceCard({
  resource,
  compact = false,
}: {
  resource: Resource;
  compact?: boolean;
}) {
  const spark = resource.learning_role === "spark";
  const Icon = /video/.test(resource.format)
    ? PlayCircle
    : /interactive|practice/.test(resource.format)
      ? MousePointerClick
      : BookOpen;
  const access = (
    <p className="resource-access">
      <strong>{copy.access}:</strong> {resource.access}
    </p>
  );
  return (
    <Card
      className={"resource-card" + (spark ? " spark-resource" : "")}
      data-testid={spark ? "spark-resource" : undefined}
    >
      <CardContent>
        <div className="resource-kicker">
          <span>
            <Icon size={16} aria-hidden="true" />
            {resource.provider}
          </span>
          <Badge
            variant={inspectedResource(resource) ? "secondary" : "warning"}
            size="sm"
          >
            {statusLabel(resource.review_status)}
          </Badge>
        </div>
        <h3>
          <a href={resource.url} target="_blank" rel="noreferrer">
            {resource.title}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </h3>
        <p className="small-muted">{resource.creator}</p>
        <p>{resource.description}</p>
        {spark && (
          <p className="curiosity-question">
            <Sparkles size={16} aria-hidden="true" />
            <span>
              <strong>{copy.whyItMatters}</strong>
              {resource.why_it_matters}
            </span>
          </p>
        )}
        {spark && resource.format === "video" && (
          <a
            className="spark-watch"
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            <PlayCircle size={18} aria-hidden="true" />
            {copy.watchVideo}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
        {spark && resource.provider === "YouTube" && (
          <p className="small-muted">{copy.videoAccessNote}</p>
        )}
        {(!spark || compact) && access}
        {!compact &&
          (spark ? (
            <>
              <div className="practice-block">
                <h4>{copy.playWithIdea}</h4>
                <p>{resource.practice}</p>
              </div>
              <details className="resource-teaching-notes">
                <summary>{copy.sourceTeachingNotes}</summary>
                {access}
                <h4>{copy.assessmentConnection}</h4>
                <p>{resource.assessment_connection}</p>
                <ReviewEvidence resource={resource} />
              </details>
            </>
          ) : (
            <>
              <div className="practice-block">
                <h4>{copy.practice}</h4>
                <p>{resource.practice}</p>
                <h4>{copy.assessmentConnection}</h4>
                <p>{resource.assessment_connection}</p>
              </div>
              <ReviewEvidence resource={resource} />
            </>
          ))}
      </CardContent>
    </Card>
  );
}
