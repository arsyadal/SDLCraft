import { expect, test } from "vitest";
import { getRuntimeIdentity } from "./main";

test("exposes the SDLCraft API runtime identity", () => {
  expect(getRuntimeIdentity()).toEqual({ name: "SDLCraft API" });
});
