"use client";

import { useCallback, useEffect, useRef } from "react";
import { generateKeyBetween } from "fractional-indexing";
import type { Block } from "@workspace/types";
import { useEditor } from "../state";

export interface UseBlockDragReturn {
  handlePointerDown: (e: React.PointerEvent<HTMLButtonElement>, block: Block) => void;
  wasDragging: () => boolean;
}

export const useBlockDrag = (): UseBlockDragReturn => {
  const { blocks, setDragState, moveBlock } = useEditor();

  const blocksRef = useRef<Block[]>(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const dropTargetRef = useRef<{ blockId: string; position: "before" | "after" } | null>(null);
  const justFinishedDragRef = useRef<boolean>(false);

  const dragSessionRef = useRef<{
    activeBlock: Block | null;
    startX: number;
    startY: number;
    isStarted: boolean;
    targetButton: HTMLButtonElement | null;
  }>({
    activeBlock: null,
    startX: 0,
    startY: 0,
    isStarted: false,
    targetButton: null
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, block: Block): void => {
      // Only primary mouse/pointer button
      if (e.button !== 0) return;

      const button = e.currentTarget;
      try {
        button.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture fails
      }

      console.log("[Drag] onPointerDown", block.id, e.pointerId);

      dropTargetRef.current = null;
      dragSessionRef.current = {
        activeBlock: block,
        startX: e.clientX,
        startY: e.clientY,
        isStarted: false,
        targetButton: button
      };

      const handlePointerMove = (moveEvent: PointerEvent): void => {
        const session = dragSessionRef.current;
        if (!session.activeBlock) return;

        const distance = Math.hypot(
          moveEvent.clientX - session.startX,
          moveEvent.clientY - session.startY
        );

        if (!session.isStarted) {
          if (distance >= 3) {
            session.isStarted = true;
            document.body.style.cursor = "grabbing";
            document.body.style.userSelect = "none";
          } else {
            return;
          }
        }

        const activeBlock = session.activeBlock;
        const pointerPos = { x: moveEvent.clientX, y: moveEvent.clientY };
        const dragOffset = {
          x: moveEvent.clientX - session.startX,
          y: moveEvent.clientY - session.startY
        };

        // Find nearest sibling drop target
        const currentBlocks = blocksRef.current;
        const siblingElements = Array.from(
          document.querySelectorAll<HTMLElement>("[data-editor-block-id]")
        ).filter((el) => {
          const id = el.getAttribute("data-editor-block-id");
          if (!id || id === activeBlock.id) return false;
          const b = currentBlocks.find((item) => item.id === id);
          return b && (b.parentId ?? null) === (activeBlock.parentId ?? null);
        });

        let closestTarget: { blockId: string; position: "before" | "after" } | null = null;
        let minDistance = Infinity;

        for (const el of siblingElements) {
          const targetId = el.getAttribute("data-editor-block-id");
          if (!targetId) continue;

          const rect = el.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const pos: "before" | "after" = moveEvent.clientY < midY ? "before" : "after";
          const targetY = pos === "before" ? rect.top : rect.bottom;
          const dist = Math.abs(moveEvent.clientY - targetY);

          if (dist < minDistance) {
            minDistance = dist;
            closestTarget = { blockId: targetId, position: pos };
          }
        }

        dropTargetRef.current = closestTarget;
        console.log("[Drag] onPointerMove", closestTarget);

        setDragState({
          isDragging: true,
          draggedBlockId: activeBlock.id,
          draggingBlockId: activeBlock.id,
          dragOffset,
          dropTarget: closestTarget,
          pointerPosition: pointerPos
        });
      };

      const handlePointerUp = (upEvent: PointerEvent): void => {
        const session = dragSessionRef.current;
        const activeBlock = session.activeBlock;
        const dropTarget = dropTargetRef.current;

        console.log("[Drag] onPointerUp", dropTarget);

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerUp);

        if (session.targetButton) {
          try {
            session.targetButton.releasePointerCapture(upEvent.pointerId);
          } catch {
            // ignore if already released
          }
        }

        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        if (session.isStarted) {
          justFinishedDragRef.current = true;
          setTimeout(() => {
            justFinishedDragRef.current = false;
          }, 150);
        }

        if (session.isStarted && activeBlock && dropTarget) {
          const { blockId: targetId, position } = dropTarget;
          const currentBlocks = blocksRef.current;

          // Sibling reordering
          const siblings = currentBlocks
            .filter((b) => (b.parentId ?? null) === (activeBlock.parentId ?? null))
            .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

          // Construct new array order without dragged block
          const filtered = siblings.filter((b) => b.id !== activeBlock.id);
          const targetIdx = filtered.findIndex((b) => b.id === targetId);

          if (targetIdx !== -1) {
            const insertIdx = position === "before" ? targetIdx : targetIdx + 1;
            const newArray = [
              ...filtered.slice(0, insertIdx),
              activeBlock,
              ...filtered.slice(insertIdx)
            ];

            const currentIndex = newArray.findIndex((b) => b.id === activeBlock.id);
            const prevBlock = currentIndex > 0 ? newArray[currentIndex - 1] : undefined;
            const nextBlock =
              currentIndex < newArray.length - 1 ? newArray[currentIndex + 1] : undefined;

            const newPos = generateKeyBetween(prevBlock?.pos ?? null, nextBlock?.pos ?? null);

            if (newPos !== activeBlock.pos) {
              void moveBlock(activeBlock.id, newPos, activeBlock.parentId);
            }
          }
        }

        dragSessionRef.current = {
          activeBlock: null,
          startX: 0,
          startY: 0,
          isStarted: false,
          targetButton: null
        };
        dropTargetRef.current = null;

        setDragState({
          isDragging: false,
          draggedBlockId: null,
          draggingBlockId: null,
          dragOffset: null,
          dropTarget: null,
          pointerPosition: null
        });
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
    },
    [moveBlock, setDragState]
  );

  const wasDragging = useCallback((): boolean => {
    return justFinishedDragRef.current || dragSessionRef.current.isStarted;
  }, []);

  return { handlePointerDown, wasDragging };
};
