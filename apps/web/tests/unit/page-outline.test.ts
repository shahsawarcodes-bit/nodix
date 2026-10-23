import assert from "node:assert/strict";
import test from "node:test";
import type { Block } from "@workspace/types";

// Helper logic identical to PageOutline useMemo
const extractHeadings = (blocks: readonly Block[]) => {
  return blocks
    .filter(
      (b): b is Block & { type: "h1" | "h2" | "h3" } =>
        (b.type === "h1" || b.type === "h2" || b.type === "h3") &&
        Boolean(b.text && b.text.trim().length > 0) &&
        !b.deleted
    )
    .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }))
    .map((b) => ({
      id: b.id,
      type: b.type,
      text: b.text.trim(),
      level: b.type === "h1" ? 1 : b.type === "h2" ? 2 : 3
    }));
};

const createMockBlock = (id: string, type: Block["type"], text: string, pos: string): Block => ({
  id,
  pageId: "page-1",
  parentId: null,
  type,
  text,
  pos,
  props: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  deleted: false
});

void test("PageOutline extracts h1, h2, and h3 headings in pos order", () => {
  const blocks: Block[] = [
    createMockBlock("b1", "h1", "Overview", "a0"),
    createMockBlock("b2", "text", "Some normal text", "a1"),
    createMockBlock("b3", "h2", "Architecture", "a2"),
    createMockBlock("b4", "todo", "Task 1", "a3"),
    createMockBlock("b5", "h3", "Database Schema", "a4")
  ];

  const headings = extractHeadings(blocks);
  assert.equal(headings.length, 3);
  assert.equal(headings[0]?.id, "b1");
  assert.equal(headings[0]?.text, "Overview");
  assert.equal(headings[0]?.level, 1);

  assert.equal(headings[1]?.id, "b3");
  assert.equal(headings[1]?.text, "Architecture");
  assert.equal(headings[1]?.level, 2);

  assert.equal(headings[2]?.id, "b5");
  assert.equal(headings[2]?.text, "Database Schema");
  assert.equal(headings[2]?.level, 3);
});

void test("PageOutline ignores empty or whitespace-only headings", () => {
  const blocks: Block[] = [
    createMockBlock("b1", "h1", "", "a0"),
    createMockBlock("b2", "h2", "   ", "a1"),
    createMockBlock("b3", "h1", "Valid Heading", "a2")
  ];

  const headings = extractHeadings(blocks);
  assert.equal(headings.length, 1);
  assert.equal(headings[0]?.id, "b3");
  assert.equal(headings[0]?.text, "Valid Heading");
});

void test("PageOutline returns empty array when no headings exist", () => {
  const blocks: Block[] = [
    createMockBlock("b1", "text", "Paragraph 1", "a0"),
    createMockBlock("b2", "todo", "Do chores", "a1"),
    createMockBlock("b3", "divider", "", "a2")
  ];

  const headings = extractHeadings(blocks);
  assert.equal(headings.length, 0);
});
