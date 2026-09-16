import { expect, test } from "bun:test";
import { getRuntimeIdentity } from "./main";

test("exposes the SDLCraft API runtime identity", () => {
  expect(getRuntimeIdentity()).toEqual({ name: "SDLCraft API" });
});
