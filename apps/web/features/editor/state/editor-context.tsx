"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from "react";
import { generateKeyBetween } from "fractional-indexing";
import { nanoid } from "nanoid";
import type * as Y from "yjs";
import type { Block, BlockType, Collaborator, GeneralAccess, Page, PermissionRole } from "@workspace/types";
import { useAuth } from "@/features/auth";
import {
  createBlock as apiCreateBlock,
  createPage as apiCreatePage,
  deleteBlock as apiDeleteBlock,
  deletePage as apiDeletePage,
  getPage as apiGetPage,
  listBlocks as apiListBlocks,
  listPages as apiListPages,
  updateBlock as apiUpdateBlock,
  updatePage as apiUpdatePage
} from "../api/client";
import {
  createYjsSession,
  getRandomColor,
  type CollaboratorState,
  type YjsSession
} from "./yjs";

const deduplicateBlocks = (blockList: readonly Block[] | Block[]): Block[] => {
  const seen = new Set<string>();
  const unique: Block[] = [];
  for (const b of blockList) {
    if (b && b.id && !seen.has(b.id)) {
      seen.add(b.id);
      unique.push(b);
    }
  }
  return unique;
};

const cleanYBlocks = (yBlocks: Y.Array<Block>, doc: Y.Doc): Block[] => {
  const current = yBlocks.toArray();
  const seen = new Set<string>();
  const duplicatesIndices: number[] = [];
  const unique: Block[] = [];

  for (let i = 0; i < current.length; i++) {
    const b = current[i];
    if (b && b.id && !seen.has(b.id)) {
      seen.add(b.id);
      unique.push(b);
    } else {
      duplicatesIndices.push(i);
    }
  }

  if (duplicatesIndices.length > 0) {
    doc.transact(() => {
      for (let i = duplicatesIndices.length - 1; i >= 0; i--) {
        yBlocks.delete(duplicatesIndices[i]!, 1);
      }
    });
  }

  return unique;
};

export interface DragState {
  isDragging: boolean;
  draggedBlockId: string | null;
  draggingBlockId: string | null;
  dragOffset: {
    x: number;
    y: number;
  } | null;
  dropTarget: {
    blockId: string;
    position: "before" | "after";
  } | null;
  pointerPosition: {
    x: number;
    y: number;
  } | null;
}

export interface EditorState {
  pages: Page[];
  currentPage: Page | null;
  blocks: Block[];
  focusedBlockId: string | null;
  loading: boolean;
  error: string | null;
  dragState: DragState;
  activeMenuBlockId: string | null;
  slashMenuBlockId: string | null;
  activeCollaborators: CollaboratorState[];
  userColor: string;
}

export interface EditorContextValue extends EditorState {
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
  setBlocks: (blocks: Block[]) => void;
  setFocusedBlockId: (id: string | null) => void;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  setActiveMenuBlockId: (id: string | null) => void;
  setSlashMenuBlockId: (id: string | null) => void;
  refreshPages: () => Promise<void>;
  loadPage: (pageId: string) => Promise<void>;
  cleanupSession: () => void;
  createNewPage: (title?: string, parentId?: string | null) => Promise<Page>;
  updatePageTitle: (pageId: string, title: string) => Promise<void>;
  updatePageCoverImage: (pageId: string, coverImage: string | null) => Promise<void>;
  updatePageIcon: (pageId: string, icon: string | null) => Promise<void>;
  updatePageShareSettings: (
    pageId: string,
    settings: {
      generalAccess?: GeneralAccess | undefined;
      publicPermission?: PermissionRole | undefined;
      collaborators?: Collaborator[] | undefined;
    }
  ) => Promise<void>;
  touchPageEditedTime: (pageId?: string) => void;
  deletePage: (pageId: string) => Promise<void>;
  duplicatePage: (pageId: string) => Promise<Page>;
  optimisticUpdateBlock: (id: string, patch: Partial<Block>) => Promise<void>;
  optimisticDeleteBlock: (id: string) => Promise<void>;
  createAndInsertBlock: (
    input: {
      pageId: string;
      parentId?: string | null | undefined;
      type?: BlockType | undefined;
      text?: string | undefined;
      pos?: string | undefined;
      props?: Record<string, unknown> | undefined;
    },
    focusNew?: boolean
  ) => Promise<Block>;
  convertBlockType: (id: string, newType: BlockType) => Promise<void>;
  duplicateBlock: (id: string) => Promise<Block>;
  moveBlock: (id: string, newPos: string, newParentId?: string | null | undefined) => Promise<void>;
  indentBlock: (id: string) => Promise<void>;
  outdentBlock: (id: string) => Promise<void>;
  setBlockColor: (id: string, color: string, type: "text" | "background") => Promise<void>;
  getPreviousSibling: (id: string) => Block | null;
  getNextSibling: (id: string) => Block | null;
  getBlockChildren: (parentId: string) => Block[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
  children: ReactNode;
}

const initialDragState: DragState = {
  isDragging: false,
  draggedBlockId: null,
  draggingBlockId: null,
  dragOffset: null,
  dropTarget: null,
  pointerPosition: null
};

export const EditorProvider = ({ children }: EditorProviderProps): ReactElement => {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);

  const { user } = useAuth();
  const [userColor] = useState<string>(() => getRandomColor());
  const [activeCollaborators, setActiveCollaborators] = useState<CollaboratorState[]>([]);
  const yjsSessionRef = useRef<YjsSession | null>(null);
  const activePageIdRef = useRef<string | null>(null);
  const titleDebounceRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const userColorRef = useRef(userColor);
  useEffect(() => {
    userColorRef.current = userColor;
  }, [userColor]);

  const handleSetFocusedBlockId = useCallback(
    (id: string | null): void => {
      setFocusedBlockId(id);
      const session = yjsSessionRef.current;
      if (session?.provider && userRef.current && userRef.current.id) {
        session.provider.awareness.setLocalStateField("user", {
          id: userRef.current.id,
          name: userRef.current.name || userRef.current.email?.split("@")[0] || "User",
          ...(userRef.current.email ? { email: userRef.current.email } : {}),
          color: userColorRef.current,
          activeBlockId: id
        });
      }
    },
    []
  );

  useEffect(() => {
    const session = yjsSessionRef.current;
    if (session?.provider) {
      if (user && user.id) {
        session.provider.awareness.setLocalStateField("user", {
          id: user.id,
          name: user.name || user.email?.split("@")[0] || "User",
          ...(user.email ? { email: user.email } : {}),
          color: userColor,
          activeBlockId: focusedBlockId
        });
      } else {
        session.provider.awareness.setLocalState(null);
      }
    }
  }, [user, userColor, focusedBlockId]);

  const cleanupSession = useCallback((): void => {
    if (yjsSessionRef.current) {
      yjsSessionRef.current.destroy();
      yjsSessionRef.current = null;
      setActiveCollaborators([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  const refreshPages = useCallback(async (): Promise<void> => {
    try {
      const pageList = await apiListPages();
      setPages(pageList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    }
  }, []);

  const loadPage = useCallback(
    async (pageId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      activePageIdRef.current = pageId;

      // Clean up previous Yjs session if switching pages
      if (yjsSessionRef.current) {
        yjsSessionRef.current.destroy();
        yjsSessionRef.current = null;
        setActiveCollaborators([]);
      }

      try {
        // 1. Fetch from REST API first
        const [fetchedPage, fetchedBlocks] = await Promise.all([
          apiGetPage(pageId),
          apiListBlocks(pageId)
        ]);

        if (activePageIdRef.current !== pageId) return;

        const initialBlocks = deduplicateBlocks(fetchedBlocks);
        setCurrentPage(fetchedPage);
        setBlocks(initialBlocks);

        // 2. Connect to Yjs provider
        const currentUser = userRef.current;
        const session = createYjsSession(
          pageId,
          currentUser && currentUser.id
            ? { id: currentUser.id, name: currentUser.name, email: currentUser.email }
            : null,
          userColorRef.current,
          (collabs) => {
            setActiveCollaborators(collabs);
          }
        );
        yjsSessionRef.current = session;

        let syncCompleted = false;

        const applyYjsSync = () => {
          if (activePageIdRef.current !== pageId) return;
          syncCompleted = true;

          // Check if Yjs document is empty
          if (session.yBlocks.length === 0 && initialBlocks.length > 0) {
            session.doc.transact(() => {
              session.yBlocks.push(initialBlocks);
            });
            setBlocks(initialBlocks);
          } else if (session.yBlocks.length > 0) {
            // Completely replace local React state with Y.Array blocks
            const cleanBlocks = cleanYBlocks(session.yBlocks, session.doc);
            cleanBlocks.sort((a, b) =>
              a.pos.localeCompare(b.pos, undefined, { numeric: true })
            );
            setBlocks(cleanBlocks);
          }

          // Sync Page Metadata (title, icon, coverImage)
          if (session.yMeta.has("title")) {
            const metaTitle = session.yMeta.get("title") as string | undefined;
            if (typeof metaTitle === "string" && metaTitle) {
              setCurrentPage((prev) => (prev && prev.id === pageId ? { ...prev, title: metaTitle } : prev));
              setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, title: metaTitle } : p)));
            }
          } else if (fetchedPage.title) {
            session.doc.transact(() => {
              session.yMeta.set("title", fetchedPage.title);
              if (fetchedPage.icon) session.yMeta.set("icon", fetchedPage.icon);
              if (fetchedPage.coverImage) session.yMeta.set("coverImage", fetchedPage.coverImage);
            });
          }
        };

        if (session.provider) {
          if (session.provider.synced) {
            applyYjsSync();
          }
          session.provider.on("sync", (isSynced: boolean) => {
            if (isSynced && activePageIdRef.current === pageId) {
              applyYjsSync();
            }
          });
        }

        if (session.indexeddbProvider) {
          session.indexeddbProvider.on("synced", () => {
            if (!syncCompleted && activePageIdRef.current === pageId && session.yBlocks.length > 0) {
              applyYjsSync();
            }
          });
        }

        // Observer: Every time the Y.Array observes changes, React state is overwritten
        session.yBlocks.observe(() => {
          if (activePageIdRef.current === pageId) {
            const currentUnique = deduplicateBlocks(session.yBlocks.toArray());
            currentUnique.sort((a, b) =>
              a.pos.localeCompare(b.pos, undefined, { numeric: true })
            );
            setBlocks(currentUnique);
          }
        });

        // Observer: Live page metadata updates across collaborators
        session.yMeta.observe(() => {
          if (activePageIdRef.current !== pageId) return;
          const newTitle = session.yMeta.get("title") as string | undefined;
          const newIcon = session.yMeta.get("icon") as string | null | undefined;
          const newCover = session.yMeta.get("coverImage") as string | null | undefined;

          setCurrentPage((prev) => {
            if (!prev || prev.id !== pageId) return prev;
            return {
              ...prev,
              ...(newTitle !== undefined ? { title: newTitle } : {}),
              ...(newIcon !== undefined ? { icon: newIcon } : {}),
              ...(newCover !== undefined ? { coverImage: newCover } : {})
            };
          });

          if (newTitle !== undefined) {
            setPages((prev) =>
              prev.map((p) => (p.id === pageId ? { ...p, title: newTitle } : p))
            );
          }
        });
      } catch (err) {
        if (activePageIdRef.current !== pageId) return;
        setError(err instanceof Error ? err.message : "Failed to load page");
      } finally {
        if (activePageIdRef.current === pageId) {
          setLoading(false);
        }
      }
    },
    []
  );

  const createNewPage = useCallback(
    async (title: string = "Untitled", parentId: string | null = null): Promise<Page> => {
      try {
        const newPage = await apiCreatePage({ title, parentId });
        setPages((prev) => [newPage, ...prev]);
        return newPage;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create page");
        throw err;
      }
    },
    []
  );

  const updatePageTitle = useCallback(
    async (pageId: string, title: string): Promise<void> => {
      const prevCurrentPage = currentPage;
      const prevPages = pages;

      setCurrentPage((prev: Page | null) => (prev && prev.id === pageId ? { ...prev, title } : prev));
      setPages((prev: Page[]) =>
        prev.map((p) => (p.id === pageId ? { ...p, title } : p))
      );

      // Instantly broadcast over Yjs to all active collaborators
      const session = yjsSessionRef.current;
      if (session) {
        session.doc.transact(() => {
          session.yMeta.set("title", title);
        });
      }

      // Debounce the backend persistence to avoid excessive HTTP requests while typing
      const existingTimer = titleDebounceRef.current.get(pageId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(async () => {
        titleDebounceRef.current.delete(pageId);
        try {
          const updated = await apiUpdatePage(pageId, { title });
          setCurrentPage((prev: Page | null) => (prev && prev.id === pageId ? updated : prev));
          setPages((prev: Page[]) => prev.map((p) => (p.id === pageId ? updated : p)));
        } catch (err) {
          setCurrentPage(prevCurrentPage);
          setPages(prevPages);
          setError(err instanceof Error ? err.message : "Failed to update page title");
        }
      }, 300);

      titleDebounceRef.current.set(pageId, timer);
    },
    [currentPage, pages]
  );

  const updatePageCoverImage = useCallback(
    async (pageId: string, coverImage: string | null): Promise<void> => {
      const prevCurrentPage = currentPage;
      const prevPages = pages;

      setCurrentPage((prev) => (prev && prev.id === pageId ? { ...prev, coverImage } : prev));
      setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, coverImage } : p)));

      // Broadcast cover image over Yjs
      const session = yjsSessionRef.current;
      if (session) {
        session.doc.transact(() => {
          session.yMeta.set("coverImage", coverImage);
        });
      }

      try {
        const updated = await apiUpdatePage(pageId, { coverImage });
        setCurrentPage((prev) => (prev && prev.id === pageId ? updated : prev));
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)));
      } catch (err) {
        setCurrentPage(prevCurrentPage);
        setPages(prevPages);
        setError(err instanceof Error ? err.message : "Failed to update cover image");
      }
    },
    [currentPage, pages]
  );

  const updatePageIcon = useCallback(
    async (pageId: string, icon: string | null): Promise<void> => {
      const prevCurrentPage = currentPage;
      const prevPages = pages;

      setCurrentPage((prev) => (prev && prev.id === pageId ? { ...prev, icon } : prev));
      setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, icon } : p)));

      // Broadcast icon over Yjs
      const session = yjsSessionRef.current;
      if (session) {
        session.doc.transact(() => {
          session.yMeta.set("icon", icon);
        });
      }

      try {
        const updated = await apiUpdatePage(pageId, { icon });
        setCurrentPage((prev) => (prev && prev.id === pageId ? updated : prev));
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)));
      } catch (err) {
        setCurrentPage(prevCurrentPage);
        setPages(prevPages);
        setError(err instanceof Error ? err.message : "Failed to update page icon");
      }
    },
    [currentPage, pages]
  );

  const touchPageEditedTime = useCallback((pageId?: string): void => {
    const now = new Date();
    setCurrentPage((prev) => (prev && (!pageId || prev.id === pageId) ? { ...prev, updatedAt: now } : prev));
    setPages((prev) => prev.map((p) => (!pageId || p.id === pageId ? { ...p, updatedAt: now } : p)));
  }, []);

  const updatePageShareSettings = useCallback(
    async (
      pageId: string,
      settings: {
        generalAccess?: GeneralAccess | undefined;
        publicPermission?: PermissionRole | undefined;
        collaborators?: Collaborator[] | undefined;
      }
    ): Promise<void> => {
      const prevCurrentPage = currentPage;
      const prevPages = pages;
      const now = new Date();

      const patchData: Partial<Page> = { updatedAt: now };
      if (settings.generalAccess !== undefined) patchData.generalAccess = settings.generalAccess;
      if (settings.publicPermission !== undefined) patchData.publicPermission = settings.publicPermission;
      if (settings.collaborators !== undefined) patchData.collaborators = settings.collaborators;

      setCurrentPage((prev) => (prev && prev.id === pageId ? { ...prev, ...patchData } : prev));
      setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, ...patchData } : p)));

      try {
        const updated = await apiUpdatePage(pageId, settings);
        setCurrentPage((prev) => (prev && prev.id === pageId ? updated : prev));
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)));
      } catch (err) {
        setCurrentPage(prevCurrentPage);
        setPages(prevPages);
        setError(err instanceof Error ? err.message : "Failed to update share settings");
        throw err;
      }
    },
    [currentPage, pages]
  );

  const deletePage = useCallback(
    async (pageId: string): Promise<void> => {
      const prevPages = pages;
      setPages((prev) => prev.filter((p) => p.id !== pageId));

      try {
        await apiDeletePage(pageId);
        if (currentPage?.id === pageId) {
          const remaining = prevPages.filter((p) => p.id !== pageId);
          setCurrentPage(remaining.length > 0 ? (remaining[0] ?? null) : null);
        }
      } catch (err) {
        setPages(prevPages);
        setError(err instanceof Error ? err.message : "Failed to delete page");
        throw err;
      }
    },
    [pages, currentPage]
  );

  const duplicatePage = useCallback(
    async (pageId: string): Promise<Page> => {
      const sourcePage = pages.find((p) => p.id === pageId);
      const title = sourcePage?.title ? `${sourcePage.title} (Copy)` : "Untitled (Copy)";
      const parentId = sourcePage?.parentId ?? null;
      const newPage = await apiCreatePage({ title, parentId });

      try {
        const sourceBlocks = await apiListBlocks(pageId);
        for (const block of sourceBlocks) {
          await apiCreateBlock({
            id: nanoid(),
            pageId: newPage.id,
            parentId: block.parentId,
            type: block.type,
            text: block.text,
            pos: block.pos,
            props: block.props
          });
        }
      } catch {
        // If copying blocks fails, new empty page is still usable
      }

      setPages((prev) => [...prev, newPage]);
      return newPage;
    },
    [pages]
  );

  const optimisticUpdateBlock = useCallback(
    async (id: string, patch: Partial<Block>): Promise<void> => {
      const prevBlocks = blocks;
      touchPageEditedTime();

      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      );

      // Mutate Yjs Y.Array
      const session = yjsSessionRef.current;
      if (session) {
        const arr = session.yBlocks.toArray();
        const index = arr.findIndex((b) => b.id === id);
        if (index !== -1) {
          const current = arr[index]!;
          session.doc.transact(() => {
            session.yBlocks.delete(index, 1);
            session.yBlocks.insert(index, [{ ...current, ...patch }]);
          });
        } else {
          const localBlock = blocks.find((b) => b.id === id) || prevBlocks.find((b) => b.id === id);
          if (localBlock) {
            session.doc.transact(() => {
              session.yBlocks.push([{ ...localBlock, ...patch }]);
            });
          }
        }
      }

      try {
        const updated = await apiUpdateBlock(id, {
          parentId: patch.parentId,
          type: patch.type,
          text: patch.text,
          props: patch.props,
          pos: patch.pos
        });
        setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
      } catch (err) {
        setBlocks(prevBlocks);
        setError(err instanceof Error ? err.message : "Failed to update block");
      }
    },
    [blocks, touchPageEditedTime]
  );

  const indentBlock = useCallback(
    async (id: string): Promise<void> => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return;

      const siblings = blocks
        .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

      const idx = siblings.findIndex((b) => b.id === id);
      if (idx <= 0) return;

      const prevSibling = siblings[idx - 1]!;
      const children = blocks
        .filter((b) => b.parentId === prevSibling.id)
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

      const lastChild = children.length > 0 ? children[children.length - 1] : undefined;
      const newPos = generateKeyBetween(lastChild?.pos ?? null, null);

      await optimisticUpdateBlock(id, {
        parentId: prevSibling.id,
        pos: newPos
      });
    },
    [blocks, optimisticUpdateBlock]
  );

  const outdentBlock = useCallback(
    async (id: string): Promise<void> => {
      const block = blocks.find((b) => b.id === id);
      if (!block || !block.parentId) return;

      const parentBlock = blocks.find((b) => b.id === block.parentId);
      if (!parentBlock) return;

      const parentSiblings = blocks
        .filter((b) => (b.parentId ?? null) === (parentBlock.parentId ?? null))
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

      const pIdx = parentSiblings.findIndex((b) => b.id === parentBlock.id);
      const nextSiblingOfParent =
        pIdx >= 0 && pIdx < parentSiblings.length - 1 ? parentSiblings[pIdx + 1] : undefined;

      const newPos = generateKeyBetween(parentBlock.pos, nextSiblingOfParent?.pos ?? null);

      await optimisticUpdateBlock(id, {
        parentId: parentBlock.parentId ?? null,
        pos: newPos
      });
    },
    [blocks, optimisticUpdateBlock]
  );

  const optimisticDeleteBlock = useCallback(
    async (id: string): Promise<void> => {
      const prevBlocks = blocks;
      const targetBlock = blocks.find((b) => b.id === id);

      if (targetBlock) {
        touchPageEditedTime(targetBlock.pageId);
        const siblings = prevBlocks
          .filter((b) => (b.parentId ?? null) === (targetBlock.parentId ?? null))
          .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
        const idx = siblings.findIndex((b) => b.id === id);
        const prevSibling = idx > 0 ? siblings[idx - 1] : undefined;
        const nextSibling = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
        const toFocus = prevSibling ?? nextSibling;
        if (toFocus) {
          handleSetFocusedBlockId(toFocus.id);
        }
      }

      setBlocks((prev) => prev.filter((b) => b.id !== id));

      const session = yjsSessionRef.current;
      if (session) {
        const arr = session.yBlocks.toArray();
        const index = arr.findIndex((b) => b.id === id);
        if (index !== -1) {
          session.doc.transact(() => {
            session.yBlocks.delete(index, 1);
          });
        }
      }

      try {
        await apiDeleteBlock(id);
        // If it was the only block on the page, create a new empty text block
        if (targetBlock && prevBlocks.filter((b) => b.pageId === targetBlock.pageId).length <= 1) {
          const emptyId = nanoid();
          const newBlock = await apiCreateBlock({
            id: emptyId,
            pageId: targetBlock.pageId,
            type: "text",
            text: ""
          });
          setBlocks([newBlock]);
          if (session) {
            session.doc.transact(() => {
              session.yBlocks.push([newBlock]);
            });
          }
          handleSetFocusedBlockId(newBlock.id);
        }
      } catch (err) {
        setBlocks(prevBlocks);
        setError(err instanceof Error ? err.message : "Failed to delete block");
      }
    },
    [blocks, touchPageEditedTime, handleSetFocusedBlockId]
  );

  const createAndInsertBlock = useCallback(
    async (
      input: {
        pageId: string;
        parentId?: string | null | undefined;
        type?: BlockType | undefined;
        text?: string | undefined;
        pos?: string | undefined;
        props?: Record<string, unknown> | undefined;
      },
      focusNew: boolean = true
    ): Promise<Block> => {
      touchPageEditedTime(input.pageId);
      const generatedId = nanoid();
      try {
        const newBlock = await apiCreateBlock({ ...input, id: generatedId });

        const session = yjsSessionRef.current;
        if (session) {
          const arr = session.yBlocks.toArray();
          const existingIdx = arr.findIndex((b) => b.id === newBlock.id);
          if (existingIdx === -1) {
            const insertIdx = arr.findIndex(
              (b) => b.pos.localeCompare(newBlock.pos, undefined, { numeric: true }) > 0
            );
            session.doc.transact(() => {
              if (insertIdx === -1) {
                session.yBlocks.push([newBlock]);
              } else {
                session.yBlocks.insert(insertIdx, [newBlock]);
              }
            });
          }
        } else {
          setBlocks((prev) => deduplicateBlocks([...prev, newBlock]));
        }

        if (focusNew) {
          handleSetFocusedBlockId(newBlock.id);
        }
        return newBlock;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create block");
        throw err;
      }
    },
    [touchPageEditedTime, handleSetFocusedBlockId]
  );

  const convertBlockType = useCallback(
    async (id: string, newType: BlockType): Promise<void> => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return;

      await optimisticUpdateBlock(id, { type: newType });
      handleSetFocusedBlockId(id);

      // If new type is divider, create an empty text block below and focus it
      if (newType === "divider" && currentPage) {
        const siblings = blocks
          .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
          .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
        const idx = siblings.findIndex((b) => b.id === id);
        const nextSibling = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
        const newPos = generateKeyBetween(block.pos, nextSibling?.pos ?? null);

        await createAndInsertBlock(
          {
            pageId: currentPage.id,
            parentId: block.parentId,
            type: "text",
            text: "",
            pos: newPos
          },
          true
        );
      }
    },
    [blocks, currentPage, optimisticUpdateBlock, createAndInsertBlock, handleSetFocusedBlockId]
  );

  const duplicateBlock = useCallback(
    async (id: string): Promise<Block> => {
      const block = blocks.find((b) => b.id === id);
      if (!block || !currentPage) throw new Error("Block or page not found");

      const siblings = blocks
        .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
      const idx = siblings.findIndex((b) => b.id === id);
      const nextSibling = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
      const newPos = generateKeyBetween(block.pos, nextSibling?.pos ?? null);

      return await createAndInsertBlock(
        {
          pageId: currentPage.id,
          parentId: block.parentId,
          type: block.type,
          text: block.text,
          props: { ...block.props },
          pos: newPos
        },
        true
      );
    },
    [blocks, currentPage, createAndInsertBlock]
  );

  const moveBlock = useCallback(
    async (id: string, newPos: string, newParentId?: string | null | undefined): Promise<void> => {
      const patch: Partial<Block> = { pos: newPos };
      if (newParentId !== undefined) {
        patch.parentId = newParentId;
      }
      await optimisticUpdateBlock(id, patch);
    },
    [optimisticUpdateBlock]
  );

  const setBlockColor = useCallback(
    async (id: string, color: string, type: "text" | "background"): Promise<void> => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return;

      const currentProps = (block.props ?? {}) as Record<string, unknown>;
      const updatedProps = { ...currentProps };

      if (type === "text") {
        if (color === "default") {
          delete updatedProps["color"];
        } else {
          updatedProps["color"] = color;
        }
      } else {
        if (color === "default") {
          delete updatedProps["backgroundColor"];
        } else {
          updatedProps["backgroundColor"] = color;
        }
      }

      await optimisticUpdateBlock(id, { props: updatedProps });
    },
    [blocks, optimisticUpdateBlock]
  );

  const getPreviousSibling = useCallback(
    (id: string): Block | null => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return null;

      const siblings = blocks
        .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
      const idx = siblings.findIndex((b) => b.id === id);
      const prev = idx > 0 ? siblings[idx - 1] : undefined;
      return prev ?? null;
    },
    [blocks]
  );

  const getNextSibling = useCallback(
    (id: string): Block | null => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return null;

      const siblings = blocks
        .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
      const idx = siblings.findIndex((b) => b.id === id);
      const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
      return next ?? null;
    },
    [blocks]
  );

  const getBlockChildren = useCallback(
    (parentId: string): Block[] => {
      return blocks
        .filter((b) => b.parentId === parentId)
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));
    },
    [blocks]
  );

  const value = useMemo<EditorContextValue>(
    () => ({
      pages,
      currentPage,
      blocks,
      focusedBlockId,
      loading,
      error,
      dragState,
      activeMenuBlockId,
      slashMenuBlockId,
      activeCollaborators,
      userColor,
      setPages,
      setCurrentPage,
      setBlocks,
      setFocusedBlockId: handleSetFocusedBlockId,
      setDragState,
      setActiveMenuBlockId,
      setSlashMenuBlockId,
      refreshPages,
      loadPage,
      cleanupSession,
      createNewPage,
      updatePageTitle,
      updatePageCoverImage,
      updatePageIcon,
      updatePageShareSettings,
      touchPageEditedTime,
      deletePage,
      duplicatePage,
      optimisticUpdateBlock,
      optimisticDeleteBlock,
      createAndInsertBlock,
      convertBlockType,
      duplicateBlock,
      moveBlock,
      indentBlock,
      outdentBlock,
      setBlockColor,
      getPreviousSibling,
      getNextSibling,
      getBlockChildren
    }),
    [
      pages,
      currentPage,
      blocks,
      focusedBlockId,
      loading,
      error,
      dragState,
      activeMenuBlockId,
      slashMenuBlockId,
      activeCollaborators,
      userColor,
      refreshPages,
      loadPage,
      cleanupSession,
      createNewPage,
      updatePageTitle,
      updatePageCoverImage,
      updatePageIcon,
      updatePageShareSettings,
      touchPageEditedTime,
      deletePage,
      duplicatePage,
      optimisticUpdateBlock,
      optimisticDeleteBlock,
      createAndInsertBlock,
      convertBlockType,
      duplicateBlock,
      moveBlock,
      indentBlock,
      outdentBlock,
      setBlockColor,
      getPreviousSibling,
      getNextSibling,
      getBlockChildren,
      handleSetFocusedBlockId
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextValue => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
