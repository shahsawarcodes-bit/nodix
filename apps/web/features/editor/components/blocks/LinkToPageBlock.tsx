"use client";

import { useState, useMemo, type ReactElement } from "react";
import { FileText, Search, Link2 } from "lucide-react";
import type { Block, Page } from "@workspace/types";
import { PageLinkCard } from "@workspace/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@workspace/ui/primitives";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";

export interface LinkToPageBlockProps {
  block: Block;
}

export const LinkToPageBlock = ({ block }: LinkToPageBlockProps): ReactElement | null => {
  const isReadOnly = useReadOnly();
  const { pages, optimisticUpdateBlock } = useEditor();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const targetPageId = block.props.pageId;
  const linkedPage = useMemo(() => {
    return pages.find((p) => p.id === targetPageId) ?? null;
  }, [pages, targetPageId]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [pages, searchQuery]);

  const handleSelectPage = (page: Page): void => {
    if (isReadOnly) return;
    void optimisticUpdateBlock(block.id, {
      props: {
        ...block.props,
        pageId: page.id
      }
    });
    setIsOpen(false);
  };

  if (!targetPageId || !linkedPage) {
    if (isReadOnly) return null;
    return (
      <div className="py-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer select-none border border-transparent hover:border-gray-200"
            >
              <Link2 className="size-4 text-gray-400" />
              <span>Link to page</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="w-72 p-2 bg-white rounded-lg shadow-xl border border-gray-200 text-xs"
          >
            <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 mb-1">
              <Search className="size-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full bg-transparent outline-none text-xs text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredPages.length === 0 ? (
                <div className="py-3 text-center text-gray-400 text-xs">
                  No pages found
                </div>
              ) : (
                filteredPages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPage(p)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  >
                    <span className="text-sm shrink-0">
                      {p.icon || <FileText className="size-3.5 text-gray-400" />}
                    </span>
                    <span className="truncate flex-1 font-medium text-xs">
                      {p.title.trim() || "Untitled"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <PageLinkCard
      href={`/page/${linkedPage.id}${isReadOnly ? "?guest=true" : ""}`}
      title={linkedPage.title}
      icon={linkedPage.icon}
      action={
        !isReadOnly ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="opacity-0 group-hover/link:opacity-100 text-[11px] text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-all cursor-pointer"
              >
                Change
              </button>
            </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="w-72 p-2 bg-white rounded-lg shadow-xl border border-gray-200 text-xs"
          >
            <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 mb-1">
              <Search className="size-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full bg-transparent outline-none text-xs text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredPages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPage(p)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                >
                  <span className="text-sm shrink-0">
                    {p.icon || <FileText className="size-3.5 text-gray-400" />}
                  </span>
                  <span className="truncate flex-1 font-medium text-xs">
                    {p.title.trim() || "Untitled"}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : undefined
    }
    />
  );
};
