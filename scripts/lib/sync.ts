import { cpSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { baselineFiles, IMPORTER_VERSION, type Snapshot } from "./kn.ts";
import {
  applyOverlay,
  loadCatalog,
  loadOverlays,
  type Overlay,
} from "./model.ts";
import {
  files,
  json,
  readYaml,
  treeHash,
  write,
  writeYaml,
  type Obj,
} from "./io.ts";
const equal = (a: any, b: any) => json(a ?? null) === json(b ?? null);
const strip = (row: Obj) =>
  Object.fromEntries(
    Object.entries(row).filter(
      ([k]) => !["source", "ownership", "schema_version"].includes(k),
    ),
  );
export interface Conflict {
  path: string;
  before: any;
  upstream: any;
  local: any;
  kind: "edit" | "deletion" | "collision";
}
export interface Decision {
  choice: "upstream" | "local" | "retain" | "delete";
  value?: any;
}
export interface Binding {
  base_revision: string;
  new_revision: string;
  local_hash: string;
  importer_version: number;
  schema_version: 1;
}
export interface Preview {
  binding: Binding;
  changes: { path: string; kind: string; fields: string[] }[];
  conflicts: Conflict[];
  affected_local_records: string[];
}
/** Whole top-level field merge. undefined means absent; extension fields never participate. */
export function mergeField(
  before: any,
  upstream: any,
  local: any,
): { value: any; conflict: boolean } {
  if (equal(upstream, before)) return { value: local, conflict: false };
  if (equal(local, before) || equal(upstream, local))
    return { value: upstream, conflict: false };
  return { value: local, conflict: true };
}
function baseline(root: string): Record<string, Obj> {
  const folder = join(root, "data/upstream/knowledge-navigator");
  return Object.fromEntries(
    files(folder)
      .filter((p) => !p.endsWith("/lock.yaml"))
      .map((path) => [relative(folder, path), readYaml(path)]),
  );
}
function overlays(root: string): { path: string; record: Overlay }[] {
  return loadOverlays(root).map((row) => ({
    ...row,
    path: relative(root, row.path),
  }));
}
function localReferences(root: string, id: string): string[] {
  const contains = (value: any): boolean =>
    typeof value === "string"
      ? value === id
      : Array.isArray(value)
        ? value.some(contains)
        : value && typeof value === "object"
          ? Object.values(value).some(contains)
          : false;
  return files(join(root, "data"))
    .filter((path) => !path.includes("/upstream/"))
    .filter((path) => contains(readYaml(path)))
    .map((path) => relative(root, path));
}
function overlayFor(path: string, rows: { path: string; record: Overlay }[]) {
  const [kind, file] = path.split("/");
  return rows.find(
    (row) =>
      row.record.target_id === file?.replace(/\.yaml$/, "") &&
      [kind, kind.replace(/ies$/, "y").replace(/s$/, "")].includes(
        row.record.target_type,
      ),
  );
}
export function previewUpdate(root: string, snapshot: Snapshot): Preview {
  const lock = readYaml(
    join(root, "data/upstream/knowledge-navigator/lock.yaml"),
  );
  const old = baseline(root),
    next = baselineFiles(snapshot),
    ov = overlays(root);
  delete next["lock.yaml"];
  const changes: Preview["changes"] = [],
    conflicts: Conflict[] = [],
    affected = new Set<string>();
  for (const path of [
    ...new Set([...Object.keys(old), ...Object.keys(next)]),
  ].sort()) {
    const b = old[path],
      u = next[path],
      overlay = overlayFor(path, ov);
    const id = (b || u).id;
    if (!b) {
      changes.push({ path, kind: "added", fields: Object.keys(strip(u)) });
      if (id) {
        const collision = files(join(root, "data", path.split("/")[0])).some(
          (p) => readYaml(p).id === id,
        );
        if (collision)
          conflicts.push({
            path,
            before: null,
            upstream: u,
            local: "Local record with this ID already exists",
            kind: "collision",
          });
      }
      continue;
    }
    if (!u) {
      changes.push({ path, kind: "deleted", fields: Object.keys(strip(b)) });
      const refs = id ? localReferences(root, id) : [];
      refs.forEach((p) => affected.add(p));
      if (overlay || refs.length)
        conflicts.push({
          path,
          before: b,
          upstream: null,
          local: overlay ? applyOverlay(b, overlay.record) : b,
          kind: "deletion",
        });
      continue;
    }
    const fields = [
      ...new Set([...Object.keys(strip(b)), ...Object.keys(strip(u))]),
    ].filter((key) => !equal(b[key], u[key]));
    if (!fields.length) continue;
    changes.push({ path, kind: "edited", fields });
    if (id) localReferences(root, id).forEach((p) => affected.add(p));
    const l = overlay ? applyOverlay(b, overlay.record) : b;
    for (const field of fields)
      if (mergeField(b[field], u[field], l[field]).conflict)
        conflicts.push({
          path: `${path}/${field}`,
          before: b[field],
          upstream: u[field],
          local: l[field],
          kind: "edit",
        });
  }
  return {
    binding: {
      schema_version: 1,
      importer_version: IMPORTER_VERSION,
      base_revision: lock.revision,
      new_revision: snapshot.revision,
      local_hash: treeHash(root),
    },
    changes,
    conflicts,
    affected_local_records: [...affected].sort(),
  };
}
export function installBaseline(root: string, snapshot: Snapshot) {
  const folder = join(root, "data/upstream/knowledge-navigator");
  for (const [path, row] of Object.entries(baselineFiles(snapshot)))
    writeYaml(join(folder, path), row);
  if (snapshot.license_text)
    write(join(folder, "LICENSE-DATA.md"), snapshot.license_text);
  write(
    join(folder, "ATTRIBUTION.md"),
    `# Upstream attribution\n\nAdapted from Knowledge Navigator by MohamedMuneerM and contributors.\n\nSource: https://github.com/MohamedMuneerM/knowledge-navigator/tree/${snapshot.revision}\n\nContent license: CC BY-SA 4.0. https://creativecommons.org/licenses/by-sa/4.0/\n\nAuthored JSON has been converted to readable YAML. Source paths and hashes are recorded in lock.yaml; source metadata accompanies each imported record. Locally owned resources and curriculum records are maintained separately.\n`,
  );
}
export function applyUpdate(
  root: string,
  snapshot: Snapshot,
  reviewed: Preview,
  resolution?: Obj,
): Preview {
  const current = previewUpdate(root, snapshot);
  if (!equal(current.binding, reviewed.binding))
    throw new Error(
      "Stale preview: local inputs, upstream revision, or adapter version changed. Preview again.",
    );
  if (resolution && !equal(resolution.binding, current.binding))
    throw new Error(
      "Stale resolution: its binding does not match the reviewed preview.",
    );
  const decisions: Record<string, Decision> = resolution?.resolutions || {};
  for (const conflict of current.conflicts) {
    const d = decisions[conflict.path];
    if (!d) throw new Error(`Unresolved ${conflict.kind}: ${conflict.path}`);
    if (conflict.kind === "collision")
      throw new Error(
        `ID collision at ${conflict.path}; explicitly migrate the local ID first`,
      );
    if (
      conflict.kind === "deletion" &&
      !["retain", "delete"].includes(d.choice)
    )
      throw new Error(`${conflict.path}: choose retain or delete`);
    if (conflict.kind === "edit" && !["local", "upstream"].includes(d.choice))
      throw new Error(`${conflict.path}: choose local or upstream`);
  }
  const stage = join(root, ".cache", `sync-transaction-${process.pid}`);
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  cpSync(join(root, "data"), join(stage, "data"), { recursive: true });
  cpSync(join(root, "schemas"), join(stage, "schemas"), { recursive: true });
  try {
    const old = baseline(root),
      next = baselineFiles(snapshot),
      ov = overlays(root);
    rmSync(join(stage, "data/upstream/knowledge-navigator"), {
      recursive: true,
      force: true,
    });
    installBaseline(stage, snapshot);
    for (const path of Object.keys(old)) {
      const b = old[path],
        u = next[path],
        overlay = overlayFor(path, ov);
      if (!u) {
        if (decisions[path]?.choice === "retain") {
          const kind = path.split("/")[0];
          writeYaml(join(stage, "data", kind, `${b.id}.yaml`), {
            ...b,
            ownership: "local",
            retained_from: current.binding.base_revision,
            ...(overlay ? { ...strip(applyOverlay(b, overlay.record)) } : {}),
          });
        }
        if (overlay) rmSync(join(stage, overlay.path));
        continue;
      }
      if (!overlay) continue;
      const local = applyOverlay(b, overlay.record),
        updated = structuredClone(overlay.record);
      updated.overrides = {};
      updated.remove_fields = [];
      for (const field of new Set([
        ...Object.keys(strip(b)),
        ...Object.keys(strip(u)),
      ])) {
        const merged = mergeField(b[field], u[field], local[field]);
        const decision = decisions[`${path}/${field}`];
        const value = merged.conflict
          ? decision.choice === "upstream"
            ? u[field]
            : "value" in decision
              ? decision.value
              : local[field]
          : merged.value;
        if (!equal(value, u[field])) {
          if (value === undefined) updated.remove_fields.push(field);
          else updated.overrides[field] = value;
        }
      }
      if (!Object.keys(updated.overrides).length) delete updated.overrides;
      if (!updated.remove_fields.length) delete updated.remove_fields;
      writeYaml(join(stage, overlay.path), updated);
    }
    loadCatalog(stage); // Complete graph/local-extension validation before mutating tracked input.
    if (treeHash(root) !== current.binding.local_hash)
      throw new Error(
        "Local inputs changed during validation; update not applied.",
      );
    const backup = join(root, ".cache", `sync-backup-${process.pid}`);
    rmSync(backup, { recursive: true, force: true });
    renameSync(join(root, "data"), backup);
    try {
      renameSync(join(stage, "data"), join(root, "data"));
    } catch (error) {
      renameSync(backup, join(root, "data"));
      throw error;
    }
    rmSync(backup, { recursive: true, force: true });
    return current;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}
