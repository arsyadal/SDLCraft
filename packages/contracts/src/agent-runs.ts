import { z } from "zod";
import { agentRunIdSchema, projectIdSchema, workflowRunIdSchema } from "./identifiers";

export const agentJobStatusSchema = z.enum(["queued", "running", "succeeded", "failed", "cancelled"]);

export const agentJobSchema = z.object({
  id: z.string().uuid(),
  projectId: projectIdSchema,
  workflowRunId: workflowRunIdSchema.optional(),
  agentType: z.string().min(1),
  idempotencyKey: z.string().min(1),
  status: agentJobStatusSchema,
  input: z.record(z.string(), z.unknown()).default({}),
});

export const agentRunSchema = z.object({
  id: agentRunIdSchema,
  jobId: z.string().uuid(),
  status: agentJobStatusSchema,
  attempt: z.number().int().positive(),
  startedAt: z.coerce.date().optional(),
  finishedAt: z.coerce.date().optional(),
});

export type AgentJobStatus = z.infer<typeof agentJobStatusSchema>;
export type AgentJob = z.infer<typeof agentJobSchema>;
export type AgentRun = z.infer<typeof agentRunSchema>;
