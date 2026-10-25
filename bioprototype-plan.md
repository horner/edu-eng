# Biomedical engineering prototype implementation plan

Status: ready for implementation; application and curriculum milestones are pending.

## 1. Outcome and scope

Build a working, four-year biomedical engineering curriculum prototype that Indiana Tech faculty, students, and employers can explore and review. Work backward from graduate capabilities, connect them to prerequisites and learning resources, and show where students practice and demonstrate them through individual work and collaborative engineering studios.

The prototype must provide:

- Eight semesters of proposed study, including foundations, broad education, projects, individual assessments, and team evidence.
- Readable YAML source files and meaningful GitHub pull-request diffs.
- Pinned imports from Knowledge Navigator, with a repeatable update process that preserves local curriculum and resource curation.
- A Knowledge Navigator-style browse view and a roadmap.sh-style graph view over the same data.
- A tested Knowledge Navigator export for supported fields, with a report of extensions that its current application cannot display.
- Indiana Tech branding as the default demonstration profile, with configuration-based support for another university.
- A static deployment suitable for GitHub Pages, with no server required for the demonstration.

This document is the implementation assignment. Do not check off implementation tasks merely because they have been described here. Treat the proposed curriculum as a design for review. Keep its status distinct from Indiana Tech's existing approved degree and from an accreditation determination.

### Demonstration journey

A visitor selects a university and the biomedical program, explores all eight semesters, opens a competency, sees its prerequisites, follows a specific resource, and examines the individual and team evidence expected. Switching between browse and graph views preserves the selected competency. A contributor changes a YAML record, opens a readable diff, runs validation, and sees the same change in both views. A maintainer previews an upstream Knowledge Navigator update and resolves any conflict without losing local work.

### Scope decisions

- Implement our two presentation modes using our own UI. A roadmap-style view does not depend on importing roadmap.sh's application or content.
- Make Knowledge Navigator synchronization one-way into this repository for the PoC. Sending changes upstream is a separate contribution action.
- Use synthetic or nonsensitive demonstration progress and evidence. Authentication, an LMS, a production gradebook, and multi-user progress synchronization are later work.
- Link to Huddle and Pulse initially. Their APIs and single sign-on are not dependencies for this prototype.
- Do not create a new paid subscription, scheduled synchronization, or external publication as an implicit implementation step.

## 2. Verified starting points and open evidence

Sources checked on 2026-10-25:

| ID | Source | How to use it |
| --- | --- | --- |
| S1 | [Indiana Tech biomedical program](https://academics.indianatech.edu/program/biomedical-engineering/) | Verified on-campus program and 122-credit total. Capture a current course-level baseline separately. |
| S2 | [Indiana Tech biomedical outcomes](https://academics.indianatech.edu/talwar/abet/biomedical-engineering-bs/) | Source for the existing degree's outcomes and biomedical experience areas. |
| S3 | [2026–2027 catalog](https://catalog.indianatech.edu/index.php?catoid=22) | Required baseline source. The catalog home was readable, but current degree details were not retrievable during planning. Obtain a current official export before asserting course or credit equivalence. |
| S4 | [ABET EAC criteria, 2026–2027](https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/) | Versioned reference for outcomes, curriculum, biomedical content, assessment, faculty, and facilities. |
| S5 | [Knowledge Navigator schema](https://github.com/MohamedMuneerM/knowledge-navigator/blob/main/data/SCHEMA.md) and [builder](https://github.com/MohamedMuneerM/knowledge-navigator/blob/main/scripts/build.py) | Authored JSON chapters, prerequisites, related links, nested topics, and staged goal paths. Preserve their meaning on import. |
| S6 | [Knowledge Navigator repository](https://github.com/MohamedMuneerM/knowledge-navigator) | Initial verified revision: `c26f8337f42f6dd3bbe5e007263fa92399f1b96e`. Verify it exists when implementing and record the exact imported revision. |
| S7 | [MIE UI consumer documentation](https://github.com/mieweb/ui) and [agent instructions](https://github.com/mieweb/ui/blob/main/agent/mieweb-ui.instructions.md) | Component selection, styling, branding, accessibility, and integration conventions. Read the current instructions before implementation. |
| S8 | [Indiana Tech identity](https://marketing.indianatech.edu/identity/), [logo usage guidelines](https://marketing.indianatech.edu/wp-content/uploads/sites/21/Logo-Usage-Guidelines-Indiana-Tech.pdf), and [logo assets](https://marketing.indianatech.edu/identity/indiana-tech-logo/) | Prototype branding reference. The published guide specifies bold orange `#FA4616` alongside black. Preserve original logo artwork and distinguish official brand values from additional accessible UI tokens. |
| S9 | [roadmap.sh contribution model](https://github.com/nilbuild/developer-roadmap/blob/master/contributing.md) and [license](https://github.com/nilbuild/developer-roadmap/blob/master/license) | Its current public repository contains topic content and synchronization tools. It does not supply the app renderer or a verified stable import contract. Link to its pages; do not assume its content can be redistributed. |
| S10 | [Resource-curation skill](.agents/skills/curate-learning-resources/SKILL.md) and [project context](ReadMe.md) | Existing instructions and examples for accuracy, engagement, deep links, practice, access conditions, collaboration, Huddle, and Pulse. |

ABET's current engineering curriculum criteria include minimum mathematics/basic-science and engineering-topic credit requirements, broad education, and a culminating design experience. Its biomedical criteria cover engineering and relevant sciences, living/nonliving interactions, biomedical modeling and realization, and measurements and interpretation of living systems. Capture the precise requirements and criterion identifiers from S4 in versioned records. The general credit minima are 30 and 45 semester credits respectively; the overall program target from S1 is 122. Software validation checks a recorded mapping, while academic judgment establishes whether an experience satisfies it.

Knowledge Navigator currently supplies shared foundations and engineering topics but lists biomedical engineering as future expansion. Add locally owned biomedical records and connect them to imported prerequisites. Its ABET audits cite an earlier criteria cycle; retain those citations as upstream provenance and create a separate mapping for our chosen review cycle.

## 3. Commit and checkbox contract

Every actionable checkbox below has a stable task ID. Work in dependency order. Use one focused commit per task, or a small group of closely related task IDs when they cannot be validated independently.

1. Read the task, implement its artifacts, and run its stated validation.
2. Add a dated evidence entry under `docs/progress/<TASK-ID>.md`: summary, changed artifacts, exact commands/results, and any manual review evidence. A screenshot supports a UI check but does not replace a command result.
3. Change that task's checkbox to `[x]` in this file only when its acceptance condition is met. Keep unresolved academic or resource reviews visibly pending in their records.
4. Stage the implementation, evidence, and checkbox change together. Inspect `git diff --cached` and commit with the task ID, for example `[BIO-031] Add safe upstream update preview`.
5. Use the ID to find the associated implementation: `git log --all --oneline --grep='BIO-031'`. Keep the ID unchanged even if later work revises the implementation.

Do not insert a commit's own SHA into files included in that same commit. Git history provides that association. Evidence may cite earlier commits. If a checked task must be reopened, change it back in a new commit that explains why; keep its earlier evidence.

For a task requiring several commits, put its ID in every commit and leave its checkbox unchecked until the final validated commit. Stage named files; do not sweep unrelated work into a milestone commit. Use local commits throughout. Remote creation, pushing, and enabling Pages require an explicit destination and publication instruction.

- [x] **BIO-000 — Record the implementation assignment.** Preserve the existing introduction, README, and curation skill; add this plan; validate document links and task IDs; commit the planning baseline. The initial evidence is this plan, its source table, and the planning commit. All implementation checkboxes below start unchecked.
- [x] **BIO-001 — Set Indiana Tech as the prototype brand.** Update the README, brand sources, planned configuration path, and implementation acceptance criteria to use Indiana Tech's institutional identity while preserving configuration-based support for other universities. Record source verification and document checks in `docs/progress/BIO-001.md`. This completes the planning amendment; BIO-050 and BIO-051 remain implementation tasks.

## 4. Technical design to implement

### Runtime and tools

Use React, TypeScript, and Vite for a static application. Use `@mieweb/ui` for the shell, controls, panels, and tables, following S7. Prefer its published CSS and semantic theme tokens; introduce app-level Tailwind only if its current integration instructions require it. Use `@xyflow/react` with `@dagrejs/dagre` for the graph. Use the `yaml` package for YAML 1.2 parsing and Ajv with JSON Schema 2020-12 for structural validation. Run graph, reference, schedule, and credit checks after schema validation.

Use a supported Node LTS release, pinned in the repository during setup, and pnpm pinned through `packageManager`. Record tested versions and commit the lockfile. Use Vitest for import/merge/validation behavior and Playwright for the small set of essential browser journeys. Pin versions during implementation rather than copying unverified version numbers from this plan.

Primary implementation references: [Vite static deployment](https://vite.dev/guide/static-deploy.html#github-pages), [React Flow](https://reactflow.dev/learn), [layout guidance](https://reactflow.dev/learn/layouting/layouting), [graph accessibility](https://reactflow.dev/learn/advanced-use/accessibility), [YAML parser](https://eemeli.org/yaml/), and [Ajv](https://ajv.js.org/guide/getting-started.html).

### Intended repository layout

These are future paths to create during the tasks, not existing deliverables:

```text
data/
  upstream/knowledge-navigator/
    lock.yaml
    chapters/*.yaml                 generated, checked-in upstream baseline
    disciplines/*.yaml
    roadmaps/*.yaml
    redirects.yaml
  overlays/*.yaml                   locally authored changes to imported records
  disciplines/biomedical.yaml       locally owned discipline/category metadata
  chapters/edu-bme-*.yaml            locally owned biomedical chapters
  competencies/*.yaml               observable capabilities and performance criteria
  resources/*.yaml                  watch/read/practice destinations and reviews
  assessments/*.yaml                individual and team assessment definitions
  studios/*.yaml                    team challenges, roles, interfaces, deliverables
  programs/biomedical.yaml          generic eight-semester proposed program
  institutions/indiana-tech.yaml    identity, baseline sources, local program settings
  institutions/demo-university.yaml
  brands/indiana-tech.yaml
  brands/demo.yaml
  crosswalks/abet-eac-2026-2027.yaml
  crosswalks/indiana-tech-bme.yaml
  baselines/indiana-tech-bme-2026-2027.yaml
schemas/*.schema.json
scripts/                            import, sync, validate, build, export commands
src/                                React application and typed data adapters
tests/fixtures/                     tiny upstream revisions and curriculum examples
docs/progress/<TASK-ID>.md
docs/sources/                       source inventory and retrieval notes
generated/                          ignored site JSON, reports, diagram layout
dist/                               ignored deployment output
.cache/                             ignored upstream fetch/cache
```

The upstream YAML is generated but intentionally committed so changes can be reviewed. Contributors edit overlays and local records, not that baseline. Generated website bundles and graph coordinates are ignored. Ordinary builds read checked-in YAML and do not fetch a moving upstream branch.

### Data responsibilities

| Record | Required meaning |
| --- | --- |
| Chapter/topic | Stable ID, label, scope, level, source ownership, prerequisite versus related relationships, and nested topic IDs where applicable. Preserve imported chapter/topic distinctions. |
| Competency | Observable capability, expected performance level, relevant topics, individual/team context, and assessment references. Distinguish introduced, practiced, assessed, and demonstrated states. |
| Resource | Stable ID, topic references, title, creator, provider, verified URL/segment, format, prerequisites, access conditions, accuracy evidence, engagement rationale, review state, and date checked. |
| Assessment | Task, individual/team mode, observable evidence, rubric/performance indicators, competency references, and pass/completion interpretation. |
| Studio | Need, scope, deliverables, work decomposition, interfaces, role rotation, learning dependencies, experiments, root-cause reflection, and individual defenses. |
| Program/semester | Eight ordered terms; selected content and depth; credit-bearing unit IDs; foundations, broad education, studio, assessments, and completion conditions. |
| Institution | University name, program profile, catalog/baseline references, optional local terminology and requirement overrides, brand reference. |
| Brand | Verified colors, typography, assets, token provenance, and accessible theme settings. Keep university identity and visual theme separate. |
| Crosswalk | Source/version/criterion ID, local competency or experience IDs, coverage state, evidence requirements, review state, and gaps. |

Keep a single institution-independent program definition. An institution can select or override academic requirements explicitly without copying the whole program. Brand configuration alone must never change academic content.

Imported IDs stay unchanged; use `edu-` for local IDs and fail on collisions. References target IDs rather than titles or file paths. Any rename requires an explicit redirect and migration. Program selections are explicit: a newly imported chapter cannot silently become a graduation requirement.

### Overlay and update contract

Each overlay identifies its target record type and ID, and separates `overrides` of upstream fields from locally owned `extensions`. An omitted field means inherit; `null` is a value only where the schema allows it. Delete an optional field only through an explicit `remove_fields` entry; required fields cannot be removed. For the first version, replace an overridden top-level field as a whole, including nested objects and ordered arrays. Do not implement an implicit deep merge. Resources, assessments, and local review annotations belong in extensions and must not collide with upstream fields.

Resolve imported baseline followed by project overlays; locally owned chapters have distinct IDs. Resolve the generic program before its institution-specific academic overrides. Limit those academic overrides to explicitly schema-defined requirement, elective, and content-selection fields; use the same whole-field replacement semantics. Identity and brand settings have no academic precedence. Reject unsupported override targets and include the responsible layer in validation messages.

An update resolution identifies the old and new full upstream SHAs, importer/schema versions, and a canonical hash of the relevant current local inputs. Apply rejects a stale preview or resolution, recomputes the effective candidate and validation, and only then writes changes. When an upstream value is accepted, remove or rebase its old override against the new baseline; test that the resolved application model actually contains the accepted value. Local extensions survive this operation independently.

A minimal illustrative local chapter, to refine when implementing schemas:

```yaml
schema_version: 1
id: edu-bme-biomedical-signal-analysis
name: Biomedical signal analysis
ownership: local
discipline: biomedical
category: Biomedical signals and instrumentation
level: 3
priority: core
summary: Analyze physiological signals and explain measurement limitations.
prerequisites: [] # Populate with verified IDs before marking this chapter ready.
related: []
competencies:
  - edu-bme-explain-signal-processing
resources:
  - res-3b1b-fourier-introduction
review_status: draft
```

Schema design must permit a truthful draft with identified gaps and make readiness checks fail when required prerequisites, resources, or assessments are still missing. Do not use guessed external IDs or placeholders that look like verified links.

## 5. Proposed four-year learning progression

This is our starting proposal, not Indiana Tech's official semester schedule. It must be expanded into YAML during BIO-040 through BIO-043. Foundations and broad education run alongside the studios. Studio credits belong inside the term allocation; they are not an extra workload added on top of a full course load.

| Term | Proposed foundation emphasis | Team studio and observable result |
| --- | --- | --- |
| 1 | Mathematics entry skills and calculus; chemistry; anatomy/physiology; CAD; writing and professional practice | Define a biological or assistive need and build a simple fixture. Produce requirements, measurements, CAD, a demonstrator, and an explanation of the work decomposition. |
| 2 | Further calculus; calculus-based mechanics; biology/physiology; programming; communication | Build and characterize a measurement system. Produce calibration, uncertainty analysis, reproducible results, and individual quantitative explanations. |
| 3 | Further mathematics; electricity and magnetism; circuits/computation; statistics foundations; physiological context | Build an instrumentation and data pipeline. Show calibration, sampled data, measurement limits, software interfaces, and repeatable tests. |
| 4 | Differential equations/linear algebra as needed; mechanics and materials; experimental design; technical communication | Design a biomechanical component. Compare analytical predictions with a prototype; investigate failure and document redesign. |
| 5 | Signals and systems; numerical methods; transport/fluids/thermal principles; statistics and relevant physiology | Develop and validate a benchtop physiological model. Explain assumptions, compare predictions and data, and investigate discrepancies. |
| 6 | Biomedical systems integration; biomaterials; controls where relevant; engineering ethics, quality, and risk | Integrate a biomedical prototype across mechanical, electrical, and software interfaces. Trace needs to requirements and repeatable verification. |
| 7 | Advanced electives; standards and constraints; economics; literature/research methods; remaining broad education | Capstone discovery and design. Produce stakeholder needs, alternatives, an architecture, a test plan, and a supported design review. |
| 8 | Advanced application; remaining requirements; professional communication and transition | Capstone verification and handoff. Deliver a tested demonstrator, reproducible evidence, limitations, documentation, and individual defense/transfer tasks. |

For every term, author explicit prerequisites and concurrent-study relationships rather than relying on this prose order. Refine when calculus-based physics, statistics, and domain topics are introduced versus required at full depth. For each year, show increasing independence and responsibility; students rotate through leadership, integration, verification, and communication work.

The living-system measurement requirement needs an explicit faculty-defined educational experience and appropriate facilities. A synthetic-data demo can illustrate the UI but must not claim to satisfy that curricular requirement. Keep demonstrators educational and use existing approved laboratory arrangements when actual lab experiences are later designed.

## 6. Implementation milestones

### M01 — Repository and application foundation

Depends on BIO-000. Exit: a developer can install, validate a fixture, run the shell, and produce a static build from documented commands.

- [ ] **BIO-010 — Establish project tooling.** Create `package.json`, the pinned Node/pnpm configuration, TypeScript settings, Vite application, ignore rules, and a minimal fixture. Add scripts `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`, `data:validate`, `data:build`, `sync:preview`, `sync:apply`, and `export:kn` as their implementations become available. Unimplemented scripts must fail clearly. Acceptance: clean install and initial shell build succeed; no generated bundles are tracked.
- [ ] **BIO-011 — Integrate the MIE UI shell.** Follow S7; inspect any setup-generated instructions before retaining them. Use the library's theme/provider, semantic tokens, existing controls, icon conventions, and accessible labels. Acceptance: the shell renders with the published CSS, supports keyboard navigation and light/dark behavior where configured, and obtains university appearance from theme configuration rather than hard-coded component styles.
- [ ] **BIO-012 — Add the documented developer workflow and initial CI.** Document actual commands in a developer guide and run type checking, appropriate linting, fixture validation, tests, and the build in CI. Acceptance: a fresh checkout can follow the guide; a deliberately invalid fixture makes the relevant check fail. Do not enable publication in this task.

### M02 — YAML schemas, graph semantics, and reviewable output

Depends on M01. Exit: validated YAML produces deterministic application data without coupling content to drawing coordinates.

- [ ] **BIO-020 — Define the versioned record schemas.** Implement the records and overlay contract in Section 4 and examples for each. Include locally owned discipline metadata, category membership, ID prefixes, level, and priority. Choose exact required fields and enums, including academic/resource review states. Parse YAML safely, reject duplicate keys, and validate types with file/record locations. Acceptance: schema-valid examples load; duplicate keys, unknown record types, invalid overlay operations, and wrong scalar types fail with actionable messages.
- [ ] **BIO-021 — Implement the canonical resolver.** Combine baseline imports, local overlays, local chapters, resources, program selections, and institution overrides into one typed model. Preserve ordered arrays and distinguish prerequisites, related links, and concurrent study. Acceptance: duplicate IDs, dangling references, required-prerequisite cycles, and incompatible schema versions fail; output ordering is deterministic.
- [ ] **BIO-022 — Add curriculum and coverage validation.** Check eight terms, scheduled prerequisite order, explicitly supported concurrency, selected-topic scope, assessment links, resource readiness, and coverage gaps. Implement a credit ledger that counts each credit-bearing unit once, never once per competency mapping. Acceptance: tests catch a missing prerequisite, double-counted credits, an unmapped requirement, and a draft resource masquerading as reviewed; unresolved academic credits remain visibly unresolved.
- [ ] **BIO-023 — Generate stable application data and contributor diffs.** Produce ignored JSON from YAML and a concise content-change summary for reviews. Preserve meaningful order and stable key conventions; avoid rewriting unrelated records. Acceptance: two builds from the same input are byte-identical; a resource-only change produces a small semantic diff and changes no authored coordinates.

### M03 — Knowledge Navigator import and safe synchronization

Depends on M02. Exit: an upstream update can be previewed, reviewed, resolved, and applied without losing local work.

- [ ] **BIO-030 — Import a pinned upstream baseline.** Read authored JSON from S6 at a full verified SHA. Preserve chapter/topic IDs, discipline metadata, roadmaps, rationale/focus/depth, and redirects. Convert to readable baseline YAML. Store repository URL, SHA, importer/schema version, imported paths and hashes, retrieval date, and license/attribution references in `lock.yaml`. Acceptance: the import is deterministic; normal builds work offline afterward; imported ownership is explicit; upstream material has traceable attribution.
- [ ] **BIO-031 — Implement update preview.** `pnpm sync:preview -- --ref <full-sha>` fetches into a temporary/cache location and reports additions, edits, deletions, redirects, and schema changes without changing tracked data. Include the old/new SHAs and relevant local-input hashes needed to bind later resolutions. Acceptance: the same preview is reproducible, shows affected local program references, and leaves the working tree unchanged. An unknown upstream field or invalid record stops the import for adapter review instead of discarding it.
- [ ] **BIO-032 — Implement three-way resolution.** Compare the previous baseline B, new upstream U, and locally effective value L. If U=B preserve local; if L=B accept upstream; if U=L accept the shared change; otherwise report a conflict. Initially treat ordered topic arrays atomically. Keep local resource/assessment extensions separately owned. Acceptance: fixture tests cover unchanged, upstream-only, local-only, identical, and conflicting edits and show explicit conflict locations and resolutions.
- [ ] **BIO-033 — Apply updates atomically and handle removals.** `pnpm sync:apply -- --ref <full-sha>` applies only a validated candidate with any required resolution file. Enforce Section 4's state hashes, reject stale decisions, and rebase/remove obsolete overrides. Replace the baseline, lock, and necessary overlays together. A referenced deletion or locally edited deletion requires a retention/migration decision; never infer a rename from its title. Acceptance: unresolved conflicts, stale inputs, and broken references leave all tracked inputs unchanged; the resolved model exposes accepted upstream values while preserving local BME chapters, resource reviews, assessments, and explicit degree selections. Cover additions, redirects, ID collisions, and referenced deletions with fixtures.
- [ ] **BIO-034 — Document and demonstrate the complete sync workflow.** Add a small two-revision fixture and guide showing preview, conflict resolution, apply, validation, and a reviewable commit. Include recovery from a rejected update and an upstream schema change. Acceptance: another developer follows it without editing importer code for an ordinary content update. Scheduling and automatic pushes remain outside this milestone.

### M04 — Four-year biomedical curriculum and resources

Depends on M02 and BIO-030. Exit: all eight terms are represented and navigable, with documented coverage and visible academic gaps.

- [ ] **BIO-040 — Capture the official baseline and requirement sources.** Obtain the current official course list/export from S3, record source/version/retrieval details, course codes, credits, prerequisites, elective rules, and any published sequencing. Keep it separate from our proposal. Record S4 requirements by criterion ID and review cycle. Acceptance: source-backed baseline facts reconcile to the published total or have explicit discrepancies; historical plans are labeled historical. A blocked catalog retrieval is recorded as a gap and does not produce invented course data.
- [ ] **BIO-041 — Author the proposed eight-semester program.** Expand Section 5 into program, semester, local biomedical chapter, competency, and credit-bearing-unit YAML. Select relevant imported foundations and their prerequisite closure. Add broad education and technical electives explicitly. Acceptance: all eight terms have foundations, a studio, individual assessments, team evidence, expected independence, and completion criteria. Target the 122-credit baseline through an explicit proposed ledger; any unclassified or unresolved credits prevent a reconciled-credit status. Do not require every imported chapter or frontier topic.
- [ ] **BIO-042 — Define studio and assessment evidence.** Write each studio's need, decomposition, interfaces, rotating roles, deliverables, experiments, and rubric. Include standup/Beat explanations, design reviews, integration tests, Five Whys/root-cause work, and retrospective evidence. Use individual tests, appropriate external assessments, explanations, and transfer tasks for individual competence. Acceptance: a team success cannot automatically mark every member competent; leadership and communication recur in every term; Huddle/Pulse links are configurable and optional for viewing the curriculum.
- [ ] **BIO-043 — Curate the required learning paths.** Use S10 to add specific watch/read and practice destinations for selected required content, including paid/account restrictions and review evidence. Use the existing Fourier example where it fits. Racaniello's virology course illustrates expert curation; advanced virology and Navier–Stokes research are optional unless justified by a selected capability. Acceptance: every ready required learning unit has an accessible explanation/reading, a practice or application task, and an assessment connection; metadata-only candidates and blocked subscriptions are visible; no fabricated URLs, scores, or claims of full video review.
- [ ] **BIO-044 — Build the academic crosswalk and review package.** Map the proposed experiences and individual evidence to S2/S4 outcomes and biomedical content. Show introduced/practiced/assessed stages, coverage gaps, and review state; retain upstream audits separately. Record facility/faculty assumptions and credit categorization questions. Acceptance: a reviewer can trace an outcome to a term, capability, experience, resource, and evidence definition. Code-complete, content-reviewed, and accreditation-reviewed statuses remain separate; the prototype carries no automatic accreditation claim.

BIO-041 and BIO-043 can proceed on clearly labeled draft data while BIO-040 has a source gap. A faculty-ready curriculum claim and BIO-100 acceptance require that gap to be resolved or explicitly accepted as a limitation in the review record; the UI must continue to display it.

### M05 — University profiles and branding

Depends on BIO-011 and M02. Exit: university identity and visual appearance are configuration choices.

- [ ] **BIO-050 — Implement institution and brand resolution.** Add Indiana Tech as the default profile and a clearly fictional demonstration institution. Separate name, program settings, source references, navigation terminology, and brand ID from curriculum records. Acceptance: the default route uses Indiana Tech; a configuration/URL selection changes identity and theme without editing JSX or copying curriculum YAML; both profiles show the same stable curriculum IDs unless an academic override is explicitly configured.
- [ ] **BIO-051 — Apply Indiana Tech branding.** Create `data/brands/indiana-tech.yaml` using S8 and the supported MIE UI branding mechanism. Use the published bold orange `#FA4616` and black, with legible neutral surfaces. Record the original logo asset URLs, token provenance, and any additional UI color choices. Preserve supplied wordmarks, proportions, colors, and clear space; do not recreate the logo with a substitute font. Acceptance: Indiana Tech identity and configured tokens drive both views, text/controls/focus states pass contrast checks, suitable logo variants work on light/dark backgrounds, and missing assets have a clear text fallback. Other university profiles still load without component or curriculum changes.

### M06 — Knowledge Navigator-style browsing

Depends on M04 data being available, M05, and the canonical model. Exit: the complete program can be explored without using the graph.

- [ ] **BIO-060 — Build program and semester navigation.** Render the four years/eight terms, foundation groups, studios, and readiness indicators from data. Include search/filtering by topic, competency, term, and review state. Acceptance: a content-only YAML change updates navigation after rebuilding; all eight terms have meaningful content and visible gaps; there are no hard-coded term arrays in JSX.
- [ ] **BIO-061 — Build a shared detail panel and prerequisite paths.** Show context, prerequisites, related topics, selected depth, precise resources, assessments, studio links, sources, and upstream/local provenance. Compute an ordered prerequisite path. Acceptance: every relationship resolves; users can navigate from a term to a resource and back; external resource access requirements are visible before opening it.
- [ ] **BIO-062 — Add demonstration progress without overstating mastery.** Support local saved notes and explicit states for planned/studied/practiced/assessed, plus separate evidence or review references. Version storage and key it by institution/program and stable ID. Acceptance: refresh preserves local demo state, a renamed ID uses an explicit migration, completion does not imply assessment passed, and no personal data is required for the demonstration.

### M07 — Roadmap-style visualization

Depends on BIO-061 and M02; shares M06 data and selection. Exit: users can inspect prerequisites visually and switch views without losing context.

- [ ] **BIO-070 — Create the graph adapter and derived layout.** Convert selected program chapters/competencies into nodes and typed edges. Use Dagre for layout; keep coordinates out of semantic YAML. Required prerequisites, recommended links, and concurrent relationships have distinct legends and rendering. Acceptance: node/edge IDs remain stable, required dependencies match the canonical model, and rerendering does not mutate source data.
- [ ] **BIO-071 — Build graph exploration and shared selection.** Add term/domain filters, focus-on-topic, predecessor/successor exploration, zoom/fit, and the existing detail panel. Start with the program subset; expand to its prerequisite closure on request rather than displaying the entire upstream catalog. Acceptance: selecting a topic and switching browse/graph preserves its ID, details, selected institution, and current filters where applicable.
- [ ] **BIO-072 — Verify accessible and responsive exploration.** Preserve graph keyboard focus and provide a complete ordered list alternative. Check narrow-screen navigation, readable labels, color-independent edge meaning, empty states, and a documented representative-size performance smoke test. Acceptance: a keyboard user and a narrow-screen user can complete the demonstration journey; inspect actual rendered screens in both themes/profiles before signoff.

### M08 — Interchange adapters and honest compatibility

Depends on M03/M04 and both views. Exit: supported formats have tested behavior and explicitly documented limits.

- [ ] **BIO-080 — Export supported Knowledge Navigator data.** `pnpm export:kn` writes upstream-compatible chapter/discipline/manifest/roadmap JSON to an ignored export directory, including referenced prerequisites. Export local BME chapters under a new `biomedical` discipline using `data/disciplines/biomedical.yaml`, prefix `edu-bme`, declared categories, levels, and priorities. Preserve IDs, nested topic IDs, ordered stages, rationale, and selected-topic focus. Write all unsupported fields to a versioned extension sidecar and report that the unmodified KN UI does not automatically display them: resources, competencies, assessments, studios, semester/credit rules, concurrency, institution/brand settings, crosswalks, and provenance/review metadata. Acceptance: run the pinned upstream builder against the export in a temporary checkout, reimport its authored exported JSON, and compare supported semantic fields. Every local field is preserved in a supported record or sidecar, or produces an explicit export error; none is silently dropped. The round-trip guarantee covers those declared semantic fields, not display state or native resource rendering.
- [ ] **BIO-081 — Document and test the roadmap-view adapter.** Define the local renderer JSON contract and compare the same selected competency and prerequisite edges across both views. Export the view data for inspection if useful. Acceptance: the second view is accurately labeled a roadmap-style visualization; the docs make no claim that roadmap.sh can import it. Native roadmap.sh interoperability requires a separately verified supported contract and a demonstrated import/export test before being labeled compatible.

### M09 — Reviewability, CI, and deployment readiness

Depends on M01–M08. Exit: another developer can reproduce the PoC and a reviewer can understand a content change.

- [ ] **BIO-090 — Add representative automated checks.** Run schema/semantic/credit checks, sync fixtures, deterministic builds, export compatibility, type checking, and focused UI journeys in CI. Add a proposed semantic change report and built preview artifact. Test the important invariants in Sections 4 and 7; avoid tests that only duplicate implementation wording. Acceptance: intentionally break a prerequisite, local/upstream conflict, resource reference, and export field in fixtures and observe the relevant failures.
- [ ] **BIO-091 — Add static hosting configuration and route tests.** Configure Vite's repository base and hash-based routing, such as `/#/program/biomedical/term/3?institution=indiana-tech`. Add a Pages workflow that can be enabled when a remote and publication destination are authorized. Acceptance: build and preview under a non-root repository path; a copied competency URL survives refresh and reconstructs the selected institution/view. Public deployment is not required to finish this task.
- [ ] **BIO-092 — Complete contributor and reviewer documentation.** Document adding a topic/resource, updating a term, introducing another university, previewing/applying upstream changes, interpreting validation output, reviewing a content PR, and recovering from a rejected sync. Include actual setup/build commands, schema examples, and the task-ID commit convention. Acceptance: a second person or independent agent follows the guide from a fresh checkout and reports any missing step; repair demonstrated gaps.

### M10 — Indiana Tech demonstration and handoff

Depends on M09; academic source/review limitations must be explicit.

- [ ] **BIO-100 — Run the faculty-review demonstration.** Walk through all eight terms; inspect one foundation-to-capstone path, an individual assessment, a team decomposition/root-cause example, both views, and both university profiles. Demonstrate a YAML-only change and a conflicting upstream update using fixtures. Save screenshots, commands/results, known gaps, and reviewer feedback in `docs/progress/BIO-100.md`. Acceptance: the agreed PoC journey works, content and credit status are truthful, and the README links to the running local instructions and review package. This establishes prototype acceptance, not institutional adoption.
- [ ] **BIO-101 — Record the next scope from evidence.** Turn demonstrated issues and faculty feedback into a small prioritized backlog with owners or role types, separating data corrections, academic review, UI work, and optional integrations. Acceptance: each follow-up has a concrete problem and acceptance condition; incomplete work is not hidden by marking an earlier task complete.

## 7. Minimum acceptance scenarios

Use these as the implementation's behavior checklist. The task checkboxes above remain the completion record.

| Scenario | Expected result |
| --- | --- |
| YAML resource changes | Both views show the new resource after rebuild; unrelated YAML and IDs stay unchanged. |
| Unknown reference or dependency cycle | Validation fails with source location and relevant IDs; no ready build is published. |
| Upstream-only change | Preview explains the change; apply updates baseline/lock without changing unrelated local curation. |
| Conflicting upstream and local change | Apply fails atomically until an explicit resolution is supplied. |
| Referenced upstream deletion | Maintainer must retain/migrate the record or remove references deliberately; no silent data loss. |
| Imported catalog expands | The program's required content stays unchanged until its selections are edited. |
| University/brand switches | Identity and tokens change; academic IDs and curriculum remain stable unless an explicit academic override applies. |
| View switches | Selected competency, resources, and institution agree between browse and graph. |
| Required content lacks reviewed resources | The gap is visible; readiness validation does not label it complete. |
| Credit mapping is incomplete | The program shows an unresolved ledger; it does not display a false 122-credit reconciliation. |
| Capstone/team success is recorded | Each student's individual assessment state remains independent. |
| KN export contains local extensions | Supported core data validates upstream; extensions and display limits are explicitly reported. |
| Deep link is refreshed under a repository base path | The same topic/view/profile loads without a server route rewrite. |

## 8. Done means reviewable and reproducible

The PoC is ready to present when its checked tasks, evidence records, commit history, and running demonstration agree. Every required learning path needs meaningful content; a polished empty graph does not complete a curriculum milestone. Every pending source, resource, credit, or academic review remains visible in data and in the review package.

The first implementation task is **BIO-010**. Keep this plan in the same commits as the work it records.
