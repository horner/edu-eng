# Develop and review the biomedical prototype

The application is a static React site. Curriculum source is YAML; generated JSON and browser layout are disposable. Node scripts run on a contributor's computer or in CI. The deployed site has no application server, accounts, or progress service.

## Start from a fresh checkout

Use Node from `.node-version` (tested with 22.18.0) and pnpm from `package.json` (10.13.1). With those tools installed:

```sh
git clone https://github.com/horner/edu-eng.git
cd edu-eng
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm data:validate
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm dev
```

Open `http://127.0.0.1:5173/edu-eng/`. `pnpm dev` regenerates curriculum data before starting Vite. After changing YAML, run `pnpm data:build` and refresh the browser. `pnpm build` regenerates data and writes `dist/`; `pnpm preview --port 4173` serves that output locally. These local preview servers are development tools.

Ordinary builds use the checked-in pinned baseline and need no upstream fetch after dependencies are installed. `pnpm export:verify` intentionally fetches the pinned Knowledge Navigator source and runs its Python 3 builder in an ignored temporary checkout. `pnpm sync:demo` exercises a synthetic conflicting update without changing curriculum source.

## Find the right source

| Change | Source |
| --- | --- |
| Proposed program, semesters, credit ledger | `data/programs/biomedical.yaml` |
| Biomedical learning areas and prerequisites | `data/chapters/` |
| Graduate performance criteria | `data/competencies/` |
| Individual/team evidence and rubrics | `data/assessments/` |
| Studio need, decomposition, interfaces, roles, experiments | `data/studios/` |
| Deep-linked learning resources and review evidence | `data/resources/` |
| ABET mappings and academic gaps | `data/crosswalks/` |
| Current official catalog facts | `data/baselines/`, separate from our proposal |
| University identity and academic selections | `data/institutions/` |
| Colors, original logos, token provenance | `data/brands/`, `public/assets/` |
| Imported foundations | `data/upstream/knowledge-navigator/`, generated and committed |
| Local changes to imported foundations | `data/overlays/` |
| Application copy | `src/i18n.ts`; curriculum copy stays in YAML |

Each local YAML file contains one stable record. Copy the nearest existing record and consult `schemas/records.schema.json`. Keep IDs stable and use explicit migrations/redirects when a rename is needed. Never use a title as a foreign key or hand-edit imported baseline YAML. Never add graph coordinates to semantic records. The program’s optional `roadmap_goal` and `roadmap_years` fields provide the overview’s graduate goal and year titles; year/semester grouping is derived from the semester numbers. The default map is a chronological outline, and prerequisite diagrams are a separate drill-down.

## Add a learning area or resource

1. Define an observable capability and the evidence that demonstrates it. Choose prerequisite IDs already in the catalog; distinguish required prerequisites, related subjects, and concurrent study.
2. Add a chapter under `data/chapters/`, its capability under `data/competencies/`, and the appropriate individual/team assessment references. Use existing field shapes and enums. Mark academic review truthfully.
3. Follow the [resource-curation skill](../.agents/skills/curate-learning-resources/SKILL.md). Give each resource an exact public destination, access conditions, observed review evidence, engagement rationale, explicit limits, a concrete practice activity with necessary inputs, and an assessment connection. A metadata check is not a content review.
4. Reference the resource ID from the chapter or capability. Resource `topics` also connects supplementary material to a chapter. A `practice` activity is locally authored unless explicitly attributed to the provider. A video without a transcript/content review remains a candidate.
5. Add the chapter/capability IDs to the intended semester. Update the studio and credit-bearing units only when their actual educational allocation changes. Mapping one unit to several outcomes must not duplicate its credits.
6. Run `pnpm data:validate`, `pnpm test`, and `pnpm build`. Examine `generated/content-change-summary.md` and the YAML diff. Refresh both curriculum and map views with the changed ID selected.

For upstream chapters, put resource assignments in an overlay rather than editing baseline files. The [synchronization guide](knowledge-navigator-sync.md) includes the full overlay contract and safe update procedure.

## Add another university

Copy `data/institutions/demo-university.yaml` and `data/brands/demo.yaml`, assign unique IDs, and keep `programs: [biomedical]` to reuse this program. Put original assets in `public/assets/` and record their source. Identity and theme changes alone must preserve academic IDs.

Select the institution through the UI or `#/program/biomedical?institution=<id>&view=browse`. Supported academic overrides are deliberate, schema-limited changes: whole-field `requirements`/`electives` metadata, or a complete semester-ID-to-chapter-ID `content_selections` mapping. `resolveProgram` validates the effective selection; these changes require academic review. See the synchronization guide for exact semantics.

Use the published MIE UI components, semantic theme system, and `ButtonGroup` for adjacent buttons. `src/theme.tsx` adapts local brand data through `generateBrandCSS`. Additional UI neutrals and derived shades are project choices, not official university colors. Keep application text readable in both themes and preserve supplied logo proportions.

## Interpret validation and reviews

Structural errors, duplicate IDs, dangling references, invalid prerequisite schedules, cycles, credit double counting, invalid schema fields, and unsupported upstream or overlay operations stop the build with responsible IDs/paths. Local records permit documented metadata extensions. Repair the source; do not suppress the validator to publish a broken model.

Warnings identify real review gaps: source candidates, academic questions, and absent attainment/facility evidence. A proposed 122-credit allocation is a numerical ledger, not approved course equivalence or an accreditation result. The [ABET audit](abet-audit.md) and [resource audit](resource-audit.md) explain the limits and next evidence.

The chapter prerequisite path, browser graph, and exported `edu-eng-roadmap-view` use the same semantic IDs and relationships. Dagre adds layout only in the browser. `pnpm export:kn` writes supported authored Knowledge Navigator JSON plus a sidecar of unsupported fields; `pnpm export:verify` tests the supported round trip with the pinned upstream builder. Unmodified Knowledge Navigator does not display our resource/assessment extensions. Native roadmap.sh compatibility is not claimed.

## Browser progress and backups

Notes and self-reported activity live in versioned `localStorage`, scoped by institution/program/ID. URLs share selections, not notes. Export downloads a versioned JSON backup; import validates the whole file and merges matching IDs into the current profile. Invalid files leave current state intact; unknown IDs are reported, explicit redirects migrate renamed IDs, and mismatched profiles are rejected. Reset affects only the selected profile. Storage denial falls back to memory with a session-only notice. None of these actions uploads progress or establishes individual mastery.

## Review, commit, and publish

The [plan](../bioprototype-plan.md) is the task record. For each completed task, add `docs/progress/BIO-NNN.md`, record actual commands and results, check its acceptance criteria, and commit the implementation/evidence/checkbox together with `[BIO-NNN] Description`. Keep tasks unchecked while acceptance remains unmet. A task may span several commits with the same ID.

The Pages workflow runs types, ESLint, unit/fixture tests, curriculum validation, a static build, pinned export verification, and browser journeys. Pull requests produce review artifacts; passing pushes to `main` deploy `dist/` to `https://horner.github.io/edu-eng/`. A failed check prevents deployment. Publication to this repository is user-authorized; do not send messages, open upstream contributions, or change a publication destination implicitly.

Review artifacts include content-change and validation reports, browser failure traces, and walkthrough screenshots. GitHub Pages uses `/edu-eng/` plus hash routes; copied selections survive refresh without route rewrites. To host elsewhere, set `VITE_BASE_PATH` at build time to that deployment's path and verify deep links there.

Current library packaging emits an unused ONNX/WASM asset and transitive build warnings from MIE UI's main export. Browser tests verify that the core journey loads no third-party API and makes no progress writes over the network. The library's `ButtonGroup` currently has no separate component entry in this published version; no dependency code is patched.
