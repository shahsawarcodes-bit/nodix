"use client";

import { useState, useRef, type ReactElement } from "react";
import { Upload, Trash2, Loader2, Smile } from "lucide-react";
import type { Page } from "@workspace/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@workspace/ui/primitives";
import { uploadFile, getAssetUrl } from "../api/client";
import { useEditor } from "../state";

export interface PageIconProps {
  page: Page;
  readOnly?: boolean;
}

const COMMON_EMOJIS = [
  "📄", "📁", "🚀", "💡", "🎯", "⭐", "📝", "💻",
  "🎨", "📊", "⚡", "🔥", "🏆", "📌", "📚", "🛠️",
  "☕", "🌟", "🔍", "🗓️", "🏷️", "👤", "🌱", "🔮"
];

export const PageIcon = ({ page, readOnly = false }: PageIconProps): ReactElement | null => {
  const { updatePageIcon } = useEditor();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customEmoji, setCustomEmoji] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectEmoji = async (emoji: string): Promise<void> => {
    if (readOnly) return;
    await updatePageIcon(page.id, emoji);
    setIsOpen(false);
  };

  const handleCustomEmojiSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (readOnly) return;
    const trimmed = customEmoji.trim();
    if (!trimmed) return;
    await updatePageIcon(page.id, trimmed);
    setIsOpen(false);
    setCustomEmoji("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const data = await uploadFile(file);
      await updatePageIcon(page.id, data.url);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload icon");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (): Promise<void> => {
    if (readOnly) return;
    await updatePageIcon(page.id, null);
    setIsOpen(false);
  };

  const isImageIcon =
    page.icon?.startsWith("http://") ||
    page.icon?.startsWith("https://") ||
    page.icon?.startsWith("/uploads/");

  if (!page.icon) {
    return null;
  }

  if (readOnly) {
    return (
      <div className="relative inline-block select-none mb-3">
        <div className="text-4xl leading-none flex items-center justify-center shrink-0">
          {isImageIcon ? (
            <img
              src={getAssetUrl(page.icon)}
              alt="Page icon"
              className="size-10 rounded-md object-cover"
            />
          ) : (
            <span>{page.icon}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/icon inline-block select-none mb-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-black/5 transition-colors cursor-pointer text-4xl leading-none flex items-center justify-center shrink-0 border border-transparent hover:border-gray-200"
            title="Click to change icon"
          >
            {isImageIcon ? (
              <img
                src={getAssetUrl(page.icon)}
                alt="Page icon"
                className="size-10 rounded-md object-cover"
              />
            ) : (
              <span>{page.icon}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className="w-72 p-3 bg-white rounded-lg shadow-xl border border-gray-200 text-xs"
        >
          <Tabs defaultValue="emojis" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-0.5 rounded-md h-8 text-xs">
              <TabsTrigger value="emojis" className="text-xs py-1 data-[state=active]:bg-white">
                Emojis
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs py-1 data-[state=active]:bg-white">
                Upload image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emojis" className="pt-2.5 space-y-2.5">
              <form onSubmit={(e) => void handleCustomEmojiSubmit(e)} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Type or paste emoji..."
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customEmoji.trim()}
                  className="px-2.5 py-1 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  Set
                </button>
              </form>

              <div className="grid grid-cols-6 gap-1 pt-1 border-t border-gray-100">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => void handleSelectEmoji(emoji)}
                    className="size-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="pt-3 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleFileUpload(e)}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="size-4 text-gray-400" />
                    <span className="text-xs font-medium">Upload custom icon image</span>
                    <span className="text-[10px] text-gray-400">Square PNG or JPG recommended</span>
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-[11px]">{error}</p>}
            </TabsContent>
          </Tabs>

          <div className="pt-2 mt-2 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => void handleRemove()}
              className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="size-3" />
              <span>Remove icon</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const AddIconButton = ({ page }: { page: Page }): ReactElement => {
  const { updatePageIcon } = useEditor();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customEmoji, setCustomEmoji] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectEmoji = async (emoji: string): Promise<void> => {
    await updatePageIcon(page.id, emoji);
    setIsOpen(false);
  };

  const handleCustomEmojiSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = customEmoji.trim();
    if (!trimmed) return;
    await updatePageIcon(page.id, trimmed);
    setIsOpen(false);
    setCustomEmoji("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFile(file);
      await updatePageIcon(page.id, data.url);
      setIsOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer select-none"
        >
          <Smile className="size-3.5 text-gray-400" />
          <span>Add icon</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-72 p-3 bg-white rounded-lg shadow-xl border border-gray-200 text-xs"
      >
        <Tabs defaultValue="emojis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-0.5 rounded-md h-8 text-xs">
            <TabsTrigger value="emojis" className="text-xs py-1 data-[state=active]:bg-white">
              Emojis
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs py-1 data-[state=active]:bg-white">
              Upload image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emojis" className="pt-2.5 space-y-2.5">
            <form onSubmit={(e) => void handleCustomEmojiSubmit(e)} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                placeholder="Type or paste emoji..."
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customEmoji.trim()}
                className="px-2.5 py-1 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Set
              </button>
            </form>

            <div className="grid grid-cols-6 gap-1 pt-1 border-t border-gray-100">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => void handleSelectEmoji(emoji)}
                  className="size-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg transition-transform hover:scale-110 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="pt-3 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => void handleFileUpload(e)}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="size-4 text-gray-400" />
                  <span className="text-xs font-medium">Upload custom icon image</span>
                  <span className="text-[10px] text-gray-400">Square PNG or JPG recommended</span>
                </>
              )}
            </button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
