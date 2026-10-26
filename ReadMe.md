# Engineering Education: Working Backward from the Ideal Graduate

An open, collaborative effort to design a four-year engineering education around the capabilities we want graduates to possess and the experience of doing real engineering.

This document records the project's context, goals, tools, and reference resources alongside the working biomedical curriculum prototype.

The [biomedical prototype implementation plan](bioprototype-plan.md) defines the four-year program PoC, YAML authoring, Knowledge Navigator synchronization, university branding, two visualization modes, and milestone-linked commits.

The [interactive prototype](https://horner.github.io/edu-eng/) connects eight proposed semesters, 24 biomedical learning areas, 16 capabilities, eight studios, 16 assessments, and 49 curated resources. Curriculum browsing and the program map share the same YAML-backed data. The map starts with four year stages, then reveals a semester, its capabilities and optional focused dependencies. Read the [review guide](docs/review-guide.md) for a walkthrough, the [ABET audit](docs/abet-audit.md) for alignment and gaps, and the [resource audit](docs/resource-audit.md) for bounded source reviews and video evidence.

Use Node from `.node-version` and pnpm from `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173/edu-eng/`. The [developer guide](docs/developer-guide.md) covers validation, browser tests, YAML contributions, themes, and safe [Knowledge Navigator synchronization](docs/knowledge-navigator-sync.md). The [Pages workflow](.github/workflows/pages.yml) verifies changes and publishes the built `dist/` from `main`. The original introductory page remains in `site/` as a historical artifact.

The proposed 122-credit ledger is separate from the captured current Indiana Tech catalog. Academic equivalence, living-system measurement experiences, facilities, assessment calibration, and demonstrated student attainment remain explicit review questions. This is a working proof of concept for discussion. The [independent checkout and interface review](docs/independent-review.md) records reproducibility checks and their limits; the [follow-up backlog](docs/follow-up-backlog.md) captures the next academic and technical work.

## Why this project exists

The project grows out of advising Indiana Tech on its curriculum and hearing MIE interns repeatedly say they learn more during internships than in the classroom. That observation motivates a question: what makes those experiences valuable, and how could those qualities shape an entire engineering education?

The vision is a university operating as an ecosystem of small engineering companies. Students take ownership of useful work in multidisciplinary teams, supported by faculty acting as technical directors, mentors, project leaders, and venture leaders. Students rotate through leadership responsibilities.

The original introduction is preserved in [history/email.md](history/email.md). The [background conversation about ABET and engineering education](https://chatgpt.com/share/6add8c7b-12e4-83e9-9a13-2438f1940d3e?ogimg=plain) records the earlier exploration of this idea.

## The graduate we want

A graduate should be able to learn independently, solve difficult technical problems, collaborate with others, communicate clearly, exercise professional judgment, and build things that work.

The aspiration is four years of progressively demanding engineering practice, with demonstrable technical knowledge and experience contributing to successful teams.

We will work backward from those capabilities to the evidence that demonstrates them, then to the educational experiences, projects, resources, faculty roles, and assessments needed to develop them. The eventual proposal should support comparison with conventional approaches and mapping to applicable ABET requirements.

## Collaboration is the central challenge

Individual mastery belongs in the program. Individual performance testing, tools such as Brilliant, and appropriate certification examinations should help establish what each student knows and can do. Mathematics, physics, and engineering fundamentals remain essential, and students should apply them in their work.

The central educational challenge is learning to accomplish difficult work together:

- **Decompose a problem:** turn an ambiguous challenge into understandable parts, identify dependencies, and define how the parts fit together.
- **Divide and coordinate the work:** establish ownership, agree on interfaces and expectations, and integrate contributions into a working whole.
- **Communicate continuously:** explain decisions, progress, learning, uncertainty, and blockers clearly enough for others to act.
- **Overcome obstacles together:** ask for help, share knowledge, resolve disagreements, and adapt responsibilities as the team learns.
- **Fail fast, learn fast:** test assumptions early, run small experiments, use feedback, and change direction when the evidence calls for it.
- **Ask the Five Whys and investigate root causes:** examine why failures occur, test causal explanations, and use what the team learns to improve its work.

These abilities should be practiced throughout the program. Collaboration, communication, and learning from failure are engineering disciplines that require repeated experience and feedback.

## The educational experience envisioned

Each academic term, multidisciplinary student teams would own real engineering challenges and work toward demonstrable outcomes. Faculty would guide technical understanding, experimentation, design, execution, and reflection.

Teams should practice Agile development and Scrum: maintain backlogs, plan sprints, hold regular standups, review deliverables, and reflect on how they work. Students should regularly explain what they accomplished, what they are working on, what they learned, and where they are stuck.

Faculty would curate strong existing explanations and learning resources, then devote substantial time to helping students understand and apply the material. Foundational study, individual assessment, experimentation, and team projects would all contribute to the educational experience.

## Team tools and examples

| Resource | Role in this project |
| --- | --- |
| [Huddle](https://huddle.os.mieweb.org/) | Intended collaboration environment for student teams. Its [TimeHuddle source and documentation](https://github.com/mieweb/timehuddle) describe ticket coordination, team updates, and time tracking. |
| [Pulse](https://github.com/mieweb/pulse) | Open-source short-form video tool proposed for brief student updates around standups: accomplishments, current work, learning, and blockers. This is an intended educational use. |
| [MIE open-source internship projects](https://github.com/mieweb/intern-projects-opensource) | Existing reference for learning through contributions to real projects, including working in existing repositories, diagnosing problems, documenting decisions, and delivering useful changes. |
| [REFINERY rankings repository](https://github.com/horner/refintery-rankings) and [published site](https://horner.github.io/refintery-rankings/) | Prior GitHub Pages project supplied as an example for this project's eventual public presentation. Its documented sources, methodology, and build workflow also provide examples of inspectable engineering work. |

Pulse's [terminology](https://github.com/mieweb/pulse#anatomy-of-a-pulse) calls a complete short video a **Pulse** and an individual clip's timestamped span a **Beat**. The proposed practice is for students to use short video updates to explain their work regularly.

## Learning and assessment resources

The following resources are starting references for faculty to curate and connect to engineering work:

| Resource | Intended contribution |
| --- | --- |
| [3Blue1Brown](https://www.3blue1brown.com/) | Visual mathematical explanations. |
| [Crash Course](https://thecrashcourse.com/) | Explanations of foundational subjects. |
| [FloatHeadPhysics](https://www.youtube.com/@Mahesh_Shenoy) | Physics explanations, including the Pauli exclusion principle example below. Referred to as Floating Head Physics in the original introduction. |
| [Brilliant](https://brilliant.org/) | Interactive learning and individual problem-solving practice. |
| [Vincent Racaniello's Columbia virology course](https://virology.ws/course/) | Example of a sustained expert course connecting lecture videos, readings, slides, and study questions. The linked course page is the 2021 edition. |
| [roadmap.sh](https://roadmap.sh/) | Community-created developer roadmaps, guides, and project ideas; a candidate for organizing learning paths and linking topics to resources. |
| Individual performance tests and relevant certification examinations | Evidence of individual technical knowledge and skills; specific assessments remain to be selected. |

These are starting references. Resource selection should follow the capabilities students need to develop.

The prototype uses Knowledge Navigator as its pinned multidisciplinary foundation and provides our own curriculum and roadmap-style views. It tests a supported Knowledge Navigator authored-data export with an extension sidecar. Native roadmap.sh import is not claimed; the [synchronization guide](docs/knowledge-navigator-sync.md) explains the contracts and limits.

### Concrete learning examples

These examples illustrate the quality and range of explanations that faculty could curate and connect to engineering problems, experiments, and projects:

| Topic | Resource | Intended contribution |
| --- | --- | --- |
| Pauli exclusion principle | FloatHeadPhysics: [I finally understand the Pauli exclusion principle! (My mind is blown)](https://www.youtube.com/watch?v=S5TCzvfJntA) | Example of an explanation that develops intuition for a difficult physics concept. |
| Fourier transforms and foundations for FFT study | 3Blue1Brown: [But what is the Fourier Transform? A visual introduction.](https://youtu.be/spUNpyF58BY), with a [companion lesson](https://www.3blue1brown.com/lessons/fourier-transforms/) | Visual introduction to Fourier transforms and frequency decomposition, providing conceptual grounding for later work with the fast Fourier transform. |
| Navier–Stokes equations and advanced research | FFP Podcast: [Finite-time blow-up for forced hypodissipative Navier–Stokes equations](https://ffppod.com/research/finite-time-blow-up-for-the-hypodissipative-navier-stokes-equations-with-a-force-in-l-1-t-c-x-1-cap-l-infty-t-l-x-2), with the [original paper](https://arxiv.org/abs/2407.06776) | Advanced example connecting fluid dynamics, partial differential equations, mathematical assumptions, and research reading. |
| Virology and expert-led course curation | [Vincent Racaniello's Columbia University virology course, 2021](https://virology.ws/course/) | Example of organizing a subject into lectures with linked reading, slides, study questions, and videos. Included as a curation model; its role in a particular engineering track remains to be determined. |

### A reusable resource-curation skill

The project-local [curate-learning-resources skill](.agents/skills/curate-learning-resources/SKILL.md) captures a repeatable way to discover, evaluate, link, and maintain learning resources for each area of expertise.

Search YouTube for highly ranked and engaging explanations, considering entertainment, visual intuition, demonstrations, storytelling, and clarity alongside accuracy and depth. Popularity helps discover candidates; subject accuracy and fit for the intended learner require separate evaluation. Record what was actually inspected and the evidence supporting a recommendation.

Include Brilliant and other learning platforms alongside open courses, textbooks, and videos. Deep-link to a specific lesson, chapter, video segment, or exercise when possible, and record sign-in, subscription, sequencing, or other access requirements. A topic entry should connect the learner to something to watch or read, something to practice, and an application or observable performance.

Record the source, target capability, prerequisites, level, access conditions, review status, selection rationale, and date checked. Revisit links and recommendations as topics are updated. Faculty and student feedback should improve the selections over time.

### Faculty ownership and institutional fit

Faculty would retain responsibility for academic standards, resource selection, context, mentoring, project design, assessment, and curricular improvement. Curating an outside explanation is part of exercising educational judgment. Students still need local support, experiments, feedback, and a coherent program of study.

Indiana Tech already documents the use of outside learning materials: its [textbook guidance](https://academics.indianatech.edu/resources/textbooks/) describes OpenStax links within Canvas courses, and its [adult-student resources](https://studentsuccess.indianatech.edu/online/resources-for-adult-students/) recommend Khan Academy and other external sources. These examples establish precedent; faculty and leadership responses to a broader redesign remain to be explored.

Adoption discussions should address coverage, rigor, accessibility, student cost, resource maintenance, faculty workload, and time available for mentoring and collaborative work. Faculty involvement in selection and evaluation is part of the proposed model.

## Visual direction

Use **Indiana Tech branding** for the prototype and the **MIE UI design system** for its components. Indiana Tech is the default university profile; keep branding configurable so another university can use the same curriculum and application.

| Reference | Purpose |
| --- | --- |
| [Indiana Tech identity](https://marketing.indianatech.edu/identity/) | Institutional brand reference for the prototype. |
| [Indiana Tech logo usage guidelines](https://marketing.indianatech.edu/wp-content/uploads/sites/21/Logo-Usage-Guidelines-Indiana-Tech.pdf) | Defines the primary bold orange web color, `#FA4616`, alongside black, and the institutional logo treatment. Use accessible text/surface combinations and preserve supplied logo artwork. |
| [Indiana Tech logo assets](https://marketing.indianatech.edu/identity/indiana-tech-logo/) | Source for the original institutional wordmark and variants suited to light and dark backgrounds. |
| [MIE UI](https://ui.mieweb.org/) | Design system and component documentation. |
| [MIE UI source and usage documentation](https://github.com/mieweb/ui) | Component library and integration reference. |
| [MIE UI branding documentation](https://ui.mieweb.org/?path=/docs/branding--docs) | Reference for applying brand and theme tokens. |

The REFINERY rankings site is a reference for presenting a project through GitHub Pages. Indiana Tech establishes the prototype's visual identity; MIE UI supplies the component system.

## Static site and client-side state

The prototype is a static site suitable for GitHub Pages. Visitors can explore both views immediately, with no login or account. HTML, CSS, JavaScript, images, and generated curriculum data are served as static files; all application behavior runs in the browser.

Store personal demo progress, notes, and preferences in versioned browser `localStorage`. Use the URL for shareable selections such as institution, program, topic, and view. Local progress belongs to that browser and does not automatically follow someone to another device; provide JSON export/import and a reset control. If storage is unavailable, browsing still works and session-only changes are clearly identified.

YAML editing, Knowledge Navigator synchronization, validation, and data generation run as contributor/build tooling before deployment. The deployed site has no application server, API, database, serverless functions, authentication, or shared progress service. Huddle, Pulse, and learning platforms remain external links and may have their own accounts. Browser tests exercise static exploration with external requests blocked and verify that progress changes send no network writes.

## Accreditation reference

ABET is a framework to account for as the proposal develops. The original insight was the alignment between the desired graduate and ABET's emphasis on problem-solving, design, communication, responsibility, teamwork, experimentation, and continued learning.

Use the official [ABET Engineering Accreditation Commission criteria for 2026–2027](https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/) as a primary reference for student outcomes, assessment and continuous improvement, curriculum, faculty, facilities, institutional support, and applicable discipline-specific requirements. The criteria for the program and review cycle ultimately pursued will govern the detailed mapping.

The shared ChatGPT conversation records the project's background and reasoning. Accreditation requirements should be checked against ABET's official publications.

## Participation

This project welcomes Indiana Tech faculty and leadership, practicing engineers, employers, students, and others interested in developing and evaluating the idea together.

The implementation record is the [biomedical prototype plan](bioprototype-plan.md). Its checkboxes and task-linked commits record verified work. The [follow-up backlog](docs/follow-up-backlog.md) preserves academic questions and improvements for faculty and contributor review.
