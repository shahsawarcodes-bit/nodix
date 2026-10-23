"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface TextBlockProps {
  block: Block;
}

export const TextBlock = ({ block }: TextBlockProps): ReactElement => {
  const isReadOnly = useReadOnly();
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
    <div
      ref={ref}
      data-placeholder={!isReadOnly ? "Type '/' for commands" : undefined}
      data-empty={!isReadOnly && isEmpty ? "true" : undefined}
      className={`py-1 px-1 min-h-[1.75rem] outline-none text-gray-900 leading-relaxed rounded transition-colors ${
        isReadOnly ? "cursor-default" : "focus:bg-gray-50/50"
      } ${colorClasses}`}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onBlur={!isReadOnly ? handleBlur : undefined}
      onInput={!isReadOnly ? handleInput : undefined}
      onKeyDown={!isReadOnly ? handleKeymapKeyDown : undefined}
    />
  );
};
