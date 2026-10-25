# Learning-resource audit

Audit date: 2026-10-25. Scope: the proposed biomedical program's 24 local learning units, the `ma-precalculus` entry prerequisite, and resources reused in all eight studios. This is an inspectable starting catalog for the public proof of concept. It is not a claim of a complete degree course sequence, faculty approval, or observed student mastery.

The catalog contains **49 records: 46 with selected text inspected, 2 optional videos with exported English transcripts reviewed, and 1 optional YouTube candidate with identity/URL metadata verified**. Every local unit has a primary reading, a locally authored application task and a named assessment connection. Reusable secondary readings add cells/genetics, physiological mechanisms, disease, immunity, integration and numerical work. None of the required paths relies on a paid subscription.

## Meaning of the evidence labels

`content_reviewed` means the recorded text portions, equations, diagrams or worked examples were inspected. It does **not** mean the entire textbook, course, video, code sample or discipline received expert review. The narrower `accuracy_evidence`, `review_scope` and `limitations` fields are part of the record. No resource is labeled `expert_reviewed`.

`metadata_verified` establishes a title and public destination. It does not establish the accuracy of a video's full narration, teaching effectiveness, entertainment value, captions or classroom playback. No video was claimed as fully watched, no fabricated timestamp was added, and no popularity or quality score was invented.

The activities below and in YAML are **original curriculum prompts**, not falsely attributed provider exercises. Quantitative starters include concrete synthetic inputs or formulas rather than depend on an absent “supplied” dataset. They connect learning to observable performance. The individual and team assessment definitions remain proposed and require faculty calibration; a completed reading, certificate, local progress tick or team pass does not establish individual competence.

## Required-unit coverage

IDs in the resource column are suffixes of `edu-res-`. Assessment numbers are suffixes of `edu-bme-aNN-individual` and `edu-bme-aNN-team`. The source, exact URL, access, selected scope, practice and performance connection are in each [resource YAML record](../data/resources/).

| First term | Local unit | Primary resource | Additional assigned support | Observable application and evidence |
| --- | --- | --- | --- | --- |
| Entry | `ma-precalculus` | `precalculus` | `precalculus-trig` | Evaluate a calibration function, check its domain and interpret a sinusoid; use an entry diagnostic before a01. |
| 1 | Design foundations | `design` | `human-factors`, `ethics` later | Five measurable fixture requirements, alternatives and interface acceptance checks; a01 individual defense and team demonstration. |
| 1 | Biology, anatomy, physiology and disease | `physiology` | `cell-membrane`, `action-potential`, `cardiac`, `breathing`; `gene-expression`, `human-genetics` in term 3; `pathophysiology` in term 4; `innate-immunity`, `adaptive-immunity`, `host-response` in term 6 | Explain mechanisms and model limits individually; revisit them in a03, a04 and a06 using synthetic sequence/pedigree cases, disease failure models and host-response evidence questions. |
| 1 | Chemistry | `chemistry` | `buffer` | Check concentration/dilution units and predict a bounded buffer perturbation; a01 changed-case calculation and checked material rationale. |
| 1 | Calculus | `calculus` | `integral`; optional video | Compare finite differences with a derivative, then accumulate a supplied flow trace; a01 transfer and later model balances. |
| 1 | Communication | `communication` | Reused every term | Another person implements/tests from a revised interface explanation; every individual defense and team handoff. |
| 1 | Team engineering | `team` | `root-cause` | Decompose dependencies, rotate leadership, integrate early, test competing causes and check a retrospective change; a01–a08 team rubrics. |
| 2 | Programming | `python` | `signal-numerics` later | Reproduce a synthetic-data transformation with independent expected-value checks and a file/units contract; a02. |
| 2 | Mechanics | `mechanics` | `biomechanics` later | Free-body prediction and a changed load case; a02 discrepancy investigation. |
| 2 | Experimental measurement | `measurement` | NIST Variability linked in the record; `sampling` | Separate bias and repeatability, test a handling/environmental cause and reproduce a protocol; a02 and a03. |
| 3 | Electricity and circuits | `circuits` | `rc-circuits`, `action-potential` | KCL/KVL prediction, transient model and voltage/units interface checks; a03. |
| 3 | Statistics | `statistics` | `sampling` | Explain sampling assumptions and a t interval on synthetic independent readings; a03 and a05. |
| 3 | Human factors | `human-factors` | `design` | Task analysis, predicted use error, peer walkthrough, revision and retest; a03, reused in a07. |
| 4 | Linear algebra and differential equations | `linear-ode` | `linear-visual`, `ode-modeling` | Derive a matrix state model, compute eigenvalues and compare analytic/numerical response; a04. |
| 4 | Engineering mechanics and materials | `materials` | `biomechanics` | Estimate a modulus from supplied data and identify the invalid linear range; a04. |
| 4 | Biomechanics | `biomechanics` | `materials` | Torque balance, changed moment arm and explicit forearm-weight assumption; a04 individual explanation and safe lever analogue. |
| 4 | Ethics and society | `ethics` | Reused in capstone | A sourced decision memo about a failed requirement under schedule pressure; a04, a07 and a08. |
| 5 | Signals | `fourier` | `signal-numerics`, `cardiac`; optional video | Predict/compute a synthetic spectrum, expose an alias and check morphology/timing after filtering; a05. |
| 5 | Transport | `transport` | `heat-transfer`, `diffusion`, `breathing`, `ode-modeling` | Flow/energy balance, radius or boundary-condition change, reproducible analogue and residual investigation; a05. |
| 5 | Biomaterials | `biomaterials` | `cell-membrane`, `host-response` and immunity readings | Defend material tradeoffs and missing biological evidence; a05, revisited in a06. |
| 6 | Systems and controls | `controls` | `ode-modeling` | Simulated disturbance rejection, actuator limit and changed-gain defense; a06. |
| 6 | Device integration | `integration` | `risk` | Versioned subsystem contract, reproduced mismatch, correction and acceptance rerun; a06. |
| 6 | Quality and risk | `risk` | `measurement`, `root-cause`, `host-response` | Connect hazards, requirements, evidence, uncertainty and corrective action; a06 and capstone review. |
| 7 | Design standards | `standards` | `human-factors` | Standards-applicability/edition/access matrix with no unsupported conformity claim; a07 and a08. |
| 7–8 | Capstone | `capstone` | Reuse `design`, `integration`, `risk`, `standards`, `communication`, `ethics`, `team` | a07: justify need, feasibility and prospective test criteria. a08: freeze and verify a version, report failures and have another pair reproduce the handoff. |

The precise foundation IDs related to local units are supporting references; only `ma-precalculus` is a required imported entry prerequisite. Catalog topics link it to the two entry readings without claiming that their brief selection covers all precalculus.

## Video and engagement audit

| Candidate | Evidence actually obtained | Use and remaining work |
| --- | --- | --- |
| [3Blue1Brown — The Essence of Calculus](https://www.youtube.com/watch?v=WUvTyaaNkzM) | Complete exported English transcript read; assigned mathematical claims checked against the [companion article](https://www.3blue1brown.com/lessons/essence-of-calculus/) and calculus readings. | Assign 2:16–8:23 and 11:48–15:38. The finite-annulus approximation and continuity assumption are explicit. The transcript export repeats an endpoint at 13:10; practice uses the correct difference. Full audiovisual pacing/accessibility and learner trial remain pending. |
| [3Blue1Brown — But what is the Fourier Transform?](https://www.youtube.com/watch?v=spUNpyF58BY) | Video identity verified; [companion text](https://www.3blue1brown.com/lessons/fourier-transforms/) inspected for winding and continuous-transform construction. | The inspected article is a primary explanation. The optional video retains a metadata label. Pair with sampled-signal practice; a continuous transform explanation alone does not teach aliasing or filtering. |
| [Crash Course Anatomy & Physiology #1](https://www.youtube.com/watch?v=uBGl2BujkPQ) | Complete exported English transcript read; assigned structure/function and spatial terms checked against [OpenStax anatomical terminology](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology). | Assign 1:08–1:29, 3:49–4:17 and 7:39–9:31. History/trivia and dramatic universal homeostasis wording are outside the verified assignment. Questions, playful language and a spatial quiz are observed in text; full audiovisual effectiveness/accessibility remains pending. |

Transcript export was available through the supported browser tool for the calculus and Crash Course videos; it reported no transcript for the Fourier video. Caption provenance was reported as authored or unspecified, so authorship is not asserted. Only review metadata, segment references and original exercises are saved here; the transcripts are not redistributed.

The user's FloatHeadPhysics Pauli-exclusion example remains a curation reference rather than a required BME resource: this run did not successfully inspect that video's content, and its specialist quantum topic is not needed for the chosen local capabilities. The advanced forced hypodissipative Navier–Stokes example is also not assigned. It must not be described as a solution of the classical unforced three-dimensional problem. [Racaniello's Columbia virology course](https://virology.ws/course/) remains a useful model of an expert-curated lecture/reading/question sequence; advanced virology is not a new required capability in this program.

There is a real **video-review gap beyond the current calculus and introductory physiology segments**. Next curation should prioritize one high-value explain/demonstrate resource for circuits, biomechanics, transport, chemistry and immune/host response, with actual transcript or segment inspection and a tested exercise. Neither a famous creator nor a large view count removes that work.

## Findings, fixes and unresolved gaps

| Finding | Repair included now | Remaining academic work |
| --- | --- | --- |
| Provider homepages do not constitute assignments. | Required units point to specific sections, resource pages, notebooks or guidance PDFs. Each has a practice prompt and individual/team evidence connection. | Faculty must sequence the full workload and calibrate the proposed performance gates. |
| One physiology introduction cannot support four years of BME. | Added cell membrane, neural, cardiac, respiratory, gene-expression, inheritance, disease and innate/adaptive/host-response readings, with later-term assessment connections. | Add quantitative cellular physiology, molecular regulation, organ-system breadth, advanced disease mechanisms and representative laboratory work. The selected excerpts are a starting sequence. |
| The [OpenStax endocrine-pancreas section](https://openstax.org/books/anatomy-and-physiology-2e/pages/17-9-the-endocrine-pancreas) mixes mechanisms with dated prevalence and broad receptor/treatment statements. | It is not assigned. The bounded production-versus-response activity uses [NIDDK's mechanism overview](https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes); epidemiology and treatment sections are excluded from that activity. | Subject review is needed before assigning the endocrine section in full; educational pathophysiology must be distinguished from personal medical interpretation. |
| Historical material notes include more than enduring material science. | The [MIT 2006 introduction](https://ocw.mit.edu/courses/3-051j-materials-for-biomedical-applications-spring-2006/resources/lecture1/) explicitly excludes historical usage counts and its blanket premarket-approval claim. The scientific hierarchy and selection task remain bounded. | Update protein adsorption, degradation, tissue response and assay selections using current primary literature. Historical notes are not regulatory authority. |
| Foundational topic depth exceeds a single section. | Multiple representations and reuse connect calculus, matrices/ODEs, signals, material response and transport to studio tasks. | Add balanced-reaction/stoichiometry/bonding sequence; multivariable sensitivity; regression/experimental design; nonlinear/viscoelastic tissue mechanics; quantitative mass transfer; stability/robustness and contemporary instrumentation. |
| Model assumptions can silently become biological claims. | Practices require units, boundary/initial conditions, changed cases and limits. Tube flow is bounded by its assumptions; forearm equilibrium is a planar analogue; control uses synthetic plants. | Faculty must define physical, living-system and biological measurement experiences. Synthetic or benchtop analogues do not replace those requirements. |
| Code examples can look validated when only read. | SciPy/control records explicitly say code was inspected but not executed in this curation pass; tasks require independent checks. | Exercise implementations, expected results and appropriate environment pinning need a teaching trial. |
| Current standards and guidance cannot be inferred from old notes. | [FDA human-factors PDF](https://www.fda.gov/media/80481/download) is recorded as issued August 3, 2026, originally 2016. [Standards guidance](https://www.fda.gov/media/71983/download) includes its QMSR cover notice and version/applicability caveats. | Full normative standards may require institutional/paid access. Record the applicable edition and obtain expert review before a real conformity claim. |
| Account/subscription availability can block an otherwise attractive lesson. | No required resource needs a paid account. Brilliant remains an optional preparation/testing candidate, with no invented exact lesson URL or assumed college entitlement. The course uses its own assessment evidence. | Before assigning a Brilliant lesson, verify its exact destination, free/Premium sequencing restrictions and the student's account route. Optional Colab control notebooks need a Google account; a local Python route is stated. |
| Team ceremonies are easier to record than collaboration. | Scrum is paired with [ASQ Five Whys](https://asq.org/quality-resources/five-whys), negotiated interfaces, role rotation, discriminating tests and retrospective follow-up. | Observe actual team behavior and triangulate contribution evidence. A Five Whys narrative alone is not root-cause proof; a standup count is not collaboration quality. |
| Availability does not establish accessibility or learning effectiveness. | Public text alternatives accompany optional YouTube links; access and review labels remain visible. | Test captions/transcripts, screen-reader equations, classroom filtering, device needs and student response. No full accessibility or outcome evaluation is claimed. |

## Follow-up backlog

These are reviewable content tasks, not claims that a particular provider or faculty member has agreed to do the work.

| ID | Priority | Next deliverable and acceptance check |
| --- | --- | --- |
| RSC-01 | High | Sequence the missing chemistry, multivariable math, statistics/design-of-experiments, tissue mechanics, transport and controls depth. For each assigned capability, supply exact sections, prerequisites, feasible workload, a worked teaching trial and a changed-case assessment. |
| RSC-02 | High | Curate one purposeful video/demonstration for circuits, biomechanics, transport, chemistry and immune/host response. Inspect actual segments/transcripts, check central claims against a primary reference, state observed engagement qualities separately and tie the selection to an exercise. |
| RSC-03 | High | Trial the current original activities with faculty and learners, including the synthetic numeric starters. Add expected-result checks and alternate-case prompts; keep individual evidence separate from the team deliverable. |
| RSC-04 | High | Define accessible physical and living-system measurements, facilities, protocols and biological evidence required by the actual course sequence. Neither a synthetic trace nor a classroom analogue substitutes automatically. |
| RSC-05 | Medium | Review full audiovisual/caption accessibility and classroom/anonymous playback for the three current video links. Recheck the calculus transcript discrepancy and the unassigned historical/trivia material before widening the assigned scope. |
| RSC-06 | Medium | If Brilliant or certification preparation is selected, verify an exact usable lesson or test, account/paid path and interpretation of attempts. Keep certificates and completion tracking distinct from demonstrated competence. |
| RSC-07 | Medium | Obtain the applicable normative-standard editions through lawful institutional/provider access and add expert-reviewed applicability decisions. Keep the currently linked free guidance as context. |
| RSC-08 | Low | In resource discovery, consider a direct jump from a resource's assessment connection to the matching individual/team rubric. The current selected-unit → Demonstrate and semester → studio-assessment routes already expose the evidence. |

## Checks and maintenance

- All 49 resource YAML files parse. The repository's schema/reference validator exits successfully with the catalog present; review warnings remain visible.
- Independent numerical checks confirmed the starter exercises' divider values, calibration bias/variation, RC response, modulus, lever forces and laminar-flow scale. This checks authored inputs, not student results or execution of the external notebooks.
- Resource topics and explicit `assessment_ids` resolve to local chapters/competencies/assessments, including the entry prerequisite.
- Required chapter-to-resource assignments must retain the primary resources listed above; supporting records are reusable through their topic links.
- `edu-res-integration` and `edu-res-capstone` intentionally reuse the same NASA chapter with different term-specific practice. This is reuse, not two independent reviews. All other primary URL duplicates were checked.
- URLs were inspected through public web retrieval on the audit date. This is not a promise of future availability, full browser playback or offline access.
- Before promoting a unit to academically ready, review the exact assigned scope, complete its missing sequence, trial the activity and independently calibrate individual and team evidence. Add reviewer identity/date and corrections; do not replace uncertainty with an unearned approval label.
