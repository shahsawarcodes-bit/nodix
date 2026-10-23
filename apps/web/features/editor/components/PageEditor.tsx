"use client";

import { useEffect, useCallback, useMemo, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { generateKeyBetween } from "fractional-indexing";
import { useAuth } from "@/features/auth";
import { useEditor } from "../state";
import { BlockList } from "./BlockList";
import { PageTitle } from "./PageTitle";
import { PageCover, AddCoverButton } from "./PageCover";
import { PageIcon, AddIconButton } from "./PageIcon";
import { EditorTopNav } from "./header";
import { GuestBanner } from "./GuestBanner";
import { AccessDenied } from "./AccessDenied";
import { ReadOnlyProvider } from "./ReadOnlyContext";
import { PageOutline } from "./PageOutline";
import { CollaboratorPresence } from "./CollaboratorPresence";

export interface PageEditorProps {
  pageId: string;
  isGuest?: boolean;
}

export const PageEditor = ({ pageId, isGuest }: PageEditorProps): ReactElement => {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const isGuestQuery = searchParams.get("guest") === "true" || searchParams.get("guest") === "1";

  const {
    blocks,
    pages,
    currentPage,
    loading,
    error,
    loadPage,
    cleanupSession,
    createAndInsertBlock,
    setFocusedBlockId
  } = useEditor();

  useEffect(() => {
    void loadPage(pageId);
    return () => {
      cleanupSession();
    };
  }, [pageId, loadPage, cleanupSession]);

  const canEdit = useMemo((): boolean => {
    if (!isAuthenticated || !user) return false;
    if (!currentPage) return false;

    const checkSinglePage = (p: typeof currentPage): boolean => {
      if (!p) return false;
      // 1. Owner can always edit
      if ((p.ownerId && p.ownerId === user.id) || !p.ownerId) {
        return true;
      }
      // 2. Invited collaborator with can_edit or full_access
      if (p.collaborators && p.collaborators.length > 0 && user.email) {
        const collab = p.collaborators.find(
          (c) => c.email.toLowerCase() === user.email.toLowerCase()
        );
        if (collab && (collab.role === "can_edit" || collab.role === "full_access")) {
          return true;
        }
      }
      // 3. Public link with can_edit (for authenticated users)
      if (
        p.generalAccess === "public" &&
        (p.publicPermission === "can_edit" || p.publicPermission === "full_access")
      ) {
        return true;
      }
      return false;
    };

    // Direct page check
    if (checkSinglePage(currentPage)) return true;

    // Folder Inheritance: walk up parentId chain
    if (currentPage.parentId && pages.length > 0) {
      const pageMap = new Map(pages.map((p) => [p.id, p]));
      let currParentId: string | null = currentPage.parentId;
      const visited = new Set<string>([currentPage.id]);

      while (currParentId && !visited.has(currParentId)) {
        visited.add(currParentId);
        const parent = pageMap.get(currParentId);
        if (!parent) break;
        if (checkSinglePage(parent)) return true;
        currParentId = parent.parentId ?? null;
      }
    }

    return false;
  }, [isAuthenticated, user, currentPage, pages]);

  const isGuestMode = isGuest ?? (!isAuthenticated || isGuestQuery);
  const isReadOnly = !isAuthenticated || isGuestQuery || !canEdit;

  const handleEmptyAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (isReadOnly) return;

      // Don't interfere if clicking an interactive element or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.closest("[contenteditable='true']") ||
        target.closest("button") ||
        target.closest("[role='dialog']")
      ) {
        return;
      }

      if (!currentPage) return;

      // Find top-level blocks for this page
      const rootBlocks = blocks
        .filter((b) => b.pageId === currentPage.id && (b.parentId ?? null) === null)
        .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

      const lastBlock = rootBlocks.length > 0 ? rootBlocks[rootBlocks.length - 1] : undefined;

      // If the last block is already an empty text block, focus it
      if (lastBlock && lastBlock.type === "text" && lastBlock.text.trim() === "") {
        setFocusedBlockId(lastBlock.id);
        return;
      }

      // Otherwise create a new text block at the bottom and focus it
      const newPos = generateKeyBetween(lastBlock?.pos ?? null, null);
      void createAndInsertBlock(
        {
          pageId: currentPage.id,
          parentId: null,
          type: "text",
          text: "",
          pos: newPos
        },
        true
      );
    },
    [blocks, currentPage, createAndInsertBlock, setFocusedBlockId, isReadOnly]
  );

  if (loading && !currentPage) {
    return (
      <div className="max-w-[720px] mx-auto py-12 px-8 animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-5 bg-gray-100 rounded w-full" />
        <div className="h-5 bg-gray-100 rounded w-4/5" />
        <div className="h-5 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (error && !currentPage) {
    return (
      <div className="max-w-[720px] mx-auto py-16 px-8 text-center">
        <p className="text-red-500 font-medium mb-3">Error: {error}</p>
        <button
          type="button"
          onClick={() => void loadPage(pageId)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="max-w-[720px] mx-auto py-16 px-8 text-center text-gray-400">
        Page not found.
      </div>
    );
  }

  // If in guest mode and the page is private, render Access Denied
  if (isGuestMode && currentPage.generalAccess !== "public") {
    return <AccessDenied pageId={currentPage.id} />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      {/* Top Header: GuestBanner if in guest mode, otherwise EditorTopNav */}
      {isGuestMode ? (
        <GuestBanner pageId={currentPage.id} />
      ) : (
        <>
          <EditorTopNav currentPage={currentPage} />
          {isReadOnly && (
            <div className="w-full bg-amber-50/80 border-b border-amber-200/60 px-4 py-1.5 text-xs text-amber-800 text-center font-medium select-none">
              Viewing only • Anyone with the link has view-only access to this page
            </div>
          )}
        </>
      )}

      {/* Full-width page cover */}
      <PageCover page={currentPage} readOnly={isReadOnly} />

      {/* Main editor content area: max-w-[900px] in guest mode, max-w-[860px] in owner view */}
      <div
        onClick={handleEmptyAreaClick}
        className={`w-full mx-auto flex-1 flex flex-col text-[15.5px] leading-relaxed ${
          isGuestMode ? "max-w-[900px] px-6 sm:px-12" : "max-w-[860px] px-8 sm:px-14"
        } ${isReadOnly ? "cursor-default" : "cursor-text"} ${
          currentPage.coverImage ? "pt-4 pb-12" : "py-12"
        }`}
      >
        {/* Page Icon / Actions / Title Header */}
        <div className="group/header relative mb-6 pt-2">
          {!isReadOnly && (!currentPage.icon || !currentPage.coverImage) && (
            <div className="flex items-center gap-1.5 mb-1 min-h-[28px] opacity-0 group-hover/header:opacity-100 transition-opacity duration-150">
              {!currentPage.icon && <AddIconButton page={currentPage} />}
              {!currentPage.coverImage && <AddCoverButton page={currentPage} />}
            </div>
          )}

          {currentPage.icon && (
            <div className={currentPage.coverImage ? "-mt-8 relative z-10" : ""}>
              <PageIcon page={currentPage} readOnly={isReadOnly} />
            </div>
          )}

          <PageTitle
            pageId={currentPage.id}
            initialTitle={currentPage.title}
            readOnly={isReadOnly}
          />
        </div>

        {/* Blocks Tree wrapped in ReadOnlyProvider */}
        <div className="min-h-[100px]">
          <ReadOnlyProvider value={isReadOnly}>
            <BlockList pageId={currentPage.id} parentId={null} />
          </ReadOnlyProvider>
        </div>

        {/* Clickable empty area extending to the bottom of the page like Notion */}
        <div className={`flex-1 min-h-[350px] ${isReadOnly ? "cursor-default" : "cursor-text"}`} />
      </div>

      {/* Right-Side Page Outline (Table of Contents) */}
      <PageOutline blocks={blocks.filter((b) => b.pageId === currentPage.id)} />

      {/* Floating Live Collaborator Presence (bottom-right) */}
      {!isGuestMode && <CollaboratorPresence />}
    </div>
  );
};
