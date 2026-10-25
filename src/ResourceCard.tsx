import { Badge, Card, CardContent } from "@mieweb/ui";
import {
  ExternalLink,
  PlayCircle,
  BookOpen,
  MousePointerClick,
} from "lucide-react";
import type { Resource } from "./data/types";
import { copy, statusLabel, text } from "./i18n";

export const inspectedResource = (resource: Resource) =>
  /reviewed|inspected|source_checked/.test(resource.review_status) &&
  !/pending|metadata|candidate/.test(resource.review_status);
export function ResourceCard({
  resource,
  compact = false,
}: {
  resource: Resource;
  compact?: boolean;
}) {
  const Icon = /video/.test(resource.format)
    ? PlayCircle
    : /interactive|practice/.test(resource.format)
      ? MousePointerClick
      : BookOpen;
  return (
    <Card className="resource-card">
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
        <p className="resource-access">
          <strong>{copy.access}:</strong> {resource.access}
        </p>
        {!compact && (
          <>
            <div className="practice-block">
              <h4>{copy.practice}</h4>
              <p>{resource.practice}</p>
              <h4>{copy.assessmentConnection}</h4>
              <p>{resource.assessment_connection}</p>
            </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
