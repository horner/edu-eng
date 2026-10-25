import { describe, it, expect } from "vitest";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { snapshotFromSource, baselineFiles } from "../../scripts/lib/kn.ts";
import {
  applyUpdate,
  installBaseline,
  mergeField,
  previewUpdate,
} from "../../scripts/lib/sync.ts";
import {
  json,
  readYaml,
  treeHash,
  write,
  writeYaml,
} from "../../scripts/lib/io.ts";
import { loadCatalog } from "../../scripts/lib/model.ts";
const sha1 = "1".repeat(40),
  sha2 = "2".repeat(40);
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "edu-sync-"));
  cpSync("schemas", join(root, "schemas"), { recursive: true });
  const source = join(root, "source");
  const chapter = {
    id: "ma-a",
    name: "A",
    summary: "Before",
    category: "Foundations",
    level: 1,
    priority: "core",
    prerequisites: [],
    related: [],
    topics: [{ id: "ma-a-1", name: "Basics" }],
  };
  write(
    join(source, "data/manifest.json"),
    json({ version: "1", disciplines: ["math"], roadmaps: [] }),
  );
  write(
    join(source, "data/redirects.json"),
    json({ chapters: {}, topics: {} }),
  );
  write(
    join(source, "data/disciplines/math/discipline.json"),
    json({
      id: "math",
      name: "Math",
      prefix: "ma",
      categories: ["Foundations"],
    }),
  );
  write(join(source, "data/disciplines/math/ma-a.json"), json(chapter));
  const before = snapshotFromSource(source, sha1);
  installBaseline(root, before);
  return {
    root,
    source,
    chapter,
    before,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
describe("safe upstream synchronization", () => {
  it.each([
    ["B", "B", "L", "L", false],
    ["B", "U", "B", "U", false],
    ["B", "U", "U", "U", false],
    ["B", "U", "L", "L", true],
  ])("three-way B=%s U=%s L=%s", (b, u, l, value, conflict) => {
    expect(mergeField(b, u, l)).toEqual({ value, conflict });
  });
  it("produces byte-stable YAML baseline representations", () => {
    const f = fixture();
    try {
      expect(json(baselineFiles(f.before))).toBe(
        json(baselineFiles(snapshotFromSource(f.source, sha1))),
      );
    } finally {
      f.cleanup();
    }
  });
  it("previews without touching data and applies upstream-only edits", () => {
    const f = fixture();
    try {
      write(
        join(f.source, "data/disciplines/math/ma-a.json"),
        json({ ...f.chapter, summary: "Upstream" }),
      );
      const next = snapshotFromSource(f.source, sha2),
        old = treeHash(f.root),
        preview = previewUpdate(f.root, next);
      expect(treeHash(f.root)).toBe(old);
      expect(preview.conflicts).toHaveLength(0);
      applyUpdate(f.root, next, preview);
      expect(loadCatalog(f.root).chapters[0].summary).toBe("Upstream");
    } finally {
      f.cleanup();
    }
  });
  it("requires conflict resolution then exposes accepted upstream value and preserves resources", () => {
    const f = fixture();
    try {
      writeYaml(join(f.root, "data/overlays/a.yaml"), {
        target_type: "chapter",
        target_id: "ma-a",
        overrides: { summary: "Local" },
        extensions: { review_status: "draft" },
      });
      write(
        join(f.source, "data/disciplines/math/ma-a.json"),
        json({ ...f.chapter, summary: "Upstream" }),
      );
      const next = snapshotFromSource(f.source, sha2),
        preview = previewUpdate(f.root, next),
        old = treeHash(f.root);
      expect(() => applyUpdate(f.root, next, preview)).toThrow("Unresolved");
      expect(treeHash(f.root)).toBe(old);
      const path = "chapters/ma-a.yaml/summary";
      applyUpdate(f.root, next, preview, {
        binding: preview.binding,
        resolutions: { [path]: { choice: "upstream" } },
      });
      const model = loadCatalog(f.root);
      expect(model.chapters[0].summary).toBe("Upstream");
      expect(model.chapters[0].review_status).toBe("draft");
      expect(
        readYaml(join(f.root, "data/overlays/a.yaml")).overrides,
      ).toBeUndefined();
    } finally {
      f.cleanup();
    }
  });
  it("rejects stale inputs before writing", () => {
    const f = fixture();
    try {
      const next = snapshotFromSource(f.source, sha2),
        preview = previewUpdate(f.root, next);
      writeYaml(join(f.root, "data/overlays/a.yaml"), {
        target_type: "chapter",
        target_id: "ma-a",
        extensions: { review_status: "draft" },
      });
      const old = treeHash(f.root);
      expect(() => applyUpdate(f.root, next, preview)).toThrow("Stale");
      expect(treeHash(f.root)).toBe(old);
    } finally {
      f.cleanup();
    }
  });
  it("halts on unknown upstream fields instead of dropping them", () => {
    const f = fixture();
    try {
      write(
        join(f.source, "data/disciplines/math/ma-a.json"),
        json({ ...f.chapter, resources: ["new-upstream-schema"] }),
      );
      expect(() => snapshotFromSource(f.source, sha2)).toThrow(
        "adapter review",
      );
    } finally {
      f.cleanup();
    }
  });
  it("retains an explicitly selected deleted record without losing a local reference", () => {
    const f = fixture();
    try {
      writeYaml(join(f.root, "data/disciplines/biomedical.yaml"), {
        id: "biomedical",
        name: "Biomedical",
        prefix: "edu-bme",
        categories: ["Foundations"],
      });
      writeYaml(join(f.root, "data/chapters/edu-bme-a.yaml"), {
        ...f.chapter,
        id: "edu-bme-a",
        discipline: "biomedical",
        ownership: "local",
        topics: [{ id: "edu-bme-a-1", name: "BME" }],
        prerequisites: ["ma-a"],
      });
      rmSync(join(f.source, "data/disciplines/math/ma-a.json"));
      const next = snapshotFromSource(f.source, sha2),
        preview = previewUpdate(f.root, next);
      expect(preview.conflicts[0].kind).toBe("deletion");
      const unchanged = treeHash(f.root);
      expect(() =>
        applyUpdate(f.root, next, preview, {
          binding: preview.binding,
          resolutions: { "chapters/ma-a.yaml": { choice: "delete" } },
        }),
      ).toThrow("unknown ID ma-a");
      expect(treeHash(f.root)).toBe(unchanged);
      applyUpdate(f.root, next, preview, {
        binding: preview.binding,
        resolutions: { "chapters/ma-a.yaml": { choice: "retain" } },
      });
      expect(
        loadCatalog(f.root).chapters.find((c) => c.id === "ma-a")?.ownership,
      ).toBe("local");
    } finally {
      f.cleanup();
    }
  });
  it("refuses an added upstream ID that collides with a local record", () => {
    const f = fixture();
    try {
      writeYaml(join(f.root, "data/chapters/ma-local.yaml"), {
        ...f.chapter,
        id: "ma-local",
        discipline: "math",
        ownership: "local",
        topics: [{ id: "ma-local-1", name: "Local" }],
      });
      write(
        join(f.source, "data/disciplines/math/ma-local.json"),
        json({
          ...f.chapter,
          id: "ma-local",
          topics: [{ id: "ma-local-1", name: "New" }],
        }),
      );
      const next = snapshotFromSource(f.source, sha2),
        preview = previewUpdate(f.root, next);
      expect(preview.conflicts[0].kind).toBe("collision");
      expect(() =>
        applyUpdate(f.root, next, preview, {
          binding: preview.binding,
          resolutions: { "chapters/ma-local.yaml": { choice: "upstream" } },
        }),
      ).toThrow("ID collision");
    } finally {
      f.cleanup();
    }
  });
  it("rejects a stale resolution file even when its preview is current", () => {
    const f = fixture();
    try {
      const next = snapshotFromSource(f.source, sha2),
        preview = previewUpdate(f.root, next),
        old = treeHash(f.root);
      expect(() =>
        applyUpdate(f.root, next, preview, {
          binding: { ...preview.binding, local_hash: "stale" },
          resolutions: {},
        }),
      ).toThrow("Stale resolution");
      expect(treeHash(f.root)).toBe(old);
    } finally {
      f.cleanup();
    }
  });
  it("rejects duplicate overlay layers before previewing or applying", () => {
    const f = fixture();
    try {
      writeYaml(join(f.root, "data/overlays/one.yaml"), {
        target_type: "chapter",
        target_id: "ma-a",
        overrides: { summary: "One" },
      });
      writeYaml(join(f.root, "data/overlays/two.yaml"), {
        target_type: "chapters",
        target_id: "ma-a",
        overrides: { summary: "Two" },
      });
      expect(() => loadCatalog(f.root)).toThrow("duplicate overlay target");
      expect(() =>
        previewUpdate(f.root, snapshotFromSource(f.source, sha2)),
      ).toThrow("duplicate overlay target");
    } finally {
      f.cleanup();
    }
  });
  it("rejects invalid upstream field types and dependency cycles before installing", () => {
    const f = fixture();
    try {
      write(
        join(f.source, "data/disciplines/math/ma-a.json"),
        json({ ...f.chapter, level: "three" }),
      );
      expect(() => snapshotFromSource(f.source, sha2)).toThrow(
        "Invalid upstream",
      );
      write(
        join(f.source, "data/disciplines/math/ma-a.json"),
        json({ ...f.chapter, prerequisites: ["ma-a"] }),
      );
      expect(() => snapshotFromSource(f.source, sha2)).toThrow("cycle");
    } finally {
      f.cleanup();
    }
  });
});
