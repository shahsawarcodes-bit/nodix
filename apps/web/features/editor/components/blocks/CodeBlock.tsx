"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface CodeBlockProps {
  block: Block;
}

export const CodeBlock = ({ block }: CodeBlockProps): ReactElement => {
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
    <div className="my-1.5 rounded-md bg-gray-100 p-3 border border-gray-200/80">
      <div
        ref={ref}
        data-placeholder={!isReadOnly ? "Code" : undefined}
        data-empty={!isReadOnly && isEmpty ? "true" : undefined}
        className={`font-mono text-sm text-gray-800 outline-none leading-relaxed whitespace-pre-wrap ${
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
