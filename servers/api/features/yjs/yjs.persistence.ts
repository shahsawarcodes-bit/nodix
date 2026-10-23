import { createRequire } from "node:module";
import type * as Y from "yjs";
import { YjsSnapshotModel } from "./yjs.model.js";

const require = createRequire(import.meta.url);
const yjs = require("yjs") as typeof Y;

const debounceTimers = new Map<string, NodeJS.Timeout>();
const SAVE_DEBOUNCE_MS = 3000;

export const scheduleSnapshotSave = (docName: string, doc: Y.Doc): void => {
  const existingTimer = debounceTimers.get(docName);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    debounceTimers.delete(docName);
    void saveSnapshot(docName, doc);
  }, SAVE_DEBOUNCE_MS);

  debounceTimers.set(docName, timer);
};

export const saveSnapshot = async (docName: string, doc: Y.Doc): Promise<void> => {
  try {
    const update = Buffer.from(yjs.encodeStateAsUpdate(doc));
    await YjsSnapshotModel.updateOne(
      { pageId: docName },
      { $set: { update, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.error(`[Yjs] Failed to save snapshot for ${docName}:`, error);
  }
};

export const bindDocumentState = async (docName: string, doc: Y.Doc): Promise<void> => {
  try {
    const snapshot = await YjsSnapshotModel.findOne({ pageId: docName });
    if (snapshot && snapshot.update) {
      yjs.applyUpdate(doc, new Uint8Array(snapshot.update));
    }

    // Attach update listener to debounce save to MongoDB every 3 seconds
    doc.on("update", () => {
      scheduleSnapshotSave(docName, doc);
    });
  } catch (error) {
    console.error(`[Yjs] Failed to bind document state for ${docName}:`, error);
  }
};

export const flushAllPendingSnapshots = async (docs: Map<string, Y.Doc>): Promise<void> => {
  const promises: Promise<void>[] = [];
  for (const [docName, timer] of debounceTimers.entries()) {
    clearTimeout(timer);
    const doc = docs.get(docName);
    if (doc) {
      promises.push(saveSnapshot(docName, doc));
    }
  }
  debounceTimers.clear();
  await Promise.allSettled(promises);
};
