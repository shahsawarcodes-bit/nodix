"use client";

import { useState, type ReactElement } from "react";
import { ChevronRight } from "lucide-react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { BlockList } from "../BlockList";
import { getBlockColorClasses } from "./block-colors";

export interface ToggleBlockProps {
  block: Block;
}

export const ToggleBlock = ({ block }: ToggleBlockProps): ReactElement => {
  const isReadOnly = useReadOnly();
  const [expanded, setExpanded] = useState<boolean>(() => Boolean(block.props?.open));
  const { optimisticUpdateBlock } = useEditor();

  const { ref, handleInput, handleBlur, handleKeyDown: handleContentEditableKeyDown } =
    useContentEditable({
      initialValue: block.text,
      onChange: (text) => {
        if (isReadOnly) return;
        void optimisticUpdateBlock(block.id, { text });
      }
    });

  const { handleKeyDown: handleKeymapKeyDown } = useBlockKeymap({
    block,
    elementRef: ref,
    onKeyDownExtra: handleContentEditableKeyDown
  });

  const colorClasses = getBlockColorClasses(block.props);
  const isEmpty = block.text.trim() === "";

  return (
    <div className="py-1 px-1">
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-transform select-none focus:outline-none cursor-pointer"
          aria-label={expanded ? "Collapse toggle" : "Expand toggle"}
        >
          <ChevronRight
            className={`size-4 transition-transform duration-150 ${
              expanded ? "rotate-90 text-gray-800" : ""
            }`}
          />
        </button>
        <div
          ref={ref}
          data-placeholder={!isReadOnly ? "Toggle" : undefined}
          data-empty={!isReadOnly && isEmpty ? "true" : undefined}
          className={`flex-1 py-0.5 outline-none leading-relaxed text-gray-900 ${
            isReadOnly ? "cursor-default" : ""
          } ${colorClasses}`}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onBlur={!isReadOnly ? handleBlur : undefined}
          onInput={!isReadOnly ? handleInput : undefined}
          onKeyDown={!isReadOnly ? handleKeymapKeyDown : undefined}
        />
      </div>
      {expanded && (
        <div className="pl-6 border-l border-gray-100 ml-3 mt-1">
          <BlockList pageId={block.pageId} parentId={block.id} />
        </div>
      )}
    </div>
  );
};
