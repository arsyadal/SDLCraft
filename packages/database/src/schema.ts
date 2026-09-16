import {
  foreignKey,
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
// updatedAt columns are maintained by the set_updated_at trigger in the initial migration.

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
  uniqueIndex("projects_organization_id_unique").on(table.organizationId, table.id),
  uniqueIndex("projects_organization_slug_unique").on(table.organizationId, table.slug),
  index("projects_organization_idx").on(table.organizationId),
]);

export const projectMembers = pgTable("project_members", {
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.projectId, table.userId] }),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "project_members_project_tenant_fk",
  }),
]);

export const workflowTemplates = pgTable("workflow_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  name: text("name").notNull(),
  definition: jsonb("definition").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("workflow_templates_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("workflow_templates_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "workflow_templates_project_tenant_fk",
  }),
]);

export const workflowStages = pgTable("workflow_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowTemplateId: uuid("workflow_template_id").notNull(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  definition: jsonb("definition").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("workflow_stages_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  uniqueIndex("workflow_stages_template_name_unique").on(table.workflowTemplateId, table.name),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "workflow_stages_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowTemplateId],
    foreignColumns: [workflowTemplates.organizationId, workflowTemplates.projectId, workflowTemplates.id],
    name: "workflow_stages_template_tenant_fk",
  }),
]);

export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowTemplateId: uuid("workflow_template_id").notNull(),
  status: text("status").notNull(),
  context: jsonb("context").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("workflow_runs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("workflow_runs_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "workflow_runs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowTemplateId],
    foreignColumns: [workflowTemplates.organizationId, workflowTemplates.projectId, workflowTemplates.id],
    name: "workflow_runs_template_tenant_fk",
  }),
]);

export const workflowStageRuns = pgTable("workflow_stage_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowRunId: uuid("workflow_run_id").notNull(),
  stageId: uuid("stage_id").notNull(),
  status: text("status").notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("workflow_stage_runs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "workflow_stage_runs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowRunId],
    foreignColumns: [workflowRuns.organizationId, workflowRuns.projectId, workflowRuns.id],
    name: "workflow_stage_runs_run_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.stageId],
    foreignColumns: [workflowStages.organizationId, workflowStages.projectId, workflowStages.id],
    name: "workflow_stage_runs_stage_tenant_fk",
  }),
]);

export const requirements = pgTable("requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("requirements_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "requirements_project_tenant_fk",
  }),
]);

export const requirementVersions = pgTable("requirement_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  requirementId: uuid("requirement_id").notNull(),
  version: integer("version").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("requirement_versions_requirement_version_unique").on(table.requirementId, table.version),
  uniqueIndex("requirement_versions_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "requirement_versions_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.requirementId],
    foreignColumns: [requirements.organizationId, requirements.projectId, requirements.id],
    name: "requirement_versions_requirement_tenant_fk",
  }),
]);

export const designs = pgTable("designs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("designs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "designs_project_tenant_fk",
  }),
]);

export const designVersions = pgTable("design_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  designId: uuid("design_id").notNull(),
  version: integer("version").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("design_versions_design_version_unique").on(table.designId, table.version),
  uniqueIndex("design_versions_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "design_versions_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.designId],
    foreignColumns: [designs.organizationId, designs.projectId, designs.id],
    name: "design_versions_design_tenant_fk",
  }),
]);

export const artifacts = pgTable("artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("artifacts_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("artifacts_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "artifacts_project_tenant_fk",
  }),
]);

export const artifactVersions = pgTable("artifact_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  artifactId: uuid("artifact_id").notNull(),
  version: integer("version").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("artifact_versions_artifact_version_unique").on(table.artifactId, table.version),
  uniqueIndex("artifact_versions_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "artifact_versions_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactId],
    foreignColumns: [artifacts.organizationId, artifacts.projectId, artifacts.id],
    name: "artifact_versions_artifact_tenant_fk",
  }),
]);

export const artifactLinks = pgTable("artifact_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  sourceVersionId: uuid("source_version_id").notNull(),
  targetVersionId: uuid("target_version_id").notNull(),
  relation: text("relation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("artifact_links_source_target_relation_unique").on(table.sourceVersionId, table.targetVersionId, table.relation),
  uniqueIndex("artifact_links_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "artifact_links_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.sourceVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "artifact_links_source_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.targetVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "artifact_links_target_tenant_fk",
  }),
]);

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  configuration: jsonb("configuration").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("agents_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  uniqueIndex("agents_project_name_unique").on(table.organizationId, table.projectId, table.name),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "agents_project_tenant_fk",
  }),
]);

export const agentVersions = pgTable("agent_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  agentId: uuid("agent_id").notNull(),
  version: integer("version").notNull(),
  configuration: jsonb("configuration").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("agent_versions_agent_version_unique").on(table.agentId, table.version),
  uniqueIndex("agent_versions_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "agent_versions_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.agentId],
    foreignColumns: [agents.organizationId, agents.projectId, agents.id],
    name: "agent_versions_agent_tenant_fk",
  }),
]);

export const agentJobs = pgTable("agent_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowRunId: uuid("workflow_run_id"),
  agentId: uuid("agent_id").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  status: text("status").notNull(),
  input: jsonb("input").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("agent_jobs_idempotency_unique").on(table.organizationId, table.idempotencyKey),
  uniqueIndex("agent_jobs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "agent_jobs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowRunId],
    foreignColumns: [workflowRuns.organizationId, workflowRuns.projectId, workflowRuns.id],
    name: "agent_jobs_workflow_run_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.agentId],
    foreignColumns: [agents.organizationId, agents.projectId, agents.id],
    name: "agent_jobs_agent_tenant_fk",
  }),
]);

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  jobId: uuid("job_id").notNull(),
  attempt: integer("attempt").notNull(),
  status: text("status").notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("agent_runs_job_attempt_unique").on(table.jobId, table.attempt),
  uniqueIndex("agent_runs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "agent_runs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.jobId],
    foreignColumns: [agentJobs.organizationId, agentJobs.projectId, agentJobs.id],
    name: "agent_runs_job_tenant_fk",
  }),
]);

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  artifactVersionId: uuid("artifact_version_id").notNull(),
  gate: text("gate").notNull(),
  decision: text("decision").notNull(),
  reviewerId: uuid("reviewer_id").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("approvals_gate_version_unique").on(table.artifactVersionId, table.gate),
  uniqueIndex("approvals_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "approvals_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "approvals_artifact_version_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.reviewerId],
    foreignColumns: [projectMembers.organizationId, projectMembers.projectId, projectMembers.userId],
    name: "approvals_reviewer_project_member_fk",
  }),
]);

export const repositoryConnections = pgTable("repository_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  credentials: jsonb("credentials").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("repository_connections_provider_external_unique").on(table.organizationId, table.provider, table.externalId),
  uniqueIndex("repository_connections_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "repository_connections_project_tenant_fk",
  }),
]);

export const repositories = pgTable("repositories", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  connectionId: uuid("connection_id").notNull(),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  url: text("url").notNull(),
  defaultBranch: text("default_branch").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("repositories_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  uniqueIndex("repositories_connection_external_unique").on(table.connectionId, table.externalId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "repositories_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.connectionId],
    foreignColumns: [repositoryConnections.organizationId, repositoryConnections.projectId, repositoryConnections.id],
    name: "repositories_connection_tenant_fk",
  }),
]);

export const repositoryBranches = pgTable("repository_branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  repositoryId: uuid("repository_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("repository_branches_repository_name_unique").on(table.repositoryId, table.name),
  uniqueIndex("repository_branches_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "repository_branches_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.repositoryId],
    foreignColumns: [repositories.organizationId, repositories.projectId, repositories.id],
    name: "repository_branches_repository_tenant_fk",
  }),
]);

export const pullRequests = pgTable("pull_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  repositoryId: uuid("repository_id").notNull(),
  artifactVersionId: uuid("artifact_version_id"),
  externalId: text("external_id").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("pull_requests_repository_external_unique").on(table.repositoryId, table.externalId),
  uniqueIndex("pull_requests_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "pull_requests_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.repositoryId],
    foreignColumns: [repositories.organizationId, repositories.projectId, repositories.id],
    name: "pull_requests_repository_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "pull_requests_artifact_version_tenant_fk",
  }),
]);

export const testRuns = pgTable("test_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowRunId: uuid("workflow_run_id"),
  repositoryId: uuid("repository_id"),
  suite: text("suite").notNull(),
  status: text("status").notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("test_runs_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("test_runs_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "test_runs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowRunId],
    foreignColumns: [workflowRuns.organizationId, workflowRuns.projectId, workflowRuns.id],
    name: "test_runs_workflow_run_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.repositoryId],
    foreignColumns: [repositories.organizationId, repositories.projectId, repositories.id],
    name: "test_runs_repository_tenant_fk",
  }),
]);

export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  testRunId: uuid("test_run_id").notNull(),
  artifactVersionId: uuid("artifact_version_id"),
  name: text("name").notNull(),
  status: text("status").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("test_results_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("test_results_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "test_results_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.testRunId],
    foreignColumns: [testRuns.organizationId, testRuns.projectId, testRuns.id],
    name: "test_results_test_run_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "test_results_artifact_version_tenant_fk",
  }),
]);

export const securityScans = pgTable("security_scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workflowRunId: uuid("workflow_run_id"),
  tool: text("tool").notNull(),
  status: text("status").notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("security_scans_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("security_scans_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "security_scans_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.workflowRunId],
    foreignColumns: [workflowRuns.organizationId, workflowRuns.projectId, workflowRuns.id],
    name: "security_scans_workflow_run_tenant_fk",
  }),
]);

export const securityFindings = pgTable("security_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  securityScanId: uuid("security_scan_id").notNull(),
  artifactVersionId: uuid("artifact_version_id"),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("security_findings_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  index("security_findings_project_idx").on(table.organizationId, table.projectId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "security_findings_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.securityScanId],
    foreignColumns: [securityScans.organizationId, securityScans.projectId, securityScans.id],
    name: "security_findings_scan_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "security_findings_artifact_version_tenant_fk",
  }),
]);

export const releaseCandidates = pgTable("release_candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  artifactVersionId: uuid("artifact_version_id").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("release_candidates_project_version_unique").on(table.projectId, table.version),
  uniqueIndex("release_candidates_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "release_candidates_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.artifactVersionId],
    foreignColumns: [artifactVersions.organizationId, artifactVersions.projectId, artifactVersions.id],
    name: "release_candidates_artifact_version_tenant_fk",
  }),
]);

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  releaseCandidateId: uuid("release_candidate_id").notNull(),
  environment: text("environment").notNull(),
  status: text("status").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("deployments_release_environment_unique").on(table.releaseCandidateId, table.environment),
  uniqueIndex("deployments_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "deployments_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.organizationId, table.projectId, table.releaseCandidateId],
    foreignColumns: [releaseCandidates.organizationId, releaseCandidates.projectId, releaseCandidates.id],
    name: "deployments_release_candidate_tenant_fk",
  }),
]);

export const auditResources = pgTable("audit_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceKey: text("resource_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("audit_resources_tenant_id_unique").on(table.organizationId, table.projectId, table.id),
  uniqueIndex("audit_resources_type_key_unique").on(table.organizationId, table.projectId, table.resourceType, table.resourceKey),
  uniqueIndex("audit_resources_id_type_unique").on(table.id, table.resourceType),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "audit_resources_project_tenant_fk",
  }),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  projectId: uuid("project_id").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  resourceId: uuid("resource_id").notNull(),
  resourceType: text("resource_type").notNull(),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_resource_idx").on(table.organizationId, table.projectId, table.resourceType, table.resourceId),
  foreignKey({
    columns: [table.organizationId, table.projectId],
    foreignColumns: [projects.organizationId, projects.id],
    name: "audit_logs_project_tenant_fk",
  }),
  foreignKey({
    columns: [table.resourceId, table.resourceType],
    foreignColumns: [auditResources.id, auditResources.resourceType],
    name: "audit_logs_resource_fk",
  }),
]);
