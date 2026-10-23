"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface HeadingBlockProps {
  block: Block;
  level: 1 | 2 | 3;
}

export const HeadingBlock = ({ block, level }: HeadingBlockProps): ReactElement => {
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

  const getHeadingStyles = (): string => {
    switch (level) {
      case 1:
        return "text-3xl font-bold tracking-tight text-gray-900 mt-5 mb-1";
      case 2:
        return "text-2xl font-semibold tracking-tight text-gray-900 mt-4 mb-1";
      case 3:
        return "text-xl font-medium tracking-tight text-gray-900 mt-3 mb-1";
    }
  };

  const colorClasses = getBlockColorClasses(block.props);
  const isEmpty = block.text.trim() === "";
  const placeholder = `Heading ${level}`;

  return (
    <div
      ref={ref}
      data-placeholder={!isReadOnly ? placeholder : undefined}
      data-empty={!isReadOnly && isEmpty ? "true" : undefined}
      className={`py-1 px-1 min-h-[2rem] outline-none rounded transition-colors ${
        isReadOnly ? "cursor-default" : ""
      } ${getHeadingStyles()} ${colorClasses}`}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onBlur={!isReadOnly ? handleBlur : undefined}
      onInput={!isReadOnly ? handleInput : undefined}
      onKeyDown={!isReadOnly ? handleKeymapKeyDown : undefined}
    />
  );
};
