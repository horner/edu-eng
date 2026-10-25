import { describe, expect, it } from "vitest";
import { assertExportIntegrity } from "../../scripts/lib/export-kn.ts";
import type { Curriculum } from "../../src/data/types.ts";

function fixture() {
  const chapter = {
    id: "edu-bme-fixture",
    name: "Fixture chapter",
    summary: "Preserve the authored learning scope.",
    topics: [{ id: "edu-bme-fixture-1", name: "An explicit topic" }],
    resources: ["edu-res-fixture"],
    review_status: "academic_review_pending",
  };
  const resource = {
    id: "edu-res-fixture",
    title: "Fixture reading",
    url: "https://example.org/fixture-reading",
    review_scope: "One assigned section, not the entire course.",
  };
  const model = {
    chapters: [chapter],
    disciplines: [],
    roadmaps: [],
    resources: [resource],
    competencies: [],
    assessments: [],
    studios: [],
    programs: [],
    institutions: [],
    brands: [],
    crosswalks: [],
    baselines: [],
  } as unknown as Curriculum;
  const reimported = {
    chapters: [
      {
        id: chapter.id,
        name: chapter.name,
        summary: chapter.summary,
        topics: structuredClone(chapter.topics),
      },
    ],
    disciplines: [],
    roadmaps: [],
  };
  const sidecar = {
    schema_version: 1,
    collections: {
      chapters: [
        {
          id: chapter.id,
          fields: {
            resources: [...chapter.resources],
            review_status: chapter.review_status,
          },
        },
      ],
      resources: [{ id: resource.id, fields: { ...resource } }],
    },
  };
  return { model, reimported, sidecar };
}

describe("export field-loss rejection", () => {
  it("accepts intact supported fields and separately preserved extensions", () => {
    const { model, reimported, sidecar } = fixture();
    expect(() =>
      assertExportIntegrity(model, reimported, sidecar),
    ).not.toThrow();
  });

  it("rejects a deliberately dropped supported chapter field", () => {
    const { model, reimported, sidecar } = fixture();
    Reflect.deleteProperty(reimported.chapters[0], "summary");
    expect(() => assertExportIntegrity(model, reimported, sidecar)).toThrow(
      "Lost export field chapters/edu-bme-fixture/summary",
    );
  });

  it("rejects a deliberately dropped chapter extension", () => {
    const { model, reimported, sidecar } = fixture();
    Reflect.deleteProperty(sidecar.collections.chapters[0].fields, "resources");
    expect(() => assertExportIntegrity(model, reimported, sidecar)).toThrow(
      "Lost export field chapters/edu-bme-fixture/resources",
    );
  });

  it("rejects an altered field in a sidecar-only resource record", () => {
    const { model, reimported, sidecar } = fixture();
    sidecar.collections.resources[0].fields.url = "https://example.org/wrong";
    expect(() => assertExportIntegrity(model, reimported, sidecar)).toThrow(
      "Missing sidecar record resources/edu-res-fixture",
    );
  });
});
