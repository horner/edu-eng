import type { Curriculum, Program } from "./types";
export async function loadCurriculum(): Promise<Curriculum> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/curriculum.json`,
  );
  if (!response.ok)
    throw new Error(`Curriculum could not load (${response.status}).`);
  return response.json() as Promise<Curriculum>;
}
export function prerequisitePath(id: string, data: Curriculum): string[] {
  const records = new Map(
    [...data.chapters, ...data.competencies].map((c) => [c.id, c]),
  );
  const done = new Set<string>();
  const result: string[] = [];
  function visit(key: string) {
    if (done.has(key)) return;
    done.add(key);
    (records.get(key)?.prerequisites || []).forEach(visit);
    result.push(key);
  }
  visit(id);
  return result;
}

/** Academic overrides are explicit and independent of identity/brand settings. */
export function resolveProgram(
  data: Curriculum,
  institutionId: string,
  programId: string,
): Program {
  const institution = data.institutions.find((row) => row.id === institutionId);
  if (!institution || !institution.programs.includes(programId))
    throw new Error(
      `Institution ${institutionId} does not offer program ${programId}`,
    );
  const base = data.programs.find((row) => row.id === programId);
  if (!base) throw new Error(`Unknown program ${programId}`);
  const program = structuredClone(base),
    overrides = institution.academic_overrides || {};
  for (const key of Object.keys(overrides))
    if (!["requirements", "electives", "content_selections"].includes(key))
      throw new Error(`Unsupported academic override ${key}`);
  for (const key of ["requirements", "electives"])
    if (Object.hasOwn(overrides, key))
      program[key] = structuredClone(overrides[key]);
  if (Object.hasOwn(overrides, "content_selections")) {
    const selection = overrides.content_selections;
    if (!selection || typeof selection !== "object" || Array.isArray(selection))
      throw new Error(
        "content_selections must map every semester ID to a chapter-ID array",
      );
    const map = selection as Record<string, unknown>,
      terms = new Set(program.semesters.map((term) => term.id));
    if (
      Object.keys(map).length !== terms.size ||
      Object.keys(map).some((id) => !terms.has(id))
    )
      throw new Error(
        "content_selections must contain exactly the program semester IDs",
      );
    const ids = new Set(data.chapters.map((chapter) => chapter.id));
    for (const term of program.semesters) {
      const value = map[term.id];
      if (
        !Array.isArray(value) ||
        value.some((id) => typeof id !== "string" || !ids.has(id)) ||
        new Set(value).size !== value.length
      )
        throw new Error(
          `${term.id}: content_selections must contain distinct known chapter IDs`,
        );
      term.chapters = [...value];
    }
    program.content_selections = structuredClone(map);
  }
  return program;
}
