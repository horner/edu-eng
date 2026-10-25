import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { files, hash, readYaml, type Obj } from "./io.ts";
import type {
  Curriculum,
  ProgramLedger,
  ValidationIssue,
} from "../../src/data/types.ts";
import { resolveProgram } from "../../src/data/load.ts";
import { graphContract } from "../../src/data/graph-contract.ts";
export const collections = [
  "chapters",
  "disciplines",
  "competencies",
  "resources",
  "assessments",
  "studios",
  "programs",
  "institutions",
  "brands",
  "crosswalks",
  "baselines",
  "roadmaps",
] as const;
const requiredCore = [
  "id",
  "name",
  "category",
  "level",
  "priority",
  "summary",
  "prerequisites",
  "related",
  "topics",
  "discipline",
  "ownership",
];
export interface Overlay extends Obj {
  target_type: string;
  target_id: string;
  overrides?: Obj;
  extensions?: Obj;
  remove_fields?: string[];
}
export function loadOverlays(
  root: string,
): { path: string; record: Overlay }[] {
  const seen = new Set<string>();
  return files(join(root, "data/overlays")).map((path) => {
    const record = readYaml(path) as Overlay;
    const kind = collections.find(
      (kind) =>
        record.target_type === kind ||
        record.target_type === kind.replace(/ies$/, "y").replace(/s$/, ""),
    );
    if (!kind || typeof record.target_id !== "string")
      throw new Error(`${path}: unsupported overlay target`);
    if (record.schema_version !== undefined && record.schema_version !== 1)
      throw new Error(`${path}: incompatible overlay schema version`);
    if (
      Object.keys(record).some(
        (key) =>
          ![
            "schema_version",
            "target_type",
            "target_id",
            "overrides",
            "extensions",
            "remove_fields",
          ].includes(key),
      )
    )
      throw new Error(`${path}: unknown overlay operation`);
    const key = `${kind}:${record.target_id}`;
    if (seen.has(key))
      throw new Error(
        `${path}: duplicate overlay target ${key}; use one overlay per record`,
      );
    seen.add(key);
    return { path, record };
  });
}
export function applyOverlay(base: Obj, overlay: Overlay): Obj {
  if (
    typeof overlay.target_id !== "string" ||
    typeof overlay.target_type !== "string"
  )
    throw new Error("Overlay requires string target_type and target_id");
  for (const field of ["overrides", "extensions"])
    if (
      overlay[field] !== undefined &&
      (!overlay[field] ||
        typeof overlay[field] !== "object" ||
        Array.isArray(overlay[field]))
    )
      throw new Error(`${base.id}: ${field} must be a mapping`);
  if (
    overlay.remove_fields !== undefined &&
    (!Array.isArray(overlay.remove_fields) ||
      overlay.remove_fields.some((k) => typeof k !== "string"))
  )
    throw new Error(`${base.id}: remove_fields must be string IDs`);
  for (const key of overlay.remove_fields || [])
    if (key in (overlay.overrides || {}) || key in (overlay.extensions || {}))
      throw new Error(`${base.id}: conflicting overlay operations for ${key}`);
  for (const key of Object.keys(overlay.extensions || {}))
    if (key in (overlay.overrides || {}))
      throw new Error(`${base.id}: conflicting overlay operations for ${key}`);
  if (overlay.target_id !== base.id)
    throw new Error(
      `Overlay target ${overlay.target_id} does not match ${base.id}`,
    );
  const result = structuredClone(base);
  for (const key of overlay.remove_fields || []) {
    if (requiredCore.includes(key) || key === "source")
      throw new Error(
        `${base.id}: required/provenance field ${key} cannot be removed`,
      );
    delete result[key];
  }
  for (const [key, value] of Object.entries(overlay.overrides || {})) {
    if (["id", "source", "ownership", "discipline"].includes(key))
      throw new Error(`${base.id}: unsupported override field ${key}`);
    if (!(key in base))
      throw new Error(
        `${base.id}: unknown upstream field ${key}; use extensions`,
      );
    result[key] = value;
  }
  for (const [key, value] of Object.entries(overlay.extensions || {})) {
    if (key in base)
      throw new Error(
        `${base.id}: extension collides with upstream field ${key}`,
      );
    result[key] = value;
  }
  return result;
}
function normalize(kind: string, row: Obj): Obj {
  const out = { ...row };
  const lists: Record<string, string[]> = {
    chapters: [
      "prerequisites",
      "related",
      "topics",
      "resources",
      "competencies",
      "assessments",
    ],
    competencies: [
      "chapters",
      "prerequisites",
      "resources",
      "assessments",
      "performance_criteria",
    ],
    assessments: ["evidence", "rubric", "competencies"],
    studios: [
      "deliverables",
      "decomposition",
      "interfaces",
      "roles",
      "experiments",
      "competencies",
    ],
    resources: ["topics"],
  };
  for (const field of lists[kind] || [])
    if (out[field] === undefined) out[field] = [];
  return out;
}
export function loadCatalog(root: string): Curriculum {
  if (existsSync(join(root, "data")))
    for (const entry of readdirSync(join(root, "data"), {
      withFileTypes: true,
    }))
      if (
        entry.isDirectory() &&
        ![...collections, "upstream", "overlays"].includes(entry.name as any)
      )
        throw new Error(`data/${entry.name}: unknown record collection`);
  const result: Obj = {
    schema_version: 1,
    revision: "",
    upstream_revision: "",
    validation: [],
    ledgers: [],
    redirects: { chapters: {}, topics: {} },
  };
  const locations = new Map<string, string>();
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const schema = JSON.parse(
    readFileSync(join(root, "schemas/records.schema.json"), "utf8"),
  );
  ajv.addSchema(schema, "records");
  const overlayRecords = loadOverlays(root);
  for (const kind of collections) {
    const rows: Obj[] = [];
    for (const path of [
      ...files(join(root, "data/upstream/knowledge-navigator", kind)),
      ...files(join(root, "data", kind)),
    ]) {
      const row = readYaml(path);
      if (row.record_type && row.record_type !== kind)
        throw new Error(
          `${path}: unknown/mismatched record_type ${row.record_type}`,
        );
      if (!row.id) throw new Error(`${path}: missing id`);
      if (rows.some((r) => r.id === row.id))
        throw new Error(`${path}: duplicate ${kind} ID ${row.id}`);
      rows.push(row);
      locations.set(`${kind}:${row.id}`, relative(root, path));
    }
    for (const { path, record: overlay } of overlayRecords) {
      if (
        overlay.target_type !== kind &&
        overlay.target_type !== kind.replace(/ies$/, "y").replace(/s$/, "")
      )
        continue;
      const i = rows.findIndex((r) => r.id === overlay.target_id);
      if (i < 0)
        throw new Error(`${path}: unknown overlay target ${overlay.target_id}`);
      if (rows[i].ownership !== "upstream")
        throw new Error(`${path}: overlays target upstream records only`);
      rows[i] = applyOverlay(rows[i], overlay);
    }
    result[kind] = rows
      .map((row) => {
        const record = normalize(kind, row);
        const validator = ajv.getSchema(`records#/$defs/${kind}`);
        if (validator && !validator(record))
          throw new Error(
            `${locations.get(`${kind}:${row.id}`)} (${row.id}): ${ajv.errorsText(validator.errors, { separator: "; " })}`,
          );
        return record;
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }
  const upstream = join(root, "data/upstream/knowledge-navigator");
  if (existsSync(join(upstream, "lock.yaml"))) {
    const lock = readYaml(join(upstream, "lock.yaml"));
    if (lock.schema_version !== 1 || lock.importer_version !== 1)
      throw new Error(
        "Incompatible Knowledge Navigator baseline schema/importer version; adapter review required",
      );
    result.upstream_revision = lock.revision;
  }
  if (existsSync(join(upstream, "redirects.yaml"))) {
    const r = readYaml(join(upstream, "redirects.yaml"));
    result.redirects = { chapters: r.chapters || {}, topics: r.topics || {} };
  }
  const data = result as Curriculum;
  data.validation = validateCatalog(data);
  data.ledgers = data.programs.map((program) => creditLedger(program));
  data.revision = hash(
    files(join(root, "data")).map((path) => [
      relative(root, path),
      hash(readFileSync(path, "utf8")),
    ]),
  );
  const errors = data.validation.filter((issue) => issue.severity === "error");
  if (errors.length)
    throw new Error(errors.map((e) => `${e.record}: ${e.message}`).join("\n"));
  return data;
}
export function creditLedger(program: any): ProgramLedger {
  const seen = new Set<string>(),
    by_category: Record<string, number> = {},
    issues: string[] = [];
  let total = 0,
    verified = true;
  for (const semester of program.semesters)
    for (const unit of semester.credit_units || []) {
      if (seen.has(unit.id)) {
        issues.push(`Credit unit ${unit.id} counted more than once`);
        continue;
      }
      seen.add(unit.id);
      if (unit.credits === null) {
        issues.push(`${unit.id}: credits unresolved`);
        continue;
      }
      total += unit.credits;
      by_category[unit.category] =
        (by_category[unit.category] || 0) + unit.credits;
      if (unit.category === "unclassified" || unit.status === "unresolved")
        issues.push(`${unit.id}: classification unresolved`);
      if (unit.status !== "verified") verified = false;
    }
  if (total !== program.target_credits)
    issues.push(`${total} proposed credits; target ${program.target_credits}`);
  return {
    program: program.id,
    total,
    target: program.target_credits,
    by_category,
    status: issues.length ? "unresolved" : verified ? "reconciled" : "proposed",
    issues,
  };
}
export function validateCatalog(data: Curriculum): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (
    severity: "error" | "warning",
    code: string,
    record: string,
    message: string,
  ) => issues.push({ severity, code, record, message });
  const chapters = new Map(data.chapters.map((c) => [c.id, c]));
  const competencies = new Map(data.competencies.map((c) => [c.id, c]));
  const entities = new Map<string, Obj>(
    [
      ...data.chapters,
      ...data.competencies,
      ...data.studios,
      ...data.assessments,
    ].map((c) => [c.id, c]),
  );
  if (
    entities.size !==
    data.chapters.length +
      data.competencies.length +
      data.studios.length +
      data.assessments.length
  )
    add(
      "error",
      "duplicate-id",
      "catalog",
      "Duplicate semantic IDs across record types",
    );
  const topicIds = new Set<string>();
  const topics = (rows: Obj[]) =>
    rows.forEach((t) => {
      if (topicIds.has(t.id))
        add("error", "duplicate-topic", t.id, "Duplicate topic ID");
      topicIds.add(t.id);
      if (t.sub) topics(t.sub);
    });
  data.chapters.forEach((c) => topics(c.topics));
  const sets: Record<string, Set<string>> = {
    chapters: new Set(chapters.keys()),
    competencies: new Set(competencies.keys()),
    resources: new Set(data.resources.map((r) => r.id)),
    assessments: new Set(data.assessments.map((a) => a.id)),
    studios: new Set(data.studios.map((s) => s.id)),
    disciplines: new Set(data.disciplines.map((d) => d.id)),
    brands: new Set(data.brands.map((b) => b.id)),
    programs: new Set(data.programs.map((p) => p.id)),
  };
  const refs = (record: Obj, field: string, allowed: Set<string>) => {
    for (const id of record[field] || [])
      if (!allowed.has(id))
        add(
          "error",
          "dangling-reference",
          record.id,
          `${field} references unknown ID ${id}`,
        );
  };
  for (const chapter of data.chapters) {
    refs(chapter, "prerequisites", sets.chapters);
    refs(chapter, "related", sets.chapters);
    refs(chapter, "resources", sets.resources);
    refs(chapter, "competencies", sets.competencies);
    refs(chapter, "assessments", sets.assessments);
    if (!sets.disciplines.has(chapter.discipline))
      add(
        "error",
        "discipline",
        chapter.id,
        `Unknown discipline ${chapter.discipline}`,
      );
    else {
      const discipline = data.disciplines.find(
        (d) => d.id === chapter.discipline,
      )!;
      if (!discipline.categories.includes(chapter.category))
        add(
          "error",
          "category",
          chapter.id,
          `Category ${chapter.category} absent from ${discipline.id}`,
        );
      if (!chapter.id.startsWith(discipline.prefix + "-"))
        add(
          "error",
          "prefix",
          chapter.id,
          `Expected prefix ${discipline.prefix}-`,
        );
    }
  }
  for (const c of data.competencies) {
    refs(c, "chapters", sets.chapters);
    refs(c, "prerequisites", new Set([...sets.chapters, ...sets.competencies]));
    refs(c, "resources", sets.resources);
    refs(c, "assessments", sets.assessments);
  }
  for (const a of [...data.assessments, ...data.studios])
    refs(a, "competencies", sets.competencies);
  for (const r of data.resources) {
    refs(r, "assessment_ids", sets.assessments);
    refs(
      r,
      "topics",
      new Set([...sets.chapters, ...sets.competencies, ...topicIds]),
    );
    try {
      const u = new URL(r.url);
      if (!["https:", "http:"].includes(u.protocol)) throw new Error();
    } catch {
      add(
        "error",
        "resource-url",
        r.id,
        "Expected an absolute HTTP(S) resource URL",
      );
    }
    if (
      !["content_reviewed", "transcript_reviewed", "expert_reviewed"].includes(
        r.review_status,
      )
    )
      add(
        "warning",
        "resource-review",
        r.id,
        `Review basis: ${r.review_status}; content accuracy remains pending`,
      );
  }
  for (const crosswalk of data.crosswalks)
    for (const criterion of (crosswalk.criteria || []) as Obj[]) {
      for (const field of [
        "competencies",
        "studios",
        "assessments",
        "chapters",
      ])
        refs(criterion, field, sets[field]);
      for (const stage of criterion.instructional_stages || []) {
        refs(
          { ...stage, id: `${criterion.id}/${stage.stage}` },
          "assessments",
          sets.assessments,
        );
        if (
          !["introduced", "practiced", "assessed"].includes(stage.stage) ||
          !Array.isArray(stage.terms) ||
          stage.terms.some(
            (term: unknown) =>
              !Number.isInteger(term) || Number(term) < 1 || Number(term) > 8,
          )
        )
          add(
            "error",
            "instructional-stage",
            criterion.id,
            "Expected introduced/practiced/assessed with term numbers 1..8",
          );
      }
      const count = [
        "competencies",
        "studios",
        "assessments",
        "chapters",
      ].reduce((total, key) => total + (criterion[key]?.length || 0), 0);
      if (!count && !criterion.gaps?.length)
        add(
          "error",
          "unmapped-requirement",
          criterion.id,
          "Requirement needs a local mapping or explicit gap",
        );
      if (criterion.coverage === "gap" || criterion.gaps?.length)
        add(
          "warning",
          "academic-gap",
          criterion.id,
          `Academic review gap: ${(criterion.gaps || []).join("; ")}`,
        );
    }
  const done = new Set<string>(),
    active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) {
      add("error", "prerequisite-cycle", id, "Required-prerequisite cycle");
      return;
    }
    if (done.has(id)) return;
    active.add(id);
    for (const p of entities.get(id)?.prerequisites || []) visit(p);
    active.delete(id);
    done.add(id);
  }
  for (const id of entities.keys()) visit(id);
  for (const program of data.programs) {
    if (
      program.semesters.length !== 8 ||
      new Set(program.semesters.map((s) => s.number)).size !== 8
    )
      add(
        "error",
        "semester-count",
        program.id,
        "Expected eight distinct semester numbers",
      );
    const schedule = new Map<string, number>();
    for (const semester of program.semesters) {
      refs(semester, "chapters", sets.chapters);
      refs(semester, "competencies", sets.competencies);
      refs(semester, "assessments", sets.assessments);
      if (!sets.studios.has(semester.studio))
        add(
          "error",
          "studio",
          semester.id,
          `Unknown studio ${semester.studio}`,
        );
      for (const id of semester.chapters)
        schedule.set(
          id,
          Math.min(schedule.get(id) ?? Infinity, semester.number),
        );
      for (const selection of (semester.selections || []) as Obj[]) {
        const chapter = chapters.get(selection.chapter);
        if (!chapter) {
          add(
            "error",
            "selection-reference",
            semester.id,
            `Unknown selected chapter ${selection.chapter}`,
          );
          continue;
        }
        const ids = new Set<string>();
        const collect = (rows: Obj[]) =>
          rows.forEach((t) => {
            ids.add(t.id);
            if (t.sub) collect(t.sub);
          });
        collect(chapter.topics);
        for (const id of selection.focus || [])
          if (!ids.has(id))
            add(
              "error",
              "selected-topic-scope",
              semester.id,
              `${id} is not a topic of ${chapter.id}`,
            );
      }
    }
    const entry = new Set<string>(
      (program.entry_prerequisites as string[]) || [],
    );
    for (const semester of program.semesters)
      for (const id of semester.chapters) {
        const chapter = chapters.get(id);
        if (!chapter) continue;
        for (const prerequisite of chapter.prerequisites) {
          const when = schedule.get(prerequisite);
          if (entry.has(prerequisite)) continue;
          if (
            when === undefined ||
            when > semester.number ||
            (when === semester.number &&
              !(semester.concurrent || []).includes(prerequisite))
          )
            add(
              program.review_status === "ready" ? "error" : "warning",
              "schedule-prerequisite",
              id,
              `${prerequisite} must precede term ${semester.number}, or be explicitly concurrent/entry knowledge`,
            );
        }
        const resources = (chapter.resources || [])
          .map((r) => data.resources.find((row) => row.id === r))
          .filter(Boolean);
        if (!resources.length)
          add(
            chapter.review_status === "ready" ? "error" : "warning",
            "coverage-gap",
            id,
            "No assigned resource; learning unit remains draft",
          );
        else if (
          chapter.review_status === "ready" &&
          resources.some(
            (r) =>
              ![
                "content_reviewed",
                "transcript_reviewed",
                "expert_reviewed",
              ].includes(r!.review_status),
          )
        )
          add(
            "error",
            "resource-readiness",
            id,
            "Ready unit depends on a resource without content review",
          );
      }
    const ledger = creditLedger(program);
    for (const message of ledger.issues)
      add(
        message.includes("more than once") ? "error" : "warning",
        "credit-ledger",
        program.id,
        message,
      );
  }
  for (const institution of data.institutions) {
    refs(institution, "programs", sets.programs);
    if (!sets.brands.has(institution.brand_id))
      add(
        "error",
        "brand",
        institution.id,
        `Unknown brand ${institution.brand_id}`,
      );
    for (const key of Object.keys(institution.academic_overrides || {}))
      if (!["requirements", "electives", "content_selections"].includes(key))
        add(
          "error",
          "institution-override",
          institution.id,
          `Unsupported academic override ${key}`,
        );
    if (Object.keys(institution.academic_overrides || {}).length)
      for (const programId of institution.programs) {
        if (!sets.programs.has(programId)) continue;
        try {
          const effective = resolveProgram(data, institution.id, programId);
          const checks = validateCatalog({
            ...data,
            institutions: [],
            programs: [effective],
          });
          for (const issue of checks)
            if (
              issue.severity === "error" ||
              issue.code === "schedule-prerequisite"
            )
              add(
                "error",
                `institution-${issue.code}`,
                `${institution.id}/${issue.record}`,
                issue.message,
              );
          if (institution.academic_overrides?.content_selections) {
            const selected = new Set([
              ...effective.semesters.flatMap((term) => term.chapters),
              ...((effective.entry_prerequisites as string[]) || []),
            ]);
            for (const term of effective.semesters)
              for (const competencyId of term.competencies)
                for (const chapterId of competencies.get(competencyId)
                  ?.chapters || [])
                  if (!selected.has(chapterId))
                    add(
                      "error",
                      "institution-coverage",
                      `${institution.id}/${competencyId}`,
                      `Content selection orphaned required competency chapter ${chapterId}`,
                    );
          }
        } catch (error) {
          add(
            "error",
            "institution-override",
            institution.id,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
  }
  return issues;
}
export function graphView(data: Curriculum, chapterIds?: string[]) {
  return graphContract(data, chapterIds);
}
export function contentChanges(
  before: Partial<Curriculum> | undefined,
  after: Curriculum,
) {
  const changes: {
    kind: string;
    id: string;
    change: "added" | "updated" | "removed";
  }[] = [];
  for (const kind of collections) {
    const old = new Map(
      ((before?.[kind] || []) as Obj[]).map((row) => [row.id, row]),
    );
    const current = new Map((after[kind] as Obj[]).map((row) => [row.id, row]));
    for (const id of [...new Set([...old.keys(), ...current.keys()])].sort()) {
      if (!old.has(id)) changes.push({ kind, id, change: "added" });
      else if (!current.has(id)) changes.push({ kind, id, change: "removed" });
      else if (hash(old.get(id)) !== hash(current.get(id)))
        changes.push({ kind, id, change: "updated" });
    }
  }
  return changes;
}
