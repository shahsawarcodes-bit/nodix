"use client";

import type { ReactElement } from "react";
import type { BlockType } from "@workspace/types";
import { SLASH_COMMANDS } from "./slash-menu-items";

export interface BlockMenuSubmenuProps {
  type: "turnInto" | "color";
  onSelectTurnInto: (type: BlockType) => void;
  onSelectColor: (color: string, kind: "text" | "background") => void;
}

const TEXT_COLORS = [
  { name: "default", label: "Default", class: "text-gray-900" },
  { name: "gray", label: "Gray", class: "text-gray-500" },
  { name: "brown", label: "Brown", class: "text-amber-800" },
  { name: "orange", label: "Orange", class: "text-orange-600" },
  { name: "yellow", label: "Yellow", class: "text-yellow-600" },
  { name: "green", label: "Green", class: "text-emerald-600" },
  { name: "blue", label: "Blue", class: "text-blue-600" },
  { name: "purple", label: "Purple", class: "text-purple-600" },
  { name: "pink", label: "Pink", class: "text-pink-600" },
  { name: "red", label: "Red", class: "text-red-600" }
];

const BG_COLORS = [
  { name: "default", label: "Default background", preview: "bg-transparent border border-gray-200" },
  { name: "gray", label: "Gray background", preview: "bg-gray-100" },
  { name: "brown", label: "Brown background", preview: "bg-amber-100" },
  { name: "orange", label: "Orange background", preview: "bg-orange-100" },
  { name: "yellow", label: "Yellow background", preview: "bg-yellow-100" },
  { name: "green", label: "Green background", preview: "bg-emerald-100" },
  { name: "blue", label: "Blue background", preview: "bg-blue-100" },
  { name: "purple", label: "Purple background", preview: "bg-purple-100" },
  { name: "pink", label: "Pink background", preview: "bg-pink-100" },
  { name: "red", label: "Red background", preview: "bg-red-100" }
];

export const BlockMenuSubmenu = ({
  type,
  onSelectTurnInto,
  onSelectColor
}: BlockMenuSubmenuProps): ReactElement => {
  if (type === "turnInto") {
    return (
      <div className="absolute left-[calc(100%+4px)] top-0 z-50 w-64 max-h-72 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
          Turn into
        </div>
        {SLASH_COMMANDS.map((cmd) => (
          <button
            key={cmd.type}
            type="button"
            onClick={() => onSelectTurnInto(cmd.type)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{cmd.renderIcon()}</span>
              <span>{cmd.label}</span>
            </div>
            {cmd.shortcut && (
              <span className="text-xs text-gray-400 font-mono">{cmd.shortcut}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute left-[calc(100%+4px)] top-0 z-50 w-64 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95 duration-150">
      <div>
        <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
          Color
        </div>
        {TEXT_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelectColor(c.name === "default" ? "" : c.name, "text")}
            className="w-full flex items-center gap-2 px-2.5 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left cursor-pointer"
          >
            <span className={`font-semibold ${c.class}`}>A</span>
            <span className={c.class}>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-1 border-t border-gray-100">
        <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
          Background
        </div>
        {BG_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelectColor(c.name === "default" ? "" : c.name, "background")}
            className="w-full flex items-center gap-2 px-2.5 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-left cursor-pointer"
          >
            <span className={`size-4 rounded-sm ${c.preview}`} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
