"use client";

import { useCallback, useState } from "react";
import type { Block, BlockType } from "@workspace/types";
import { useEditor } from "../state";

export type SubmenuType = "turnInto" | "color" | null;

export interface UseBlockMenuOptions {
  block: Block;
  onClose: () => void;
}

export interface UseBlockMenuReturn {
  activeSubmenu: SubmenuType;
  setActiveSubmenu: (submenu: SubmenuType) => void;
  handleTurnInto: (type: BlockType) => Promise<void>;
  handleSetColor: (color: string, type: "text" | "background") => Promise<void>;
  handleDuplicate: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCopyLink: () => Promise<void>;
}

export const useBlockMenu = ({
  block,
  onClose
}: UseBlockMenuOptions): UseBlockMenuReturn => {
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuType>(null);
  const {
    convertBlockType,
    duplicateBlock,
    optimisticDeleteBlock,
    setBlockColor,
    setFocusedBlockId
  } = useEditor();

  const handleTurnInto = useCallback(
    async (type: BlockType): Promise<void> => {
      await convertBlockType(block.id, type);
      onClose();
      setFocusedBlockId(block.id);
    },
    [block.id, convertBlockType, onClose, setFocusedBlockId]
  );

  const handleSetColor = useCallback(
    async (color: string, type: "text" | "background"): Promise<void> => {
      await setBlockColor(block.id, color, type);
      onClose();
      setFocusedBlockId(block.id);
    },
    [block.id, setBlockColor, onClose, setFocusedBlockId]
  );

  const handleDuplicate = useCallback(async (): Promise<void> => {
    onClose();
    await duplicateBlock(block.id);
  }, [block.id, duplicateBlock, onClose]);

  const handleDelete = useCallback(async (): Promise<void> => {
    onClose();
    await optimisticDeleteBlock(block.id);
  }, [block.id, optimisticDeleteBlock, onClose]);

  const handleCopyLink = useCallback(async (): Promise<void> => {
    onClose();
    const url = `${window.location.origin}${window.location.pathname}#${block.id}`;
    await navigator.clipboard.writeText(url);
    setFocusedBlockId(block.id);
  }, [block.id, onClose, setFocusedBlockId]);

  return {
    activeSubmenu,
    setActiveSubmenu,
    handleTurnInto,
    handleSetColor,
    handleDuplicate,
    handleDelete,
    handleCopyLink
  };
};
