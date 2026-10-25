import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { parseDocument, stringify } from "yaml";

export type Obj = Record<string, any>;
export function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
export const json = (value: any) =>
  JSON.stringify(canonical(value), null, 2) + "\n";
export const hash = (value: any) =>
  createHash("sha256")
    .update(typeof value === "string" ? value : json(value))
    .digest("hex");
export function readYaml(path: string): Obj {
  const doc = parseDocument(readFileSync(path, "utf8"), {
    uniqueKeys: true,
    version: "1.2",
  });
  if (doc.errors.length)
    throw new Error(`${path}: ${doc.errors.map((e) => e.message).join("; ")}`);
  const value = doc.toJS({ maxAliasCount: 100 });
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${path}: expected one mapping record`);
  return value;
}
export function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
export const writeYaml = (path: string, value: any) =>
  write(path, stringify(value, { lineWidth: 0, sortMapEntries: false }));
export function files(dir: string, extension = ".yaml"): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(join(dir, entry.name), extension)
        : entry.name.endsWith(extension)
          ? [join(dir, entry.name)]
          : [],
    )
    .sort();
}
export function treeHash(root: string, dirs = ["data"]): string {
  return hash(
    dirs
      .flatMap((dir) => files(join(root, dir), ''))
      .map((path) => [relative(root, path), hash(readFileSync(path, "utf8"))]),
  );
}
export function argument(name: string, fallback?: string): string | undefined {
  const args = process.argv.slice(2).filter((v) => v !== "--");
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
}
