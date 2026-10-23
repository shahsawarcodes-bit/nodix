"use client";

import { useState, useEffect, useRef, useMemo, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Loader2,
  Sparkles,
  LayoutTemplate,
  ArrowRight,
  AlertCircle,
  FileText,
  Plus
} from "lucide-react";
import type { Template } from "@workspace/types";
import { applyTemplate, listTemplates } from "../api/client";
import { useEditor } from "../state";

export interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  parentId?: string | null;
}

const CATEGORIES = [
  "All",
  "Work",
  "Personal",
  "Study",
  "Creative",
  "Blank Option"
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

const getCategoryBadgeClass = (category: string): string => {
  switch (category.toLowerCase()) {
    case "work":
      return "bg-blue-50 text-blue-700 border-blue-200/70";
    case "personal":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
    case "study":
      return "bg-amber-50 text-amber-700 border-amber-200/70";
    case "creative":
      return "bg-purple-50 text-purple-700 border-purple-200/70";
    case "blank":
    case "blank option":
      return "bg-gray-100 text-gray-700 border-gray-200/80";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200/60";
  }
};

export const TemplatesModal = ({
  open,
  onClose,
  parentId = null
}: TemplatesModalProps): ReactElement | null => {
  const router = useRouter();
  const { refreshPages, createNewPage } = useEditor();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch templates when opened
  useEffect(() => {
    if (!open) return;

    let mounted = true;

    listTemplates()
      .then((data) => {
        if (mounted) {
          setTemplates(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load templates");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  // Handle escape key and click outside
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !applyingId) {
        onClose();
      }
    };

    const handlePointerDown = (e: MouseEvent): void => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !applyingId) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open, onClose, applyingId]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "Blank Option") {
      return [];
    }

    return templates.filter((t) => {
      const matchesCategory =
        selectedCategory === "All" ||
        t.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [templates, selectedCategory, searchQuery]);

  const showBlankCard = useMemo(() => {
    if (selectedCategory === "Blank Option") return true;
    if (selectedCategory !== "All") return false;
    if (!searchQuery) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      "blank".includes(q) ||
      "blank page".includes(q) ||
      "empty".includes(q) ||
      "untitled".includes(q)
    );
  }, [selectedCategory, searchQuery]);

  const handleApply = async (template: Template): Promise<void> => {
    try {
      setApplyingId(template.id);
      setError(null);
      const newPage = await applyTemplate(template.id, parentId);
      await refreshPages();
      onClose();
      router.push(`/page/${newPage.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to apply template");
      setApplyingId(null);
    }
  };

  const handleApplyBlank = async (): Promise<void> => {
    try {
      setApplyingId("blank");
      setError(null);
      const newPage = await createNewPage("Untitled", parentId);
      await refreshPages();
      onClose();
      router.push(`/page/${newPage.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create blank page");
      setApplyingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Template Gallery
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  Nodix
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose a pre-built space to manage tasks, weekly schedules, or focus goals in seconds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(applyingId)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3.5 border-b border-gray-100 bg-[#FAFBFB] flex flex-col md:flex-row gap-3.5 md:items-center justify-between shrink-0">
          {/* Categories: All, Work, Personal, Study, Creative, Blank Option */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-gray-950 hover:bg-gray-100/80 border border-gray-200/80"
                  }`}
                >
                  {cat === "All" && "✨ All"}
                  {cat === "Work" && "📋 Work"}
                  {cat === "Personal" && "🌱 Personal"}
                  {cat === "Study" && "📚 Study"}
                  {cat === "Creative" && "🎨 Creative"}
                  {cat === "Blank Option" && "📄 Blank Option"}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-60 shrink-0">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="size-6 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading templates...</p>
            </div>
          ) : !showBlankCard && filteredTemplates.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 max-w-sm mx-auto">
              <Sparkles className="size-8 mb-2 opacity-40 text-blue-500" />
              <p className="text-sm font-semibold text-gray-800">No templates found in {selectedCategory}</p>
              <p className="text-xs text-gray-500 mt-1">
                Try selecting "All" or searching for a different keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-3.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {/* Blank Option Card */}
              {showBlankCard && (
                <div
                  onClick={() => {
                    if (!applyingId) {
                      void handleApplyBlank();
                    }
                  }}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer bg-white transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 hover:border-gray-400 ${
                    applyingId === "blank"
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-dashed border-gray-300 bg-linear-to-b from-gray-50/50 to-white"
                  }`}
                >
                  <div>
                    {/* Icon & Category Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="size-11 rounded-xl bg-gray-100/80 border border-gray-200/80 flex items-center justify-center text-gray-700 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all duration-200">
                        <Plus className="size-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border bg-gray-100 text-gray-700 border-gray-200/80">
                        Blank
                      </span>
                    </div>

                    {/* Title & 1-line Description */}
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>Blank Page</span>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 leading-normal">
                      Start from scratch with a completely empty page.
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Empty canvas
                    </span>

                    <button
                      type="button"
                      disabled={Boolean(applyingId)}
                      className="text-xs font-semibold flex items-center gap-1 text-gray-600 group-hover:text-blue-600 transition-colors"
                    >
                      {applyingId === "blank" ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-blue-600" />
                          <span className="text-blue-600">Creating...</span>
                        </>
                      ) : (
                        <>
                          <span>Create blank</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Polished Template Cards */}
              {filteredTemplates.map((template) => {
                const isApplying = applyingId === template.id;
                const badgeClass = getCategoryBadgeClass(template.category);

                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      if (!applyingId) {
                        void handleApply(template);
                      }
                    }}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer bg-white transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 hover:border-blue-500 ${
                      isApplying
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-200/90 shadow-2xs"
                    }`}
                  >
                    <div>
                      {/* Icon & Category Header */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="size-11 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                          {template.icon || "📄"}
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${badgeClass}`}
                        >
                          {template.category}
                        </span>
                      </div>

                      {/* Title & 1-line Description */}
                      <h3 className="font-bold text-gray-900 text-[15px] mb-1 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 leading-normal" title={template.description}>
                        {template.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {template.blocks.length} blocks
                      </span>

                      <button
                        type="button"
                        disabled={Boolean(applyingId)}
                        className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isApplying ? "text-blue-600" : "text-blue-600 group-hover:text-blue-700"
                        }`}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <>
                            <span>Use template</span>
                            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#FAFBFB] border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-gray-400" />
            Templates instantly create pre-populated pages in your workspace.
          </span>
          <span className="font-medium text-gray-500">Press Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
