import { describe, expect, it } from "vitest";
import { resolveProgram } from "../../src/data/load.ts";
import { validateCatalog } from "../../scripts/lib/model.ts";
import type { Curriculum } from "../../src/data/types.ts";

function fixture(): Curriculum {
  const chapter = {
    id: "ma-a",
    name: "A",
    category: "Basics",
    level: 1,
    priority: "core",
    summary: "A foundation",
    discipline: "math",
    ownership: "upstream",
    prerequisites: [],
    related: [],
    topics: [],
    resources: [],
  };
  return {
    schema_version: 1,
    revision: "fixture",
    upstream_revision: "fixture",
    chapters: [chapter, { ...chapter, id: "ma-b", name: "B" }],
    disciplines: [
      { id: "math", name: "Math", prefix: "ma", categories: ["Basics"] },
    ],
    competencies: [
      {
        id: "c",
        chapters: ["ma-a"],
        prerequisites: [],
        resources: [],
        assessments: [],
      },
    ],
    resources: [],
    assessments: [],
    studios: [{ id: "studio", competencies: [] }],
    programs: [
      {
        id: "program",
        name: "Program",
        summary: "Fixture",
        review_status: "draft",
        target_credits: 3,
        semesters: Array.from({ length: 8 }, (_, i) => ({
          id: `term-${i + 1}`,
          number: i + 1,
          title: `Term ${i + 1}`,
          theme: "Fixture",
          chapters: i === 0 ? ["ma-a"] : [],
          competencies: i === 0 ? ["c"] : [],
          studio: "studio",
          assessments: [],
          credit_units:
            i === 0
              ? [
                  {
                    id: "unit",
                    title: "Study",
                    credits: 3,
                    category: "engineering",
                    status: "proposed",
                  },
                ]
              : [],
          completion_criteria: [],
          independence: "Independent",
        })),
      },
    ],
    institutions: [
      {
        id: "one",
        name: "One",
        short_name: "One",
        programs: ["program"],
        brand_id: "brand",
      },
      {
        id: "two",
        name: "Two",
        short_name: "Two",
        programs: ["program"],
        brand_id: "other",
      },
    ],
    brands: [{ id: "brand" }, { id: "other" }],
    crosswalks: [],
    baselines: [],
    roadmaps: [],
    redirects: { chapters: {}, topics: {} },
    validation: [],
    ledgers: [],
  } as unknown as Curriculum;
}
describe("institution-independent curriculum and explicit academic overrides", () => {
  it("identity and brand changes inherit the same stable academic IDs", () => {
    const d = fixture();
    const first = resolveProgram(d, "one", "program"),
      second = resolveProgram(d, "two", "program");
    expect(first).toEqual(second);
    expect(first.semesters[0].chapters).toEqual(["ma-a"]);
  });
  it("an explicit complete content-selection override changes the effective program only", () => {
    const d = fixture();
    const selections = Object.fromEntries(
      d.programs[0].semesters.map((term) => [term.id, [...term.chapters]]),
    );
    selections["term-2"] = ["ma-b"];
    d.institutions[1].academic_overrides = { content_selections: selections };
    expect(resolveProgram(d, "two", "program").semesters[1].chapters).toEqual([
      "ma-b",
    ]);
    expect(resolveProgram(d, "one", "program").semesters[1].chapters).toEqual(
      [],
    );
    expect(
      validateCatalog(d).some((issue) => issue.code.startsWith("institution-")),
    ).toBe(false);
  });
  it("rejects partial override maps, dangling IDs, and orphaned required competency chapters", () => {
    const d = fixture();
    d.institutions[1].academic_overrides = {
      content_selections: { "term-1": [] },
    };
    expect(() => resolveProgram(d, "two", "program")).toThrow("exactly");
    const all = Object.fromEntries(
      d.programs[0].semesters.map((term) => [term.id, []]),
    );
    d.institutions[1].academic_overrides = { content_selections: all };
    expect(
      validateCatalog(d).some((issue) => issue.code === "institution-coverage"),
    ).toBe(true);
  });
  it("rejects an override that schedules a prerequisite after its dependent", () => {
    const d = fixture();
    d.chapters[1].prerequisites = ["ma-a"];
    const all = Object.fromEntries(
      d.programs[0].semesters.map((term) => [term.id, [] as string[]]),
    );
    all["term-1"] = ["ma-b"];
    all["term-2"] = ["ma-a"];
    d.institutions[1].academic_overrides = { content_selections: all };
    expect(
      validateCatalog(d).some(
        (issue) => issue.code === "institution-schedule-prerequisite",
      ),
    ).toBe(true);
  });
});
