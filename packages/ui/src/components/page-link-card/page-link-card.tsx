"use client";

import * as React from "react";
import { FileText } from "lucide-react";

export interface PageLinkCardProps {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const PageLinkCard = ({
  title,
  icon,
  href,
  onClick,
  action,
  className
}: PageLinkCardProps): React.ReactElement => {
  const content = (
    <>
      <span className="text-base leading-none shrink-0">
        {icon || <FileText className="size-4 text-gray-500" />}
      </span>
      <span className="truncate">{title.trim() || "Untitled"}</span>
    </>
  );

  return (
    <div
      className={
        className ||
        "py-1 group/link relative inline-flex items-center gap-2 select-none"
      }
    >
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 underline decoration-gray-300 underline-offset-4 decoration-1"
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 underline decoration-gray-300 underline-offset-4 decoration-1 cursor-pointer"
        >
          {content}
        </button>
      )}

      {action}
    </div>
  );
};
