import { describe, expect, test } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  agentJobs,
  agentRuns,
  agentVersions,
  agents,
  approvals,
  artifactLinks,
  artifactVersions,
  artifacts,
  auditLogs,
  auditResources,
  deployments,
  designVersions,
  designs,
  memberships,
  organizations,
  projectMembers,
  projects,
  pullRequests,
  releaseCandidates,
  repositories,
  repositoryBranches,
  repositoryConnections,
  requirementVersions,
  requirements,
  securityFindings,
  securityScans,
  testResults,
  testRuns,
  users,
  workflowRuns,
  workflowStageRuns,
  workflowStages,
  workflowTemplates,
} from "./schema";

type Table = Parameters<typeof getTableConfig>[0];

const tableConfig = (table: Table) => getTableConfig(table);
const columnName = (column: unknown): string => {
  if (typeof column === "object" && column !== null && "name" in column && typeof column.name === "string") {
    return column.name;
  }
  throw new Error("Expected a named Drizzle column");
};
const tableColumns = (table: Table) => tableConfig(table).columns.map((column) => column.name);
const foreignKeyPairs = (table: Table) => tableConfig(table).foreignKeys.map((foreignKey) => ({
  columns: foreignKey.reference().columns.map((column) => column.name),
  foreignColumns: foreignKey.reference().foreignColumns.map((column) => column.name),
}));
const indexColumns = (table: Table) => tableConfig(table).indexes.map((index) => ({
  columns: index.config.columns.map(columnName),
  unique: index.config.unique,
}));

const requiredTables = {
  organizations,
  users,
  memberships,
  projects,
  projectMembers,
  workflowTemplates,
  workflowStages,
  workflowRuns,
  workflowStageRuns,
  requirements,
  requirementVersions,
  designs,
  designVersions,
  artifacts,
  artifactVersions,
  artifactLinks,
  agents,
  agentVersions,
  agentJobs,
  agentRuns,
  approvals,
  repositoryConnections,
  repositories,
  repositoryBranches,
  pullRequests,
  testRuns,
  testResults,
  securityScans,
  securityFindings,
  releaseCandidates,
  deployments,
  auditResources,
  auditLogs,
} as const;

const tenantProjectTables = [

  projectMembers,
  workflowTemplates,
  workflowStages,
  workflowRuns,
  workflowStageRuns,
  requirements,
  requirementVersions,
  designs,
  designVersions,
  artifacts,
  artifactVersions,
  artifactLinks,
  agents,
  agentVersions,
  agentJobs,
  agentRuns,
  approvals,
  repositoryConnections,
  repositories,
  repositoryBranches,
  pullRequests,
  testRuns,
  testResults,
  securityScans,
  securityFindings,
  releaseCandidates,
  deployments,
] as const;

describe("database schema", () => {
  test("exports every PRD entity as a table", () => {
    expect(Object.values(requiredTables).map((table) => tableConfig(table).name)).toEqual([
      "organizations",
      "users",
      "organization_memberships",
      "projects",
      "project_members",
      "workflow_templates",
      "workflow_stages",
      "workflow_runs",
      "workflow_stage_runs",
      "requirements",
      "requirement_versions",
      "designs",
      "design_versions",
      "artifacts",
      "artifact_versions",
      "artifact_links",
      "agents",
      "agent_versions",
      "agent_jobs",
      "agent_runs",
      "approvals",
      "repository_connections",
      "repositories",
      "repository_branches",
      "pull_requests",
      "test_runs",
      "test_results",
      "security_scans",
      "security_findings",
      "release_candidates",
      "deployments",
      "audit_resources",
      "audit_logs",
    ]);
  });

  test("keeps tenant ownership columns on every project-scoped record", () => {
    for (const table of tenantProjectTables) {
      expect(tableColumns(table), tableConfig(table).name).toEqual(expect.arrayContaining([
        "organization_id",
        "project_id",
      ]));
      expect(foreignKeyPairs(table), tableConfig(table).name).toContainEqual({
        columns: ["organization_id", "project_id"],
        foreignColumns: ["organization_id", "id"],
      });
    }
  });

  test("anchors artifact, workflow, repository, and audit relationships with composite foreign keys", () => {
    expect(foreignKeyPairs(artifactVersions)).toContainEqual({
      columns: ["organization_id", "project_id", "artifact_id"],
      foreignColumns: ["organization_id", "project_id", "id"],
    });
    expect(foreignKeyPairs(artifactLinks)).toEqual(expect.arrayContaining([
      { columns: ["organization_id", "project_id", "source_version_id"], foreignColumns: ["organization_id", "project_id", "id"] },
      { columns: ["organization_id", "project_id", "target_version_id"], foreignColumns: ["organization_id", "project_id", "id"] },
    ]));
    expect(foreignKeyPairs(workflowStageRuns)).toEqual(expect.arrayContaining([
      { columns: ["organization_id", "project_id", "workflow_run_id"], foreignColumns: ["organization_id", "project_id", "id"] },
      { columns: ["organization_id", "project_id", "stage_id"], foreignColumns: ["organization_id", "project_id", "id"] },
    ]));
    expect(foreignKeyPairs(pullRequests)).toContainEqual({
      columns: ["organization_id", "project_id", "repository_id"],
      foreignColumns: ["organization_id", "project_id", "id"],
    });
    expect(foreignKeyPairs(projectMembers)).toContainEqual({
      columns: ["organization_id", "user_id"],
      foreignColumns: ["organization_id", "user_id"],
    });
    expect(foreignKeyPairs(auditLogs)).toContainEqual({
      columns: ["organization_id", "project_id", "resource_id", "resource_type"],
      foreignColumns: ["organization_id", "project_id", "id", "resource_type"],
    });
    expect(tableColumns(auditResources)).toEqual(expect.arrayContaining([
      "id", "organization_id", "project_id", "resource_type", "resource_key",
    ]));
  });

  test("retains required uniqueness constraints", () => {
    expect(indexColumns(artifactVersions)).toContainEqual({ columns: ["artifact_id", "version"], unique: true });
    expect(indexColumns(approvals)).toContainEqual({ columns: ["artifact_version_id", "gate"], unique: true });
    expect(indexColumns(agentJobs)).toContainEqual({ columns: ["organization_id", "idempotency_key"], unique: true });
    expect(indexColumns(repositoryConnections)).toContainEqual({
      columns: ["organization_id", "provider", "external_id"],
      unique: true,
    });
    expect(indexColumns(repositoryBranches)).toContainEqual({
      columns: ["repository_id", "name"],
      unique: true,
    });
  });
});
