import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { files, hash, type Obj } from "./io.ts";
import { validateCatalog } from "./model.ts";
import type { Curriculum } from "../../src/data/types.ts";
export const REPO = "https://github.com/MohamedMuneerM/knowledge-navigator";
export const PIN = "c26f8337f42f6dd3bbe5e007263fa92399f1b96e";
export const IMPORTER_VERSION = 1;
export const CHAPTER_FIELDS = [
  "id",
  "name",
  "category",
  "level",
  "priority",
  "summary",
  "prerequisites",
  "related",
  "topics",
];
const fields: Record<string, string[]> = {
  chapter: CHAPTER_FIELDS,
  discipline: [
    "id",
    "name",
    "icon",
    "color",
    "prefix",
    "description",
    "categories",
  ],
  roadmap: [
    "id",
    "name",
    "icon",
    "tagline",
    "description",
    "outcomes",
    "stages",
    "related",
  ],
  manifest: ["version", "disciplines", "roadmaps"],
  redirects: ["_comment", "chapters", "topics"],
};
export interface Snapshot {
  revision: string;
  manifest: Obj;
  chapters: Obj[];
  disciplines: Obj[];
  roadmaps: Obj[];
  redirects: Obj;
  paths: Record<string, string>;
  hashes: Record<string, string>;
  license_text?: string;
  retrieved_date: string;
}
function assertKeys(value: Obj, kind: string, path: string) {
  const unknown = Object.keys(value).filter((k) => !fields[kind].includes(k));
  if (unknown.length)
    throw new Error(
      `${path}: unknown upstream ${kind} fields: ${unknown.join(", ")}; adapter review required`,
    );
  if (kind === "chapter") {
    const topics = (rows: Obj[]) =>
      rows.forEach((t) => {
        const keys = Object.keys(t).filter(
          (k) => !["id", "name", "sub"].includes(k),
        );
        if (keys.length)
          throw new Error(`${path}: unknown topic fields ${keys.join(", ")}`);
        if (t.sub) topics(t.sub);
      });
    topics(value.topics || []);
  }
  if (kind === "roadmap")
    for (const stage of value.stages || []) {
      if (
        Object.keys(stage).some(
          (k) => !["name", "description", "items"].includes(k),
        )
      )
        throw new Error(`${path}: unknown roadmap stage field`);
      for (const item of stage.items || [])
        if (
          Object.keys(item).some(
            (k) => !["chapter", "why", "depth", "focus"].includes(k),
          )
        )
          throw new Error(`${path}: unknown roadmap item field`);
    }
}
export function sourceCheckout(root: string, revision: string): string {
  if (!/^[a-f0-9]{40}$/.test(revision))
    throw new Error("Use a full 40-character commit SHA.");
  const path = join(root, ".cache/knowledge-navigator-source");
  if (!existsSync(join(path, ".git")))
    execFileSync("git", ["clone", "--quiet", `${REPO}.git`, path], {
      stdio: "inherit",
    });
  try {
    execFileSync(
      "git",
      ["-C", path, "cat-file", "-e", `${revision}^{commit}`],
      { stdio: "pipe" },
    );
  } catch {
    execFileSync("git", ["-C", path, "fetch", "--quiet", "origin", revision], {
      stdio: "inherit",
    });
  }
  execFileSync("git", [
    "-C",
    path,
    "checkout",
    "--quiet",
    "--detach",
    revision,
  ]);
  const actual = execFileSync("git", ["-C", path, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  if (actual !== revision)
    throw new Error("Upstream checkout revision mismatch.");
  return path;
}
export function snapshotFromSource(source: string, revision: string): Snapshot {
  const paths: Record<string, string> = {},
    hashes: Record<string, string> = {};
  const read = (path: string, kind: string) => {
    const raw = readFileSync(join(source, path), "utf8");
    const value = JSON.parse(raw);
    assertKeys(value, kind, path);
    if (
      ["chapter", "discipline", "roadmap"].includes(kind) &&
      (!value.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id))
    )
      throw new Error(`${path}: invalid stable upstream ID`);
    paths[`${kind}:${value.id || kind}`] = path;
    hashes[path] = hash(raw);
    return value;
  };
  const manifest = read("data/manifest.json", "manifest");
  for (const key of ["disciplines", "roadmaps"])
    if (
      !Array.isArray(manifest[key]) ||
      manifest[key].some(
        (id: unknown) =>
          typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id),
      )
    )
      throw new Error(`Invalid upstream manifest ${key}`);
  const disciplines: Obj[] = [],
    chapters: Obj[] = [];
  for (const id of manifest.disciplines) {
    disciplines.push(
      read(`data/disciplines/${id}/discipline.json`, "discipline"),
    );
    for (const path of files(join(source, "data/disciplines", id), ".json"))
      if (!path.endsWith("/discipline.json"))
        chapters.push({
          ...read(relative(source, path), "chapter"),
          discipline: id,
        });
  }
  const roadmaps = (manifest.roadmaps || []).map((id: string) =>
    read(`data/roadmaps/${id}.json`, "roadmap"),
  );
  const redirects = read("data/redirects.json", "redirects");
  const licensePath = join(source, "LICENSE-DATA.md");
  const license_text = existsSync(licensePath)
    ? readFileSync(licensePath, "utf8")
    : undefined;
  if (license_text) hashes["LICENSE-DATA.md"] = hash(license_text);
  const snapshot = {
    revision,
    manifest,
    chapters,
    disciplines,
    roadmaps,
    redirects,
    paths,
    hashes,
    license_text,
    retrieved_date: new Date().toISOString().slice(0, 10),
  };
  validateSnapshot(snapshot);
  return snapshot;
}
export function validateSnapshot(snapshot: Snapshot): void {
  const schema = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL("../../schemas/records.schema.json", import.meta.url),
      ),
      "utf8",
    ),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(schema, "records");
  for (const kind of ["chapters", "disciplines", "roadmaps"] as const) {
    const check = ajv.getSchema(`records#/$defs/${kind}`)!;
    for (const original of snapshot[kind]) {
      const row =
        kind === "chapters" ? { ...original, ownership: "upstream" } : original;
      if (!check(row))
        throw new Error(
          `Invalid upstream ${kind}/${original.id}: ${ajv.errorsText(check.errors)}`,
        );
    }
  }
  const model = {
    chapters: snapshot.chapters.map((c) => ({ ...c, ownership: "upstream" })),
    disciplines: snapshot.disciplines,
    roadmaps: snapshot.roadmaps,
    competencies: [],
    resources: [],
    assessments: [],
    studios: [],
    programs: [],
    institutions: [],
    brands: [],
    crosswalks: [],
    baselines: [],
  } as unknown as Curriculum;
  const errors = validateCatalog(model).filter(
    (issue) => issue.severity === "error",
  );
  if (errors.length)
    throw new Error(
      `Invalid upstream graph: ${errors.map((e) => `${e.record}: ${e.message}`).join("; ")}`,
    );
  const chapters = new Set(snapshot.chapters.map((c) => c.id)),
    roadmaps = new Set(snapshot.roadmaps.map((r) => r.id));
  for (const roadmap of snapshot.roadmaps) {
    for (const related of roadmap.related || [])
      if (!roadmaps.has(related))
        throw new Error(
          `Invalid upstream roadmap ${roadmap.id}: unknown related roadmap ${related}`,
        );
    for (const stage of roadmap.stages)
      for (const item of stage.items || []) {
        if (!chapters.has(item.chapter))
          throw new Error(
            `Invalid upstream roadmap ${roadmap.id}: unknown chapter ${item.chapter}`,
          );
        const chapter = snapshot.chapters.find((c) => c.id === item.chapter)!;
        const topicIds = new Set<string>();
        const collect = (rows: Obj[]) =>
          rows.forEach((t) => {
            topicIds.add(t.id);
            if (t.sub) collect(t.sub);
          });
        collect(chapter.topics);
        for (const focus of item.focus || [])
          if (!topicIds.has(focus))
            throw new Error(
              `Invalid upstream roadmap ${roadmap.id}: focus ${focus} is not in ${chapter.id}`,
            );
      }
  }
}
export function baselineFiles(snapshot: Snapshot): Record<string, Obj> {
  const records: Record<string, Obj> = {
    "manifest.yaml": snapshot.manifest,
    "redirects.yaml": snapshot.redirects,
  };
  for (const [kind, rows] of Object.entries({
    chapters: snapshot.chapters,
    disciplines: snapshot.disciplines,
    roadmaps: snapshot.roadmaps,
  }))
    for (const row of rows) {
      const singular =
        kind === "chapters"
          ? "chapter"
          : kind === "disciplines"
            ? "discipline"
            : "roadmap";
      records[`${kind}/${row.id}.yaml`] = {
        ...row,
        ownership: "upstream",
        source: {
          repository: REPO,
          revision: snapshot.revision,
          path: snapshot.paths[`${singular}:${row.id}`],
          sha256: snapshot.hashes[snapshot.paths[`${singular}:${row.id}`]],
        },
      };
    }
  records["lock.yaml"] = {
    schema_version: 1,
    importer_version: IMPORTER_VERSION,
    repository: REPO,
    revision: snapshot.revision,
    retrieved_date: snapshot.retrieved_date,
    source_paths: snapshot.hashes,
    licenses: {
      code: "MIT",
      content: "CC-BY-SA-4.0",
      attribution: `Knowledge Navigator contributors, ${REPO}`,
      content_license: `${REPO}/blob/${snapshot.revision}/LICENSE-DATA.md`,
    },
  };
  return records;
}
