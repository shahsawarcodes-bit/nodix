"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import {
  Lock,
  Globe,
  Link as LinkIcon,
  Check,
  ChevronDown,
  Trash2,
  HelpCircle
} from "lucide-react";
import type { Collaborator, GeneralAccess, Page, PermissionRole } from "@workspace/types";
import { useEditor } from "../../state";

export interface ShareDialogProps {
  page: Page;
  open: boolean;
  onClose: () => void;
}

const ROLE_LABELS: Record<PermissionRole, string> = {
  full_access: "Full access",
  can_edit: "Can edit",
  can_comment: "Can comment",
  can_view: "Can view"
};

const ROLE_DESCRIPTIONS: Record<PermissionRole, string> = {
  full_access: "Edit, suggest, comment, and share",
  can_edit: "Edit, suggest, and comment",
  can_comment: "Suggest and comment",
  can_view: "Can view only"
};

export const ShareDialog = ({ page, open, onClose }: ShareDialogProps): ReactElement | null => {
  const { updatePageShareSettings } = useEditor();
  const [inviteInput, setInviteInput] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<PermissionRole>("can_edit");
  const [showInviteRoleDropdown, setShowInviteRoleDropdown] = useState<boolean>(false);
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null);
  const [showGeneralAccessDropdown, setShowGeneralAccessDropdown] = useState<boolean>(false);
  const [showPublicRoleDropdown, setShowPublicRoleDropdown] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent): void => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const currentGeneralAccess: GeneralAccess = page.generalAccess ?? "invited";
  const currentPublicPermission: PermissionRole = page.publicPermission ?? "can_view";
  const collaborators: Collaborator[] = page.collaborators ?? [];

  const handleCopyLink = async (): Promise<void> => {
    try {
      const isPublic = currentGeneralAccess === "public";
      const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/page/${page.id}` : "";
      const url = isPublic ? `${baseUrl}?guest=true` : baseUrl;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleInvite = async (): Promise<void> => {
    if (!inviteInput.trim()) return;

    // Parse comma-separated emails
    const rawEmails = inviteInput.split(",").map((e) => e.trim()).filter((e) => e.length > 0);
    if (rawEmails.length === 0) return;

    const existingEmails = new Set(collaborators.map((c) => c.email.toLowerCase()));
    const newCollaborators: Collaborator[] = [...collaborators];

    for (const email of rawEmails) {
      if (!existingEmails.has(email.toLowerCase())) {
        newCollaborators.push({
          email: email.toLowerCase(),
          name: email.split("@")[0] || email,
          role: inviteRole,
          addedAt: new Date()
        });
        existingEmails.add(email.toLowerCase());
      }
    }

    setInviteInput("");
    await updatePageShareSettings(page.id, { collaborators: newCollaborators });
  };

  const handleRoleChange = async (email: string, newRole: PermissionRole): Promise<void> => {
    setActiveRoleDropdown(null);
    const updated = collaborators.map((c) =>
      c.email.toLowerCase() === email.toLowerCase() ? { ...c, role: newRole } : c
    );
    await updatePageShareSettings(page.id, { collaborators: updated });
  };

  const handleRemoveCollaborator = async (email: string): Promise<void> => {
    setActiveRoleDropdown(null);
    const updated = collaborators.filter((c) => c.email.toLowerCase() !== email.toLowerCase());
    await updatePageShareSettings(page.id, { collaborators: updated });
  };

  const handleGeneralAccessChange = async (newAccess: GeneralAccess): Promise<void> => {
    setShowGeneralAccessDropdown(false);
    await updatePageShareSettings(page.id, { generalAccess: newAccess });
  };

  const handlePublicPermissionChange = async (newRole: PermissionRole): Promise<void> => {
    setShowPublicRoleDropdown(false);
    await updatePageShareSettings(page.id, { publicPermission: newRole });
  };

  return (
    <div
      ref={dialogRef}
      className="absolute top-10 right-0 z-50 w-[420px] sm:w-[460px] bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header without tab switcher */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-xs font-semibold text-gray-900">Share</h3>

        <a
          href="https://www.notion.so/help/sharing-and-permissions"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HelpCircle className="size-3.5" />
          <span>Learn about sharing</span>
        </a>
      </div>

      <div className="p-4 space-y-4">
        {/* Invite Input Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white">
            <input
              type="text"
              placeholder="Email or group, separated by commas"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleInvite();
                }
              }}
              className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />

            {/* Invite Role Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInviteRoleDropdown(!showInviteRoleDropdown)}
                className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 font-medium px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{ROLE_LABELS[inviteRole]}</span>
                <ChevronDown className="size-3 text-gray-400" />
              </button>

              {showInviteRoleDropdown && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 text-xs">
                  {(["full_access", "can_edit", "can_comment", "can_view"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setInviteRole(role);
                        setShowInviteRoleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700 cursor-pointer"
                    >
                      <span>{ROLE_LABELS[role]}</span>
                      {inviteRole === role && <Check className="size-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!inviteInput.trim()}
            onClick={() => void handleInvite()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            Share
          </button>
        </div>

        {/* Collaborators List */}
        <div className="space-y-1">
          {/* Primary Workspace User */}
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                S
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-gray-900 flex items-center gap-1">
                  <span>Shah Sawar</span>
                  <span className="text-[11px] text-gray-400 font-normal">(You)</span>
                </div>
                <div className="text-[11px] text-gray-400 truncate">shahsawar.codes@gmail.com</div>
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveRoleDropdown(activeRoleDropdown === "owner" ? null : "owner")
                }
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer font-medium"
              >
                <span>Full access</span>
                <ChevronDown className="size-3 text-gray-400" />
              </button>

              {activeRoleDropdown === "owner" && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      Current access
                    </div>
                    <div className="font-medium text-gray-900">Full access</div>
                    <div className="text-[11px] text-gray-500">via user access on {page.title || "this page"}</div>
                  </div>

                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    User access
                  </div>

                  {(["full_access", "can_edit", "can_comment", "can_view"] as const).map((role) => (
                    <div
                      key={role}
                      className={`w-full text-left px-3 py-1.5 flex items-start justify-between ${
                        role === "full_access" ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{ROLE_LABELS[role]}</div>
                        <div className="text-[10px] text-gray-500">{ROLE_DESCRIPTIONS[role]}</div>
                      </div>
                      {role === "full_access" && <Check className="size-3.5 text-blue-600 shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invited Collaborators */}
          {collaborators.map((collab) => {
            const initial = (collab.name || collab.email || "?").charAt(0).toUpperCase();
            const isDropdownOpen = activeRoleDropdown === collab.email;

            return (
              <div
                key={collab.email}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    {initial}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {collab.name || collab.email}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{collab.email}</div>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRoleDropdown(isDropdownOpen ? null : collab.email)
                    }
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  >
                    <span>{ROLE_LABELS[collab.role]}</span>
                    <ChevronDown className="size-3 text-gray-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs">
                      {/* Current access section matching Notion screenshot */}
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                          Current access
                        </div>
                        <div className="font-medium text-gray-900">{ROLE_LABELS[collab.role]}</div>
                        <div className="text-[11px] text-gray-500">
                          via user access on {page.title || "this page"}
                        </div>
                      </div>

                      <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        User access
                      </div>

                      {(["full_access", "can_edit", "can_comment", "can_view"] as const).map(
                        (role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => void handleRoleChange(collab.email, role)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-start justify-between cursor-pointer ${
                              collab.role === role ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div>
                              <div className="font-medium text-gray-900">{ROLE_LABELS[role]}</div>
                              <div className="text-[10px] text-gray-500">
                                {ROLE_DESCRIPTIONS[role]}
                              </div>
                            </div>
                            {collab.role === role && (
                              <Check className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                            )}
                          </button>
                        )
                      )}

                      <div className="my-1 border-t border-gray-100" />

                      <button
                        type="button"
                        onClick={() => void handleRemoveCollaborator(collab.email)}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </button>

                      <div className="px-3 py-2 text-[10px] text-gray-400 leading-tight border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                        You&apos;ll override permissions from the parent page if you change this role.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 my-2" />

        {/* General Access Section */}
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            General access
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50/60 border border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-2xs shrink-0">
                {currentGeneralAccess === "public" ? (
                  <Globe className="size-4 text-emerald-600" />
                ) : (
                  <Lock className="size-4 text-gray-500" />
                )}
              </div>

              <div className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => setShowGeneralAccessDropdown(!showGeneralAccessDropdown)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
                >
                  <span className="truncate">
                    {currentGeneralAccess === "public"
                      ? "Anyone on the web with the link"
                      : "Only people invited"}
                  </span>
                  <ChevronDown className="size-3 text-gray-400 shrink-0" />
                </button>

                <div className="text-[11px] text-gray-400 truncate">
                  {currentGeneralAccess === "public"
                    ? "Anyone with the link can access this page"
                    : "Only explicitly invited people can access"}
                </div>

                {showGeneralAccessDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => void handleGeneralAccessChange("invited")}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-start gap-2.5 cursor-pointer ${
                        currentGeneralAccess === "invited" ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <Lock className="size-4 text-gray-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center justify-between">
                          <span>Only people invited</span>
                          {currentGeneralAccess === "invited" && (
                            <Check className="size-3.5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Only explicitly invited people can access
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleGeneralAccessChange("public")}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-start gap-2.5 cursor-pointer ${
                        currentGeneralAccess === "public" ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <Globe className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center justify-between">
                          <span>Anyone on the web with the link</span>
                          {currentGeneralAccess === "public" && (
                            <Check className="size-3.5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Anyone with the link can access according to permission
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Public Role Picker when public */}
            {currentGeneralAccess === "public" && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPublicRoleDropdown(!showPublicRoleDropdown)}
                  className="flex items-center gap-1 text-xs text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors cursor-pointer font-medium"
                >
                  <span>{ROLE_LABELS[currentPublicPermission]}</span>
                  <ChevronDown className="size-3 text-gray-400" />
                </button>

                {showPublicRoleDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 text-xs">
                    {(["can_view", "can_comment", "can_edit"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => void handlePublicPermissionChange(role)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700 cursor-pointer"
                      >
                        <span>{ROLE_LABELS[role]}</span>
                        {currentPublicPermission === role && (
                          <Check className="size-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Footer: Clean, centered Copy Link button */}
      <div className="border-t border-gray-100 p-3 bg-gray-50/50 flex items-center justify-center">
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs ${
            copied
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold"
              : "bg-white hover:bg-gray-100/80 border border-gray-200 hover:border-gray-300 text-gray-800"
          }`}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span>Link copied to clipboard</span>
            </>
          ) : (
            <>
              <LinkIcon className="size-3.5 text-gray-500" />
              <span>Copy link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
