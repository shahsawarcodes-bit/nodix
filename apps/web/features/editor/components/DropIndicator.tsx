"use client";

import type { ReactElement } from "react";

export interface DropIndicatorProps {
  position: "before" | "after";
}

export const DropIndicator = ({ position }: DropIndicatorProps): ReactElement => {
  return (
    <div
      className={`absolute left-0 right-0 h-0.5 bg-blue-500 z-40 rounded pointer-events-none shadow-sm transition-all duration-100 ${
        position === "before" ? "-top-1" : "-bottom-1"
      }`}
    />
  );
};
