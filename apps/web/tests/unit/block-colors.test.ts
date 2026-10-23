import test from "node:test";
import assert from "node:assert/strict";
import { getBlockColorClasses } from "../../features/editor/components/blocks/block-colors";

test("returns empty string when props are undefined or empty", () => {
  assert.equal(getBlockColorClasses(undefined), "");
  assert.equal(getBlockColorClasses({}), "");
});

test("maps text color names to Tailwind text classes", () => {
  assert.match(getBlockColorClasses({ color: "gray" }), /text-gray-500/);
  assert.match(getBlockColorClasses({ color: "yellow" }), /text-yellow-600/);
  assert.match(getBlockColorClasses({ color: "red" }), /text-red-600/);
  assert.match(getBlockColorClasses({ color: "blue" }), /text-blue-600/);
  assert.match(getBlockColorClasses({ color: "green" }), /text-emerald-600/);
});

test("maps background color names to Tailwind bg classes", () => {
  assert.match(getBlockColorClasses({ backgroundColor: "yellow" }), /bg-yellow-100/);
  assert.match(getBlockColorClasses({ backgroundColor: "red" }), /bg-red-100/);
  assert.match(getBlockColorClasses({ backgroundColor: "blue" }), /bg-blue-100/);
});

test("combines text color and background color classes", () => {
  const result = getBlockColorClasses({ color: "blue", backgroundColor: "yellow" });
  assert.match(result, /text-blue-600/);
  assert.match(result, /bg-yellow-100/);
});
