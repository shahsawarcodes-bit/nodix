"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { Page } from "@workspace/types";

export interface PageBreadcrumbsProps {
  currentPage: Page;
  pages: Page[];
}

export const PageBreadcrumbs = ({ currentPage, pages }: PageBreadcrumbsProps): ReactElement => {
  const crumbs = useMemo(() => {
    const pageMap = new Map<string, Page>(pages.map((p) => [p.id, p]));
    const trail: Page[] = [currentPage];
    let curr: Page | undefined = currentPage;
    const visited = new Set<string>([currentPage.id]);

    while (curr?.parentId) {
      const parent = pageMap.get(curr.parentId);
      if (!parent || visited.has(parent.id)) break;
      visited.add(parent.id);
      trail.unshift(parent);
      curr = parent;
    }

    return trail;
  }, [currentPage, pages]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-gray-500 overflow-x-auto no-scrollbar py-0.5 select-none"
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        const icon = crumb.icon ? (
          <span className="text-sm select-none mr-1.5 flex-shrink-0 leading-none">{crumb.icon}</span>
        ) : (
          <FileText className="size-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
        );

        const title = crumb.title.trim() || "Untitled";

        return (
          <div key={crumb.id} className="flex items-center space-x-1 whitespace-nowrap">
            {idx > 0 && <span className="text-gray-300 select-none px-1 font-light text-xs">/</span>}
            {isLast ? (
              <span className="flex items-center font-medium text-gray-900 px-1.5 py-0.5 rounded hover:bg-gray-100/80 transition-colors cursor-default">
                {icon}
                <span className="truncate max-w-[200px]">{title}</span>
              </span>
            ) : (
              <Link
                href={`/page/${crumb.id}`}
                className="flex items-center text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 px-1.5 py-0.5 rounded transition-colors"
              >
                {icon}
                <span className="truncate max-w-[160px]">{title}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
