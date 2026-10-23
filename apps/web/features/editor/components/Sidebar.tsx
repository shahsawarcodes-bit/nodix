"use client";

import { useEffect, useState, useCallback, useMemo, type ReactElement } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, LogOut, LayoutTemplate } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@workspace/ui/primitives";
import { useEditor } from "../state";
import { SidebarPageItem } from "./SidebarPageItem";
import { NodixLogo } from "./NodixLogo";
import { TemplatesModal } from "./TemplatesModal";

export const Sidebar = (): ReactElement => {
  const router = useRouter();
  const params = useParams();
  const currentId = typeof params?.id === "string" ? params.id : null;
  const { user, logout } = useAuth();

  const { pages, refreshPages, createNewPage } = useEditor();
  const [expandedPageIds, setExpandedPageIds] = useState<Set<string>>(() => new Set());
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);

  useEffect(() => {
    void refreshPages();
  }, [refreshPages]);

  // Declaratively auto-expand parent tree if active page is a child
  const effectiveExpandedIds = useMemo(() => {
    const set = new Set(expandedPageIds);
    if (currentId) {
      let curr = pages.find((p) => p.id === currentId);
      while (curr?.parentId) {
        set.add(curr.parentId);
        curr = pages.find((p) => p.id === curr?.parentId);
      }
    }
    return set;
  }, [expandedPageIds, currentId, pages]);

  const toggleExpand = useCallback((pageId: string): void => {
    setExpandedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const expandPage = useCallback((pageId: string): void => {
    setExpandedPageIds((prev) => {
      const next = new Set(prev);
      next.add(pageId);
      return next;
    });
  }, []);

  const handleCreateTopLevelPage = async (): Promise<void> => {
    try {
      const page = await createNewPage("Untitled", null);
      router.push(`/page/${page.id}`);
    } catch {
      // Handled in store
    }
  };

  const rootPages = useMemo(() => {
    return pages.filter(
      (p) => !p.parentId || !pages.some((parent) => parent.id === p.parentId)
    );
  }, [pages]);

  return (
    <aside className="w-[256px] min-w-[256px] h-screen bg-[#F7F7F5] border-r border-[#E9E9E7] flex flex-col select-none">
      {/* Workspace Header */}
      <div className="px-3.5 py-3 flex items-center justify-between border-b border-[#E9E9E7]/70">
        <Link href="/" className="flex items-center hover:opacity-85 transition-opacity">
          <NodixLogo className="h-6" />
        </Link>
      </div>

      {/* Pages Section */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5">
        {/* Private Header Row with Hover (+) */}
        <div className="group flex items-center justify-between px-2 py-1.5 text-[11.5px] font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wide">
          <span>Private</span>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => void handleCreateTopLevelPage()}
                  className="size-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Add a page"
                >
                  <Plus className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px] py-1 px-2 bg-gray-900 text-white">
                Add a page
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Page Items */}
        {rootPages.length === 0 ? (
          <div className="px-3 py-8 text-center text-[13px] text-gray-400">
            <p className="font-medium mb-1">No pages yet</p>
            <button
              type="button"
              onClick={() => void handleCreateTopLevelPage()}
              className="mt-1 text-blue-600 hover:underline font-semibold text-[13px]"
            >
              + Create one
            </button>
          </div>
        ) : (
          rootPages.map((page) => (
            <SidebarPageItem
              key={page.id}
              page={page}
              isActive={currentId === page.id}
              allPages={pages}
              expandedPageIds={effectiveExpandedIds}
              toggleExpand={toggleExpand}
              expandPage={expandPage}
              level={0}
            />
          ))
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2.5 border-t border-[#E9E9E7] space-y-0.5">
        <button
          type="button"
          onClick={() => void handleCreateTopLevelPage()}
          className="sidebar-item-hover w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-gray-500 hover:bg-black/5 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>New page</span>
        </button>
        <button
          type="button"
          onClick={() => setIsTemplatesModalOpen(true)}
          className="sidebar-item-hover w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-gray-500 hover:bg-black/5 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <LayoutTemplate className="size-3.5" />
          <span>Templates</span>
        </button>
      </div>

      {/* User Profile & Logout */}
      {user && (
        <div className="p-3 border-t border-[#E9E9E7] flex items-center justify-between bg-white/40 hover:bg-white/60 transition-colors group/user">
          <div className="flex items-center gap-2.5 min-w-0 mr-1">
            <div className="size-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate leading-tight">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="p-1.5 rounded hover:bg-black/8 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer opacity-0 group-hover/user:opacity-100"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        open={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />
    </aside>
  );
};
