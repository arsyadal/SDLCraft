import { describe, expect, test } from "vitest";
import { artifactStatusSchema, artifactTypeSchema } from "./artifacts";

describe("artifact contracts", () => {
  test("accepts a versioned user requirement", () => {
    expect(
      artifactTypeSchema.parse("user_requirement"),
    ).toBe("user_requirement");
    expect(artifactStatusSchema.parse("approved")).toBe("approved");
  });

  test("rejects an unknown artifact type", () => {
    expect(() => artifactTypeSchema.parse("unknown")).toThrow();
  });
});
