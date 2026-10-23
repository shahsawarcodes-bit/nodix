"use client";

import type { ReactElement } from "react";
import { GripVertical, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@workspace/ui/primitives";

export interface BlockGutterProps {
  blockId: string;
  onAddBelow: () => void;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDragPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  isTopAligned?: boolean;
}

export const BlockGutter = ({
  blockId,
  onAddBelow,
  onOpenMenu,
  onDragPointerDown,
  isTopAligned = false
}: BlockGutterProps): ReactElement => {
  return (
    <div
      data-block-id={blockId}
      className={`absolute -left-[54px] ${
        isTopAligned ? "top-2.5" : "top-1/2 -translate-y-1/2"
      } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 select-none`}
      contentEditable={false}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onAddBelow}
              className="size-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
              aria-label="Add block below"
            >
              <Plus className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs py-1 px-2">
            Click to add below
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onOpenMenu}
              onPointerDown={onDragPointerDown}
              className="size-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-grab active:cursor-grabbing"
              aria-label="Block options and drag handle"
            >
              <GripVertical className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs py-1 px-2">
            Click to open menu, drag to move
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
