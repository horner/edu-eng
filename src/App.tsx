import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  Alert,
  AlertDialog,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Input,
  Progress,
  Select,
  Spinner,
  useThemeContext,
} from "@mieweb/ui";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  FlaskConical,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import type { Curriculum, Metadata, Program, Semester } from "./data/types";
import { loadCurriculum, resolveProgram } from "./data/load";
import { copy, list, statusLabel, text } from "./i18n";
import {
  browserStorage,
  parseBackup,
  readProgress,
  readRoute,
  saveProgress,
  storageKey,
  writeRoute,
  type Backup,
  type Entries,
  type Entry,
  type Route,
} from "./state";
import { brandCSS } from "./theme";
import { recordMap } from "./graph";
import {
  DetailPanel,
  EvidenceList,
  resourcesFor,
  StudioView,
} from "./DetailPanel";
import { GraphView } from "./GraphView";
import { ResourceCard, inspectedResource } from "./ResourceCard";

const repository = "https://github.com/horner/edu-eng";
const views = [
  { id: "browse", icon: LayoutGrid },
  { id: "graph", icon: GitBranch },
  { id: "review", icon: ShieldCheck },
  { id: "resources", icon: BookOpen },
] as const;
const emptyEntry: Entry = { activity: "", note: "" };

function TermCard({
  term,
  data,
  selected,
  onSelect,
  onTerm,
  expanded = false,
}: {
  term: Semester;
  data: Curriculum;
  selected: string;
  onSelect: (id: string) => void;
  onTerm: (n: number) => void;
  expanded?: boolean;
}) {
  const records = recordMap(data);
  const studio = data.studios.find((item) => item.id === term.studio);
  const credits = term.credit_units.reduce(
    (sum, unit) => sum + (unit.credits || 0),
    0,
  );
  return (
    <Card
      className={`term-card ${expanded ? "expanded" : ""}`}
      data-testid={`term-${term.number}`}
    >
      <CardContent>
        <div className="term-kicker">
          <span>{copy.term(term.number)}</span>
          <span>
            {credits} {copy.credits}
          </span>
        </div>
        <h3>{term.theme}</h3>
        <div className="capability-list">
          {term.competencies.map((id) => {
            const record = records.get(id);
            return (
              record && (
                <ButtonGroup key={id}>
                  <Button
                    variant={selected === id ? "primary" : "outline"}
                    className="capability-button"
                    onClick={() => onSelect(id)}
                    aria-pressed={selected === id}
                  >
                    {id.endsWith("-team") ? (
                      <Users size={17} aria-hidden="true" />
                    ) : (
                      <Compass size={17} aria-hidden="true" />
                    )}
                    <span>
                      <small>
                        {id.endsWith("-team") ? copy.team : copy.technical}
                      </small>
                      {record.name}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </ButtonGroup>
              )
            );
          })}
        </div>
        <div className="studio-preview">
          <FlaskConical size={19} aria-hidden="true" />
          <div>
            <span className="eyebrow">{copy.studio}</span>
            <p>{studio?.name}</p>
          </div>
        </div>
        {!expanded && (
          <ButtonGroup>
            <Button variant="link" onClick={() => onTerm(term.number)}>
              {copy.term(term.number)}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
          </ButtonGroup>
        )}
        {expanded && (
          <>
            <h4>{copy.foundations}</h4>
            <div className="learning-links">
              {term.chapters.map((id) => (
                <ButtonGroup key={id}>
                  <Button
                    variant={selected === id ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => onSelect(id)}
                    aria-pressed={selected === id}
                  >
                    {records.get(id)?.name || id}
                  </Button>
                </ButtonGroup>
              ))}
            </div>
            <div className="term-evidence">
              <h4>{copy.independence}</h4>
              <p>{term.independence}</p>
              <h4>{copy.completeWhen}</h4>
              <EvidenceList items={term.completion_criteria} />
            </div>
            {studio && (
              <Accordion
                items={[
                  {
                    id: studio.id,
                    title: `${copy.studio}: ${studio.name}`,
                    content: <StudioView studio={studio} data={data} />,
                  },
                ]}
              />
            )}
            <Accordion
              items={[
                {
                  id: "credit-ledger",
                  title: copy.creditLedger,
                  content: (
                    <>
                      <ul className="credit-list">
                        {term.credit_units.map((unit) => (
                          <li key={unit.id}>
                            <span>{unit.title}</span>
                            <strong>{unit.credits ?? copy.unresolved}</strong>
                            <Badge size="sm" variant="outline">
                              {statusLabel(unit.category)}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                      <p className="small-muted">{copy.creditStatus}</p>
                    </>
                  ),
                },
              ]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CreditSummary({
  data,
  program,
}: {
  data: Curriculum;
  program: Program;
}) {
  const ledger = data.ledgers.find((item) => item.program === program.id);
  if (!ledger) return null;
  return (
    <Card className="credit-summary">
      <CardContent>
        <div className="section-line">
          <h3>{copy.creditLedger}</h3>
          <Badge
            variant={ledger.status === "unresolved" ? "warning" : "secondary"}
          >
            {copy[ledger.status]}
          </Badge>
        </div>
        <p>{copy.ledgerTotal(ledger.total, ledger.target)}</p>
        <div className="credit-categories">
          {(["math_science", "engineering", "broad_education"] as const).map(
            (category) => (
              <div key={category}>
                <strong>{ledger.by_category[category] || 0}</strong>
                <span>
                  {category === "math_science"
                    ? copy.mathScience
                    : category === "engineering"
                      ? copy.engineering
                      : copy.broadEducation}
                </span>
              </div>
            ),
          )}
        </div>
        <p className="small-muted">{copy.creditStatus}</p>
        {ledger.issues.length > 0 && <EvidenceList items={ledger.issues} />}
      </CardContent>
    </Card>
  );
}

function metadataRecords(value: unknown): Metadata[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Metadata =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function AbetReview({
  data,
  program,
  onSelect,
  onTerm,
}: {
  data: Curriculum;
  program: Program;
  onSelect: (id: string) => void;
  onTerm: (n: number) => void;
}) {
  const records = recordMap(data);
  const criteria = data.crosswalks.flatMap((crosswalk) =>
    metadataRecords(crosswalk.criteria),
  );
  return (
    <div className="stack">
      <CreditSummary data={data} program={program} />
      <Alert variant="warning">
        <strong>{copy.gaps}</strong>
        <EvidenceList items={program.gaps || []} />
      </Alert>
      <div className="section-links">
        <a
          href={`${repository}/blob/main/docs/abet-audit.md`}
          target="_blank"
          rel="noreferrer"
        >
          {copy.auditLink}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <a
          href="https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/"
          target="_blank"
          rel="noreferrer"
        >
          ABET EAC 2026–2027
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
      <Accordion
        type="multiple"
        items={criteria.map((criterion, index) => ({
          id: text(criterion.id) || String(index),
          title: (
            <span className="criterion-heading">
              <strong>{text(criterion.id)}</strong>
              <span>
                {text(criterion.title) ||
                  text(criterion.requirement) ||
                  text(criterion.statement)}
              </span>
              <Badge variant="warning" size="sm">
                {copy.reviewPending}
              </Badge>
            </span>
          ),
          content: (
            <div className="stack">
              <p>
                {text(criterion.requirement) ||
                  text(criterion.statement) ||
                  text(criterion.description)}
              </p>
              {text(criterion.coverage) && (
                <p>
                  <strong>{copy.coverage}:</strong> {text(criterion.coverage)}
                </p>
              )}
              {metadataRecords(criterion.instructional_stages).length > 0 && (
                <section>
                  <h4>{copy.instructionalStages}</h4>
                  <ul className="evidence-list">
                    {metadataRecords(criterion.instructional_stages).map(
                      (stage, i) => (
                        <li key={i}>
                          <Badge variant="secondary" size="sm">
                            {statusLabel(text(stage.stage))}
                          </Badge>{" "}
                          {Array.isArray(stage.terms)
                            ? stage.terms
                                .map((n) => copy.term(Number(n)))
                                .join(", ")
                            : ""}
                          <p>{text(stage.meaning)}</p>
                        </li>
                      ),
                    )}
                  </ul>
                  <p className="small-muted">
                    {text(criterion.stage_interpretation)}
                  </p>
                </section>
              )}
              {list(criterion.competencies).length > 0 && (
                <section>
                  <h4>{copy.linkedCapabilities}</h4>
                  <div className="link-stack">
                    {list(criterion.competencies).map((id) => (
                      <ButtonGroup key={id}>
                        <Button variant="link" onClick={() => onSelect(id)}>
                          {records.get(id)?.name || id}
                        </Button>
                      </ButtonGroup>
                    ))}
                  </div>
                </section>
              )}
              {list(criterion.studios).length > 0 && (
                <section>
                  <h4>{copy.linkedStudios}</h4>
                  <div className="link-stack">
                    {list(criterion.studios).map((id) => {
                      const term = program.semesters.find(
                        (item) => item.studio === id,
                      );
                      return (
                        term && (
                          <ButtonGroup key={id}>
                            <Button
                              variant="link"
                              onClick={() => onTerm(term.number)}
                            >
                              {copy.term(term.number)}:{" "}
                              {
                                data.studios.find((item) => item.id === id)
                                  ?.name
                              }
                            </Button>
                          </ButtonGroup>
                        )
                      );
                    })}
                  </div>
                </section>
              )}
              {list(criterion.evidence).length > 0 && (
                <>
                  <h4>{copy.evidence}</h4>
                  <EvidenceList items={list(criterion.evidence)} />
                </>
              )}
              {list(criterion.gaps).length > 0 && (
                <Alert variant="warning">
                  <strong>{copy.gaps}</strong>
                  <EvidenceList items={list(criterion.gaps)} />
                </Alert>
              )}
            </div>
          ),
        }))}
      />
      {data.baselines.map((baseline, index) => (
        <Card key={text(baseline.id) || index}>
          <CardContent>
            <h3>{copy.baseline}</h3>
            <p>{text(baseline.summary) || text(baseline.note)}</p>
            <Badge variant="secondary">
              {statusLabel(
                text(baseline.review_status) || text(baseline.status),
              )}
            </Badge>
            {list(baseline.gaps).length > 0 && (
              <EvidenceList items={list(baseline.gaps)} />
            )}
            <a
              className="block-link"
              href={`${repository}/tree/main/data/baselines`}
              target="_blank"
              rel="noreferrer"
            >
              {copy.sourceFile}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Workspace({
  data,
  route,
  updateRoute,
}: {
  data: Curriculum;
  route: Route;
  updateRoute: (update: Partial<Route>, replace?: boolean) => void;
}) {
  const institution =
    data.institutions.find((item) => item.id === route.institution) ||
    data.institutions[0];
  const program = useMemo(
    () => resolveProgram(data, institution.id, "biomedical"),
    [data, institution.id],
  );
  const brand = data.brands.find((item) => item.id === institution.brand_id)!;
  const teamTools = (institution.team_tools || {}) as Record<string, string>;
  const { resolvedTheme, setTheme } = useThemeContext();
  const [storage] = useState(browserStorage);
  const [initial] = useState(() =>
    storage
      ? readProgress(
          storage,
          institution.id,
          program.id,
          data.redirects.chapters,
        )
      : { entries: {}, warning: copy.sessionOnly },
  );
  const [entries, setEntries] = useState<Entries>(initial.entries);
  const [warning, setWarning] = useState(initial.warning);
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const records = useMemo(() => recordMap(data), [data]);
  const knownIds = useMemo(() => new Set(records.keys()), [records]);
  const terms = program.semesters.filter(
    (term) => !route.term || term.number === route.term,
  );
  const visibleIds = useMemo(
    () => [
      ...new Set(
        terms.flatMap((term) => [...term.chapters, ...term.competencies]),
      ),
    ],
    [program, route.term],
  );
  const matchingIds = visibleIds.filter((id) => {
    const record = records.get(id)!;
    const q = route.q.toLowerCase();
    const resources = resourcesFor(record, data);
    return (
      (!q ||
        `${record.name} ${record.summary} ${resources.map((resource) => resource.title).join(" ")}`
          .toLowerCase()
          .includes(q)) &&
      (route.review === "all" ||
        (route.review === "reviewed"
          ? resources.some(inspectedResource)
          : !resources.some(inspectedResource)))
    );
  });
  const selected = records.has(route.node) ? route.node : "";
  const selectedTerm = program.semesters.find(
    (term) => term.number === route.term,
  );
  const activityCount = visibleIds.filter((id) =>
    Boolean(entries[id]?.activity),
  ).length;
  const select = useCallback(
    (node: string) => updateRoute({ node }),
    [updateRoute],
  );
  const showTerm = (term: number) =>
    updateRoute({ term, view: "browse", q: "", review: "all", focus: false });
  const updateEntry = (entry: Entry) => {
    const next = { ...entries, [selected]: entry };
    setEntries(next);
    if (warning === copy.corruptStorage) return;
    if (!storage || !saveProgress(storage, institution.id, program.id, next))
      setWarning(copy.sessionOnly);
  };
  const exportProgress = () => {
    const backup: Backup = {
      version: 1,
      institution: institution.id,
      program: program.id,
      curriculum_revision: data.revision,
      entries,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${copy.downloadName}-${institution.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importProgress = async (file: File | undefined) => {
    if (!file) return;
    try {
      const result = parseBackup(
        await file.text(),
        institution.id,
        program.id,
        data.revision,
        knownIds,
        data.redirects.chapters,
      );
      const merged = { ...entries, ...result.entries };
      setEntries(merged);
      if (
        !storage ||
        warning === copy.corruptStorage ||
        !saveProgress(storage, institution.id, program.id, merged)
      )
        setWarning(
          warning === copy.corruptStorage ? warning : copy.sessionOnly,
        );
      setMessage(
        [
          copy.imported,
          result.unknown.length
            ? copy.importedUnknown(result.unknown.length)
            : "",
          result.revisionChanged ? copy.importRevision : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : copy.importError,
      );
    }
    if (fileInput.current) fileInput.current.value = "";
  };
  const resetProgress = () => {
    setEntries({});
    setResetOpen(false);
    setMessage(copy.resetDone);
    try {
      if (!storage) throw new Error();
      storage.removeItem(storageKey(institution.id, program.id));
      setWarning("");
    } catch {
      setWarning(copy.sessionOnly);
    }
  };
  const logo =
    resolvedTheme === "dark" && text(brand.logo_dark_url)
      ? text(brand.logo_dark_url)
      : brand.logo_url;
  const resources = data.resources.filter(
    (resource) =>
      (!route.q ||
        `${resource.title} ${resource.description} ${resource.topics.map((id) => records.get(id)?.name || id).join(" ")}`
          .toLowerCase()
          .includes(route.q.toLowerCase())) &&
      (!route.term || resource.topics.some((id) => visibleIds.includes(id))) &&
      (route.review === "all" ||
        (route.review === "reviewed"
          ? inspectedResource(resource)
          : !inspectedResource(resource))),
  );
  const heading =
    route.view === "graph"
      ? copy.mapTitle
      : route.view === "review"
        ? copy.abetTitle
        : route.view === "resources"
          ? copy.allResources
          : selectedTerm?.theme || copy.heroTitle;
  return (
    <div className="education-app">
      <style>{brandCSS(brand)}</style>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        {copy.skip}
      </a>
      <header className="app-header">
        <a
          className="brand-lockup"
          href={`#/program/biomedical?institution=${institution.id}&view=browse`}
          aria-label={`${institution.name} · ${copy.appName}`}
        >
          {logo && !logoFailed ? (
            <img
              src={`${import.meta.env.BASE_URL}${logo}`}
              alt={brand.logo_alt || institution.name}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <strong>{institution.name}</strong>
          )}
          <span className="brand-divider" />
          <span className="app-title">
            {copy.appName}
            <small>{copy.appSubtitle}</small>
          </span>
        </a>
        <div className="header-actions">
          <Badge variant="outline">{copy.prototype}</Badge>
          <ButtonGroup>
            <Button
              size="icon"
              variant="ghost"
              aria-label={copy.theme}
              onClick={() => {
                try {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                } catch {
                  setWarning(copy.sessionOnly);
                }
              }}
            >
              {resolvedTheme === "dark" ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
            </Button>
            <a
              className="source-link"
              href={repository}
              target="_blank"
              rel="noreferrer"
            >
              {copy.source}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </ButtonGroup>
        </div>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-program">
            <div className="program-icon">
              <GraduationCap size={23} aria-hidden="true" />
            </div>
            <p>
              {copy.biomedical}
              <small>{copy.proposal}</small>
            </p>
          </div>
          <Select
            label={copy.institution}
            size="sm"
            value={institution.id}
            onValueChange={(id) => updateRoute({ institution: id })}
            options={data.institutions.map((item) => ({
              value: item.id,
              label: item.short_name,
            }))}
          />
          {institution.id === "demo-university" && (
            <p className="small-muted">{copy.demoProfile}</p>
          )}
          <nav className="view-nav" aria-label={copy.nav}>
            {views.map((view) => (
              <a
                key={view.id}
                href={`#/program/biomedical?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.hash.split("?")[1] || "")), institution: institution.id, view: view.id })}`}
                aria-current={route.view === view.id ? "page" : undefined}
              >
                <view.icon size={18} aria-hidden="true" />
                {copy[view.id]}
              </a>
            ))}
          </nav>
          <div className="semester-nav">
            <p className="nav-label">{copy.chooseTerm}</p>
            <ButtonGroup orientation="vertical">
              <Button
                variant={route.term === 0 ? "secondary" : "ghost"}
                size="sm"
                onClick={() => showTerm(0)}
                aria-pressed={route.term === 0}
              >
                {copy.allTerms}
              </Button>
              {program.semesters.map((term) => (
                <Button
                  key={term.id}
                  variant={route.term === term.number ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => showTerm(term.number)}
                  aria-pressed={route.term === term.number}
                >
                  <span className="term-number">
                    {String(term.number).padStart(2, "0")}
                  </span>
                  {term.theme}
                </Button>
              ))}
            </ButtonGroup>
          </div>
          <div className="sidebar-bottom">
            <ShieldCheck size={19} aria-hidden="true" />
            <strong>{copy.localShort}</strong>
            <p>{copy.localNotice}</p>
            <ButtonGroup orientation="vertical">
              <Button size="sm" variant="outline" onClick={exportProgress}>
                <ArrowDownToLine size={15} aria-hidden="true" />
                {copy.backup}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInput.current?.click()}
              >
                <ArrowUpFromLine size={15} aria-hidden="true" />
                {copy.restore}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setResetOpen(true)}
              >
                {copy.reset}
              </Button>
            </ButtonGroup>
            <Input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              label={copy.restore}
              className="file-input"
              onChange={(event) => void importProgress(event.target.files?.[0])}
            />
          </div>
          <section className="team-tools">
            <h4>{copy.teamTools}</h4>
            <div className="section-links">
              {teamTools.huddle && (
                <a href={teamTools.huddle} target="_blank" rel="noreferrer">
                  {copy.huddle}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
              {teamTools.pulse && (
                <a href={teamTools.pulse} target="_blank" rel="noreferrer">
                  {copy.pulse}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
            </div>
            <p className="small-muted">{copy.teamToolsNote}</p>
          </section>
        </aside>
        <main
          id="main-content"
          tabIndex={-1}
          className={`main-content ${selected ? "with-detail" : ""}`}
        >
          <div className="main-heading">
            <div className="eyebrow">
              <span className="accent-dot" />
              {route.term ? copy.term(route.term) : copy.heroLabel}
            </div>
            <h1>{heading}</h1>
            <p>
              {route.view === "graph"
                ? copy.mapIntro
                : route.view === "review"
                  ? copy.abetIntro
                  : route.view === "resources"
                    ? copy.resourceIntro
                    : selectedTerm?.independence || copy.heroBody}
            </p>
          </div>
          {route.view === "browse" && !route.term && (
            <div className="program-stats">
              <div>
                <strong>{Math.ceil(program.semesters.length / 2)}</strong>
                <span>{copy.years}</span>
              </div>
              <div>
                <strong>{program.semesters.length}</strong>
                <span>{copy.terms}</span>
              </div>
              <div>
                <strong>{program.target_credits}</strong>
                <span>{copy.credits}</span>
              </div>
              <div>
                <strong>{data.studios.length}</strong>
                <span>{copy.studios}</span>
              </div>
            </div>
          )}
          <div className="content-tools">
            <Input
              label={copy.search}
              hideLabel
              placeholder={copy.searchPlaceholder}
              value={route.q}
              onChange={(event) => updateRoute({ q: event.target.value }, true)}
            />
            <Select
              label={copy.reviewFilter}
              hideLabel
              size="md"
              value={route.review}
              onValueChange={(review) => updateRoute({ review })}
              options={[
                { value: "all", label: copy.allReviews },
                { value: "reviewed", label: copy.reviewed },
                { value: "gaps", label: copy.reviewGaps },
              ]}
            />
            <div className="mobile-term-select">
              <Select
                label={copy.chooseTerm}
                value={String(route.term)}
                onValueChange={(term) =>
                  updateRoute({ term: Number(term), focus: false })
                }
                options={[
                  { value: "0", label: copy.allTerms },
                  ...program.semesters.map((term) => ({
                    value: String(term.number),
                    label: `${copy.term(term.number)}: ${term.theme}`,
                  })),
                ]}
              />
            </div>
          </div>
          {warning && <Alert variant="warning">{warning}</Alert>}
          {message && (
            <Alert
              variant="info"
              dismissible
              dismissLabel={copy.closeDetail}
              onDismiss={() => setMessage("")}
            >
              {message}
            </Alert>
          )}
          {route.view === "browse" && (
            <>
              {!route.q && route.review === "all" ? (
                <div className={route.term ? "term-focus stack" : "term-grid"}>
                  {terms.map((term) => (
                    <TermCard
                      key={term.id}
                      term={term}
                      data={data}
                      selected={selected}
                      onSelect={select}
                      onTerm={showTerm}
                      expanded={Boolean(route.term)}
                    />
                  ))}
                </div>
              ) : (
                <div className="search-results">
                  {matchingIds.map((id) => {
                    const record = records.get(id)!;
                    return (
                      <Card key={id}>
                        <CardContent>
                          <ButtonGroup>
                            <Button variant="link" onClick={() => select(id)}>
                              {record.name}
                              <ChevronRight size={16} aria-hidden="true" />
                            </Button>
                          </ButtonGroup>
                          <p>{record.summary}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {!matchingIds.length && <Alert>{copy.noResults}</Alert>}
                </div>
              )}
              <div className="program-progress">
                <CheckCircle2 size={17} aria-hidden="true" />
                <span>
                  {copy.progressCount(activityCount, visibleIds.length)}
                </span>
                <Progress
                  value={
                    visibleIds.length
                      ? (activityCount / visibleIds.length) * 100
                      : 0
                  }
                  srLabel={copy.state}
                />
              </div>
              <Alert variant="default">
                <strong>{copy.sourceNotice}</strong>
                <p>{copy.proposalNotice}</p>
              </Alert>
            </>
          )}
          {route.view === "graph" && (
            <GraphView
              data={data}
              ids={matchingIds}
              selected={selected}
              onSelect={select}
              focused={route.focus}
              onFocus={(focus) => updateRoute({ focus })}
            />
          )}
          {route.view === "review" && (
            <AbetReview
              data={data}
              program={program}
              onSelect={select}
              onTerm={showTerm}
            />
          )}
          {route.view === "resources" && (
            <>
              <div className="section-line">
                <Badge variant="secondary">
                  {copy.resourceCount(resources.length)}
                </Badge>
                <a
                  href={`${repository}/blob/main/docs/resource-audit.md`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.resourceAudit}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
              <div className="resource-grid">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
              {!resources.length && <Alert>{copy.noResults}</Alert>}
            </>
          )}
          <footer className="app-footer">
            <p>{copy.footer}</p>
            <div>
              <a
                href={`${repository}/blob/main/bioprototype-plan.md`}
                target="_blank"
                rel="noreferrer"
              >
                {copy.planLink}
              </a>
              <a
                href={`${repository}/blob/main/ReadMe.md`}
                target="_blank"
                rel="noreferrer"
              >
                {copy.contextLink}
              </a>
              <a href={repository} target="_blank" rel="noreferrer">
                {copy.feedback}
              </a>
            </div>
            <p className="source-revision">
              {copy.sourceRevision}:{" "}
              <a
                href={`https://github.com/MohamedMuneerM/knowledge-navigator/tree/${data.upstream_revision}`}
                target="_blank"
                rel="noreferrer"
              >
                {data.upstream_revision.slice(0, 8)}
              </a>{" "}
              · CC BY-SA 4.0
            </p>
          </footer>
        </main>
        {selected && (
          <DetailPanel
            data={data}
            selected={selected}
            onSelect={select}
            onClose={() => updateRoute({ node: "" })}
            entry={entries[selected] || emptyEntry}
            onEntry={updateEntry}
          />
        )}
      </div>
      <AlertDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={copy.reset}
        description={copy.resetConfirm}
        actionLabel={copy.reset}
        cancelLabel={copy.closeDetail}
        onAction={resetProgress}
        variant="destructive"
      />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<Curriculum>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    let active = true;
    setError(false);
    loadCurriculum()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const updateRoute = useCallback(
    (update: Partial<Route>, replace = false) => {
      // Read the current URL so a fast edit after link navigation cannot
      // restore the previous view while its hashchange event is queued.
      const next = { ...readRoute(), ...update };
      setRoute(next);
      writeRoute(next, replace);
    },
    [],
  );
  if (error)
    return (
      <div className="loading-screen">
        <Alert variant="danger">{copy.loadError}</Alert>
        <Button onClick={() => setAttempt((n) => n + 1)}>{copy.retry}</Button>
      </div>
    );
  if (!data)
    return (
      <div className="loading-screen">
        <Spinner />
        <p>{copy.loading}</p>
      </div>
    );
  return (
    <Workspace
      key={route.institution}
      data={data}
      route={route}
      updateRoute={updateRoute}
    />
  );
}
