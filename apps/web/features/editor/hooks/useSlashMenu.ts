"use client";

import { useCallback, useMemo, useState } from "react";
import type { BlockType } from "@workspace/types";
import { SLASH_COMMANDS, type SlashCommandDefinition } from "../components/slash-menu-items";

export interface UseSlashMenuOptions {
  onSelectType: (type: BlockType) => void;
  onClose: () => void;
}

export interface UseSlashMenuReturn {
  query: string;
  setQuery: (q: string) => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  filteredCommands: readonly SlashCommandDefinition[];
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  selectCurrent: () => void;
}

export const useSlashMenu = ({
  onSelectType,
  onClose
}: UseSlashMenuOptions): UseSlashMenuReturn => {
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((cmd) => {
      if (cmd.label.toLowerCase().includes(q)) return true;
      if (cmd.shortcut && cmd.shortcut.toLowerCase().includes(q)) return true;
      return cmd.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [query]);

  const selectCurrent = useCallback((): void => {
    if (filteredCommands.length > 0 && selectedIndex >= 0 && selectedIndex < filteredCommands.length) {
      const selectedCmd = filteredCommands[selectedIndex];
      if (selectedCmd) {
        onSelectType(selectedCmd.type);
        onClose();
      }
    }
  }, [filteredCommands, selectedIndex, onSelectType, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length));
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length === 0 ? 0 : (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
        return true;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        selectCurrent();
        return true;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return true;
      }
      return false;
    },
    [filteredCommands.length, selectCurrent, onClose]
  );

  return {
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filteredCommands,
    handleKeyDown,
    selectCurrent
  };
};
