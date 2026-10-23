"use client";

import { useState, type ReactElement } from "react";
import {
  Lock,
  Globe,
  Link2,
  Check,
  Star,
  MoreHorizontal,
  Trash2,
  Copy,
  SlidersHorizontal
} from "lucide-react";
import type { Page } from "@workspace/types";
import { useEditor } from "../../state";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { PageLastEdited } from "./PageLastEdited";
import { ShareDialog } from "./ShareDialog";

export interface EditorTopNavProps {
  currentPage: Page;
}

export const EditorTopNav = ({ currentPage }: EditorTopNavProps): ReactElement => {
  const { pages, deletePage, duplicatePage, activeCollaborators } = useEditor();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [quickCopied, setQuickCopied] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  const isPublic = currentPage.generalAccess === "public";

  const handleQuickCopyLink = async (): Promise<void> => {
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}/page/${currentPage.id}` : "";
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleDelete = async (): Promise<void> => {
    setShowMoreMenu(false);
    if (confirm("Are you sure you want to delete this page?")) {
      await deletePage(currentPage.id);
    }
  };

  const handleDuplicate = async (): Promise<void> => {
    setShowMoreMenu(false);
    await duplicatePage(currentPage.id);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-xs border-b border-gray-100 flex items-center justify-between px-5 h-12 select-none">
      {/* Top Left: Breadcrumbs */}
      <div className="flex-1 min-w-0 mr-4">
        <PageBreadcrumbs currentPage={currentPage} pages={pages} />
      </div>

      {/* Top Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Dynamic Last Edited Time */}
        <PageLastEdited updatedAt={currentPage.updatedAt} />

        {/* Topbar Avatars: Stacked list of active users */}
        {activeCollaborators.length > 0 && (
          <div
            className="flex items-center -space-x-1.5 mr-1"
            title={`${activeCollaborators.length} collaborator${activeCollaborators.length > 1 ? "s" : ""} online`}
          >
            {activeCollaborators.slice(0, 4).map((c) => {
              const initials =
                c.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "U";
              return (
                <div
                  key={c.clientId}
                  className="relative group size-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white shadow-2xs select-none transition-transform hover:scale-110 hover:z-20 cursor-default"
                  style={{ backgroundColor: c.color }}
                >
                  <span>{initials}</span>
                  {/* Hover Tooltip */}
                  <div className="absolute top-full mt-2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-900 text-white text-[11px] font-medium whitespace-nowrap shadow-lg z-50 pointer-events-none animate-in fade-in">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{c.name}</span>
                    <span className="text-gray-400 text-[10px]">• online</span>
                  </div>
                </div>
              );
            })}
            {activeCollaborators.length > 4 && (
              <div className="size-7 rounded-full bg-gray-100 ring-2 ring-white text-gray-600 font-bold text-[11px] flex items-center justify-center shadow-2xs">
                +{activeCollaborators.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Share Button & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsShareOpen(!isShareOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all border shadow-2xs cursor-pointer ${
              isShareOpen
                ? "bg-gray-100 text-gray-900 border-gray-300"
                : "bg-white hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] text-gray-800 border-gray-200 hover:border-gray-300"
            }`}
          >
            {isPublic ? (
              <Globe className="size-3.5 text-emerald-600" />
            ) : (
              <Lock className="size-3.5 text-gray-500" />
            )}
            <span>Share</span>
          </button>

          <ShareDialog
            page={currentPage}
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />
        </div>

        {/* Edit Layout Button */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all border border-gray-200 bg-white hover:bg-gray-50 hover:scale-[1.02] text-gray-700 hover:border-gray-300 shadow-2xs cursor-pointer"
          title="Customize page layout and margins"
        >
          <SlidersHorizontal className="size-3.5 text-gray-500" />
          <span>Edit layout</span>
        </button>

        {/* Quick Copy Link Icon Button */}
        <button
          type="button"
          onClick={() => void handleQuickCopyLink()}
          title={quickCopied ? "Link copied!" : "Copy link"}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {quickCopied ? (
            <Check className="size-4 text-emerald-600 animate-in fade-in" />
          ) : (
            <Link2 className="size-4" />
          )}
        </button>

        {/* Favorite Icon Button */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            isFavorite
              ? "text-amber-500 hover:bg-amber-50"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Star className={`size-4 ${isFavorite ? "fill-amber-400" : ""}`} />
        </button>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More options"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs">
              <button
                type="button"
                onClick={() => void handleDuplicate()}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700 cursor-pointer"
              >
                <Copy className="size-3.5" />
                <span>Duplicate page</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => void handleDelete()}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete page</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
