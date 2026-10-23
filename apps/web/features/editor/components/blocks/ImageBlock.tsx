"use client";

import { type ReactElement } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { Block } from "@workspace/types";
import { MediaPicker } from "@workspace/ui";
import { uploadFile, getAssetUrl } from "../../api/client";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";

export interface ImageBlockProps {
  block: Block;
}

export const ImageBlock = ({ block }: ImageBlockProps): ReactElement | null => {
  const isReadOnly = useReadOnly();
  const { optimisticUpdateBlock } = useEditor();
  const imageUrl = block.props.url;

  if (isReadOnly && !imageUrl) {
    return null;
  }

  const handleSelectUrl = async (url: string, fileName?: string): Promise<void> => {
    const nextProps = {
      ...block.props,
      url,
      ...(fileName ? { fileName } : {})
    };
    await optimisticUpdateBlock(block.id, {
      props: nextProps
    });
  };

  const handleRemove = async (): Promise<void> => {
    const nextProps = { ...block.props };
    delete nextProps.url;
    delete nextProps.fileName;
    await optimisticUpdateBlock(block.id, { props: nextProps });
  };

  return (
    <div className="my-2 select-none">
      {!imageUrl ? (
        <MediaPicker
          accept="image/*"
          onUpload={uploadFile}
          onSelectUrl={(url, fileName) => {
            void handleSelectUrl(url, fileName);
          }}
          submitButtonText="Embed image"
          triggerButton={
            <button
              type="button"
              className="flex items-center gap-2.5 w-full py-2.5 px-3 rounded-md bg-[#F2F1EE]/90 hover:bg-[#EBEAE5] text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xs font-medium border border-transparent hover:border-gray-300/50 select-none"
            >
              <ImageIcon className="size-4 text-gray-500 shrink-0" />
              <span>Add an image</span>
            </button>
          }
        />
      ) : (
        <div className="relative group inline-block max-w-full">
          <img
            src={getAssetUrl(imageUrl)}
            alt={block.props.fileName || "Image block"}
            className="rounded-lg max-w-full max-h-[550px] object-contain border border-gray-200/60 shadow-xs"
          />
          {/* Hover Action Bar */}
          {!isReadOnly && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 backdrop-blur-xs rounded-md shadow-md border border-gray-200 px-1 py-0.5 text-xs">
              <MediaPicker
                accept="image/*"
                onUpload={uploadFile}
                align="end"
                side="bottom"
                submitButtonText="Embed image"
                onSelectUrl={(url, fileName) => {
                  void handleSelectUrl(url, fileName);
                }}
                triggerButton={
                  <button
                    type="button"
                    className="px-2 py-0.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-xs font-medium cursor-pointer"
                  >
                    Change
                  </button>
                }
              />
              <button
                type="button"
                onClick={() => {
                  void handleRemove();
                }}
                className="px-2 py-0.5 rounded text-red-600 hover:bg-red-50 transition-colors text-xs font-medium cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

