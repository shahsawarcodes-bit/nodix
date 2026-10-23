"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, FileText, MoreHorizontal, Plus } from "lucide-react";
import type { Page } from "@workspace/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@workspace/ui/primitives";
import { useEditor } from "../state";
import { SidebarPageMenu } from "./SidebarPageMenu";

export interface SidebarPageItemProps {
  page: Page;
  isActive: boolean;
  allPages: Page[];
  expandedPageIds: Set<string>;
  toggleExpand: (pageId: string) => void;
  expandPage: (pageId: string) => void;
  level?: number;
}

export const SidebarPageItem = ({
  page,
  isActive,
  allPages,
  expandedPageIds,
  toggleExpand,
  expandPage,
  level = 0
}: SidebarPageItemProps): ReactElement => {
  const router = useRouter();
  const params = useParams();
  const currentId = typeof params?.id === "string" ? params.id : null;

  const { updatePageTitle, deletePage, duplicatePage, createNewPage } = useEditor();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState<string>(page.title);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isExpanded = expandedPageIds.has(page.id);
  const childrenPages = allPages.filter((p) => p.parentId === page.id);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleSaveRename = async (): Promise<void> => {
    setIsRenaming(false);
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== page.title) {
      await updatePageTitle(page.id, trimmed);
    } else {
      setTitleValue(page.title);
    }
  };

  const handleAddPageInside = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newPage = await createNewPage("Untitled", page.id);
      expandPage(page.id);
      router.push(`/page/${newPage.id}`);
    } catch {
      // Handled in store
    }
  };

  const handleDuplicate = async (): Promise<void> => {
    try {
      const newPage = await duplicatePage(page.id);
      router.push(`/page/${newPage.id}`);
    } catch {
      // Handled in store
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await deletePage(page.id);
      if (isActive) {
        router.push("/");
      }
    } catch {
      // Handled in store
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    const url = `${window.location.origin}/page/${page.id}`;
    await navigator.clipboard.writeText(url);
  };

  const indentPadding = level * 12 + 6;

  return (
    <div className="relative">
      <div className="relative group">
        <div
          style={{ paddingLeft: `${indentPadding}px` }}
          className={`sidebar-item-hover flex items-center gap-1.5 pr-2 py-1.5 rounded-lg text-[13.5px] transition-all select-none ${
            isActive
              ? "bg-black/[0.08] text-gray-900 font-semibold shadow-2xs"
              : "text-gray-600 hover:bg-black/[0.05] hover:text-gray-950 font-medium"
          }`}
        >
          {/* Chevron expand/collapse button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpand(page.id);
            }}
            className="size-4 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-transform shrink-0"
            aria-label={isExpanded ? "Collapse subpages" : "Expand subpages"}
          >
            <ChevronRight
              className={`size-3.5 transition-transform duration-150 ${
                isExpanded ? "rotate-90 text-gray-700" : "text-gray-400"
              }`}
            />
          </button>

          {/* Page Icon */}
          <span className="text-[14px] leading-none shrink-0 text-gray-500">
            {page.icon || <FileText className="size-4" />}
          </span>

          {/* Page Title / Rename Input */}
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => void handleSaveRename()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSaveRename();
                }
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setTitleValue(page.title);
                }
              }}
              className="flex-1 bg-white px-2 py-0.5 text-[13px] rounded border border-blue-400 outline-none text-gray-900 shadow-2xs"
            />
          ) : (
            <Link
              href={`/page/${page.id}`}
              className="truncate flex-1 py-0.5 text-[13.5px] text-inherit outline-none"
            >
              {page.title.trim() || "Untitled"}
            </Link>
          )}

          {/* Hover Actions: (+) and (...) */}
          {!isRenaming && (
            <div
              className={`flex items-center gap-0.5 transition-opacity duration-150 ${
                isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMenuOpen((prev) => !prev);
                      }}
                      className={`size-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-black/10 transition-colors cursor-pointer ${
                        isMenuOpen ? "bg-black/10 text-gray-700" : ""
                      }`}
                      aria-label="Delete, duplicate, and more..."
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px] py-1 px-2 bg-gray-900 text-white">
                    Delete, duplicate, and more...
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => void handleAddPageInside(e)}
                      className="size-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-black/10 transition-colors cursor-pointer"
                      aria-label="Add a page inside"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[11px] py-1 px-2 bg-gray-900 text-white">
                    Add a page inside
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Popover Options Menu */}
        {isMenuOpen && (
          <SidebarPageMenu
            onClose={() => setIsMenuOpen(false)}
            onRename={() => {
              setTitleValue(page.title);
              setIsRenaming(true);
            }}
            onDuplicate={() => void handleDuplicate()}
            onDelete={() => void handleDelete()}
            onCopyLink={() => void handleCopyLink()}
          />
        )}
      </div>

      {/* Subpages when expanded */}
      {isExpanded && (
        <div className="space-y-0.5">
          {childrenPages.length > 0 ? (
            childrenPages.map((child) => (
              <SidebarPageItem
                key={child.id}
                page={child}
                isActive={currentId === child.id}
                allPages={allPages}
                expandedPageIds={expandedPageIds}
                toggleExpand={toggleExpand}
                expandPage={expandPage}
                level={level + 1}
              />
            ))
          ) : (
            <div
              style={{ paddingLeft: `${indentPadding + 22}px` }}
              className="py-1 text-[11px] text-gray-400 select-none"
            >
              No pages inside
            </div>
          )}
        </div>
      )}
    </div>
  );
};
