import assert from "node:assert/strict";
import test from "node:test";
import * as Y from "yjs";
import type { Block } from "@workspace/types";

test("Yjs real-time page metadata synchronization between collaborators", () => {
  // Simulate Client A (e.g. Salman) and Client B (e.g. Admin)
  const docA = new Y.Doc();
  const docB = new Y.Doc();

  const metaA = docA.getMap<unknown>("meta");
  const metaB = docB.getMap<unknown>("meta");

  let clientBReceivedTitle: string | null = null;
  let clientBReceivedIcon: string | null = null;

  metaB.observe(() => {
    clientBReceivedTitle = (metaB.get("title") as string) ?? null;
    clientBReceivedIcon = (metaB.get("icon") as string) ?? null;
  });

  // Client A types "Simple Task Tracker my working"
  docA.transact(() => {
    metaA.set("title", "Simple Task Tracker my working");
    metaA.set("icon", "📁");
  });

  // Transmit update from A to B (simulating WebSocket connection)
  const update1 = Y.encodeStateAsUpdate(docA);
  Y.applyUpdate(docB, update1);

  assert.equal(metaB.get("title"), "Simple Task Tracker my working");
  assert.equal(clientBReceivedTitle, "Simple Task Tracker my working");
  assert.equal(clientBReceivedIcon, "📁");

  // Client B types further update
  docB.transact(() => {
    metaB.set("title", "Updated by Admin");
  });

  const update2 = Y.encodeStateAsUpdate(docB);
  Y.applyUpdate(docA, update2);

  assert.equal(metaA.get("title"), "Updated by Admin");
});

test("Yjs real-time block updates and positioning between collaborators", () => {
  const docA = new Y.Doc();
  const docB = new Y.Doc();

  const yBlocksA = docA.getArray<Block>("blocks");
  const yBlocksB = docB.getArray<Block>("blocks");

  const initialBlock: Block = {
    id: "block-1",
    pageId: "page-1",
    parentId: null,
    type: "text",
    pos: "a0",
    text: "Initial task description",
    props: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  docA.transact(() => {
    yBlocksA.push([initialBlock]);
  });

  // Sync to B
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  assert.equal(yBlocksB.length, 1);
  assert.equal(yBlocksB.get(0)?.text, "Initial task description");

  // Client A edits text in real-time
  docA.transact(() => {
    yBlocksA.delete(0, 1);
    yBlocksA.insert(0, [{ ...initialBlock, text: "Updated live text" }]);
  });

  // Sync to B
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  assert.equal(yBlocksB.length, 1);
  assert.equal(yBlocksB.get(0)?.text, "Updated live text");
});
