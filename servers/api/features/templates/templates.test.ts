import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TEMPLATES } from "./templates.seed.js";
import { toTemplate } from "./templates.model.js";

void test("DEFAULT_TEMPLATES includes the required templates", () => {
  assert.ok(DEFAULT_TEMPLATES.length >= 3);
  const names = DEFAULT_TEMPLATES.map((t) => t.name);
  assert.ok(names.includes("Simple Task Tracker"), "Includes Simple Task Tracker");
  assert.ok(names.includes("Simple Project Tracker"), "Includes Simple Project Tracker");
  assert.ok(names.includes("Weekly Planner"), "Includes Weekly Planner");
  assert.ok(names.includes("Today's Focus"), "Includes Today's Focus");

  for (const t of DEFAULT_TEMPLATES) {
    assert.ok(t.name.length > 0, "Template has name");
    assert.ok(t.icon.length > 0, "Template has icon");
    assert.ok(t.description.length > 0, "Template has description");
    assert.ok(t.category.length > 0, "Template has category");
    assert.ok(Array.isArray(t.blocks) && t.blocks.length > 0, "Template has blocks");
    for (const b of t.blocks) {
      assert.ok(b.type, "Block has type");
      assert.ok(b.pos, "Block has position");
    }
  }
});

void test("toTemplate properly formats template properties", () => {
  const now = new Date();
  const template = toTemplate({
    _id: "tpl_123",
    name: "Project Sprint",
    description: "Track sprint deliverables",
    icon: "🚀",
    category: "Engineering",
    blocks: [
      { type: "h1", text: "Sprint Goals", pos: "a0" },
      { type: "todo", text: "Deploy API", pos: "a1", props: { checked: false } }
    ],
    createdAt: now,
    updatedAt: now
  });

  assert.equal(template.id, "tpl_123");
  assert.equal(template.name, "Project Sprint");
  assert.equal(template.icon, "🚀");
  assert.equal(template.blocks.length, 2);
  assert.equal(template.blocks[0]?.type, "h1");
  assert.equal(template.blocks[1]?.type, "todo");
});
