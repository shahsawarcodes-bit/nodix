import assert from "node:assert/strict";
import test from "node:test";
import * as Y from "yjs";

void test("Yjs document encodes state and restores correctly", () => {
  const doc1 = new Y.Doc();
  const yBlocks1 = doc1.getArray("blocks");

  const blockData = {
    id: "block-1",
    pageId: "page-1",
    type: "h1",
    text: "Real-time Collaboration",
    pos: "a0",
    props: {}
  };
  yBlocks1.push([blockData]);

  const update = Y.encodeStateAsUpdate(doc1);
  assert.ok(update.byteLength > 0, "Update buffer is created");

  const doc2 = new Y.Doc();
  Y.applyUpdate(doc2, update);

  const yBlocks2 = doc2.getArray("blocks");
  assert.equal(yBlocks2.length, 1);
  const restored = yBlocks2.get(0) as typeof blockData;
  assert.equal(restored.id, "block-1");
  assert.equal(restored.text, "Real-time Collaboration");
});
