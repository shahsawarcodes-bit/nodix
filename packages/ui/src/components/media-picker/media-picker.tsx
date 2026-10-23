"use client";

import * as React from "react";
import { Upload, Link as LinkIcon, Sparkles, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../../primitives/index.js";

export interface MediaPickerProps {
  onSelectUrl: (url: string, fileName?: string) => Promise<void> | void;
  accept?: string;
  triggerButton?: React.ReactNode;
  children?: React.ReactNode;
  onUpload?: (file: File) => Promise<{ url: string; fileName?: string }>;
  uploadEndpoint?: string;
  showUnsplashTab?: boolean;
  presets?: string[];
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  linkPlaceholder?: string;
  submitButtonText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const defaultUploadFile = async (
  file: File,
  endpoint = "/api/upload"
): Promise<{ url: string; fileName?: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(errorData?.error?.message || `Upload failed with status ${String(response.status)}`);
  }

  return response.json() as Promise<{ url: string; fileName?: string }>;
};

export const MediaPicker = ({
  onSelectUrl,
  accept = "image/*",
  triggerButton,
  children,
  onUpload,
  uploadEndpoint = "/api/upload",
  showUnsplashTab = true,
  presets,
  align = "start",
  side = "bottom",
  className,
  linkPlaceholder,
  submitButtonText = "Embed",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: MediaPickerProps): React.ReactElement => {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [linkInput, setLinkInput] = React.useState<string>("");
  const [fileNameInput, setFileNameInput] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
    if (!nextOpen) {
      setError(null);
      setLinkInput("");
      setFileNameInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadFn = onUpload ?? ((f: File) => defaultUploadFile(f, uploadEndpoint));
      const data = await uploadFn(file);
      await onSelectUrl(data.url, data.fileName || file.name);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLinkSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = linkInput.trim();
    if (!trimmed) return;

    const derivedFileName =
      fileNameInput.trim() || trimmed.split("/").pop() || undefined;

    await onSelectUrl(trimmed, derivedFileName);
    handleOpenChange(false);
    setLinkInput("");
    setFileNameInput("");
  };

  const handlePresetSelect = async (presetUrl: string): Promise<void> => {
    await onSelectUrl(presetUrl);
    handleOpenChange(false);
  };

  const hasPresets = Array.isArray(presets) && presets.length > 0;
  const defaultTab = hasPresets ? "gallery" : "upload";

  const triggerContent = triggerButton ?? children;

  const resolvedLinkPlaceholder =
    linkPlaceholder ||
    (accept.startsWith("image") ? "Paste image web link..." : "Paste link to file...");

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      {triggerContent && <PopoverTrigger asChild>{triggerContent}</PopoverTrigger>}
      <PopoverContent
        align={align}
        side={side}
        className={className || "w-80 p-3 bg-white rounded-lg shadow-xl border border-gray-200 text-xs"}
      >
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList
            className={`grid w-full bg-gray-100 p-0.5 rounded-md h-8 text-xs ${
              hasPresets ? "grid-cols-3" : showUnsplashTab ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {hasPresets && (
              <TabsTrigger value="gallery" className="text-xs py-1 data-[state=active]:bg-white">
                Gallery
              </TabsTrigger>
            )}
            <TabsTrigger value="upload" className="text-xs py-1 data-[state=active]:bg-white">
              Upload
            </TabsTrigger>
            <TabsTrigger value="link" className="text-xs py-1 data-[state=active]:bg-white">
              Link
            </TabsTrigger>
            {!hasPresets && showUnsplashTab && (
              <TabsTrigger value="unsplash" className="text-xs py-1 data-[state=active]:bg-white">
                Unsplash
              </TabsTrigger>
            )}
          </TabsList>

          {/* Gallery Tab (when presets are provided) */}
          {hasPresets && (
            <TabsContent value="gallery" className="pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      void handlePresetSelect(preset);
                    }}
                    className="h-16 rounded-md overflow-hidden border border-gray-200 hover:scale-[1.02] transition-transform cursor-pointer relative"
                  >
                    <img
                      src={preset}
                      alt={`Preset ${String(idx + 1)}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Upload Tab */}
          <TabsContent value="upload" className="pt-3 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => {
                void handleFileUpload(e);
              }}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Uploading file...</span>
                </div>
              ) : (
                <>
                  <Upload className="size-4 text-gray-400" />
                  <span className="text-xs font-medium">
                    {accept.startsWith("image") ? "Upload an image file" : "Choose a file to upload"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {accept.startsWith("image")
                      ? "PNG, JPG, GIF, WebP up to 25MB"
                      : "PDF, DOC, ZIP, audio, etc."}
                  </span>
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-[11px]">{error}</p>}
          </TabsContent>

          {/* Link Tab */}
          <TabsContent value="link" className="pt-3">
            <form
              onSubmit={(e) => {
                void handleLinkSubmit(e);
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2.5 py-1.5 focus-within:border-blue-500">
                <LinkIcon className="size-3.5 text-gray-400 shrink-0" />
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                  }}
                  placeholder={resolvedLinkPlaceholder}
                  className="w-full bg-transparent outline-none text-xs text-gray-800 placeholder-gray-400"
                  autoFocus
                />
              </div>

              {accept !== "image/*" && (
                <input
                  type="text"
                  value={fileNameInput}
                  onChange={(e) => {
                    setFileNameInput(e.target.value);
                  }}
                  placeholder="Optional file name"
                  className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                />
              )}

              <button
                type="submit"
                disabled={!linkInput.trim()}
                className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitButtonText}
              </button>
            </form>
          </TabsContent>

          {/* Unsplash Tab */}
          {!hasPresets && showUnsplashTab && (
            <TabsContent value="unsplash" className="pt-6 pb-4 text-center">
              <div className="flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <Sparkles className="size-5 text-gray-300" />
                <span className="text-xs font-medium text-gray-500">Unsplash integration</span>
                <span className="text-[11px] text-gray-400">Coming soon</span>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
