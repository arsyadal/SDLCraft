import { z } from "zod";

const identifierSchema = z.string().uuid();

export const organizationIdSchema = identifierSchema.brand("OrganizationId");
export const projectIdSchema = identifierSchema.brand("ProjectId");
export const workflowRunIdSchema = identifierSchema.brand("WorkflowRunId");
export const artifactIdSchema = identifierSchema.brand("ArtifactId");
export const artifactVersionIdSchema = identifierSchema.brand("ArtifactVersionId");
export const agentRunIdSchema = identifierSchema.brand("AgentRunId");
export const agentIdSchema = identifierSchema.brand("AgentId");
export const approvalIdSchema = identifierSchema.brand("ApprovalId");
export const userIdSchema = identifierSchema.brand("UserId");
export const workflowTemplateIdSchema = identifierSchema.brand("WorkflowTemplateId");
export const repositoryIdSchema = identifierSchema.brand("RepositoryId");

export type OrganizationId = z.infer<typeof organizationIdSchema>;
export type ProjectId = z.infer<typeof projectIdSchema>;
export type WorkflowRunId = z.infer<typeof workflowRunIdSchema>;
export type ArtifactId = z.infer<typeof artifactIdSchema>;
export type ArtifactVersionId = z.infer<typeof artifactVersionIdSchema>;
export type AgentRunId = z.infer<typeof agentRunIdSchema>;
export type AgentId = z.infer<typeof agentIdSchema>;
export type ApprovalId = z.infer<typeof approvalIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type WorkflowTemplateId = z.infer<typeof workflowTemplateIdSchema>;
export type RepositoryId = z.infer<typeof repositoryIdSchema>;
