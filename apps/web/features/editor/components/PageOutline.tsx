"use client";

import { useEffect, useState, useMemo, type ReactElement } from "react";
import { ListCollapse, ChevronRight } from "lucide-react";
import type { Block } from "@workspace/types";

export interface PageOutlineProps {
  blocks: readonly Block[];
  className?: string;
}

interface OutlineItem {
  id: string;
  type: "h1" | "h2" | "h3";
  text: string;
  level: number;
}

export const PageOutline = ({ blocks, className = "" }: PageOutlineProps): ReactElement | null => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Extract h1, h2, h3 headings from blocks
  const headings = useMemo<OutlineItem[]>(() => {
    return blocks
      .filter(
        (b): b is Block & { type: "h1" | "h2" | "h3" } =>
          (b.type === "h1" || b.type === "h2" || b.type === "h3") &&
          Boolean(b.text && b.text.trim().length > 0) &&
          !b.deleted
      )
      .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }))
      .map((b) => ({
        id: b.id,
        type: b.type,
        text: b.text.trim(),
        level: b.type === "h1" ? 1 : b.type === "h2" ? 2 : 3
      }));
  }, [blocks]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const blockId = entry.target.getAttribute("data-editor-block-id");
            if (blockId) {
              setActiveBlockId(blockId);
            }
          }
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0
      }
    );

    for (const h of headings) {
      const el =
        document.getElementById(`block-${h.id}`) ??
        document.querySelector(`[data-editor-block-id="${h.id}"]`);
      if (el) {
        observer.observe(el);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  // Hide the outline if there are no headings on this page
  if (headings.length === 0) {
    return null;
  }

  const handleScrollToHeading = (blockId: string): void => {
    const el =
      document.getElementById(`block-${blockId}`) ??
      document.querySelector(`[data-editor-block-id="${blockId}"]`);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveBlockId(blockId);
    }
  };

  return (
    <aside
      aria-label="Table of contents"
      className={`hidden xl:block fixed right-6 top-28 w-56 max-h-[calc(100vh-140px)] select-none z-20 ${className}`}
    >
      <div className="bg-white/90 backdrop-blur-xs border border-gray-100 rounded-xl p-3 shadow-xs transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100 text-gray-400">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <ListCollapse className="size-3.5 text-gray-400" />
            <span>Outline</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand outline" : "Collapse outline"}
          >
            <ChevronRight className={`size-3 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
          </button>
        </div>

        {/* Headings List */}
        {!isCollapsed && (
          <nav className="mt-1 space-y-0.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {headings.map((item) => {
              const isActive = activeBlockId === item.id;
              const indentClass =
                item.level === 1
                  ? "pl-2 font-medium"
                  : item.level === 2
                  ? "pl-4 text-[11px]"
                  : "pl-6 text-[11px] text-gray-400";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleScrollToHeading(item.id)}
                  title={item.text}
                  className={`group w-full text-left py-1 pr-2 rounded text-xs transition-all truncate flex items-center gap-1.5 cursor-pointer ${indentClass} ${
                    isActive
                      ? "text-blue-600 font-semibold bg-blue-50/70"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`size-1 rounded-full shrink-0 transition-colors ${
                      isActive ? "bg-blue-600 scale-125" : "bg-gray-300 group-hover:bg-gray-400"
                    }`}
                  />
                  <span className="truncate">{item.text}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
};
