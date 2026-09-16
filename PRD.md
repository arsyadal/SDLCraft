# SDLCraft — Product Requirements Document

**Document Version:** 0.1  
**Status:** Draft  
**Product Type:** B2B Enterprise SaaS / Self-Hosted Agentic SDLC Platform  
**Initial Methodology:** Waterfall-first  
**Primary Target:** Enterprise internal software development teams  
**Last Updated:** 2026-09-16

---

## 1. Product Summary

SDLCraft is an **Agentic Software Development Lifecycle (SDLC) platform** designed for enterprise software delivery.

The platform allows a business user or project owner to describe a software need in non-technical language. SDLCraft then orchestrates specialized AI agents that perform structured SDLC activities such as requirement analysis, system design, software implementation, code review, testing, security verification, and release preparation.

SDLCraft is not positioned as a generic AI coding assistant or no-code app builder.

Its main value is to provide a **governed, traceable, auditable software delivery process** where AI agents execute engineering work while humans retain authority over critical approvals.

The initial product will support a compact Waterfall-style lifecycle:

> **Require → Design → Build → Verify → Release**

Each phase can contain AI-generated artifacts, automated checks, human approval gates, and traceability to previous phases.

---

## 2. Problem Statement

Enterprise software development is often slowed by fragmented workflows across business users, system analysts, programmers, QA, security, infrastructure, and deployment teams.

Common problems include:

- Business requirements are incomplete, ambiguous, or difficult to translate into technical specifications.
- System design quality depends heavily on individual analysts.
- Developers spend significant time understanding requirements before implementation.
- Documentation becomes outdated after implementation changes.
- Testing and security checks are not always directly traceable to requirements.
- Different teams use different development standards.
- Approval processes are manual and scattered across email, chat, documents, tickets, and spreadsheets.
- Production changes are difficult to trace back to the original business requirement.
- AI coding tools accelerate code generation but often operate without sufficient business, governance, and audit context.
- Enterprises may not allow proprietary source code or sensitive documentation to leave their internal network.

SDLCraft aims to solve these problems by becoming the **control plane for AI-assisted enterprise software delivery**.

---

## 3. Product Vision

### Vision

Enable one human decision-maker to coordinate an AI-powered software engineering organization while maintaining enterprise-grade governance, traceability, security, and approval controls.

### Long-Term Product Vision

A user should be able to express a business need such as:

> “Operators currently enter manifest numbers manually. I want them to scan the barcode, validate the manifest automatically, and update receiving status.”

SDLCraft should then be capable of producing and managing:

1. Business requirements
2. Functional requirements
3. Acceptance criteria
4. System design
5. Architecture decisions
6. Data model changes
7. API contracts
8. Implementation tasks
9. Source code
10. Automated tests
11. Code review findings
12. Security findings
13. Release artifacts
14. Approval records
15. Deployment traceability

All artifacts should remain linked to the original business intent.

---

## 4. Product Principles

### 4.1 Human Authority, AI Execution

AI agents may perform engineering work, but humans remain responsible for business decisions, major scope changes, security exceptions, and production release approval.

### 4.2 Business-First Experience

Business users should not need to understand software architecture, databases, APIs, frameworks, or deployment infrastructure.

The platform should ask business questions first and technical questions only when appropriate.

### 4.3 Traceability by Default

Every technical artifact should be traceable to its parent requirement and subsequent implementation.

Example:

```text
Business Need
    ↓
UR-024
    ↓
DR-018
    ↓
API-009
    ↓
TASK-133
    ↓
Commit a82f91
    ↓
TEST-081
    ↓
SEC-021
    ↓
RELEASE-220
```

### 4.4 Governance Over Autonomy

The system should not optimize for maximum autonomy at the expense of control.

Agents must operate within explicit permissions and workflow boundaries.

### 4.5 Methodology-Agnostic Core

The MVP will implement Waterfall first, but the workflow engine must not be hardcoded specifically for Waterfall.

Future methodologies may include:

- Scrum
- Kanban
- Hybrid SDLC
- V-Model
- Custom enterprise workflows

### 4.6 Self-Hosted Friendly

Enterprise customers must be able to operate agent execution inside their own infrastructure when required.

---

## 5. Target Customers

### Primary Ideal Customer Profile

Large organizations that:

- Maintain many internal business applications
- Use formal SDLC processes
- Have separate development and production environments
- Work with internal developers and/or external vendors
- Require security review before production
- Need auditability and approval records
- Use DEV / QAS / PROD or similar environment separation
- Have proprietary source code or sensitive business processes
- Need controlled deployment processes

### Initial Industries

- Manufacturing
- Automotive
- Logistics
- Banking
- Insurance
- Telecommunications
- Enterprise IT departments
- Large supply-chain organizations

### Non-Primary Target

SDLCraft is not initially optimized for:

- Personal projects
- Simple landing pages
- Small business websites
- Simple CRUD applications
- Hobby developers
- Consumer no-code use cases

For these use cases, a complete governed SDLC would often be unnecessary overhead.

---

## 6. User Personas

### 6.1 Business User / Product Owner

**Goal:** Describe business problems and approve outcomes without understanding implementation details.

Needs:

- Simple requirement input
- Business-focused questions
- Easy approval/rejection
- Clear project status
- Visibility into delivered functionality

### 6.2 System Analyst

**Goal:** Validate AI-generated requirements and system design.

Needs:

- Requirement editor
- Design review
- Impact analysis
- Requirement-to-design traceability
- Ability to request changes

### 6.3 Developer / Engineering Lead

**Goal:** Review, supervise, or collaborate with AI-generated implementation.

Needs:

- Repository integration
- Diff review
- Build/test results
- Agent activity
- PR creation
- Technical artifact access

### 6.4 Security / Infrastructure Team

**Goal:** Ensure software meets security and deployment policies.

Needs:

- Security findings
- Vulnerability scan results
- Risk classification
- Evidence
- Approval/rejection
- Controlled runner access

### 6.5 Release Manager / Production Gatekeeper

**Goal:** Control production release without manually performing every engineering task.

Needs:

- Approved artifact
- Release history
- Environment status
- Deployment evidence
- Rollback readiness
- Production approval gate

### 6.6 Organization Administrator

**Goal:** Configure how SDLCraft operates inside the organization.

Needs:

- Organization configuration
- User roles
- Agent permissions
- Workflow templates
- Repository integrations
- Model providers
- Runner configuration
- Audit logs

---

## 7. Initial SDLC Model

The MVP will expose five primary phases:

```text
REQUIRE
   ↓
DESIGN
   ↓
BUILD
   ↓
VERIFY
   ↓
RELEASE
```

### 7.1 REQUIRE

Purpose:

Translate business intent into structured, approved requirements.

Outputs may include:

- User Requirement document
- Business rules
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Assumptions
- Dependencies
- Open questions

### 7.2 DESIGN

Purpose:

Translate approved requirements into implementable system design.

Outputs may include:

- Design Requirement
- System flow
- Architecture proposal
- API specification
- Database changes
- Integration design
- UI flow
- Impact analysis
- Technical constraints

### 7.3 BUILD

Purpose:

Implement the approved design.

Activities may include:

- Repository analysis
- Task generation
- Branch creation
- Source code modification
- Unit test creation
- Build execution
- Pull request creation

### 7.4 VERIFY

Purpose:

Validate functionality, quality, and security.

Activities may include:

- Code review
- Unit testing
- Integration testing
- Regression testing
- Requirement coverage verification
- Static security analysis
- Dependency scanning
- Secret scanning
- Optional vulnerability assessment
- Optional user acceptance validation

### 7.5 RELEASE

Purpose:

Prepare and control the release of an approved software artifact.

Activities may include:

- Release artifact generation
- Environment promotion
- Release notes
- Deployment checklist
- Human approval
- Deployment execution
- Health check
- Rollback metadata

---

## 8. Agent Model

Each AI agent must have a defined job scope.

Agents must not rely only on prompt instructions for access control.

Each agent definition consists of:

```text
AGENT.md
+ Input Schema
+ Output Schema
+ Tools
+ Permissions
+ Version
```

### 8.1 Requirement Agent

Responsibilities:

- Interview business user
- Clarify ambiguous requirements
- Generate structured requirements
- Identify missing business rules
- Produce acceptance criteria

Must not:

- Write implementation code
- Make major business decisions without user approval
- Deploy software

### 8.2 System Analyst Agent

Responsibilities:

- Transform approved requirements into design
- Identify integrations
- Define system behavior
- Produce technical specifications
- Perform impact analysis
- Maintain requirement traceability

Must not:

- Modify approved business intent without explicit approval
- Deploy production

### 8.3 Developer Agent

Responsibilities:

- Read approved requirements and design
- Inspect repository
- Modify source code
- Add tests
- Run build and tests
- Produce clean diff
- Create branch / pull request

Must not:

- Approve its own code
- Modify approved requirements silently
- Deploy production

### 8.4 Reviewer Agent

Responsibilities:

- Review code changes
- Check correctness
- Check maintainability
- Check design compliance
- Identify implementation risks
- Approve or reject technical changes

### 8.5 QA Agent

Responsibilities:

- Generate test scenarios
- Run available automated tests
- Verify acceptance criteria coverage
- Identify missing tests
- Report failures

### 8.6 Security Agent

Responsibilities:

- Run security scanners
- Interpret scanner output
- Classify findings
- Recommend remediation
- Block workflow according to policy

The Security Agent should rely on actual tools where possible, such as:

- Semgrep
- Gitleaks
- Trivy
- OWASP ZAP
- Dependency scanners

The LLM should interpret evidence, not invent security status.

### 8.7 Release Agent

Responsibilities:

- Prepare approved release artifacts
- Generate release notes
- Execute allowed deployment actions
- Perform post-deployment checks
- Record deployment result

Must not:

- Deploy to restricted environments without approval
- Modify source code during deployment

---

## 9. Workflow Engine

The workflow engine is the core orchestration layer of SDLCraft.

The engine must represent workflows generically.

Core concepts:

```text
Workflow
├── Stage
├── Task
├── Transition
├── Gate
├── Agent
├── Artifact
├── Approval
└── Policy
```

The MVP workflow will be Waterfall-based but implemented as configuration rather than hardcoded logic.

Example:

```text
REQUIRE
   ↓ approval_required
DESIGN
   ↓ approval_required
BUILD
   ↓
VERIFY
   ↓ approval_required
RELEASE
```

The engine must support:

- Sequential transitions
- Failed-state handling
- Rework loops
- Human approval gates
- Agent assignment
- Artifact requirements
- Policy-based blocking
- Retry
- Cancellation
- Versioned workflows

---

## 10. Human Approval Gates

Human approval is a first-class product feature.

Examples:

### Requirement Gate

```text
Requirement Generated

[Approve]
[Request Changes]
[Reject]
```

### Design Gate

```text
Design Ready

Impacted:
- 2 database tables
- 4 APIs
- 3 screens
- 12 tests

[Approve Design]
[Request Revision]
```

### Production Gate

```text
Release Candidate: 1.4.2

Build: PASSED
Tests: 148/148 PASSED
Security: PASSED
QAS: PASSED

[Approve Production Release]
[Reject]
```

Approval events must be recorded in the audit log.

---

## 11. Traceability Model

Traceability is a core differentiator.

The platform should maintain relationships between:

- Business need
- Requirement
- Design item
- Development task
- File change
- Commit
- Pull request
- Test case
- Security finding
- Artifact
- Release
- Deployment

Users should be able to answer questions such as:

- Why does this code exist?
- Which requirement introduced this API?
- Which tests cover this requirement?
- Which design was used for this implementation?
- Which release contains this change?
- Who approved this change?
- Which agent version created this artifact?

---

## 12. Artifact Management

SDLCraft will generate and manage artifacts such as:

- UR.md
- DR.md
- architecture.md
- OpenAPI specifications
- Database design
- Task plans
- Test reports
- Security reports
- Release notes
- Build artifacts
- Deployment evidence

Artifacts must support:

- Versioning
- Ownership
- Agent source
- Human modification
- Checksum
- Status
- Parent/child relationships

Suggested storage:

- PostgreSQL for metadata
- S3-compatible object storage for large files

---

## 13. Repository Integration

### MVP

Support GitHub first.

Capabilities:

- Connect repository
- Clone repository
- Read branch
- Create branch
- Commit
- Push
- Create pull request
- Read diff
- Read CI status

### Architecture Requirement

Repository integration must use a provider abstraction.

Example:

```ts
interface GitProvider {
  cloneRepository(): Promise<void>;
  createBranch(name: string): Promise<void>;
  commit(message: string): Promise<string>;
  push(): Promise<void>;
  createPullRequest(): Promise<string>;
  getDiff(): Promise<string>;
  getPipelineStatus(): Promise<string>;
}
```

Future providers:

- GitLab
- Azure DevOps
- Bitbucket
- Enterprise Git servers

---

## 14. Agent Execution & Sandbox

Agent code execution must not run directly inside the main API process.

Target architecture:

```text
Web
 ↓
API
 ↓
Queue
 ↓
Worker
 ↓
Sandbox
 ↓
Repository
```

Each development agent run should:

1. Receive a job
2. Create an isolated workspace
3. Clone repository
4. Load approved context
5. Execute allowed tools
6. Modify code
7. Run tests
8. Generate diff
9. Commit or create PR
10. Return structured result
11. Destroy or archive workspace

### MVP Sandbox

Docker-based isolated execution.

Future enterprise runner:

- Customer-managed VM
- On-prem runner
- Private cloud runner
- Air-gapped execution mode

---

## 15. Model Provider Strategy

SDLCraft must not be tied permanently to one LLM provider.

Define a provider abstraction.

Potential providers:

- OpenAI
- Anthropic
- Google
- Azure OpenAI
- Enterprise-hosted models
- Local/on-prem models

Agent identity is based on role, not model.

Example:

```text
Developer Agent
├── OpenAI model
├── Anthropic model
└── Enterprise approved model
```

The organization should eventually be able to assign approved models to specific agents.

---

## 16. MVP Scope

### Goal

Validate that SDLCraft can execute a controlled Waterfall lifecycle from business requirement to implementation-ready pull request with traceability and human approval.

### MVP Workflow

```text
Business Input
   ↓
Requirement Agent
   ↓
UR
   ↓
Human Approval
   ↓
System Analyst Agent
   ↓
DR
   ↓
Human Approval
   ↓
Developer Agent
   ↓
Reviewer Agent
   ↓
QA Agent
   ↓
Security Agent
   ↓
Pull Request Ready
```

### MVP Must-Have Features

#### Organization & User

- Basic authentication
- Organization
- Organization membership
- Basic roles

#### Project

- Create project
- Project dashboard
- Connect GitHub repository
- Project status
- Project activity timeline

#### Requirement

- Business requirement input
- AI clarification questions
- Generated UR
- Requirement versioning
- Approval/revision

#### Design

- Generate DR from approved UR
- Design versioning
- Impact analysis
- Approval/revision

#### Agent Execution

- Requirement Agent
- System Analyst Agent
- Developer Agent
- Reviewer Agent
- QA Agent
- Basic Security Agent

#### Workflow

- Waterfall template
- Stage status
- Approval gate
- Retry
- Failure
- Rework loop

#### Development

- Clone repository
- Create branch
- Modify files
- Run build
- Run tests
- Generate diff
- Create pull request

#### Verification

- Reviewer findings
- Test result
- Basic secret scan
- Basic static analysis
- Security finding status

#### Audit

- Agent run history
- Artifact version history
- Approval history
- Timeline

---

## 17. MVP Out of Scope

The following are intentionally excluded from v0.1:

- Scrum
- Kanban
- Custom workflow builder
- Automatic production deployment
- Kubernetes integration
- Desktop application
- Multi-cloud deployment
- Full enterprise SSO
- SCIM
- Advanced RBAC
- Advanced billing
- Full VA/penetration testing
- Native GitLab integration
- Native Azure DevOps integration
- Mobile app
- Real-time collaborative document editing
- Fully autonomous production changes

---

## 18. Primary User Experience

### 18.1 Create Project

User enters:

- Project name
- Business context
- Repository
- Application type
- Criticality
- Sensitive data indicator
- External integration indicator

Methodology in MVP:

```text
Waterfall
```

Future:

```text
Waterfall
Scrum
Kanban
Custom
```

### 18.2 Describe Business Need

Example:

```text
Operators currently input receiving data manually.
I want them to scan a manifest barcode and automatically
validate the delivery before receiving it.
```

### 18.3 AI Requirement Interview

Example:

```text
1. What should happen if the manifest does not exist?
2. Can a manifest be scanned more than once?
3. Which roles may perform Goods Receive?
4. Does receiving immediately update inventory?
```

### 18.4 Requirement Approval

User sees:

```text
12 Requirements
4 Business Rules
3 Edge Cases
2 External Dependencies

[Approve]
[Request Changes]
```

### 18.5 Design

SDLCraft generates:

- Flow
- API
- Data changes
- Dependencies
- Impact analysis

### 18.6 Build

Developer Agent works in repository sandbox.

User sees:

```text
Analyzing repository
✓ Complete

Creating implementation plan
✓ Complete

Editing backend
✓ Complete

Editing frontend
● Running

Tests
○ Waiting
```

### 18.7 Verify

Reviewer / QA / Security findings are displayed.

### 18.8 Completion

MVP completion state:

```text
Pull Request Ready

Requirement Coverage: 100%
Build: Passed
Tests: Passed
Security Gate: Passed

[Open Pull Request]
```

---

## 19. Product Dashboard

Example:

```text
Project: Warehouse Management

REQUIRE
████████████████ 100% ✓

DESIGN
████████████████ 100% ✓

BUILD
████████████░░░░ 75%

VERIFY
██████░░░░░░░░░░ 40%

RELEASE
░░░░░░░░░░░░░░░░ Pending
```

Activity:

```text
13:31 Requirement Agent
Added 3 missing business rules.

13:35 System Analyst Agent
Generated database impact analysis.

13:42 Developer Agent
Created branch feature/receive-manifest.

13:49 Reviewer Agent
Rejected implementation:
Missing authorization validation.

13:56 Developer Agent
Resolved reviewer finding.

14:02 QA Agent
42/42 tests passed.
```

---

## 20. Roles & Permissions

Initial roles:

### Organization Admin

- Configure organization
- Manage users
- Manage providers
- Configure runners

### Project Owner

- Create project
- Approve requirements
- Approve design
- View all artifacts

### Analyst

- Edit requirements
- Edit design
- Request revisions

### Developer

- View implementation
- Review diffs
- Collaborate with developer agent

### Security Reviewer

- Review findings
- Approve security gate

### Viewer

- Read-only access

Agent permissions must be enforced independently from human roles.

---

## 21. Audit Requirements

Every important action should be auditable.

Example record:

```text
Event:
DesignApproved

Project:
project_123

Artifact:
DR-018 v2

Approved By:
user_291

Generated By:
SystemAnalystAgent v0.4.1

Model:
provider/model-version

Timestamp:
2026-09-16T14:31:22+07:00
```

Audit should eventually include:

- User actions
- Agent actions
- Tool calls
- Approval events
- Repository actions
- Security gate changes
- Release actions
- Configuration changes

---

## 22. Security Requirements

### MVP

- HTTPS
- Secure session/authentication
- Encrypted secrets
- Repository token isolation
- Agent permission enforcement
- Docker sandbox isolation
- Secret scanning
- Dependency security scanning
- Audit logging
- No production deployment

### Future Enterprise

- SAML / OIDC SSO
- SCIM
- Advanced RBAC
- Customer-managed encryption keys
- Private networking
- Self-hosted control plane
- Self-hosted runner
- Air-gapped deployment
- Model allowlist
- Policy engine
- Artifact signing
- Deployment signing
- Secret vault integration

---

## 23. Proposed Technical Architecture

### Recommended MVP Stack

#### Runtime

- Bun
- TypeScript

#### Frontend

- React
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

#### Backend

- NestJS
- Fastify
- REST
- OpenAPI

#### Database

- PostgreSQL
- Drizzle ORM

#### Queue

- Redis
- BullMQ

#### Agent Runtime

- TypeScript
- Provider abstraction
- Docker sandbox

#### Storage

- S3-compatible storage
- MinIO for development/self-hosted environment

#### Repository

- GitHub first
- Provider abstraction

#### Infrastructure

- Docker Compose
- GitHub Actions

---

## 24. Application Architecture

SDLCraft should begin as a **modular monolith with separate worker execution**.

```text
                     ┌─────────────┐
                     │ React Web   │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │ API         │
                     │ NestJS      │
                     │ Modular     │
                     │ Monolith    │
                     └──────┬──────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
       PostgreSQL         Redis        Object Storage
                            │
                            ▼
                     ┌──────────────┐
                     │ Agent Worker │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ Docker       │
                     │ Sandbox      │
                     └──────┬───────┘
                            │
                       Git Provider
```

Do not start with full microservices.

Services should only be extracted when scale, security boundaries, or deployment requirements justify them.

---

## 25. Suggested Monorepo Structure

```text
sdlcraft/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
│
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
│
├── agents/
│   ├── requirement/
│   │   ├── AGENT.md
│   │   ├── schema.ts
│   │   ├── tools.ts
│   │   └── index.ts
│   │
│   ├── system-analyst/
│   ├── developer/
│   ├── reviewer/
│   ├── qa/
│   └── security/
│
├── workflows/
│   └── waterfall/
│
├── infra/
│   ├── docker/
│   └── compose/
│
└── docs/
```

---

## 26. Core Data Entities

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

---

## 27. Non-Functional Requirements

### Reliability

- Workflow state must survive application restart.
- Failed agent jobs must be retryable.
- Agent execution must be idempotent where practical.

### Scalability

- API and workers must scale independently.
- Agent runners must support horizontal scaling.
- Repository execution must not block API requests.

### Security

- Least privilege by default.
- Strong tenant isolation.
- No shared credentials between organizations.
- Agents cannot exceed configured tool permissions.

### Observability

- Structured logging
- Agent run status
- Queue monitoring
- Execution duration
- Token/model usage
- Tool-call history
- Error traceability

### Performance

- UI interactions should feel responsive.
- Long-running agent jobs should run asynchronously.
- Users must receive live or near-live progress updates.

---

## 28. Success Metrics

### MVP Technical Success

- A user can create a project.
- A business need can be converted into approved UR.
- Approved UR can be converted into DR.
- Developer Agent can modify a real Git repository.
- Build and tests can execute in sandbox.
- Reviewer Agent can reject an implementation.
- Developer Agent can repair rejected work.
- QA and Security Agents can produce structured findings.
- SDLCraft can create a pull request.
- All major artifacts remain traceable.

### Product Success

Possible early metrics:

- Time from requirement input to PR
- Percentage of generated requirements accepted without major rewrite
- Percentage of agent-generated code accepted
- Number of human interventions per workflow
- Agent failure/retry rate
- Requirement-to-test coverage
- Average review cycles
- Security findings found before PR
- Customer time saved
- Lead time reduction

---

## 29. Future Roadmap

### v0.1 — Waterfall MVP

- Requirement Agent
- System Analyst Agent
- Developer Agent
- Reviewer Agent
- QA Agent
- Security Agent
- GitHub
- Human approvals
- PR generation

### v0.2 — Iterative Waterfall

- Change requests
- Requirement impact analysis
- Design impact analysis
- Rework propagation
- Better security tooling

### v0.3 — Agile / Scrum

- Epic
- User story
- Acceptance criteria
- Sprint
- Backlog
- Sprint agent workflows

### v0.4 — Enterprise Workflow Builder

Allow organizations to define flows such as:

```text
UR
→ DR
→ Architecture Review
→ Development
→ SIT
→ UAT
→ Security
→ CAB
→ Production
```

### v0.5 — Private Enterprise Runner

- Customer-hosted runner
- Internal GitLab
- Internal model gateway
- Private network access

### v1.0 — Enterprise Agentic SDLC Control Plane

- Multiple methodology templates
- Custom workflows
- Enterprise RBAC
- SSO
- Audit
- Self-hosting
- Production release controls
- Policy engine
- Advanced analytics

---

## 30. Business Model Direction

Initial positioning:

> **B2B Enterprise**

Possible commercial model:

```text
Annual Platform License
+
AI / Agent Usage
+
Enterprise Add-ons
+
Implementation / Support
```

Potential packages:

### Pilot

- One project
- Waterfall workflow
- Core agents
- Git integration
- Basic audit

### Team

- Multiple projects
- Team collaboration
- More agent usage
- Organization management

### Enterprise

- Custom workflow
- SSO
- Advanced RBAC
- Private runner
- Self-hosted deployment
- Security policies
- Advanced audit
- Premium support

---

## 31. Product Positioning

Avoid positioning as:

- AI coding assistant
- AI IDE
- No-code builder
- Website generator
- Generic autonomous coding agent

Preferred positioning:

> **SDLCraft is an Agentic SDLC Control Plane for enterprise software delivery.**

Alternative:

> **Turn business intent into governed software delivery using an AI engineering team.**

Core differentiation:

- Business-first
- Human-controlled
- Multi-agent
- Requirement traceability
- Enterprise workflow
- Security gates
- Self-hosted execution
- Model agnostic
- Repository agnostic
- Auditability

---

## 32. Key Product Hypothesis

The core hypothesis behind SDLCraft is:

> Enterprise customers do not primarily need another AI coding assistant. They need a governed system that coordinates AI agents across the entire software development lifecycle while preserving human authority, security, traceability, and organizational process.

The MVP should validate this hypothesis before expanding into broader methodologies or production automation.

---

## 33. MVP Definition of Done

SDLCraft v0.1 is considered functionally complete when a user can:

1. Sign in
2. Create an organization
3. Create a project
4. Connect a GitHub repository
5. Describe a business requirement
6. Answer clarification questions
7. Review and approve generated UR
8. Generate DR
9. Review and approve DR
10. Trigger development
11. Observe Developer Agent activity
12. Receive Reviewer Agent findings
13. Automatically loop rejected work back to Developer Agent
14. Run QA verification
15. Run basic security scanning
16. Produce an approved implementation
17. Create a pull request
18. Trace the PR back to its original business requirement
19. View a complete audit timeline

Production deployment is explicitly excluded from v0.1.

---

## 34. Final MVP Principle

SDLCraft should prove one thing first:

> A business requirement can move through a structured, governed SDLC and become a traceable, reviewable software implementation with most execution performed by specialized AI agents and critical decisions retained by humans.

Everything that does not directly help validate this should be considered secondary for the MVP.
