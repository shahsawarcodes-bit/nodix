"use client";

import type { ReactElement } from "react";
import type { Block } from "@workspace/types";
import { useBlockKeymap, useContentEditable } from "../../hooks";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";
import { getBlockColorClasses } from "./block-colors";

export interface TodoBlockProps {
  block: Block;
}

export const TodoBlock = ({ block }: TodoBlockProps): ReactElement => {
  const isReadOnly = useReadOnly();
  const { optimisticUpdateBlock } = useEditor();
  const isChecked = Boolean(block.props.checked);

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

  const toggleCheckbox = (): void => {
    if (isReadOnly) return;
    void optimisticUpdateBlock(block.id, {
      props: {
        ...block.props,
        checked: !isChecked
      }
    });
  };

  const colorClasses = getBlockColorClasses(block.props);
  const isEmpty = block.text.trim() === "";

  return (
    <div className="flex items-start gap-2 py-1 px-1 group">
      <div className="pt-1 select-none">
        <input
          type="checkbox"
          checked={isChecked}
          disabled={isReadOnly}
          onChange={toggleCheckbox}
          className={`size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
            isReadOnly ? "cursor-default" : "cursor-pointer"
          }`}
        />
      </div>
      <div
        ref={ref}
        data-placeholder={!isReadOnly ? "To-do" : undefined}
        data-empty={!isReadOnly && isEmpty ? "true" : undefined}
        className={`flex-1 py-0.5 outline-none leading-relaxed transition-all ${
          isReadOnly ? "cursor-default" : ""
        } ${isChecked ? "line-through text-gray-400" : "text-gray-900"} ${colorClasses}`}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        onBlur={!isReadOnly ? handleBlur : undefined}
        onInput={!isReadOnly ? handleInput : undefined}
        onKeyDown={!isReadOnly ? handleKeymapKeyDown : undefined}
      />
    </div>
  );
};
