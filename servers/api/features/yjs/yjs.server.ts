import type { Server as HttpServer, IncomingMessage } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { setupWSConnection, setPersistence, docs } from "y-websocket/bin/utils";
import * as decoding from "lib0/decoding";
import type { Logger } from "@workspace/logging";
import { bindDocumentState, saveSnapshot, flushAllPendingSnapshots } from "./yjs.persistence.js";
import { verifyToken } from "../auth/auth.utils.js";
import { canEditPage } from "../auth/permissions.js";
import { createPagesRepository } from "../pages/pages.repository.js";

export interface YjsServerOptions {
  server: HttpServer;
  logger?: Logger;
}

export const setupYjsWebSocketServer = ({ server, logger }: YjsServerOptions): {
  wss: WebSocketServer;
  close: () => Promise<void>;
} => {
  const pagesRepository = createPagesRepository();

  // Setup persistence for Yjs documents
  setPersistence({
    bindState: bindDocumentState,
    writeState: saveSnapshot
  });

  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost:4001");
      const pageIdParam = url.searchParams.get("pageId");
      const tokenParam = url.searchParams.get("token");
      const pathname = url.pathname.replace(/^\/+/, "");
      const docName = pageIdParam || pathname || "default";

      // 1. Verify token & permissions
      let canEdit = false;
      const decoded = tokenParam ? verifyToken(tokenParam) : null;
      if (decoded) {
        try {
          const page = await pagesRepository.findById(docName);
          if (page) {
            const perm = await canEditPage(
              page,
              { id: decoded.userId, email: decoded.email, name: decoded.name },
              (id) => pagesRepository.findById(id)
            );
            canEdit = perm.allowed;
          } else {
            // Document not yet in DB or test/template room
            canEdit = true;
          }
        } catch {
          canEdit = true;
        }
      } else {
        // Guests without valid tokens are strictly read-only
        canEdit = false;
      }

      // 2. If read-only, intercept incoming messages and filter out mutation/write updates
      if (!canEdit) {
        logger?.info("WebSocket connection is read-only", { docName });
        const originalEmit = ws.emit.bind(ws);
        ws.emit = function (event: string | symbol, ...args: unknown[]): boolean {
          if (event === "message") {
            const raw = args[0];
            try {
              let u8: Uint8Array | null = null;
              if (raw instanceof ArrayBuffer) {
                u8 = new Uint8Array(raw);
              } else if (Buffer.isBuffer(raw)) {
                u8 = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
              } else if (raw instanceof Uint8Array) {
                u8 = raw;
              }

              if (u8) {
                const decoder = decoding.createDecoder(u8);
                const messageType = decoding.readVarUint(decoder);
                if (messageType === 0) {
                  // messageSync
                  const syncType = decoding.readVarUint(decoder);
                  // 0 is SyncStep1 (request doc state) -> ALLOW
                  // 1 is SyncStep2 (client sending doc updates) -> DROP for read-only
                  // 2 is messageYjsUpdate (client mutating doc) -> DROP for read-only
                  if (syncType === 1 || syncType === 2) {
                    return true;
                  }
                }
              }
            } catch {
              // Ignore decoding errors
            }
          }
          return originalEmit(event, ...args);
        };
      }

      logger?.info("Yjs WebSocket connection opened", {
        docName,
        canEdit,
        remoteAddress: req.socket.remoteAddress
      });

      setupWSConnection(ws, req, { docName });
    } catch (error) {
      logger?.error("Failed to setup Yjs WebSocket connection", {
        error: error instanceof Error ? error.message : String(error)
      });
      ws.close(1011, "Internal server error");
    }
  });

  return {
    wss,
    close: async (): Promise<void> => {
      await flushAllPendingSnapshots(docs);
      await new Promise<void>((resolve) => {
        wss.close(() => resolve());
      });
    }
  };
};
