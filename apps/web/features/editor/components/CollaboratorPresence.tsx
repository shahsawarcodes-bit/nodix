"use client";

import { useState, type ReactElement } from "react";
import { X, Sparkles } from "lucide-react";
import { useEditor } from "../state";

export interface CollaboratorPresenceProps {
  name?: string | undefined;
  avatarText?: string | undefined;
  className?: string | undefined;
}

export const CollaboratorPresence = ({
  name,
  avatarText,
  className = ""
}: CollaboratorPresenceProps): ReactElement | null => {
  const { activeCollaborators } = useEditor();
  const [dismissed, setDismissed] = useState<boolean>(false);

  const activeCollab = activeCollaborators.find((c) => c.activeBlockId !== null) ?? activeCollaborators[0];

  const displayName = name ?? activeCollab?.name;
  if (!displayName || dismissed) return null;

  const displayAvatar =
    avatarText ??
    (displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U");

  const displayColor = activeCollab?.color ?? "#7C3AED";

  return (
    <div
      aria-label="Collaborator activity"
      className={`fixed bottom-5 right-6 z-40 flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-lg shadow-black/5 rounded-full px-3.5 py-1.5 select-none transition-all duration-200 hover:shadow-xl hover:border-gray-300 animate-in fade-in slide-in-from-bottom-2 ${className}`}
    >
      {/* Avatar with live pulse dot */}
      <div className="relative shrink-0">
        <div
          className="size-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
          style={{ backgroundColor: displayColor }}
        >
          {displayAvatar}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full border border-white ring-2 ring-emerald-500/20 animate-pulse" />
      </div>

      {/* Editing text with subtle icon */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="font-semibold text-gray-900">{displayName}</span>
        <span>is editing...</span>
        <Sparkles className="size-3 text-amber-500 animate-pulse" />
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-1 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Dismiss presence"
      >
        <X className="size-3" />
      </button>
    </div>
  );
};
