declare module "y-websocket/bin/utils" {
  import type { IncomingMessage } from "node:http";
  import type { WebSocket } from "ws";
  import type * as Y from "yjs";

  export const docs: Map<string, Y.Doc>;
  export function getYDoc(docname: string, gc?: boolean): Y.Doc;
  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void;
  export function setPersistence(persistence: {
    bindState: (docname: string, doc: Y.Doc) => void | Promise<void>;
    writeState: (docname: string, doc: Y.Doc) => void | Promise<void>;
  } | null): void;
  export function getPersistence(): unknown;
}
