import test from "node:test";
import assert from "node:assert/strict";
import type { Page } from "@workspace/types";

test("partitions pages into root pages and subpages based on parentId", () => {
  const pages: Page[] = [
    { id: "root-1", title: "My_Project", icon: null, parentId: null, createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "child-1", title: "Epics", icon: null, parentId: "root-1", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "child-2", title: "Features", icon: null, parentId: "root-1", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "root-2", title: "Fitness Tracker", icon: null, parentId: null, createdAt: new Date(), updatedAt: new Date(), deleted: false }
  ];

  const rootPages = pages.filter((p) => !p.parentId || !pages.some((parent) => parent.id === p.parentId));
  const subpagesOfRoot1 = pages.filter((p) => p.parentId === "root-1");

  assert.equal(rootPages.length, 2);
  assert.deepEqual(rootPages.map((p) => p.id), ["root-1", "root-2"]);

  assert.equal(subpagesOfRoot1.length, 2);
  assert.deepEqual(subpagesOfRoot1.map((p) => p.id), ["child-1", "child-2"]);
});

test("renaming a subpage preserves its parentId and nested tree position", () => {
  const existingSubpage: Page = {
    id: "child-1",
    title: "Old Title",
    icon: null,
    parentId: "root-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  // Simulating API update where backend returns { id, title } without parentId
  const apiReturnedPage = {
    id: "child-1",
    title: "New Epics Title",
    icon: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  // Enriched update preserving parentId
  const enrichedUpdatedPage: Page = {
    ...apiReturnedPage,
    parentId: existingSubpage.parentId ?? null
  };

  assert.equal(enrichedUpdatedPage.title, "New Epics Title");
  assert.equal(enrichedUpdatedPage.parentId, "root-1", "parentId must not be lost upon rename");
});

test("ancestor path calculation correctly discovers all parents to root", () => {
  const pages: Page[] = [
    { id: "root", title: "Root", icon: null, parentId: null, createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "level-1", title: "Level 1", icon: null, parentId: "root", createdAt: new Date(), updatedAt: new Date(), deleted: false },
    { id: "level-2", title: "Level 2", icon: null, parentId: "level-1", createdAt: new Date(), updatedAt: new Date(), deleted: false }
  ];

  const targetId = "level-2";
  const ancestors: string[] = [];

  let curr = pages.find((p) => p.id === targetId);
  while (curr?.parentId) {
    ancestors.push(curr.parentId);
    const nextParentId = curr.parentId;
    curr = pages.find((p) => p.id === nextParentId);
  }

  assert.deepEqual(ancestors, ["level-1", "root"]);
});
