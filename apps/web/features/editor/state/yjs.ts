"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import type { Block } from "@workspace/types";
import { getStoredToken } from "@/features/auth";

export interface UserAwareness {
  id: string;
  name: string;
  email?: string;
  color: string;
  activeBlockId: string | null;
}

export interface CollaboratorState extends UserAwareness {
  clientId: number;
}

export const COLLABORATOR_COLORS = [
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#EA580C", // Orange
  "#059669", // Emerald
  "#0891B2", // Cyan
  "#D97706", // Amber
  "#4F46E5"  // Indigo
];

export const getRandomColor = (): string => {
  const index = Math.floor(Math.random() * COLLABORATOR_COLORS.length);
  return COLLABORATOR_COLORS[index] ?? "#2563EB";
};

export interface YjsSession {
  doc: Y.Doc;
  yBlocks: Y.Array<Block>;
  yMeta: Y.Map<unknown>;
  provider: WebsocketProvider | null;
  indexeddbProvider: IndexeddbPersistence | null;
  destroy: () => void;
}

const getWsUrl = (): string => {
  if (typeof window === "undefined") return "ws://127.0.0.1:4001";
  const envWs = process.env.NEXT_PUBLIC_WS_URL;
  if (envWs) return envWs;
  const host = window.location.hostname || "127.0.0.1";
  return `ws://${host}:4001`;
};

export const createYjsSession = (
  pageId: string,
  user: { id?: string | null; name?: string | null; email?: string | null } | null,
  userColor: string,
  onAwarenessChange?: (collaborators: CollaboratorState[]) => void,
  token?: string | null
): YjsSession => {
  const doc = new Y.Doc();
  const yBlocks = doc.getArray<Block>("blocks");
  const yMeta = doc.getMap<unknown>("meta");

  let provider: WebsocketProvider | null = null;
  let indexeddbProvider: IndexeddbPersistence | null = null;
  let cleanupUnload: (() => void) | null = null;

  if (typeof window !== "undefined") {
    try {
      const authToken = token !== undefined ? token : getStoredToken();
      const wsUrl = getWsUrl();
      const params: Record<string, string> = { pageId };
      if (authToken) {
        params["token"] = authToken;
      }

      // Connect to WebSocket server using query parameters (?pageId=...&token=...)
      provider = new WebsocketProvider(wsUrl, pageId, doc, {
        params
      });

      // IndexedDB persistence for offline-first support
      indexeddbProvider = new IndexeddbPersistence(`nodix-page-${pageId}`, doc);

      // Only register awareness if user is authenticated (never register "Anonymous")
      if (user && user.id) {
        const initialUser: UserAwareness = {
          id: user.id,
          name: user.name || user.email?.split("@")[0] || "User",
          ...(user.email ? { email: user.email } : {}),
          color: userColor,
          activeBlockId: null
        };
        provider.awareness.setLocalStateField("user", initialUser);
      } else {
        provider.awareness.setLocalState(null);
      }

      // Listen to awareness changes (other active users & cursors)
      provider.awareness.on("change", () => {
        if (!provider || !onAwarenessChange) return;
        const currentClientId = doc.clientID;
        const states = Array.from(provider.awareness.getStates().entries());
        const collaborators: CollaboratorState[] = [];
        const seenUserIds = new Set<string>();

        // Never show our own user id in the collaborators list
        if (user?.id) {
          seenUserIds.add(user.id);
        }

        for (const [clientId, state] of states) {
          if (clientId === currentClientId) continue;
          const u = (state as { user?: UserAwareness | null }).user;

          // Skip empty, invalid, anonymous, or disconnected states
          if (!u || !u.name || u.name === "Anonymous" || !u.id || u.id === "anon" || u.id.startsWith("anon-")) {
            continue;
          }

          // Deduplicate by user ID to avoid ghost duplicates
          if (seenUserIds.has(u.id)) {
            continue;
          }
          seenUserIds.add(u.id);

          collaborators.push({
            clientId,
            id: u.id,
            name: u.name,
            ...(u.email ? { email: u.email } : {}),
            color: u.color || "#2563EB",
            activeBlockId: u.activeBlockId || null
          });
        }

        onAwarenessChange(collaborators);
      });

      // Cleanup on tab close / reload / navigation so ghost connections don't stay online
      const handleUnload = () => {
        try {
          if (provider) {
            provider.awareness.setLocalState(null);
            provider.disconnect();
          }
        } catch {
          // ignore unload error
        }
      };

      window.addEventListener("beforeunload", handleUnload);
      window.addEventListener("pagehide", handleUnload);

      cleanupUnload = () => {
        window.removeEventListener("beforeunload", handleUnload);
        window.removeEventListener("pagehide", handleUnload);
      };
    } catch (err) {
      console.warn("[Yjs] Failed to initialize WebSocket provider:", err);
    }
  }

  return {
    doc,
    yBlocks,
    yMeta,
    provider,
    indexeddbProvider,
    destroy: () => {
      try {
        if (cleanupUnload) {
          cleanupUnload();
          cleanupUnload = null;
        }
        if (provider) {
          provider.awareness.setLocalState(null);
          provider.disconnect();
          provider.destroy();
        }
        indexeddbProvider?.destroy();
        doc.destroy();
      } catch {
        // Ignore destruction errors
      }
    }
  };
};
