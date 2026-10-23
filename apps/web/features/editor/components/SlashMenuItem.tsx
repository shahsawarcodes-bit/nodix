"use client";

import type { ReactElement } from "react";

export interface SlashMenuItemProps {
  icon: ReactElement;
  label: string;
  shortcut?: string | undefined;
  selected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export const SlashMenuItem = ({
  icon,
  label,
  shortcut,
  selected,
  onClick,
  onMouseEnter
}: SlashMenuItemProps): ReactElement => {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors text-left cursor-pointer ${
        selected ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-gray-500">{icon}</span>
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-gray-400 font-mono tracking-tight">{shortcut}</span>
      )}
    </button>
  );
};
