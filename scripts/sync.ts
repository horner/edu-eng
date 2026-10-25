import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { argument, json, readYaml, write } from "./lib/io.ts";
import { PIN, sourceCheckout, snapshotFromSource } from "./lib/kn.ts";
import {
  applyUpdate,
  installBaseline,
  previewUpdate,
  type Preview,
} from "./lib/sync.ts";
try {
  const root = argument("--root", process.cwd())!,
    ref = argument("--ref", PIN)!;
  const source = sourceCheckout(root, ref),
    snapshot = snapshotFromSource(source, ref);
  const action = process.argv[2];
  if (action === "import") {
    if (existsSync(join(root, "data/upstream/knowledge-navigator/lock.yaml")))
      throw new Error("Baseline exists; use sync:preview and sync:apply.");
    installBaseline(root, snapshot);
    console.log(`Imported ${snapshot.chapters.length} chapters at ${ref}.`);
  } else if (action === "preview") {
    const preview = previewUpdate(root, snapshot);
    const path = argument("--out", join(root, "generated/sync-preview.json"))!;
    write(path, json(preview));
    console.log(
      `${preview.changes.length} changed records; ${preview.conflicts.length} conflicts. Preview: ${path}`,
    );
  } else if (action === "apply") {
    const path = argument(
      "--preview",
      join(root, "generated/sync-preview.json"),
    )!;
    if (!existsSync(path)) throw new Error("Create a sync:preview first.");
    const reviewed = JSON.parse(readFileSync(path, "utf8")) as Preview;
    const resolutionPath = argument("--resolutions");
    const resolutions = resolutionPath
      ? resolutionPath.endsWith(".json")
        ? JSON.parse(readFileSync(resolutionPath, "utf8"))
        : readYaml(resolutionPath)
      : undefined;
    const preview = applyUpdate(root, snapshot, reviewed, resolutions);
    console.log(
      `Applied ${preview.changes.length} changes at ${ref}; local extensions preserved.`,
    );
  } else throw new Error("Expected import, preview, or apply.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
