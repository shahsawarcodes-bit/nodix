"use client";

import { type ReactElement } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import type { Page } from "@workspace/types";
import { MediaPicker } from "@workspace/ui";
import { uploadFile, getAssetUrl } from "../api/client";
import { useEditor } from "../state";

export interface PageCoverProps {
  page: Page;
  readOnly?: boolean;
}

export const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
];

export const PageCover = ({ page, readOnly = false }: PageCoverProps): ReactElement | null => {
  const { updatePageCoverImage } = useEditor();

  const handleSelectCover = async (url: string): Promise<void> => {
    if (readOnly) return;
    await updatePageCoverImage(page.id, url);
  };

  const handleRemove = async (): Promise<void> => {
    if (readOnly) return;
    await updatePageCoverImage(page.id, null);
  };

  if (!page.coverImage) {
    return null;
  }

  return (
    <div className="relative group/cover w-full h-48 sm:h-56 md:h-64 overflow-hidden select-none bg-gray-100">
      <img
        src={getAssetUrl(page.coverImage)}
        alt="Page Cover"
        className="w-full h-full object-cover object-center block max-w-none"
      />

      {/* Hover action bar */}
      {!readOnly && (
        <div className="absolute bottom-3 right-6 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white/90 backdrop-blur-xs rounded-md shadow-md border border-gray-200/80 px-2 py-1 text-xs">
        <MediaPicker
          presets={PRESET_COVERS}
          accept="image/*"
          onUpload={uploadFile}
          align="end"
          side="top"
          submitButtonText="Set cover"
          onSelectUrl={(url) => {
            void handleSelectCover(url);
          }}
          triggerButton={
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 hover:bg-black/5 font-medium transition-colors cursor-pointer"
            >
              <ImageIcon className="size-3.5" />
              <span>Change cover</span>
            </button>
          }
        />

        <button
          type="button"
          onClick={() => {
            void handleRemove();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>Remove</span>
        </button>
      </div>
      )}
    </div>
  );
};

export const AddCoverButton = ({ page }: { page: Page }): ReactElement => {
  const { updatePageCoverImage } = useEditor();

  return (
    <MediaPicker
      presets={PRESET_COVERS}
      accept="image/*"
      onUpload={uploadFile}
      align="start"
      side="bottom"
      submitButtonText="Set cover"
      onSelectUrl={(url) => {
        void updatePageCoverImage(page.id, url);
      }}
      triggerButton={
        <button
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer select-none"
        >
          <ImageIcon className="size-3.5 text-gray-400" />
          <span>Add cover</span>
        </button>
      }
    />
  );
};

