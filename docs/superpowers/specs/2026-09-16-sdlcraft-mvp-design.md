# SDLCraft v0.1 MVP Design

## Status

Approved design derived from `PRD.md` version 0.1. The PRD remains the product source of truth.

## Goal

Build SDLCraft as a governed, traceable Waterfall-first control plane that takes one business need through requirements, design, implementation, verification, and pull-request preparation while keeping human approval at critical gates.

The MVP proves that a business requirement can become a reviewable implementation with specialized agent execution, visible evidence, traceability, and an auditable history. Production deployment is excluded from v0.1.

## Product Boundary

The primary interaction is a business-first web experience. A business user describes a need in non-technical language, answers clarification questions, reviews generated artifacts, and approves or requests changes. Technical execution remains visible as status and evidence without requiring the business user to understand frameworks, databases, APIs, or deployment infrastructure.

The v0.1 workflow is configured as:

```text
REQUIRE → DESIGN → BUILD → VERIFY → RELEASE
```

The workflow engine represents stages, transitions, gates, tasks, agents, artifacts, approvals, and policies generically. The Waterfall template is configuration, not hardcoded control flow.

## Architecture

SDLCraft starts as a modular monolith with a separately deployable worker. It is not a set of independently deployed microservices.

```text
React Web
    │ REST/OpenAPI
    ▼
NestJS + Fastify API
    ├── PostgreSQL via Drizzle
    ├── Redis via BullMQ
    └── S3-compatible object storage
             │ jobs
             ▼
       Agent Worker
             │
             ▼
       Docker Sandbox
             │
             ▼
      GitHub provider
```

The API owns request validation, authorization, workflow state, artifact metadata, approvals, audit events, and job enqueueing. The worker owns long-running agent execution, repository operations, test execution, security tools, artifact upload, and structured job results. Repository work never blocks an API request.

The monorepo uses Bun and TypeScript:

```text
sdlcraft/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
├── packages/
│   ├── database/
│   ├── workflow-engine/
│   ├── agent-core/
│   ├── agent-tools/
│   ├── git-provider/
│   ├── model-provider/
│   ├── sandbox/
│   ├── contracts/
│   └── ui/
├── agents/
├── workflows/
├── infra/
└── docs/
```

## Technology Choices

- Runtime and package manager: Bun.
- Language: TypeScript.
- Web: React, Vite, TanStack Router, TanStack Query, TanStack Form, Tailwind CSS, and shadcn/ui.
- API: NestJS on Fastify, REST, and OpenAPI.
- Database: PostgreSQL accessed through Drizzle ORM.
- Queue: Redis and BullMQ.
- Object storage: S3-compatible storage, with MinIO for local development.
- Agent execution: TypeScript provider abstraction inside a Docker sandbox.
- Repository provider: GitHub first, behind a `GitProvider` abstraction.
- Model provider: provider abstraction; agents identify by role rather than a permanent model vendor.
- Runner: local Docker-backed implementation behind a `Runner` contract.
- Automated tests: Vitest for domain and service behavior. Browser smoke verification uses the OMP browser runtime until the critical flow stabilizes.

## Runtime Modules

### Web

Authenticated screens cover organization, project, workflow progress, business intake, artifact review, agent activity, findings, pull-request status, and audit history. TanStack Router owns routes. TanStack Query owns server state and cache invalidation. Forms submit typed payloads validated by the API contract.

The UI exposes loading, empty, error, approval, revision, failed-job, and retry states. It does not show controls without a real action or an explicit disabled or coming-soon state.

### API

The API is a modular monolith. Each module owns its controller, application service, persistence access, authorization checks, and emitted audit events. Modules communicate through application contracts rather than importing another module's persistence internals.

Required modules:

- Authentication and organization membership.
- Projects and repository connections.
- Workflow templates, workflow runs, stages, gates, and transitions.
- Requirements and requirement versions.
- Designs and design versions.
- Artifacts and traceability links.
- Agent definitions, versions, permissions, and runs.
- Approvals and revision requests.
- Pull requests, test runs, and security findings.
- Release candidates and audit logs.

REST request and response schemas live in `packages/contracts` and use Zod at the application boundary. No client reads the database directly.

### Worker

The worker consumes BullMQ jobs. Each job includes the workflow run, stage task, agent version, approved context identifiers, permission set, repository connection, and model-provider selection.

A worker run claims an idempotency key, creates an isolated workspace, loads only approved context and permitted tools, executes the assigned agent, runs required checks in the sandbox, persists progress events, uploads large artifacts, persists metadata and findings, advances or blocks the workflow through an application contract, and destroys or archives the workspace according to policy.

Repeated delivery of a job must not duplicate approvals, commits, pull requests, or audit events. Existing run state and the idempotency key determine the result.

## Agent Runtime

Every agent has an `AGENT.md`, input schema, output schema, tool list, permission set, and version. Prompt text is not an access-control boundary. The runtime enforces tool permissions independently from human roles.

MVP roles:

- Requirement Agent: interviews the business user and generates structured requirements; it cannot write code or deploy.
- System Analyst Agent: turns approved requirements into design and impact analysis; it cannot silently change approved business intent or deploy.
- Developer Agent: works from approved artifacts, changes repository files, runs checks, and creates a branch or pull request; it cannot approve its own work.
- Reviewer Agent: reviews the diff against requirements and design and returns structured findings.
- QA Agent: generates or executes verification scenarios and reports acceptance-criteria coverage.
- Security Agent: interprets actual secret, dependency, and static-check evidence; it cannot invent a pass state.

## Provider Contracts

`GitProvider` hides repository vendor details. The MVP GitHub implementation supports connect, clone, read branch, create branch, commit, push, create pull request, read diff, and read CI status.

`ModelProvider` hides model-vendor details. Agent role and version remain stable when the organization changes its assigned model. Provider failures become structured agent-run failures with retryability classification.

`Runner` hides execution placement. The MVP uses a local Docker-backed runner. Sandbox network and filesystem access are explicit configuration, not ambient permissions.

## Data Model

PostgreSQL stores tenant-scoped metadata, workflow state, structured artifacts, relationships, approvals, findings, and audit records. S3-compatible storage stores large artifact bodies and build outputs.

Initial entities:

```text
organizations
users
organization_members
projects
project_members
workflow_templates
workflow_stages
workflow_runs
workflow_stage_runs
requirements
requirement_versions
designs
design_versions
artifacts
artifact_links
agents
agent_versions
agent_runs
approvals
repositories
repository_connections
branches
pull_requests
test_runs
test_results
security_scans
security_findings
release_candidates
deployments
audit_logs
```

Artifact versions record type, owner, source agent and version, human modifications, checksum, status, parent links, and storage location. `artifact_links` records typed relationships such as requirement-to-design, design-to-task, task-to-file-change, commit-to-test, and security-finding-to-release.

The graph answers why code exists, which requirement introduced an API, which design guided an implementation, which tests verify a requirement, which findings affect a release candidate, who approved each gate, and which agent version and model produced an artifact.

## Workflow and State

The MVP ships one Waterfall workflow template:

```text
REQUIRE
  └─ approval required
DESIGN
  └─ approval required
BUILD
VERIFY
  └─ approval required
RELEASE
  └─ production deployment excluded from v0.1
```

The engine supports sequential transitions, failed states, rework loops, approval gates, agent assignment, artifact requirements, policy blocks, retry, cancellation, and versioned workflow definitions.

The primary visible state progression is:

```text
DRAFT
→ INTERVIEW
→ REQUIREMENT_REVIEW
→ REQUIREMENT_APPROVED
→ DESIGN_REVIEW
→ DESIGN_APPROVED
→ BUILDING
→ REVIEWING
→ VERIFYING
→ PR_READY
```

A revision request creates a rework transition to the responsible stage and preserves the approved version. A failed job records failure, leaves the stage blocked, and exposes retry only when retryable. A human approval writes an immutable approval event and advances only the matching stage.

## End-to-End Flow

1. User creates an organization and project, then connects a GitHub repository.
2. User submits a business need.
3. API creates a project-scoped workflow run and draft business-intent artifact.
4. Requirement Agent asks business-focused clarification questions and stores each turn as evidence.
5. Agent produces versioned UR data: business rules, functional requirements, non-functional requirements, acceptance criteria, assumptions, dependencies, and open questions.
6. User approves the UR or requests changes. The decision is audited.
7. After UR approval, System Analyst Agent creates a versioned DR, flow, architecture proposal, API specification, data changes, integration design, UI flow, constraints, and impact analysis.
8. User approves the DR or requests revision. Prior versions remain available.
9. After DR approval, Developer Agent runs in Docker against a GitHub branch and produces tasks, source changes, tests, build output, and a diff.
10. Reviewer Agent evaluates the diff. Rejected findings return bounded rework context to the Developer Agent.
11. QA Agent verifies acceptance criteria and records test runs and results.
12. Security Agent runs available secret, dependency, and static checks. The LLM interprets evidence but cannot manufacture scanner results.
13. When checks and gates pass, the system creates a release candidate and marks the run `PR_READY`. The user can open the GitHub pull request and inspect the traceability chain.
14. Production deployment is not executed in v0.1.

## API Boundaries

Required REST groups:

- `POST /auth/session`, session retrieval, and sign-out.
- `POST /organizations`, membership management, and role assignment.
- `POST /projects`, project retrieval, dashboard, and repository connection.
- `POST /projects/:projectId/intents`, business-intent creation.
- `POST /workflow-runs/:runId/interview/answers`, interview answers.
- `POST /requirements/:requirementId/approve` and `POST /requirements/:requirementId/request-revision`.
- `POST /requirements/:requirementId/generate-design`.
- `POST /designs/:designId/approve` and `POST /designs/:designId/request-revision`.
- `POST /workflow-runs/:runId/build` to enqueue development work.
- `GET /workflow-runs/:runId`, stage status, progress events, and traceability.
- `GET /artifacts/:artifactId`, metadata and version body.
- `GET /artifacts/:artifactId/links`, parent and child relationships.
- `GET /agent-runs/:agentRunId`, progress, tool history, result, and failure state.
- `GET /pull-requests/:pullRequestId`, diff and CI status.
- `GET /workflow-runs/:runId/audit`, ordered audit events.

Resource identifiers are opaque strings. Mutations include authenticated actor and organization context. DTO fields, authorization matrices, error codes, pagination, and OpenAPI schemas are plan deliverables derived from these boundaries.

## Security, Roles, and Audit

MVP security requirements are HTTPS, secure session authentication, encrypted secrets, repository-token isolation, independent agent permission enforcement, Docker sandbox isolation, secret scanning, dependency scanning, audit logging, and no production deployment.

Human roles are Organization Admin, Project Owner, Analyst, Developer, Security Reviewer, and Viewer. Organization data is tenant-isolated. Repository credentials are scoped to an organization and repository connection and never appear in prompts or artifact bodies.

Every user action, agent action, tool call, approval, repository action, security-gate change, release action, and configuration change emits an append-only audit record with actor type, actor identifier, organization, project, workflow run, resource, event type, timestamp, and relevant metadata. Agent events also record agent version, provider/model identifier, and tool-call history.

## Failure Handling

Invalid payloads return typed validation errors without creating workflow transitions. Missing or inaccessible repository connections block build and show remediation. Provider, model, sandbox, and scanner failures record retryability and preserve partial evidence. Retries reuse the same run and idempotency key. Authorization failures never disclose another tenant's resource existence.

## MVP Acceptance

The implementation is complete when a user can sign in, create an organization and project, connect GitHub, describe a business requirement, answer clarification questions, approve UR, generate and approve DR, trigger development, observe agent activity, receive reviewer findings, loop rejected work back to development, run QA and basic security scanning, produce an approved implementation, create a pull request, trace that PR to the original requirement, and view the complete audit timeline.

Production deployment remains explicitly excluded.

## Explicit Design Reasons

- Modular monolith: keeps domain boundaries clear without premature operational complexity.
- Separate worker: prevents long-running repository and agent execution from blocking API requests.
- Generic workflow model: preserves the methodology-agnostic core while shipping Waterfall first.
- PostgreSQL plus object storage: keeps queryable relationships in relational metadata and large bodies outside transactional rows.
- Provider abstractions: prevents GitHub, model vendor, and execution placement from becoming permanent domain dependencies.
- Human approval gates: preserves business and release authority where agent autonomy is unsafe.
- Append-only audit records: makes governance evidence durable and corrections explicit.
- TypeScript contracts with runtime validation: keeps web, API, and worker payloads aligned at boundaries.
