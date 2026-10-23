"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface NumberedListBlockProps {
  block: Block;
  index?: number;
}

export const NumberedListBlock = ({ block, index = 1 }: NumberedListBlockProps): ReactElement => {
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
    <div className="flex items-start gap-2 py-1 px-1">
      <div className="pt-0.5 select-none text-gray-500 font-medium text-sm min-w-[1.25rem] text-right">
        {index}.
      </div>
      <div
        ref={ref}
        data-placeholder={!isReadOnly ? "List" : undefined}
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
  );
};
