import { describe, it, expect } from "vitest";
import { mkdtempSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyOverlay,
  contentChanges,
  creditLedger,
  graphView,
  loadCatalog,
  validateCatalog,
} from "../../scripts/lib/model.ts";
import { readYaml, write, writeYaml } from "../../scripts/lib/io.ts";
import type { Curriculum } from "../../src/data/types.ts";

const base = {
  id: "ma-a",
  name: "A",
  summary: "Foundation",
  category: "Foundations",
  level: 1,
  priority: "core",
  discipline: "math",
  ownership: "upstream",
  prerequisites: [],
  related: [],
  topics: [],
};
const empty = () =>
  ({
    schema_version: 1,
    revision: "fixture",
    upstream_revision: "fixture",
    chapters: [],
    disciplines: [],
    competencies: [],
    resources: [],
    assessments: [],
    studios: [],
    programs: [],
    institutions: [],
    brands: [],
    crosswalks: [],
    baselines: [],
    roadmaps: [],
    redirects: { chapters: {}, topics: {} },
    validation: [],
    ledgers: [],
  }) as Curriculum;
describe("semantic YAML model", () => {
  it("replaces whole overridden fields and preserves independent extensions", () => {
    expect(
      applyOverlay(base, {
        target_type: "chapter",
        target_id: "ma-a",
        overrides: { summary: "New" },
        extensions: { resources: ["res-a"] },
      }),
    ).toMatchObject({ summary: "New", resources: ["res-a"], name: "A" });
    expect(() =>
      applyOverlay(base, {
        target_type: "chapter",
        target_id: "ma-a",
        extensions: { summary: "bad" },
      }),
    ).toThrow("collides");
    expect(() =>
      applyOverlay(base, {
        target_type: "chapter",
        target_id: "ma-a",
        remove_fields: ["id"],
      }),
    ).toThrow("required");
  });
  it("rejects duplicate YAML keys without choosing one silently", () => {
    const root = mkdtempSync(join(tmpdir(), "edu-yaml-"));
    try {
      write(join(root, "bad.yaml"), "id: a\nid: b\n");
      expect(() => readYaml(join(root, "bad.yaml"))).toThrow("unique");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("rejects wrong scalar types with source filename", () => {
    const root = mkdtempSync(join(tmpdir(), "edu-schema-"));
    try {
      cpSync("schemas", join(root, "schemas"), { recursive: true });
      writeYaml(join(root, "data/chapters/a.yaml"), {
        ...base,
        level: "three",
      });
      expect(() => loadCatalog(root)).toThrow(/chapters\/a.yaml.*level/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("finds unknown references and cycles", () => {
    const d = empty();
    d.disciplines = [
      { id: "math", name: "Math", prefix: "ma", categories: ["Foundations"] },
    ];
    d.chapters = [
      { ...base, prerequisites: ["ma-b"] },
      { ...base, id: "ma-b", prerequisites: ["ma-a"] },
    ] as any;
    expect(
      validateCatalog(d).some((i) => i.code === "prerequisite-cycle"),
    ).toBe(true);
    d.chapters[0].prerequisites = ["missing"];
    expect(
      validateCatalog(d).some((i) => i.code === "dangling-reference"),
    ).toBe(true);
  });
  it("rejects a broken learning-resource reference with the responsible chapter", () => {
    const d = empty();
    d.disciplines = [
      { id: "math", name: "Math", prefix: "ma", categories: ["Foundations"] },
    ];
    d.chapters = [{ ...base, resources: ["missing-resource"] }] as any;
    expect(validateCatalog(d)).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "dangling-reference",
        record: "ma-a",
        message: "resources references unknown ID missing-resource",
      }),
    );
  });
  it("requires a crosswalk mapping or an explicit documented gap", () => {
    const d = empty();
    d.crosswalks = [
      {
        id: "cw",
        criteria: [
          {
            id: "criterion",
            title: "A requirement",
            requirement: "Demonstrate something",
            coverage: "planned",
          },
        ],
      },
    ];
    expect(
      validateCatalog(d).some((i) => i.code === "unmapped-requirement"),
    ).toBe(true);
    (d.crosswalks[0].criteria as any[])[0].gaps = [
      "Faculty has not mapped it yet",
    ];
    expect(
      validateCatalog(d).some((i) => i.code === "unmapped-requirement"),
    ).toBe(false);
    (d.crosswalks[0].criteria as any[])[0].instructional_stages = [
      {
        stage: "assessed",
        terms: [9],
        assessments: ["unknown-assessment"],
        meaning: "Bad fixture",
      },
    ];
    const errors = validateCatalog(d).filter(
      (issue) => issue.severity === "error",
    );
    expect(errors.some((issue) => issue.code === "instructional-stage")).toBe(
      true,
    );
    expect(
      errors.some(
        (issue) =>
          issue.code === "dangling-reference" &&
          issue.record.includes("criterion/assessed"),
      ),
    ).toBe(true);
  });
  it("counts credits once and never calls proposed units reconciled", () => {
    const p = {
      id: "p",
      target_credits: 3,
      semesters: [
        {
          credit_units: [
            {
              id: "u",
              credits: 3,
              category: "engineering",
              status: "proposed",
            },
          ],
        },
        {
          credit_units: [
            {
              id: "u",
              credits: 3,
              category: "engineering",
              status: "proposed",
            },
          ],
        },
      ],
    };
    const ledger = creditLedger(p);
    expect(ledger.total).toBe(3);
    expect(ledger.status).toBe("unresolved");
    expect(ledger.issues[0]).toContain("more than once");
    p.semesters.pop();
    expect(creditLedger(p).status).toBe("proposed");
  });
  it("exports typed edges from the same canonical prerequisites without coordinates", () => {
    const d = empty();
    d.chapters = [
      { ...base },
      { ...base, id: "ma-b", prerequisites: ["ma-a"] },
    ] as any;
    const view = graphView(d);
    expect(view.native_roadmap_sh).toBe(false);
    expect(view.edges).toContainEqual({
      id: "prerequisite:ma-a:ma-b",
      source: "ma-a",
      target: "ma-b",
      relationship: "prerequisite",
    });
    expect(JSON.stringify(view)).not.toContain("position");
  });
  it("reports a resource-only edit without unrelated chapter churn", () => {
    const before = empty();
    before.chapters = [base] as any;
    before.resources = [{ id: "r", title: "Before" }] as any;
    const after = structuredClone(before);
    after.resources[0].title = "After";
    expect(contentChanges(before, after)).toEqual([
      { kind: "resources", id: "r", change: "updated" },
    ]);
  });
  it("does not let ready status hide missing prerequisites, unreviewed resources, or invalid topic scope", () => {
    const d = empty();
    d.disciplines = [
      { id: "math", name: "Math", prefix: "ma", categories: ["Foundations"] },
    ];
    d.chapters = [
      {
        ...base,
        prerequisites: ["ma-b"],
        resources: ["res-a"],
        review_status: "ready",
        topics: [{ id: "ma-a-1", name: "Actual topic" }],
      },
      { ...base, id: "ma-b" },
    ] as any;
    d.resources = [
      {
        id: "res-a",
        url: "https://example.org/lesson",
        topics: ["ma-a"],
        review_status: "metadata_verified",
      },
    ] as any;
    d.studios = [{ id: "studio", competencies: [] }] as any;
    d.programs = [
      {
        id: "program",
        target_credits: 0,
        review_status: "ready",
        semesters: Array.from({ length: 8 }, (_, i) => ({
          id: `term-${i + 1}`,
          number: i + 1,
          chapters: i === 0 ? ["ma-a"] : [],
          competencies: [],
          assessments: [],
          studio: "studio",
          credit_units: [],
          selections:
            i === 0
              ? [
                  {
                    chapter: "ma-a",
                    depth: "selected",
                    focus: ["ma-b-not-in-a"],
                  },
                ]
              : [],
        })),
      },
    ] as any;
    const codes = validateCatalog(d)
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.code);
    expect(codes).toContain("schedule-prerequisite");
    expect(codes).toContain("resource-readiness");
    expect(codes).toContain("selected-topic-scope");
  });
});
