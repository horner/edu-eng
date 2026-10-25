import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromSource } from "./lib/kn.ts";
import { applyUpdate, installBaseline, previewUpdate } from "./lib/sync.ts";
import { json, treeHash, write, writeYaml } from "./lib/io.ts";
import { loadCatalog } from "./lib/model.ts";
const root = join(process.cwd(), ".cache/sync-demo");
rmSync(root, { recursive: true, force: true });
cpSync("schemas", join(root, "schemas"), { recursive: true });
const first = snapshotFromSource(
  "tests/fixtures/sync/revision-1",
  "1".repeat(40),
);
const next = snapshotFromSource(
  "tests/fixtures/sync/revision-2",
  "2".repeat(40),
);
installBaseline(root, first);
writeYaml(join(root, "data/overlays/example.yaml"), {
  target_type: "chapter",
  target_id: "ma-example",
  overrides: { summary: "Locally revised example explanation." },
  extensions: { review_status: "draft" },
});
const preview = previewUpdate(root, next);
write(join(root, "preview.json"), json(preview));
const before = treeHash(root);
try {
  applyUpdate(root, next, preview);
  throw new Error("Expected unresolved conflict to reject.");
} catch (error) {
  if (!String(error).includes("Unresolved")) throw error;
}
if (before !== treeHash(root)) throw new Error("Rejected apply changed data.");
const resolution = {
  binding: preview.binding,
  resolutions: {
    "chapters/ma-example.yaml/summary": { choice: "upstream" as const },
  },
};
write(join(root, "resolution.json"), json(resolution));
applyUpdate(root, next, preview, resolution);
const record = loadCatalog(root).chapters[0];
if (
  record.summary !== "Improved upstream example explanation." ||
  record.review_status !== "draft"
)
  throw new Error("Resolved result lost upstream choice or local extension.");
console.log(
  "PASS: preview, conflict refusal with unchanged inputs, bound resolution, accepted upstream value, and local review extension. Artifacts: .cache/sync-demo",
);
