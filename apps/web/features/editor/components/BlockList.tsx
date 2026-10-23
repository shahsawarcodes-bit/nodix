"use client";

import { useMemo, type ReactElement } from "react";
import { useEditor } from "../state";
import { BlockRenderer } from "./BlockRenderer";
import { DragPreview } from "./DragPreview";

export interface BlockListProps {
  pageId: string;
  parentId?: string | null;
}

export const BlockList = ({ pageId, parentId = null }: BlockListProps): ReactElement => {
  const { blocks, dragState } = useEditor();

  const matchingBlocks = useMemo(() => {
    const filtered = blocks
      .filter((b) => b.pageId === pageId && (b.parentId ?? null) === (parentId ?? null))
      .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

    const seen = new Set<string>();
    return filtered.filter((b) => {
      if (!b.id || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [blocks, pageId, parentId]);

  const activeDragId = dragState.draggingBlockId ?? dragState.draggedBlockId;
  const draggedBlock = activeDragId ? blocks.find((b) => b.id === activeDragId) ?? null : null;

  return (
    <div className="flex flex-col gap-0.5">
      {matchingBlocks.map((block, idx) => (
        <BlockRenderer key={block.id} block={block} index={idx + 1} />
      ))}
      {parentId === null && (
        <DragPreview draggedBlock={draggedBlock} pointerPosition={dragState.pointerPosition} />
      )}
    </div>
  );
};
