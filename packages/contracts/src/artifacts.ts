import { z } from "zod";
import { artifactIdSchema, artifactVersionIdSchema, projectIdSchema } from "./identifiers";

export const artifactTypeSchema = z.enum([
  "business_intent",
  "user_requirement",
  "design_requirement",
  "architecture",
  "api_spec",
  "implementation_task",
  "file_change",
  "commit",
  "pull_request",
  "test_result",
  "security_finding",
  "release_candidate",
]);

export const artifactStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "revision_requested",
  "running",
  "failed",
  "passed",
  "blocked",
  "pr_ready",
]);

export const artifactSchema = z.object({
  id: artifactIdSchema,
  projectId: projectIdSchema,
  type: artifactTypeSchema,
  title: z.string().min(1),
  status: artifactStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const artifactVersionSchema = z.object({
  id: artifactVersionIdSchema,
  artifactId: artifactIdSchema,
  version: z.number().int().positive(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.coerce.date(),
});

export type ArtifactType = z.infer<typeof artifactTypeSchema>;
export type ArtifactStatus = z.infer<typeof artifactStatusSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type ArtifactVersion = z.infer<typeof artifactVersionSchema>;
