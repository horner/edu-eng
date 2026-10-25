import { copy } from "./i18n";

export const activities = [
  "planned",
  "studied",
  "practiced",
  "assessed",
] as const;
export type Activity = (typeof activities)[number];
export interface Entry {
  activity: Activity | "";
  note: string;
}
export type Entries = Record<string, Entry>;
export interface Backup {
  version: 1;
  institution: string;
  program: string;
  curriculum_revision: string;
  entries: Entries;
}
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const storageKey = (institution: string, program: string) =>
  `edu-eng:progress:v1:${institution}:${program}`;

export function parseEntries(value: unknown): Entries {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(copy.importError);
  const result: Entries = Object.create(null) as Entries;
  for (const [id, entry] of Object.entries(value)) {
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) ||
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry)
    )
      throw new Error(copy.importError);
    const item = entry as Record<string, unknown>;
    if (
      typeof item.note !== "string" ||
      item.note.length > 50000 ||
      (item.activity !== "" && !activities.includes(item.activity as Activity))
    )
      throw new Error(copy.importError);
    result[id] = {
      activity: item.activity as Entry["activity"],
      note: item.note,
    };
  }
  return result;
}

export function parseBackup(
  raw: string,
  institution: string,
  program: string,
  revision: string,
  knownIds: Set<string>,
  redirects: Record<string, string> = {},
) {
  if (raw.length > 5_000_000) throw new Error(copy.importError);
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(copy.importError);
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(copy.importError);
  const input = value as Partial<Backup>;
  if (input.version !== 1) throw new Error(copy.importVersionError);
  if (input.institution !== institution || input.program !== program)
    throw new Error(copy.importScopeError);
  if (typeof input.curriculum_revision !== "string")
    throw new Error(copy.importError);
  const entries = parseEntries(input.entries);
  const migration = migrateEntries(entries, redirects, knownIds);
  return {
    ...migration,
    revisionChanged: input.curriculum_revision !== revision,
  };
}

export function migrateEntries(
  entries: Entries,
  redirects: Record<string, string>,
  knownIds?: Set<string>,
) {
  const restored: Entries = Object.create(null) as Entries;
  const unknown: string[] = [];
  for (const [id, entry] of Object.entries(entries)) {
    let key = id;
    const seen = new Set<string>();
    while (redirects[key] && !seen.has(key)) {
      seen.add(key);
      key = redirects[key];
    }
    if (seen.has(key)) throw new Error(copy.importError);
    if (!knownIds || knownIds.has(key)) {
      if (restored[key]) throw new Error(copy.importError);
      restored[key] = entry;
    } else unknown.push(id);
  }
  return { entries: restored, unknown };
}

export function readProgress(
  storage: StorageLike,
  institution: string,
  program: string,
  redirects: Record<string, string> = {},
): { entries: Entries; warning: string } {
  try {
    const saved = storage.getItem(storageKey(institution, program));
    if (!saved) return { entries: {}, warning: "" };
    const parsed = JSON.parse(saved) as {
      version?: unknown;
      entries?: unknown;
    };
    if (parsed.version !== 1) throw new Error("version");
    return {
      entries: migrateEntries(parseEntries(parsed.entries), redirects).entries,
      warning: "",
    };
  } catch {
    return { entries: {}, warning: copy.corruptStorage };
  }
}

export function saveProgress(
  storage: StorageLike,
  institution: string,
  program: string,
  entries: Entries,
): boolean {
  try {
    storage.setItem(
      storageKey(institution, program),
      JSON.stringify({ version: 1, entries }),
    );
    return true;
  } catch {
    return false;
  }
}

export function browserStorage(): StorageLike | undefined {
  try {
    const storage = window.localStorage;
    const key = "edu-eng:storage-probe";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return storage;
  } catch {
    return undefined;
  }
}

export interface Route {
  institution: string;
  view: "browse" | "graph" | "review" | "resources";
  term: number;
  node: string;
  q: string;
  review: string;
  focus: boolean;
}
export function readRoute(): Route {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const view = params.get("view");
  const term = Number(params.get("term"));
  return {
    institution: params.get("institution") || "indiana-tech",
    view:
      view === "graph" || view === "review" || view === "resources"
        ? view
        : "browse",
    term: Number.isInteger(term) && term >= 1 && term <= 8 ? term : 0,
    node: params.get("node") || "",
    q: params.get("q") || "",
    review: params.get("review") || "all",
    focus: params.get("focus") === "1",
  };
}
export function writeRoute(route: Route, replace = false): void {
  const params = new URLSearchParams({
    institution: route.institution,
    view: route.view,
  });
  if (route.term) params.set("term", String(route.term));
  if (route.node) params.set("node", route.node);
  if (route.q) params.set("q", route.q);
  if (route.review !== "all") params.set("review", route.review);
  if (route.focus) params.set("focus", "1");
  const hash = `#/program/biomedical?${params}`;
  if (replace) {
    window.history.replaceState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else window.location.hash = hash;
}
