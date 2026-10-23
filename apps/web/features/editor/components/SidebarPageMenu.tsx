"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { Copy, Link2, Pencil, Trash2 } from "lucide-react";

export interface SidebarPageMenuProps {
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}

export const SidebarPageMenu = ({
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink
}: SidebarPageMenuProps): ReactElement => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-1 space-y-0.5 text-sm select-none animate-in fade-in-0 zoom-in-95 duration-150"
      role="menu"
      aria-label="Page actions"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRename();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left text-xs font-medium cursor-pointer"
      >
        <Pencil className="size-3.5 text-gray-400" />
        <span>Rename</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left text-xs font-medium cursor-pointer"
      >
        <Copy className="size-3.5 text-gray-400" />
        <span>Duplicate</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopyLink();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left text-xs font-medium cursor-pointer"
      >
        <Link2 className="size-3.5 text-gray-400" />
        <span>Copy link</span>
      </button>

      <div className="pt-0.5 border-t border-gray-100 my-0.5" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors text-left text-xs font-medium cursor-pointer"
      >
        <Trash2 className="size-3.5 text-red-500" />
        <span>Delete</span>
      </button>
    </div>
  );
};
