import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";


export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("organizations_slug_unique").on(table.slug)]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const memberships = pgTable("organization_memberships", {
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.organizationId, table.userId] })]);
export const membership = memberships;

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("projects_organization_slug_unique").on(table.organizationId, table.slug),
  index("projects_organization_idx").on(table.organizationId),
]);

export const workflowTemplates = pgTable("workflow_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  definition: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("workflow_templates_project_idx").on(table.organizationId, table.projectId)]);

export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  workflowTemplateId: uuid("workflow_template_id").notNull().references(() => workflowTemplates.id),
  status: text("status").notNull(),
  context: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("workflow_runs_project_idx").on(table.organizationId, table.projectId)]);

export const requirementVersions = pgTable("requirement_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  version: integer("version").notNull(),
  content: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("requirement_versions_project_version_unique").on(table.projectId, table.version)]);

export const designVersions = pgTable("design_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  version: integer("version").notNull(),
  content: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("design_versions_project_version_unique").on(table.projectId, table.version)]);

export const artifacts = pgTable("artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("artifacts_project_idx").on(table.organizationId, table.projectId)]);

export const artifactVersions = pgTable("artifact_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  artifactId: uuid("artifact_id").notNull().references(() => artifacts.id),
  version: integer("version").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("artifact_versions_artifact_version_unique").on(table.artifactId, table.version)]);

export const artifactLinks = pgTable("artifact_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  sourceVersionId: uuid("source_version_id").notNull().references(() => artifactVersions.id),
  targetVersionId: uuid("target_version_id").notNull().references(() => artifactVersions.id),
  relation: text("relation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("artifact_links_source_target_relation_unique").on(table.sourceVersionId, table.targetVersionId, table.relation)]);

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  configuration: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("agents_project_name_unique").on(table.projectId, table.name)]);

export const agentJobs = pgTable("agent_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  workflowRunId: uuid("workflow_run_id").references(() => workflowRuns.id),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  idempotencyKey: text("idempotency_key").notNull(),
  status: text("status").notNull(),
  input: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("agent_jobs_idempotency_unique").on(table.organizationId, table.idempotencyKey)]);

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  jobId: uuid("job_id").notNull().references(() => agentJobs.id),
  attempt: integer("attempt").notNull(),
  status: text("status").notNull(),
  output: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("agent_runs_job_attempt_unique").on(table.jobId, table.attempt)]);

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  artifactVersionId: uuid("artifact_version_id").notNull().references(() => artifactVersions.id),
  gate: text("gate").notNull(),
  decision: text("decision").notNull(),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("approvals_gate_version_unique").on(table.artifactVersionId, table.gate)]);

export const repositories = pgTable("repositories", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  url: text("url").notNull(),
  defaultBranch: text("default_branch").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("repositories_provider_external_unique").on(table.organizationId, table.provider, table.externalId)]);

export const pullRequests = pgTable("pull_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  repositoryId: uuid("repository_id").notNull().references(() => repositories.id),
  artifactVersionId: uuid("artifact_version_id").references(() => artifactVersions.id),
  externalId: text("external_id").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("pull_requests_repository_external_unique").on(table.repositoryId, table.externalId)]);

export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  artifactVersionId: uuid("artifact_version_id").references(() => artifactVersions.id),
  suite: text("suite").notNull(),
  status: text("status").notNull(),
  details: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("test_results_project_idx").on(table.organizationId, table.projectId)]);

export const securityFindings = pgTable("security_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  artifactVersionId: uuid("artifact_version_id").references(() => artifactVersions.id),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("security_findings_project_idx").on(table.organizationId, table.projectId)]);

export const releaseCandidates = pgTable("release_candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  artifactVersionId: uuid("artifact_version_id").notNull().references(() => artifactVersions.id),
  version: text("version").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("release_candidates_project_version_unique").on(table.projectId, table.version)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").references(() => projects.id),
  actorId: uuid("actor_id").references(() => users.id),
  artifactId: uuid("artifact_id").references(() => artifacts.id),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  action: text("action").notNull(),
  metadata: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("audit_logs_resource_idx").on(table.organizationId, table.resourceType, table.resourceId)]);
