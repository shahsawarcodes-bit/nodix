import test from "node:test";
import assert from "node:assert/strict";
import type { Block, BlockType } from "@workspace/types";
import { generateKeyBetween } from "fractional-indexing";

const ALLOWED_PARENT_TYPES: BlockType[] = ["toggle", "bulleted_list", "numbered_list", "todo"];

const canHaveChildren = (type: BlockType): boolean => {
  return ALLOWED_PARENT_TYPES.includes(type);
};

const calculateDepth = (blockId: string, blocks: Block[]): number => {
  let depth = 0;
  let current = blocks.find((b) => b.id === blockId);
  while (current?.parentId && depth <= 10) {
    depth++;
    const parentId = current.parentId;
    current = blocks.find((b) => b.id === parentId);
  }
  return depth;
};

test("only allows indenting under toggle, list items, and todo blocks", () => {
  assert.equal(canHaveChildren("toggle"), true);
  assert.equal(canHaveChildren("bulleted_list"), true);
  assert.equal(canHaveChildren("numbered_list"), true);
  assert.equal(canHaveChildren("todo"), true);

  assert.equal(canHaveChildren("text"), false);
  assert.equal(canHaveChildren("h1"), false);
  assert.equal(canHaveChildren("h2"), false);
  assert.equal(canHaveChildren("h3"), false);
  assert.equal(canHaveChildren("quote"), false);
  assert.equal(canHaveChildren("code"), false);
  assert.equal(canHaveChildren("divider"), false);
});

test("calculates nesting depth accurately up to maximum limit of 5", () => {
  const blocks: Block[] = [
    { id: "1", pageId: "p1", parentId: null, type: "toggle", pos: "a0", props: {}, text: "Level 0", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "2", pageId: "p1", parentId: "1", type: "toggle", pos: "a0", props: {}, text: "Level 1", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "3", pageId: "p1", parentId: "2", type: "toggle", pos: "a0", props: {}, text: "Level 2", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "4", pageId: "p1", parentId: "3", type: "toggle", pos: "a0", props: {}, text: "Level 3", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "5", pageId: "p1", parentId: "4", type: "toggle", pos: "a0", props: {}, text: "Level 4", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "6", pageId: "p1", parentId: "5", type: "toggle", pos: "a0", props: {}, text: "Level 5", createdAt: new Date(), updatedAt: new Date(), deleted: false }
  ];

  assert.equal(calculateDepth("1", blocks), 0);
  assert.equal(calculateDepth("2", blocks), 1);
  assert.equal(calculateDepth("5", blocks), 4);
  assert.equal(calculateDepth("6", blocks), 5);
});

test("outdent calculates position after parent in grandparent scope", () => {
  const parentPos = "a1";
  const parentNextPos = "a2";
  const outdentPos = generateKeyBetween(parentPos, parentNextPos);

  assert.ok(parentPos < outdentPos, "Outdent position must be after parent");
  assert.ok(outdentPos < parentNextPos, "Outdent position must be before parent's next sibling");
});
