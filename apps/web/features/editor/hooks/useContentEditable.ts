"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject
} from "react";

export interface UseContentEditableOptions {
  initialValue: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  onBlur?: () => void;
}

export interface UseContentEditableReturn {
  ref: RefObject<HTMLDivElement | null>;
  handleInput: () => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const setCaretToEnd = (element: HTMLElement): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false); // false collapses to end

  selection.removeAllRanges();
  selection.addRange(range);
};

export const useContentEditable = ({
  initialValue,
  onChange,
  debounceMs = 150,
  onBlur
}: UseContentEditableOptions): UseContentEditableReturn => {
  const ref = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedValueRef = useRef<string>(initialValue);
  const currentValueRef = useRef<string>(initialValue);

  // Sync external initialValue when it changes, but only if different from DOM innerText
  useEffect(() => {
    currentValueRef.current = initialValue;
    const element = ref.current;
    if (element && element.innerText !== initialValue) {
      // Only set if not currently being actively typed in by user or value differs significantly
      if (document.activeElement !== element) {
        element.innerText = initialValue;
        lastEmittedValueRef.current = initialValue;
      }
    }
  }, [initialValue]);

  // Initial mount setting
  useEffect(() => {
    if (ref.current && ref.current.innerText !== initialValue) {
      ref.current.innerText = initialValue;
      lastEmittedValueRef.current = initialValue;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const element = ref.current;
    if (element) {
      const text = element.innerText;
      if (text !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = text;
        currentValueRef.current = text;
        onChange(text);
      }
    }
  }, [onChange]);

  const handleInput = useCallback((): void => {
    const element = ref.current;
    if (!element) return;

    const text = element.innerText;
    currentValueRef.current = text;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (text !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = text;
        onChange(text);
      }
      debounceTimerRef.current = null;
    }, debounceMs);
  }, [debounceMs, onChange]);

  const handleBlur = useCallback((): void => {
    flush();
    if (onBlur) {
      onBlur();
    }
  }, [flush, onBlur]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ref,
    handleInput,
    handleBlur,
    handleKeyDown
  };
};
