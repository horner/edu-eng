import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import {
  CHAPTER_FIELDS,
  sourceCheckout,
  snapshotFromSource,
  type Snapshot,
} from "./kn.ts";
import { loadCatalog } from "./model.ts";
import { json, readYaml, write, type Obj } from "./io.ts";
import type { Curriculum } from "../../src/data/types.ts";
const pick = (row: Obj, keys: string[]) =>
  Object.fromEntries(
    keys.filter((k) => row[k] !== undefined).map((k) => [k, row[k]]),
  );
const disciplineFields = [
  "id",
  "name",
  "icon",
  "color",
  "prefix",
  "description",
  "categories",
];
const roadmapFields = [
  "id",
  "name",
  "icon",
  "tagline",
  "description",
  "outcomes",
  "stages",
  "related",
];
export function exportKnowledgeNavigator(root: string, out: string): Snapshot {
  const model = loadCatalog(root);
  rmSync(out, { recursive: true, force: true });
  const manifest = readYaml(
    join(root, "data/upstream/knowledge-navigator/manifest.yaml"),
  );
  const disciplineIds = [
    ...manifest.disciplines,
    ...model.disciplines
      .map((d) => d.id)
      .filter((id) => !manifest.disciplines.includes(id)),
  ];
  write(
    join(out, "data/manifest.json"),
    json({
      ...manifest,
      disciplines: disciplineIds,
      roadmaps: model.roadmaps.map((r) => r.id),
    }),
  );
  for (const discipline of model.disciplines)
    write(
      join(out, "data/disciplines", discipline.id, "discipline.json"),
      json(pick(discipline, disciplineFields)),
    );
  for (const chapter of model.chapters)
    write(
      join(out, "data/disciplines", chapter.discipline, `${chapter.id}.json`),
      JSON.stringify(pick(chapter, CHAPTER_FIELDS), null, 2) + "\n",
    );
  for (const roadmap of model.roadmaps)
    write(
      join(out, "data/roadmaps", `${roadmap.id}.json`),
      json(pick(roadmap, roadmapFields)),
    );
  write(join(out, "data/redirects.json"), json(model.redirects));
  const supported: Record<string, string[]> = {
    chapters: [...CHAPTER_FIELDS, "discipline"],
    disciplines: disciplineFields,
    roadmaps: roadmapFields,
  };
  const sidecar: Obj = {
    schema_version: 1,
    upstream_revision: model.upstream_revision,
    curriculum_revision: model.revision,
    limitations: [
      "Unmodified Knowledge Navigator does not display local resources, competencies, assessments, studios, program/credit/concurrency rules, institution settings, or review/provenance metadata.",
      "This export is not a roadmap.sh native import.",
    ],
    collections: {},
  };
  for (const [kind, rows] of Object.entries(model)) {
    if (!Array.isArray(rows) || ["validation", "ledgers"].includes(kind))
      continue;
    sidecar.collections[kind] = rows
      .map((row: Obj) => {
        const allowed = supported[kind] || [];
        return {
          id: row.id,
          fields: Object.fromEntries(
            Object.entries(row).filter(([k]) => !allowed.includes(k)),
          ),
        };
      })
      .filter((row: Obj) => Object.keys(row.fields).length);
  }
  sidecar.validation = model.validation;
  sidecar.ledgers = model.ledgers;
  write(join(out, "edu-eng-extensions.json"), json(sidecar));
  write(
    join(out, "EXPORT-REPORT.md"),
    `# Knowledge Navigator export\n\nUpstream revision: ${model.upstream_revision}\n\n${model.chapters.length} chapters and ${model.disciplines.length} disciplines exported. All unsupported record fields are retained in edu-eng-extensions.json. The original UI does not render these extensions.\n\nThe guarantee covers authored core data, not visitor progress, display layout, or native resource rendering.\n`,
  );
  return snapshotFromSource(out, model.upstream_revision);
}
/** Prove that core plus sidecar retains every original authored field. */
export function assertExportIntegrity(
  model: Curriculum,
  again: Pick<Snapshot, "chapters" | "disciplines" | "roadmaps">,
  sidecar: Obj,
): void {
  for (const kind of ["chapters", "disciplines", "roadmaps"] as const)
    for (const original of model[kind]) {
      const supportedRow = again[kind].find((r) => r.id === original.id);
      const extension =
        sidecar.collections[kind]?.find((r: Obj) => r.id === original.id)
          ?.fields || {};
      const reconstructed = { ...supportedRow, ...extension };
      for (const [key, value] of Object.entries(original))
        if (json(reconstructed[key]) !== json(value))
          throw new Error(`Lost export field ${kind}/${original.id}/${key}`);
    }
  for (const kind of [
    "resources",
    "competencies",
    "assessments",
    "studios",
    "programs",
    "institutions",
    "brands",
    "crosswalks",
    "baselines",
  ] as const)
    for (const original of model[kind]) {
      if (
        !sidecar.collections[kind]?.some(
          (row: Obj) =>
            row.id === original.id && json(row.fields) === json(original),
        )
      )
        throw new Error(`Missing sidecar record ${kind}/${original.id}`);
    }
}
export function verifyKnowledgeNavigatorExport(
  root: string,
  out: string,
): void {
  const exported = exportKnowledgeNavigator(root, out);
  const source = sourceCheckout(root, exported.revision);
  cpSync(join(source, "scripts"), join(out, "scripts"), { recursive: true });
  const output = execFileSync(
    "python3",
    [join(out, "scripts/build.py"), "--strict"],
    { encoding: "utf8" },
  );
  write(join(out, "UPSTREAM-VALIDATION.txt"), output);
  const again = snapshotFromSource(out, exported.revision);
  const core = (s: Snapshot) => ({
    manifest: s.manifest,
    chapters: s.chapters,
    disciplines: s.disciplines,
    roadmaps: s.roadmaps,
    redirects: s.redirects,
  });
  if (json(core(exported)) !== json(core(again)))
    throw new Error(
      "Authored Knowledge Navigator core fields changed on round-trip.",
    );
  const model = loadCatalog(root),
    sidecar = JSON.parse(
      readFileSync(join(out, "edu-eng-extensions.json"), "utf8"),
    );
  assertExportIntegrity(model, again, sidecar);
  if (!existsSync(join(out, "UPSTREAM-VALIDATION.txt")))
    throw new Error("Upstream validation evidence missing.");
}
