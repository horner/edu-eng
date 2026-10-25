# Biomedical prototype: ABET alignment audit

Audit date: 2026-10-25. Scope: the authored proposal, its evidence definitions and its relationship to the current Indiana Tech baseline. This is a curriculum design review, not an accreditation determination or a report of student attainment.

The prototype has designed opportunities for all seven engineering outcomes and the biomedical content areas. It has **122 proposed credits: 40 mathematics/basic science, 58 engineering, and 24 broad education**. Those classifications and academic equivalences remain subject to faculty review. The existing Indiana Tech degree's accreditation does not establish accreditation of this redesign.

## Sources and baseline

- [Indiana Tech's current 2026–2027 BME catalog](https://catalog.indianatech.edu/preview_program.php?catoid=22&poid=5716&returnto=906) was read through ordinary public Chrome navigation. The captured baseline contains 35 required core courses totaling 89 credits, a technical-elective group headed 3 credits, and a 30-credit general-education framework. The page states 122 credits overall.
- The [program page](https://academics.indianatech.edu/program/biomedical-engineering/) confirms the total and describes anatomy/physiology and CAD early in the degree, device prototyping in the middle years, and a final design or research experience.
- [ABET EAC criteria for 2026–2027](https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/) are the versioned audit reference. The normalized keys in the YAML crosswalk identify source clauses; they are not ABET approval codes.
- The current catalog has three program educational objectives. The older [public outcomes page](https://academics.indianatech.edu/talwar/abet/biomedical-engineering-bs/) has two and older enrollment figures. The current catalog takes precedence in the baseline.

Source facts and prerequisite summaries are in [the baseline YAML](../data/baselines/indiana-tech-bme-2026-2027.yaml). Proposed units are in [the program YAML](../data/programs/biomedical.yaml). No official semester grid was present on the captured degree page, and no proposed unit is asserted to be an approved course substitution.

## Credit check

| Proposed category | Credits | Audit interpretation |
| --- | ---: | --- |
| Mathematics and basic science | 40 | Numerically above the 30-credit reference minimum; depth, laboratory experience and category assignments need academic review. |
| Engineering topics | 58 | Numerically above the 45-credit reference minimum; engineering science/design content and modern-tool use need academic review. |
| Broad education | 24 | Proposed communication, humanities, leadership, economics and global/social study; institutional substitutions are unapproved. |
| Total | 122 | Every embedded credit-bearing unit is counted once. Competency/resource mappings add no credits. |

Term totals are 16, 16, 16, 16, 15, 15, 14 and 14. All credit-unit statuses are `proposed`; mathematical reconciliation is distinct from academic approval.

Indiana Tech's 30-credit **general-education** grouping includes mathematics and science options. It must not automatically become 30 credits of ABET **broad education**. The catalog also requires approved replacement electives when a course overlaps the major and general education. Higher-credit and variable-credit technical-elective options make an advisor-approved individual plan essential.

## Outcome trace

The [machine-readable crosswalk](../data/crosswalks/abet-eac-2026-2027.yaml) has 22 source-clause records with linked chapters, competencies, studios, assessments, expected evidence and explicit review gaps.

| Outcome | Designed evidence | Current finding |
| --- | --- | --- |
| 1: technical problem solving | Quantitative models, uncertainty, model/test comparison, independent transfer | Designed; no student results. |
| 2: engineering design | Needs, alternatives, requirements, risk and constrained capstone decisions | Designed; stakeholder priorities and depth need review. |
| 3: communication | Regular short explanations, technical writing, interface agreements, audience-specific reviews | Practiced every term; effectiveness unmeasured. |
| 4: professional judgment | Ethical cases, accessibility, consequences, standards and risk decisions | Designed; case/rubric calibration pending. |
| 5: teamwork | Decomposition, dependent backlog, interfaces, observed role rotation, integration and conflict handling | Designed every term; requires observed contribution evidence. |
| 6: experimentation | Calibration, controls, replication, uncertainty, statistical interpretation and reproducible tests | Designed; actual laboratories and results pending. |
| 7: independent learning | Evaluate a new source, apply it, explain limits, solve an unfamiliar case | Designed; resource consumption alone earns no mastery. |

The crosswalk records explicit `introduced`, `practiced` and `assessed` stages with term numbers. These are designed opportunities; “assessed” means an individual assessment is defined. Every term also includes formative feedback and targeted reassessment. It does not mean any student has passed. Institutional criteria use policy/support evidence rather than instructional stages.

| Outcome | Introduced | Further practice | Individual assessment opportunities |
| --- | --- | --- | --- |
| 1 | 2 | 4, 5, 6, 7, 8 | 2, 4, 5, 6, 7, 8 |
| 2 | 1 | 4, 6, 7, 8 | 1, 4, 6, 7, 8 |
| 3 | 1 | 2, 3, 4, 5, 6, 7, 8 | 1, 2, 3, 4, 5, 6, 7, 8 |
| 4 | 4 | 5, 6, 7, 8 | 4, 5, 6, 7, 8 |
| 5 | 1 | 2, 3, 4, 5, 6, 7, 8 | 1, 2, 3, 4, 5, 6, 7, 8 |
| 6 | 2 | 3, 4, 5, 6, 8 | 2, 3, 4, 5, 6, 8 |
| 7 | 3 | 5, 6, 7, 8 | 3, 5, 6, 7, 8 |

Each term has a distinct technical competency and team competency, a studio, an individual assessment and a team assessment. The proposed 0–3 rubrics require at least 2 in every dimension, correction of fundamentally invalid reasoning, and targeted reassessment. Faculty must calibrate these thresholds before educational use. A team pass never changes an individual's assessment result.

## Material gaps

| Finding | Why it matters | Required next evidence |
| --- | --- | --- |
| Living-system measurement remains unresolved | Synthetic or previously supplied demonstration data cannot establish that students made measurements on a living system. | Faculty-defined experience, facilities/protocols/oversight, acquisition evidence and individual interpretation. |
| Academic depth and course equivalence are unapproved | The current required BIO sequence totals 20 credits; the proposal explicitly allocates 13 life-science credits across anatomy/physiology, cells/genetics, pathophysiology and immunology, alongside integrated application. Integrating subjects into studios can conceal missing depth. | Subject-expert comparison of objectives, hours, experiments and assessments, including cell biology, genetics, pathophysiology and immunology. |
| Institutional general education is not mapped as an approved substitution | The proposal reorganizes communication and broad study; the official choices and overlap rule still govern the current degree. | Registrar/faculty crosswalk and an approved credit ledger for any actual offering. |
| Attainment and improvement are not yet evidenced | A complete graph and assessment definition do not demonstrate learning or an improvement cycle. | Individual work, dimension-level results, sampled reviews, corrective decisions and follow-up observations. |
| Staffing, facilities and institutional support are assumptions | The studios depend on appropriate expertise, supervision, equipment access and sustained resources. | Named faculty/capacity, laboratory access and support/budget review. |
| A catalog prerequisite needs clarification | The BME 3700 elective lists EE 2050 while the current required core lists ECE 2100. | Program confirmation of prerequisite applicability or substitution; retain the discrepancy until resolved. |
| No official eight-semester schedule was captured | Prerequisite chains are not a term offering plan. | Advisor-confirmed sequencing, concurrent-study rules and course availability. |
| Constituent review has not occurred | The proposal's intended graduate needs faculty, student and employer review. | Documented feedback and decisions, with an owner and future review cycle. |

The proposal allocates two 3-credit advanced electives, compared with the current catalog’s 3-credit elective group. Proposed emphasis options use existing biomechanical, signals/control or biomaterials/transport units; faculty must approve their advanced depth and prerequisites. This is a redesign choice, not an approved substitution.

The capstone spans terms 7–8 and explicitly traces prior learning to requirements, alternatives, standards research, multiple constraints, risk, verification and handoff. Actual standards applicability and culminating depth remain review items. An educational device demonstration establishes no medical or regulatory approval.

## Interpretation of prototype acceptance

Software acceptance can establish that references resolve, the prerequisite graph is coherent, credits are counted once, sources and gaps are visible, and both views show the same proposal. It cannot establish the quality of instruction, individual mastery, approved degree equivalence or accreditation.

Before a pilot, faculty should choose the assessment lead, calibrate the rubrics using sample work, define progression/reassessment decisions and the living-system experience, and approve staffing and facilities. Each term's review should identify weak dimensions, select a corrective action and examine its effect in the next iteration. These are proposed review responsibilities, not completed institutional actions.
