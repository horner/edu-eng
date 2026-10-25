/** Semantic source contract. Drawing coordinates and visitor state are separate. */
export interface Metadata {
  [key: string]: unknown;
}
export interface Topic extends Metadata {
  id: string;
  name: string;
  sub?: Topic[];
}
export interface Chapter extends Metadata {
  id: string;
  name: string;
  category: string;
  level: number;
  priority: string;
  summary: string;
  prerequisites: string[];
  related: string[];
  topics: Topic[];
  discipline: string;
  ownership: "upstream" | "local";
  resources?: string[];
  competencies?: string[];
  assessments?: string[];
  review_status?: string;
  concurrent?: string[];
}
export interface Discipline extends Metadata {
  id: string;
  name: string;
  prefix: string;
  categories: string[];
  icon?: string;
  color?: string;
  description?: string;
}
export interface Competency extends Metadata {
  id: string;
  name: string;
  summary: string;
  chapters: string[];
  prerequisites: string[];
  resources: string[];
  assessments: string[];
  performance_criteria: string[];
  review_status: string;
}
export interface Resource extends Metadata {
  id: string;
  title: string;
  creator: string;
  provider: string;
  url: string;
  format: string;
  topics: string[];
  description: string;
  access: string;
  accuracy_evidence: string;
  engagement_rationale: string;
  review_status: string;
  date_checked: string;
  practice: string;
  assessment_connection: string;
}
export interface Assessment extends Metadata {
  id: string;
  name: string;
  mode: "individual" | "team";
  task: string;
  evidence: string[];
  rubric: string[];
  competencies: string[];
  review_status: string;
}
export interface Studio extends Metadata {
  id: string;
  name: string;
  summary: string;
  need: string;
  deliverables: string[];
  decomposition: string[];
  interfaces: string[];
  roles: string[];
  experiments: string[];
  root_cause: string;
  individual_defense: string;
  competencies: string[];
  review_status: string;
}
export interface CreditUnit extends Metadata {
  id: string;
  title: string;
  credits: number | null;
  category: "math_science" | "engineering" | "broad_education" | "unclassified";
  status: "proposed" | "verified" | "unresolved";
}
export interface Semester extends Metadata {
  id: string;
  number: number;
  title: string;
  theme: string;
  chapters: string[];
  competencies: string[];
  studio: string;
  assessments: string[];
  credit_units: CreditUnit[];
  completion_criteria: string[];
  independence: string;
  concurrent?: string[];
}
export interface Program extends Metadata {
  id: string;
  name: string;
  summary: string;
  review_status: string;
  semesters: Semester[];
  target_credits: number;
  sources?: unknown[];
  gaps?: string[];
}
export interface Institution extends Metadata {
  id: string;
  name: string;
  short_name: string;
  brand_id: string;
  programs: string[];
  description?: string;
  academic_overrides?: Record<string, unknown>;
}
export interface Brand extends Metadata {
  id: string;
  name: string;
  colors: {
    primary: string;
    foreground: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  logo_url?: string;
  logo_alt?: string;
  sources: unknown[];
}
export interface Roadmap extends Metadata {
  id: string;
  name: string;
  icon?: string;
  tagline?: string;
  description?: string;
  outcomes?: string[];
  stages: {
    name: string;
    description?: string;
    items: {
      chapter: string;
      why?: string;
      depth?: "full" | "selected";
      focus?: string[];
    }[];
  }[];
  related?: string[];
}
export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  record: string;
  message: string;
}
export interface ProgramLedger {
  program: string;
  total: number;
  target: number;
  by_category: Record<string, number>;
  status: "proposed" | "unresolved" | "reconciled";
  issues: string[];
}
export interface Curriculum {
  schema_version: 1;
  revision: string;
  upstream_revision: string;
  chapters: Chapter[];
  disciplines: Discipline[];
  competencies: Competency[];
  resources: Resource[];
  assessments: Assessment[];
  studios: Studio[];
  programs: Program[];
  institutions: Institution[];
  brands: Brand[];
  crosswalks: Metadata[];
  baselines: Metadata[];
  roadmaps: Roadmap[];
  redirects: {
    chapters: Record<string, string>;
    topics: Record<string, string>;
  };
  validation: ValidationIssue[];
  ledgers: ProgramLedger[];
}
