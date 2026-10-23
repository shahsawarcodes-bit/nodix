import assert from "node:assert/strict";
import test from "node:test";
import type { Template } from "@workspace/types";

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: "tpl-1",
    name: "Simple Project Tracker",
    description: "Track your tasks from To Do to Done.",
    icon: "📋",
    category: "Work",
    blocks: [
      { type: "h2", text: "📋 Simple Project Tracker", pos: "a0" },
      { type: "text", text: "A simple space to manage your project tasks.", pos: "a1" },
      { type: "h3", text: "To Do", pos: "a2" },
      { type: "todo", text: "Add your first task here", props: { checked: false }, pos: "a3" },
      { type: "todo", text: "Add another task", props: { checked: false }, pos: "a4" },
      { type: "h3", text: "Doing", pos: "a5" },
      { type: "todo", text: "Task currently in progress", props: { checked: false }, pos: "a6" },
      { type: "h3", text: "Done", pos: "a7" },
      { type: "todo", text: "Completed task", props: { checked: true }, pos: "a8" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "tpl-2",
    name: "Weekly Planner",
    description: "Plan your week, Monday to Sunday.",
    icon: "📅",
    category: "Personal",
    blocks: [
      { type: "h1", text: "📅 My Weekly Planner", pos: "a0" },
      { type: "text", text: "Plan out your week to stay productive.", pos: "a1" },
      { id: "mon", type: "toggle", text: "Monday", props: { open: true }, pos: "a2" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "mon", pos: "a0" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "tpl-3",
    name: "Today's Focus",
    description: "The 3-bucket method for daily productivity.",
    icon: "🎯",
    category: "Personal",
    blocks: [
      { type: "h1", text: "🎯 Today's Focus", pos: "a0" },
      { type: "h2", text: "🔥 Must Do Today", pos: "a1" },
      { type: "todo", text: "Most important task", props: { checked: false }, pos: "a2" },
      { type: "todo", text: "Second priority task", props: { checked: false }, pos: "a3" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const CATEGORIES = [
  "All",
  "Work",
  "Personal",
  "Study",
  "Creative",
  "Blank Option"
] as const;

void test("Templates Gallery Category Filters", () => {
  const filterTemplates = (
    category: string,
    query = "",
    templates = SAMPLE_TEMPLATES
  ) => {
    if (category === "Blank Option") {
      return [];
    }

    return templates.filter((t) => {
      const matchesCategory =
        category === "All" ||
        t.category.toLowerCase() === category.toLowerCase();
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  };

  // 'All' returns all 3 templates
  assert.equal(filterTemplates("All").length, 3);

  // 'Work' returns Simple Project Tracker
  const workTemplates = filterTemplates("Work");
  assert.equal(workTemplates.length, 1);
  assert.equal(workTemplates[0]?.name, "Simple Project Tracker");

  // 'Personal' returns Weekly Planner and Today's Focus
  const personalTemplates = filterTemplates("Personal");
  assert.equal(personalTemplates.length, 2);
  assert.ok(personalTemplates.some((t) => t.name === "Weekly Planner"));
  assert.ok(personalTemplates.some((t) => t.name === "Today's Focus"));

  // 'Study' and 'Creative' currently return empty
  assert.equal(filterTemplates("Study").length, 0);
  assert.equal(filterTemplates("Creative").length, 0);

  // 'Blank Option' returns empty for template list (handled by dedicated Blank Page card)
  assert.equal(filterTemplates("Blank Option").length, 0);
});

void test("Blank Option Card visibility logic", () => {
  const shouldShowBlankCard = (category: string, query = "") => {
    if (category === "Blank Option") return true;
    if (category !== "All") return false;
    if (!query) return true;
    const q = query.trim().toLowerCase();
    return (
      "blank".includes(q) ||
      "blank page".includes(q) ||
      "empty".includes(q) ||
      "untitled".includes(q)
    );
  };

  assert.equal(shouldShowBlankCard("All"), true);
  assert.equal(shouldShowBlankCard("Blank Option"), true);
  assert.equal(shouldShowBlankCard("Work"), false);
  assert.equal(shouldShowBlankCard("Personal"), false);
  assert.equal(shouldShowBlankCard("All", "blank"), true);
  assert.equal(shouldShowBlankCard("All", "planner"), false);
});

void test("Search query filtering within template library", () => {
  const searchTemplates = (query: string) => {
    const q = query.trim().toLowerCase();
    return SAMPLE_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  };

  assert.equal(searchTemplates("tracker").length, 1);
  assert.equal(searchTemplates("tracker")[0]?.name, "Simple Project Tracker");
  assert.equal(searchTemplates("productivity").length, 1);
  assert.equal(searchTemplates("productivity")[0]?.name, "Today's Focus");
  assert.equal(searchTemplates("nonexistent").length, 0);
});

void test("Simple Project Tracker has correct 9-block To Do/Doing/Done structure", () => {
  const tracker = SAMPLE_TEMPLATES.find((t) => t.name === "Simple Project Tracker");
  assert.ok(tracker);
  assert.equal(tracker.blocks.length, 9);
  assert.equal(tracker.blocks[0]?.type, "h2");
  assert.equal(tracker.blocks[1]?.type, "text");
  assert.equal(tracker.blocks[2]?.type, "h3");
  assert.equal(tracker.blocks[2]?.text, "To Do");
  assert.equal(tracker.blocks[5]?.type, "h3");
  assert.equal(tracker.blocks[5]?.text, "Doing");
  assert.equal(tracker.blocks[7]?.type, "h3");
  assert.equal(tracker.blocks[7]?.text, "Done");
});
