# Topic 4: Real-Time Collaborative Text Editor

## Overview: 
Design a real-time collaborative editor supporting multiple users editing simultaneously. Integrate features like chat, document history, and role-based permissions. Apply synchronization algorithms like OT or CRDTs to prevent conflicts and data loss.

### Proposed Technologies: 
WebSocket, Postgres, SeaweedFS, SvelteKit, Node.js.

### Key Challenges: 
Conflict-free real-time synchronization, managing concurrent edits, and ensuring data persistence across sessions.


## Milestones:

### M1
Submit a concise project proposal. Identify the selected topic, problem, intended users, objectives, initial scope, proposed features, constraints, risks, and open questions. Provide a repository or project workspace link if available. The proposal should make clear what the first usable version will demonstrate.


### M2
Submit the system architecture and algorithm plan. Include a module or component diagram, data flow and interfaces, chosen algorithms and data structures, correctness considerations, time and space complexity analysis, technology rationale, risks, and an implementation plan.

### M3
Submit a working prototype that demonstrates a first end-to-end feature slice. Include the repository or build, setup instructions, a short demonstration or screenshots, tests of the implemented behavior, and a list of limitations and next steps.

### M4
Submit an integrated system with the main user workflow, connected components and data or service integrations. Include an updated architecture, requirement status, setup instructions, demonstration evidence, and a list of remaining defects or gaps.

### M5
Submit a validation package: test strategy, unit and integration tests, relevant performance measurements, edge-case and failure checks, results, defects found and resolved, and limitations. Make the evidence reproducible.

### M6
FINAL DELIVERABLES
Submit the final project repository or runnable build, README and technical documentation, final report, presentation materials, and demonstration evidence. Explain the problem, implemented features, algorithms and complexity, architecture, technology choices, innovation, tests and validation, outcomes, and limitations.

HOW THE PROJECT IS ASSESSED
The same general criteria apply to every topic. Evidence is judged against the selected topic, the team's stated scope and requirements, and the technical decisions explained in the submission. A particular technology or feature is not required unless it is part of the chosen project's approved scope. The assessor reviews the submitted artefacts, test results, documentation, and presentation against the rubric below. Each criterion has three published levels: 0 points when there is no adequate evidence, a partial score when important gaps remain, and the full score when the criterion is clearly met. The detailed rubric is attached to this assignment under Advanced grading.

BASE RUBRIC — 100 POINTS
• Functional Completeness — 15 points: required features and system components; levels 0 / 8 / 15.
• Algorithmic Complexity — 20 points: appropriate algorithms and data structures, efficiency and complexity reasoning; levels 0 / 10 / 20.
• System Design & Architecture — 20 points: modular design, interfaces and architectural decisions; levels 0 / 10 / 20.
• Code Quality & Documentation — 10 points: readable, maintainable code and useful technical documentation; levels 0 / 5 / 10.
• Use of Appropriate Technologies — 10 points: justified choice and integration of technologies; levels 0 / 5 / 10.
• Innovation & Creativity — 10 points: originality and thoughtful technical solutions; levels 0 / 5 / 10.
• Testing & Validation — 10 points: relevant tests, results, limitations and validation of requirements; levels 0 / 5 / 10.
• Presentation & Reporting — 5 points: clear demonstration, explanation of results and report; levels 0 / 3 / 5.

BONUS — UP TO +10 POINTS
Extra credit may be awarded for containerization (for example Docker or Kubernetes), CI/CD pipelines, and public cloud deployment (AWS, Azure or GCP). It is recorded as a separate extra-credit item in the gradebook. The base rubric remains out of 100 points. No project receives a bonus automatically; the implementation and evidence must be shown.

