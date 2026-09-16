# SDLCraft v0.1 MVP Design

## Status

Draft design derived from `PRD.md` version 0.1. The PRD is the product source of truth.

## Goal

Build SDLCraft as a governed, traceable Waterfall-first control plane that takes a business need through requirement, design, implementation, verification, and pull-request preparation while keeping human approval at critical gates.

The MVP must prove that a business requirement can become a reviewable implementation with specialized agent execution, visible evidence, traceability, and an auditable history. Production deployment is excluded from v0.1.

## Product Boundary

The primary interaction is a business-first web experience. A business user describes a need in non-technical language, answers clarification questions, reviews generated artifacts, and approves or requests changes. Technical agents and execution details remain visible as status and evidence without requiring the business user to understand frameworks, databases, APIs, or deployment infrastructure.

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

The API owns request validation, authorization, workflow state, artifact metadata, approvals, audit events, and job enqueueing. The worker owns long-running agent execution, repository operations, test execution, security tools, artifact upload, and structured job results. Repository work must never block an API request.

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

### Technology choices

- Runtime and package manager: Bun.
- Language: TypeScript.
- Web: React, Vite, TanStack Router, TanStack Query, TanStack Form, Tailwind CSS, and shadcn/ui.
- API: NestJS on Fastify, REST, and OpenAPI.
- Database: PostgreSQL accessed through Drizzle ORM.
- Queue: Redis and BullMQ.
- Object storage: S3-compatible storage, with MinIO for local and self-hosted development.
- Agent execution: TypeScript provider abstraction inside a Docker sandbox.
- Repository provider: GitHub first, behind a `GitProvider` abstraction.
- Model provider: provider abstraction; agents identify by role rather than a permanent model vendor.
- Infrastructure: Docker Compose for local dependencies and GitHub Actions for CI.
- Automated tests: Vitest for domain and service behavior. Playwright is deferred until the critical browser flow stabilizes; initial UI proof uses the OMP browser runtime.

## Runtime Modules

### Web application

The web app provides authenticated screens for organization, project, workflow progress, business intake, artifact review, agent activity, findings, pull-request status, and audit history. TanStack Router owns routes. TanStack Query owns server state and cache invalidation. Forms submit typed payloads validated by the API contract.

The UI must expose loading, empty, error, approval, revision, failed-job, and retry states. It must not show a control without a real action or a clear disabled/coming-soon state.

### API application

The API is a modular monolith with domain modules. Each module owns its controller, application service, persistence access, authorization checks, and emitted audit events. Modules communicate through explicit application contracts instead of importing another module's persistence internals.

Required domain modules:

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

The API exposes REST operations described by an OpenAPI document. Shared request and response schemas live in `packages/contracts` and are validated at runtime with Zod at the application boundary.

### Worker application

The worker consumes BullMQ jobs and executes them outside the API process. Each job includes the workflow run, stage task, agent version, approved context identifiers, permission set, repository connection, and model-provider selection.

A worker run must:

1. Claim one job with an idempotency key.
2. Create an isolated workspace.
3. Load only approved context and permitted tools.
4. Execute the assigned agent.
5. Run required checks inside the sandbox.
6. Persist structured progress events.
7. Upload large artifacts to object storage.
8. Persist metadata, links, findings, and the final result.
9. Advance or block the workflow through an API/application contract.
10. Destroy or archive the workspace according to the run policy.

Retries must not duplicate approvals, commits, pull requests, or audit events. Repeated delivery of the same job must resolve through the job idempotency key and existing run state.

### Agent runtime

Every agent has an `AGENT.md`, input schema, output schema, tool list, permission set, and version. Prompt text is not an access-control boundary. The runtime enforces tool permissions independently from human roles.

MVP agent roles:

- Requirement Agent: interviews the business user and generates structured requirements; it cannot write code or deploy.
- System Analyst Agent: turns approved requirements into design and impact analysis; it cannot silently change approved business intent or deploy.
- Developer Agent: works from approved artifacts, changes repository files, runs checks, and creates a branch or pull request; it cannot approve its own work.
- Reviewer Agent: reviews implementation against requirements and design and returns structured findings.
- QA Agent: generates or executes verification scenarios and reports acceptance-criteria coverage.
- Security Agent: interprets actual scanner evidence from secret, dependency, and static checks; it cannot invent a pass state.

### Provider abstractions

`GitProvider` hides repository vendor details. The MVP implementation targets GitHub and supports connect, clone, read branch, create branch, commit, push, create pull request, read diff, and read CI status. Future providers must implement the same contract.

`ModelProvider` hides model-vendor details. The agent role and version remain stable when the organization changes the assigned model. Provider failures become structured agent-run failures with retryability classification.

`Runner` hides execution placement. The MVP uses a local Docker-backed runner. The contract leaves room for customer-hosted or remote runners without changing workflow or agent modules.

## Data Model

PostgreSQL stores metadata, workflow state, structured artifacts, relationships, approvals, findings, and audit records. S3-compatible storage stores large artifact bodies and build outputs. All persisted records are tenant-scoped through organization and project ownership.

Initial entities follow the PRD:

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

An artifact version records its type, owner, source agent and version, human modifications, checksum, status, parent links, and storage location. `artifact_links` records typed relationships such as requirement-to-design, design-to-task, task-to-file-change, commit-to-test, and security-finding-to-release.

The graph must answer:

- Why does this code exist?
- Which requirement introduced this API?
- Which design was used for this implementation?
- Which tests verify this requirement?
- Which security findings affect this release candidate?
- Who approved each gate?
- Which agent version and model produced an artifact?

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

The workflow engine supports sequential transitions, failed states, rework loops, approval gates, agent assignment, artifact requirements, policy blocks, retry, cancellation, and versioned workflow definitions.

The primary user-visible state progression is:

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

A rejection or revision request creates a rework transition to the responsible stage. It does not silently overwrite an approved version. A failed job records the failure, leaves the stage blocked, and exposes retry when the failure is retryable. A human approval writes an immutable approval event and advances only the matching workflow stage.

## End-to-End Data Flow

1. The user creates an organization and project, then connects a GitHub repository.
2. The user enters a business need in the intake form.
3. The API creates a project-scoped workflow run and a draft business-intent artifact.
4. The Requirement Agent job is enqueued. The worker asks business-focused clarification questions and stores each turn as run evidence.
5. The agent produces a versioned UR, business rules, functional requirements, NFRs, acceptance criteria, assumptions, dependencies, and open questions.
6. The user approves the UR or requests changes. Approval or revision is recorded in the audit log.
7. After UR approval, the System Analyst Agent creates a versioned DR, system flow, architecture proposal, API specification, data changes, integration design, UI flow, constraints, and impact analysis.
8. The user approves the DR or requests revision. The system records the decision and preserves prior versions.
9. After DR approval, the Developer Agent job runs in a Docker sandbox against a GitHub branch. It produces implementation tasks, source changes, tests, build output, and a diff.
10. The Reviewer Agent evaluates the diff against approved requirements and design. Rejected findings return the workflow to the Developer Agent with a bounded rework context.
11. The QA Agent verifies acceptance criteria and records test runs and results.
12. The Security Agent runs available secret, dependency, and static checks and records findings. The LLM may interpret evidence but cannot manufacture scanner results.
13. When required checks and approval gates pass, the system creates a release candidate and marks the work `PR_READY`. The user can open the GitHub pull request and inspect the complete traceability chain.
14. Production deployment is not executed in v0.1.

## API Contracts

The API is RESTful and documented with OpenAPI. Resource identifiers are opaque strings. Every request that mutates state includes the authenticated actor and organization context supplied by the session.

Required contract groups:

- `POST /auth/session`, session retrieval, and sign-out.
- `POST /organizations`, organization membership management, and role assignment.
- `POST /projects`, project retrieval, dashboard, and repository connection.
- `POST /projects/:projectId/intents`, business-intent creation.
- `POST /workflow-runs/:runId/interview/answers`, business interview answers.
- `POST /requirements/:requirementId/approve` and `POST /requirements/:requirementId/request-revision`.
- `POST /requirements/:requirementId/generate-design`.
- `POST /designs/:designId/approve` and `POST /designs/:designId/request-revision`.
- `POST /workflow-runs/:runId/build` to enqueue development work.
- `GET /workflow-runs/:runId`, stage status, progress events, and traceability.
- `GET /artifacts/:artifactId`, artifact metadata and version body.
- `GET /artifacts/:artifactId/links`, parent and child relationships.
- `GET /agent-runs/:agentRunId`, progress, tool history, result, and failure state.
- `GET /pull-requests/:pullRequestId`, diff and CI status.
- `GET /workflow-runs/:runId/audit`, ordered audit events.

Exact DTO fields, authorization matrices, error codes, pagination, and OpenAPI schemas are implementation-plan deliverables derived from these resource boundaries. No client may bypass the API by reading the database directly.

## Security and Permissions

MVP security requirements are HTTPS, secure session authentication, encrypted secrets, repository-token isolation, agent permission enforcement, Docker sandbox isolation, secret scanning, dependency scanning, audit logging, and no production deployment.

Human roles are Organization Admin, Project Owner, Analyst, Developer, Security Reviewer, and Viewer. Agent permissions are separate from human roles and are enforced by the worker runtime. Organization data is tenant-isolated. Repository credentials are scoped to the organization and repository connection, never shared across organizations, and never placed in prompts or artifact bodies.

The worker receives only the tools and context authorized by the assigned agent version and workflow policy. Sandbox network and filesystem access are explicit configuration, not ambient permissions.

## Audit and Observability

Every user action, agent action, tool call, approval, repository action, security-gate change, release action, and configuration change emits an audit record containing actor type, actor identifier, organization, project, workflow run, artifact or resource, event type, timestamp, and relevant metadata. Agent events also record agent version, provider/model identifier, and tool-call history.

The system exposes structured logs and visible run status, queue state, execution duration, model/token usage where available, tool-call history, and error traceability. Audit records are append-only from application code; corrections are represented as new events.

## Failure Handling

- Invalid user payloads return a typed validation error without creating a workflow transition.
- Missing or inaccessible repository connections block the build stage and expose a remediation message.
- Agent provider failure records a failed run with retryability and preserves prior artifacts.
- Scanner failure is distinct from a clean security result and blocks the security gate until resolved or explicitly handled by policy.
- Human rejection creates a revision request and returns the workflow to the owning stage.
- Queue retries use bounded retry policy and idempotency keys.
- API restart must not lose workflow state because state is persisted in PostgreSQL and jobs are durable in Redis.
- Worker restart must allow BullMQ to redeliver unfinished work without duplicating side effects.
- Missing object-storage bodies produce an artifact-unavailable error; metadata and audit history remain visible.

## User Experience

The web app uses a business-first navigation model:

- Organization and project selection.
- Project dashboard with the five lifecycle stages and current gate.
- Business intent intake.
- Interview conversation with clear progress and failure states.
- Requirement review with business rules, edge cases, dependencies, version history, approve, and request-revision actions.
- Design review with flow, API, data impact, dependencies, and approval actions.
- Build activity showing agent progress without pretending that unfinished work is complete.
- Verification view showing reviewer findings, test results, security findings, and gate status.
- Pull-request-ready view showing the PR link, coverage links, checks, and audit timeline.

Every mutation gives visible success or error feedback. Keyboard operation and focus indicators are required. Responsive behavior must support the MVP screens without horizontal overflow.

## Verification Strategy

Vitest covers domain behavior and service contracts:

- Workflow transitions obey configured gates.
- Approval creates an immutable event and advances only the matching stage.
- Revision requests preserve prior versions and route work back to the responsible stage.
- Artifact links answer parent and child traceability queries.
- Agent permissions reject unauthorized tool requests.
- Duplicate job delivery does not duplicate commits, approvals, or audit events.
- Scanner failure is not reported as a pass.

The first end-to-end browser proof uses the OMP browser runtime rather than Playwright. It exercises:

```text
Sign in
→ Create organization
→ Create project
→ Enter Goods Receive intent
→ Answer interview
→ Approve UR
→ Review and approve DR
→ Trigger build
→ Inspect agent status
→ Inspect findings
→ Open traceability
→ Open pull request result
```

Playwright is added only after this flow is stable enough to justify a persistent browser regression test. Production deployment is not part of verification for v0.1.

## MVP Completion Criteria

The implementation is complete only when a user can sign in, create an organization and project, connect GitHub, describe a business requirement, answer clarification questions, approve UR, generate and approve DR, trigger development, observe agent activity, receive reviewer findings, rework rejected changes, run QA and basic security checks, produce an approved implementation, create a pull request, trace it to the original requirement, and view a complete audit timeline.

The system must keep all major artifacts linked and must not execute production deployment in v0.1.
