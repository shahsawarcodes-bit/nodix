"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { useEditor } from "../state";

export interface PageTitleProps {
  pageId: string;
  initialTitle: string;
  readOnly?: boolean;
}

export const PageTitle = ({ pageId, initialTitle, readOnly = false }: PageTitleProps): ReactElement => {
  const { updatePageTitle } = useEditor();
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerText !== (initialTitle || "")) {
        ref.current.innerText = initialTitle || "";
      }
    }
  }, [initialTitle]);

  const handleInput = (): void => {
    if (readOnly || !ref.current) return;
    const currentText = ref.current.innerText;
    void updatePageTitle(pageId, currentText);
  };

  const handleBlur = (): void => {
    if (readOnly || !ref.current) return;
    const currentText = ref.current.innerText.trim();
    const finalTitle = currentText || "Untitled";
    if (ref.current.innerText !== finalTitle) {
      ref.current.innerText = finalTitle;
    }
    void updatePageTitle(pageId, finalTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <h1
      ref={ref}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onInput={!readOnly ? handleInput : undefined}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`text-4xl font-extrabold tracking-tight text-gray-900 outline-none pb-2 mb-4 border-b border-transparent transition-colors ${
        readOnly
          ? "cursor-default"
          : "hover:border-gray-100 focus:border-gray-200 empty:before:content-['Untitled'] empty:before:text-gray-300 empty:before:pointer-events-none"
      }`}
    />
  );
};
