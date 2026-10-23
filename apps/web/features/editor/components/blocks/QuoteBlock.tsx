"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface QuoteBlockProps {
  block: Block;
}

export const QuoteBlock = ({ block }: QuoteBlockProps): ReactElement => {
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
    <div className="border-l-4 border-gray-900 pl-4 py-1 my-1">
      <div
        ref={ref}
        data-placeholder={!isReadOnly ? "Empty quote" : undefined}
        data-empty={!isReadOnly && isEmpty ? "true" : undefined}
        className={`outline-none italic text-gray-800 leading-relaxed ${
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
