"use client";

import { useCallback, useEffect, type RefObject } from "react";
import type { Block, BlockType } from "@workspace/types";
import { useEditor } from "../state";
import { setCaretToEnd } from "./useContentEditable";

export interface UseBlockKeymapOptions {
  block: Block;
  elementRef: RefObject<HTMLDivElement | null>;
  onKeyDownExtra?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const useBlockKeymap = ({
  block,
  elementRef,
  onKeyDownExtra
}: UseBlockKeymapOptions): {
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
} => {
  const {
    blocks,
    focusedBlockId,
    setFocusedBlockId,
    activeMenuBlockId,
    setActiveMenuBlockId,
    slashMenuBlockId,
    setSlashMenuBlockId,
    optimisticUpdateBlock,
    optimisticDeleteBlock,
    createAndInsertBlock,
    duplicateBlock,
    indentBlock,
    outdentBlock
  } = useEditor();

  // Handle focus when focusedBlockId matches this block
  useEffect(() => {
    if (focusedBlockId === block.id && elementRef.current) {
      elementRef.current.focus();
      setCaretToEnd(elementRef.current);
    }
  }, [focusedBlockId, block.id, elementRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      onKeyDownExtra?.(e);
      if (e.defaultPrevented) return;

      const element = elementRef.current;
      if (!element) return;

      const text = element.innerText;
      const isEmpty = text.trim() === "";

      // Global block shortcuts (when focused)
      // 1. ⌘/ or Ctrl+/ → open block options menu
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id);
        return;
      }

      // 2. ⌘D or Ctrl+D → duplicate block
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        void duplicateBlock(block.id);
        return;
      }

      // 3. ⌘L or Ctrl+L → copy block link
      if ((e.metaKey || e.ctrlKey) && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#${block.id}`;
        void navigator.clipboard.writeText(url);
        return;
      }

      // 4. Escape → close any open menu
      if (e.key === "Escape") {
        if (activeMenuBlockId || slashMenuBlockId) {
          e.preventDefault();
          setActiveMenuBlockId(null);
          setSlashMenuBlockId(null);
          return;
        }
      }

      // 5. '/' trigger at start of empty block
      if (e.key === "/" && isEmpty && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setSlashMenuBlockId(block.id);
        return;
      }

      // 6. Enter (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        if (isEmpty) {
          // If not text, convert back to normal text
          if (block.type !== "text") {
            void optimisticUpdateBlock(block.id, { type: "text" });
            return;
          }
          // If already empty text, create a new text block below
          void createAndInsertBlock(
            {
              pageId: block.pageId,
              parentId: block.parentId,
              type: "text",
              text: ""
            },
            true
          );
          return;
        }

        // Current block has text: determine next block type
        let nextType: BlockType = "text";
        if (
          block.type === "bulleted_list" ||
          block.type === "numbered_list" ||
          block.type === "todo"
        ) {
          nextType = block.type;
        }

        void createAndInsertBlock(
          {
            pageId: block.pageId,
            parentId: block.parentId,
            type: nextType,
            text: ""
          },
          true
        );
        return;
      }

      // 7. Tab / Shift+Tab (Indent / Outdent)
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          void outdentBlock(block.id);
        } else {
          void indentBlock(block.id);
        }
        return;
      }

      // 8. Backspace
      if (e.key === "Backspace") {
        const selection = window.getSelection();
        const isAtStart =
          isEmpty ||
          (selection &&
            selection.rangeCount > 0 &&
            selection.getRangeAt(0).startOffset === 0 &&
            selection.getRangeAt(0).collapsed);

        if (isEmpty && isAtStart) {
          e.preventDefault();

          // If not text, convert to text first
          if (block.type !== "text") {
            void optimisticUpdateBlock(block.id, { type: "text" });
            return;
          }

          // If already text: delete and focus previous
          const currentIndex = blocks.findIndex((b) => b.id === block.id);
          if (currentIndex > 0) {
            const prevBlock = blocks[currentIndex - 1];
            if (prevBlock) {
              setFocusedBlockId(prevBlock.id);
            }
            void optimisticDeleteBlock(block.id);
          }
          return;
        }
      }

      // 9. ArrowUp: if at start of block, focus previous block
      if (e.key === "ArrowUp") {
        const selection = window.getSelection();
        const isAtStart =
          isEmpty ||
          (selection &&
            selection.rangeCount > 0 &&
            selection.getRangeAt(0).startOffset === 0 &&
            selection.getRangeAt(0).collapsed);

        if (isAtStart) {
          const currentIndex = blocks.findIndex((b) => b.id === block.id);
          if (currentIndex > 0) {
            e.preventDefault();
            const prevBlock = blocks[currentIndex - 1];
            if (prevBlock) {
              setFocusedBlockId(prevBlock.id);
            }
          }
        }
        return;
      }

      // 10. ArrowDown: if at end of block, focus next block
      if (e.key === "ArrowDown") {
        const selection = window.getSelection();
        const isAtEnd =
          isEmpty ||
          (selection &&
            selection.rangeCount > 0 &&
            selection.getRangeAt(0).startOffset >= element.innerText.length &&
            selection.getRangeAt(0).collapsed);

        if (isAtEnd) {
          const currentIndex = blocks.findIndex((b) => b.id === block.id);
          if (currentIndex >= 0 && currentIndex < blocks.length - 1) {
            e.preventDefault();
            const nextBlock = blocks[currentIndex + 1];
            if (nextBlock) {
              setFocusedBlockId(nextBlock.id);
            }
          }
        }
      }
    },
    [
      block,
      blocks,
      elementRef,
      onKeyDownExtra,
      optimisticUpdateBlock,
      optimisticDeleteBlock,
      createAndInsertBlock,
      setFocusedBlockId,
      activeMenuBlockId,
      setActiveMenuBlockId,
      slashMenuBlockId,
      setSlashMenuBlockId,
      duplicateBlock,
      indentBlock,
      outdentBlock
    ]
  );

  return { handleKeyDown };
};
