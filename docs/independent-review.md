# Independent contributor and interface review

Date: 2026-10-25. Reviewed snapshot: [`7b4879c7d03b596f160a3d555da93ee2e97ee52b`](https://github.com/horner/edu-eng/commit/7b4879c7d03b596f160a3d555da93ee2e97ee52b).

A separate agent from the main application implementer followed the contributor instructions and inspected the review journey. This agent previously contributed the academic data, so this is an independent checkout/interface check, not an independent academic endorsement or faculty review.

## Result

The documented setup works with Node 22.18.0 and pnpm 10.13.1. A real local Git clone installed its own dependencies, passed type checking, linting, all 40 unit/fixture tests, curriculum validation and a static build. All six Chromium journeys passed against that clone's build on a separate port. No application-source repair was needed.

The current proposal remains academically unapproved. Faculty must review depth, the proposed credit classifications and substitutions, living-system measurement, assessment calibration, staffing/facilities and eventual learning outcomes. The interface, audit and follow-up backlog keep these limitations visible.

## Fresh-checkout procedure

The test directory was `/tmp/edu-eng-review.Izy8x6`, with a clean tracked working tree at the start. The command sequence was:

```sh
git clone --local /Users/horner/prj/edu-eng /tmp/edu-eng-review.Izy8x6
cd /tmp/edu-eng-review.Izy8x6
git checkout --detach 7b4879c7d03b596f160a3d555da93ee2e97ee52b
export PATH="/Users/horner/.nvm/versions/node/v22.18.0/bin:$PATH"
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm data:validate
pnpm build
pnpm exec playwright install chromium
pnpm sync:demo
```

| Check | Observed result |
| --- | --- |
| Runtime | Node `v22.18.0`; pnpm `10.13.1` |
| Frozen install | Exit 0; 328 packages installed into the clone; lockfile unchanged |
| Type checking and lint | Both exit 0 |
| Unit/fixture suite | Six files, 40 tests passed |
| Curriculum validation | Exit 0; 1,890 chapters, one program, 49 resources, 23 visible review gaps |
| Model revision | `fa04935bf565` |
| Static build | Exit 0; `dist/` generated within the clone |
| Sync demonstration | PASS: conflict refusal leaves inputs unchanged; bound resolution accepts upstream text and preserves a local review extension |

The first shell attempt selected the host's broken Homebrew Node. A second attempt used the bundled runtime's different Node/pnpm versions and failed a newer package-manager release-age policy. Those attempts do not establish compatibility. Their incomplete dependency directory was moved out of the clone, and the successful installation used the exact documented versions. No host configuration, lockfile, package policy or application source was changed to obtain the passing result.

## Browser verification from the clone

A temporary clone-only copy of `playwright.config.ts` changed all three preview-port occurrences from 4173 to 4174. It otherwise retained the committed test configuration. The exact test command was:

```sh
CI=1 pnpm exec playwright test --config playwright.review.config.ts
```

All six tests passed in 8.4 seconds. With `CI=1`, Playwright started the clone's own preview server and did not reuse the main workspace server. The tests exercised static exploration and deep-link refresh, shared selection across views, resources, local notes, backup/import/reset and profile isolation, storage denial, narrow-screen/keyboard operation, proposal labels, and all eight studios with both university themes. The static journey blocked requests to other origins and observed no application writes over the network.

Afterward, `pnpm preview --port 4174` served the clone's built files for a separate manual check. The browser displayed the Indiana Tech overview with eight terms and 122 proposed credits. That preview process was stopped after inspection; the main workspace preview on 4173 was left untouched.

## Documentation and interface read-through

The [developer guide](developer-guide.md), [review guide](review-guide.md) and [follow-up backlog](follow-up-backlog.md) were read against the actual application. Manual checks covered:

- The eight-term overview; Semester 1 and Semester 5 studios; the capstone; separate individual/team evidence and rubrics; decomposition, interfaces, roles and causal failure investigation.
- A selected capability retained across curriculum and competency-map views; the ordered list alternative; the calculus prerequisite chain; exact resource links with access notes, practice, review scope and limitations.
- The ABET page's seven outcomes, introduced/practiced/assessment-opportunity stages, 40/58/24 proposed credit allocation, institutional gaps and explicit unresolved living-system measurement.
- Browser-local notes surviving refresh without becoming an assessment result; the fictional university profile and theme change; a 390 × 844 layout and keyboard operation of its semester selector. The temporary viewport override was reset.

Two small documentation clarifications were supplied before the reviewed snapshot: choose the calculus learning area for the first prerequisite demonstration, because the first individual capability correctly has no earlier prerequisites; and distinguish permitted local metadata extensions from rejected upstream/overlay operations. Both clarifications appear in the committed guides. No further material documentation or interface blocker was found.

## Content-only contributor check

Only the cloned `edu-res-calculus` description was temporarily extended. Running `pnpm data:build` reported exactly one updated record, `resources/edu-res-calculus`. Node assertions confirmed that chapters, competencies, programs and credit allocations were unchanged. The resource ID remained stable. This checked the generated-data and semantic-diff workflow, not a new academic resource review.

The original file was restored and data regenerated to revision `fa04935bf565`. The temporary Playwright configuration was moved under ignored `.cache/reviewer/`. Final `git status --porcelain` in the clone was empty. Neither the smoke edit nor the test configuration entered the shared repository.

Existing dependency packaging warnings remain documented in the developer guide and backlog: ignored dependency lifecycle scripts, a large unused ONNX/WASM asset, bundle size and transitive `eval` warnings. They did not prevent the checked static/browser journey. This review does not establish educational effectiveness, approved degree equivalence or accreditation.
