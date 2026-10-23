import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyBetween } from "fractional-indexing";

test("generates valid initial position key", () => {
  const initial = generateKeyBetween(null, null);
  assert.equal(typeof initial, "string");
  assert.ok(initial.length > 0);
});

test("generates key between two positions with correct sorting", () => {
  const first = "a0";
  const second = "a1";
  const between = generateKeyBetween(first, second);

  assert.ok(first < between, `Expected ${first} < ${between}`);
  assert.ok(between < second, `Expected ${between} < ${second}`);
});

test("generates key before first position", () => {
  const first = "a0";
  const before = generateKeyBetween(null, first);

  assert.ok(before < first, `Expected ${before} < ${first}`);
});

test("generates key after last position", () => {
  const last = "a0";
  const after = generateKeyBetween(last, null);

  assert.ok(last < after, `Expected ${last} < ${after}`);
});

test("supports repeated insertions while maintaining strict ordering", () => {
  let prev = "a0";
  const next = "a1";
  const items: string[] = [prev];

  for (let i = 0; i < 5; i++) {
    const mid = generateKeyBetween(prev, next);
    items.push(mid);
    prev = mid;
  }
  items.push(next);

  const sorted = [...items].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  assert.deepEqual(items, sorted, "Generated positions must maintain strict ordering");
});
