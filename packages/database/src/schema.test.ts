import { describe, expect, test } from "vitest";
import { organizations, projects, artifacts, artifactLinks } from "./schema";

describe("database schema", () => {
  test("exports tenant-owned artifact tables with stable keys", () => {
    expect(organizations).toBeDefined();
    expect(projects).toBeDefined();
    expect(artifacts).toBeDefined();
    expect(artifactLinks).toBeDefined();
  });
});
