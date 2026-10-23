"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { Search } from "lucide-react";
import type { BlockType } from "@workspace/types";
import { useSlashMenu } from "../hooks/useSlashMenu";
import { SlashMenuItem } from "./SlashMenuItem";

export interface SlashMenuProps {
  onSelectType: (type: BlockType) => void;
  onClose: () => void;
}

export const SlashMenu = ({ onSelectType, onClose }: SlashMenuProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filteredCommands,
    handleKeyDown
  } = useSlashMenu({
    onSelectType,
    onClose
  });

  // Focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-[calc(100%+6px)] z-50 w-80 max-h-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-150 animate-in fade-in-0 zoom-in-95"
      role="dialog"
      aria-label="Commands"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/60">
        <Search className="size-3.5 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            const handled = handleKeyDown(e);
            if (handled) {
              e.stopPropagation();
            }
          }}
          placeholder="Filter commands..."
          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
          Text
        </div>

        {filteredCommands.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-gray-400">
            No matching commands
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => (
            <SlashMenuItem
              key={cmd.type}
              icon={cmd.renderIcon()}
              label={cmd.label}
              shortcut={cmd.shortcut}
              selected={idx === selectedIndex}
              onClick={() => {
                onSelectType(cmd.type);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            />
          ))
        )}
      </div>
    </div>
  );
};
