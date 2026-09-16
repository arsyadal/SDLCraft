import { z } from "zod";
import { approvalIdSchema, artifactVersionIdSchema, projectIdSchema, workflowRunIdSchema, workflowTemplateIdSchema } from "./identifiers";

export const workflowEventNameSchema = z.enum([
  "stage_started",
  "stage_completed",
  "approval_requested",
  "approval_granted",
  "revision_requested",
  "job_queued",
  "job_started",
  "job_failed",
  "job_retried",
  "finding_created",
  "pr_ready",
]);

export const workflowRunStatusSchema = z.enum(["running", "failed", "passed", "blocked"]);

export const workflowEventSchema = z.object({
  name: workflowEventNameSchema,
  workflowRunId: workflowRunIdSchema,
  projectId: projectIdSchema,
  occurredAt: z.coerce.date(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const artifactLinkSchema = z.object({
  sourceVersionId: artifactVersionIdSchema,
  targetVersionId: artifactVersionIdSchema,
  relation: z.string().min(1),
});

export const approvalDecisionSchema = z.enum(["approved", "rejected", "revision_requested"]);

export const approvalSchema = z.object({
  id: approvalIdSchema,
  projectId: projectIdSchema,
  artifactVersionId: artifactVersionIdSchema,
  gate: z.string().min(1),
  decision: approvalDecisionSchema,
  reviewerId: z.string().uuid(),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
});

export const workflowRunSchema = z.object({
  id: workflowRunIdSchema,
  projectId: projectIdSchema,
  workflowTemplateId: workflowTemplateIdSchema,
  status: workflowRunStatusSchema,
});

export type WorkflowEventName = z.infer<typeof workflowEventNameSchema>;
export type WorkflowRunStatus = z.infer<typeof workflowRunStatusSchema>;
export type WorkflowEvent = z.infer<typeof workflowEventSchema>;
export type ArtifactLink = z.infer<typeof artifactLinkSchema>;
export type WorkflowRun = z.infer<typeof workflowRunSchema>;
export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;
export type Approval = z.infer<typeof approvalSchema>;
