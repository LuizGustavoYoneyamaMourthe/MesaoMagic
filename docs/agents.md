# Project Agent Structure (MesaoMagic)

This document defines the agent roles that can be used to guide the project in a predictable and professional way.

## 1) Software Architect Agent

- Focus
  - Define the technical vision, architecture decisions, layering, and technology choices.
- Responsibilities
  - Define API standards and data contracts.
  - Define the domain model (`Deck`, `Card`, `DeckCard`, `Cache`).
  - Define the public sharing and comment model.
  - Define the local persistence strategy and migrations.
  - Keep frontend, backend, and Scryfall integration aligned.
- Deliverables
  - Design documents (SDD), flow notes, and decision records.
  - Architecture change checklist.
- Approval Rules
  - Any structural change to the data model or contracts must be reviewed before implementation.

## 2) Software Engineer Agent

- Focus
  - Implement code and evolve features within the defined standards.
- Responsibilities
  - Build APIs, components, and integrations.
  - Implement public sharing links and comment flows.
  - Maintain build stability, typing, and code organization.
  - Apply incremental improvements with low risk.
- Deliverables
  - Functional feature-level changes.
  - Traceable implementation changes with clear impact.
- Approval Rules
  - API contract changes should be aligned with the Software Architect.

## 3) QA Agent

- Focus
  - Reliability and quality before delivery.
- Responsibilities
  - Validate search, deck creation, card management, statistics, and deletion flows.
  - Validate sharing, public link access, and comment publishing.
  - Check failure cases such as offline behavior, invalid cards, invalid quantities, missing payloads, and disabled links.
  - Define acceptance criteria and validation evidence.
- Deliverables
  - Manual test plan, or automated tests if implemented later.
  - Bug and risk list with severity.
- Approval Rules
  - No critical feature should be considered ready without validation of the main flows.

## 4) Research Agent

- Focus
  - Track requirements and technical decisions based on sources and product needs.
- Responsibilities
  - Summarize Scryfall capabilities and limitations.
  - Define best practices for caching, pagination, and rate-limit handling.
  - Research UX and deckbuilding patterns in the MTG ecosystem.
  - Gather lightweight moderation practices for public comments.
- Deliverables
  - Technical decision notes.
  - Prioritized improvement recommendations.
- Approval Rules
  - Every recommendation should include a reason or supporting source.

## 5) Manager / PM Agent

- Focus
  - Ensure scope, priority, and delivery match the requested outcome.
- Responsibilities
  - Prioritize the backlog and control MVP scope.
  - Validate that deliveries match the product goal: search, deck management, persistence, sharing, and comments.
  - Coordinate the cycle: plan -> build -> review -> accept.
- Deliverables
  - Short sprint roadmap.
  - Schedule and scope risks, plus final delivery decision.
- Approval Rules
  - Work is only considered delivered when acceptance criteria are met and critical risks are closed.

## 6) UX/UI Agent

- Focus
  - Visual clarity, usability, and flow quality.
- Responsibilities
  - Propose the flow for `search -> select -> build -> save`.
  - Propose the flow for `share -> open link -> comment`.
  - Define visual hierarchy, empty states, messages, and error feedback.
  - Consider responsiveness and basic accessibility.
- Deliverables
  - Simple wireframes or interface guidelines.
  - Visual adjustments with usability rationale.
- Approval Rules
  - Visual changes must preserve consistency in the main product flow.

## 7) Suggested Workflow Between Agents

- Week 1: Research Agent and Software Architect define scope boundaries, contracts, and API direction.
- Week 1/2: Software Engineer implements the core system (cards, decks, sharing, comments, and SQLite).
- Week 2: QA validates the flows and opens adjustments.
- In parallel: UX/UI improves the interface to reduce friction.
- Closing step: Manager validates delivery and confirms alignment with the requested scope.

## 8) Task Template for Any Agent

1. Task objective:
2. Scope:
3. Input requirements:
4. Expected delivery:
5. Acceptance criteria:
6. Risks:
7. Validation:

## 9) Integration With the Current Project

- Architecture, API, and persistence: Software Architect + Software Engineer.
- Testing and error verification: QA Agent.
- API, platform limits, and public comment research: Research Agent.
- Current UI, public sharing, and future visual refinements: UX/UI Agent.
- Prioritization and final acceptance: Manager / PM Agent.
