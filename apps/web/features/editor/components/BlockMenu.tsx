"use client";

import { useEffect, useRef, type ReactElement } from "react";
import {
  ArrowRightLeft,
  Bot,
  Copy,
  CornerDownRight,
  MessageSquare,
  Paintbrush,
  Sparkles,
  Trash2
} from "lucide-react";
import type { Block } from "@workspace/types";
import { useBlockMenu } from "../hooks/useBlockMenu";
import { BlockMenuSubmenu } from "./BlockMenuSubmenu";

export interface BlockMenuProps {
  block: Block;
  onClose: () => void;
}

export const BlockMenu = ({ block, onClose }: BlockMenuProps): ReactElement => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
    activeSubmenu,
    setActiveSubmenu,
    handleTurnInto,
    handleSetColor,
    handleDuplicate,
    handleDelete,
    handleCopyLink
  } = useBlockMenu({ block, onClose });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (activeSubmenu) {
          setActiveSubmenu(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSubmenu, setActiveSubmenu, onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute -left-2 top-8 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 space-y-1 text-sm select-none animate-in fade-in-0 zoom-in-95 duration-150"
      role="menu"
      aria-label="Block options"
    >
      {/* TEXT FORMATTING */}
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === "turnInto" ? null : "turnInto")}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            activeSubmenu === "turnInto" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-gray-400" />
            <span>Turn into</span>
          </div>
          <span className="text-xs text-gray-400">›</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === "color" ? null : "color")}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            activeSubmenu === "color" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Paintbrush className="size-4 text-gray-400" />
            <span>Color</span>
          </div>
          <span className="text-xs text-gray-400">›</span>
        </button>
      </div>

      {/* ACTIONS */}
      <div className="pt-1 border-t border-gray-100 space-y-0.5">
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Copy className="size-4 text-gray-400" />
            <span>Copy link to block</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">⌘L</span>
        </button>

        <button
          type="button"
          onClick={() => void handleDuplicate()}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gray-400" />
            <span>Duplicate</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">⌘D</span>
        </button>

        <button
          type="button"
          onClick={() => void handleDelete()}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="size-4 text-red-500" />
            <span>Delete</span>
          </div>
          <span className="text-xs text-red-400 font-mono">Del</span>
        </button>

        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-300 cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2">
            <CornerDownRight className="size-4 text-gray-300" />
            <span>Move to</span>
          </div>
        </button>
      </div>

      {/* COLLABORATION (Disabled for Week 3) */}
      <div className="pt-1 border-t border-gray-100 space-y-0.5">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-300 cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-gray-300" />
            <span>Comment</span>
          </div>
        </button>

        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-300 cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-gray-300" />
            <span>Ask AI</span>
          </div>
        </button>
      </div>

      {/* SUBMENUS */}
      {activeSubmenu && (
        <BlockMenuSubmenu
          type={activeSubmenu}
          onSelectTurnInto={(type) => void handleTurnInto(type)}
          onSelectColor={(color, kind) => void handleSetColor(color, kind)}
        />
      )}
    </div>
  );
};
