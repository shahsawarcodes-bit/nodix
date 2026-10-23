"use client";

import { useEffect, useState, type ReactElement } from "react";

export interface PageLastEditedProps {
  updatedAt?: Date | string | null | undefined;
}

export const formatRelativeTime = (dateInput?: Date | string | null): string => {
  if (!dateInput) return "Edited just now";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 15) {
    return "Edited just now";
  }

  if (diffInSeconds < 60) {
    return `Edited ${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Edited ${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Edited ${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Edited ${diffInDays}d ago`;
  }

  return `Edited ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })}`;
};

export const PageLastEdited = ({ updatedAt }: PageLastEditedProps): ReactElement => {
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const relativeText = formatRelativeTime(updatedAt);

  return (
    <span
      className="text-xs text-gray-400 font-normal select-none px-1.5 py-0.5 rounded transition-colors"
      title={updatedAt ? new Date(updatedAt).toLocaleString() : undefined}
    >
      {relativeText}
    </span>
  );
};
