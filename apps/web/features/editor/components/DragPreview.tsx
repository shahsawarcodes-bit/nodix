"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";

export interface DragPreviewProps {
  draggedBlock: Block | null;
  pointerPosition: { x: number; y: number } | null;
}

export const DragPreview = ({
  draggedBlock,
  pointerPosition
}: DragPreviewProps): ReactElement | null => {
  if (!draggedBlock || !pointerPosition) return null;

  return (
    <div
      style={{
        transform: `translate3d(${pointerPosition.x + 12}px, ${pointerPosition.y + 12}px, 0)`
      }}
      className="fixed top-0 left-0 z-100 pointer-events-none opacity-85 bg-white/95 backdrop-blur-xs border border-blue-400 shadow-xl rounded-md px-3 py-1.5 max-w-sm select-none text-sm text-gray-800 transition-opacity duration-100"
    >
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
        <span className="truncate">
          {draggedBlock.text.trim() || `${draggedBlock.type} block`}
        </span>
      </div>
    </div>
  );
};
