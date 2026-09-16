import { describe, expect, test } from "vitest";
import {
  approvalIdSchema,
  artifactIdSchema,
  artifactVersionIdSchema,
  organizationIdSchema,
  projectIdSchema,
  userIdSchema,
  type ApprovalId,
} from "./identifiers";
import {
  artifactSchema,
  artifactStatusSchema,
  artifactTypeSchema,
  artifactVersionSchema,
} from "./artifacts";
import {
  approvalSchema,
  artifactLinkSchema,
  workflowEventNameSchema,
  workflowEventSchema,
} from "./workflow";
import { agentJobSchema } from "./agent-runs";
import { apiErrorSchema } from "./api";

const organizationId = "00000000-0000-4000-8000-000000000001";
const projectId = "00000000-0000-4000-8000-000000000002";
const artifactId = "00000000-0000-4000-8000-000000000003";
const artifactVersionId = "00000000-0000-4000-8000-000000000004";
const workflowRunId = "00000000-0000-4000-8000-000000000005";
const workflowTemplateId = "00000000-0000-4000-8000-000000000006";
const agentId = "00000000-0000-4000-8000-000000000007";
const agentJobId = "00000000-0000-4000-8000-000000000008";
const agentRunId = "00000000-0000-4000-8000-000000000009";
const approvalId = "00000000-0000-4000-8000-000000000010";
const userId = "00000000-0000-4000-8000-000000000011";

const validIdentity = {
  organizationId: organizationIdSchema.parse(organizationId),
  projectId: projectIdSchema.parse(projectId),
  artifactId: artifactIdSchema.parse(artifactId),
  artifactVersionId: artifactVersionIdSchema.parse(artifactVersionId),
  userId: userIdSchema.parse(userId),
  approvalId: approvalIdSchema.parse(approvalId),
};

describe("artifact contracts", () => {
  test("accepts a versioned user requirement", () => {
    expect(artifactTypeSchema.parse("user_requirement")).toBe("user_requirement");
    expect(artifactStatusSchema.parse("approved")).toBe("approved");
    expect(
      artifactVersionSchema.parse({
        id: validIdentity.artifactVersionId,
        artifactId: validIdentity.artifactId,
        version: 1,
        payload: { requirement: "Users can sign in" },
        createdAt: "2026-09-16T00:00:00.000Z",
      }).version,
    ).toBe(1);
  });

  test("rejects unknown types, invalid identifiers, and non-positive versions", () => {
    expect(() => artifactTypeSchema.parse("unknown")).toThrow();
    expect(() => organizationIdSchema.parse("not-a-uuid")).toThrow();
    expect(() => artifactVersionSchema.parse({
      id: artifactVersionId,
      artifactId,
      version: 0,

      payload: {},
      createdAt: new Date(),
    })).toThrow();
  });
  test("exports a branded ApprovalId type and schema", () => {
    const parsedApprovalId: ApprovalId = approvalIdSchema.parse(approvalId);
    expect(parsedApprovalId).toBe(approvalId);
  });

  test("requires the observable artifact fields", () => {
    expect(() => artifactSchema.parse({
      id: artifactId,
      projectId,
      type: "user_requirement",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow();
  });
});

describe("workflow, approval, agent, and API contracts", () => {
  test("accepts every declared workflow event and validates links", () => {
    const eventNames = [
      "stage_started", "stage_completed", "approval_requested", "approval_granted",
      "revision_requested", "job_queued", "job_started", "job_failed", "job_retried",
      "finding_created", "pr_ready",
    ] as const;
    expect(workflowEventNameSchema.options).toEqual(eventNames);
    expect(workflowEventSchema.parse({
      name: "stage_started",
      workflowRunId,
      projectId,
      occurredAt: new Date(),
      payload: { stage: "requirements" },
    }).name).toBe("stage_started");
    expect(() => artifactLinkSchema.parse({
      sourceVersionId: artifactVersionId,
      targetVersionId: "not-an-id",
      relation: "derived_from",
    })).toThrow();
  });

  test("uses a branded user identifier for approval reviewers", () => {
    const approval = approvalSchema.parse({
      id: approvalId,
      projectId,
      artifactVersionId,
      gate: "design",
      decision: "approved",
      reviewerId: validIdentity.userId,
      createdAt: new Date(),
    });
    expect(approval.reviewerId).toBe(userId);
    expect(() => approvalSchema.parse({
      id: approvalId,
      projectId,
      artifactVersionId,
      gate: "design",
      decision: "unknown",
      reviewerId: userId,
      createdAt: new Date(),
    })).toThrow();
  });

  test("identifies agent jobs by the persisted agent id", () => {
    const job = agentJobSchema.parse({
      id: agentJobId,
      projectId,
      workflowRunId,
      agentId,
      idempotencyKey: "requirements-1",
      status: "queued",
      input: { requirementId: artifactId },
    });
    expect(job.agentId).toBe(agentId);
    expect(() => agentJobSchema.parse({ ...job, agentId: "not-an-id" })).toThrow();
  });

  test("preserves the stable API error shape", () => {
    expect(apiErrorSchema.parse({ code: "INVALID_INPUT", message: "Invalid input" })).toEqual({
      code: "INVALID_INPUT",
      message: "Invalid input",
    });
    expect(apiErrorSchema.parse({ code: "CONFLICT", message: "Conflict", details: { field: "slug" } }).details)
      .toEqual({ field: "slug" });
    expect(() => apiErrorSchema.parse({ code: "INVALID_INPUT" })).toThrow();
  });
});
