"use client";

import { type ReactElement } from "react";
import { FileUp } from "lucide-react";
import type { Block } from "@workspace/types";
import { MediaPicker, FileCard } from "@workspace/ui";
import { uploadFile, getAssetUrl } from "../../api/client";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";

export interface FileBlockProps {
  block: Block;
}

export const FileBlock = ({ block }: FileBlockProps): ReactElement | null => {
  const isReadOnly = useReadOnly();
  const { optimisticUpdateBlock } = useEditor();

  const fileUrl = block.props.url;
  const fileName = block.props.fileName || "Download file";

  if (isReadOnly && !fileUrl) {
    return null;
  }

  const handleSelectUrl = async (url: string, selectedFileName?: string): Promise<void> => {
    if (isReadOnly) return;
    const derivedName =
      selectedFileName || block.props.fileName || url.split("/").pop() || "Attached File";

    await optimisticUpdateBlock(block.id, {
      props: {
        ...block.props,
        url,
        fileName: derivedName
      }
    });
  };

  const handleRemove = async (): Promise<void> => {
    if (isReadOnly) return;
    const nextProps = { ...block.props };
    delete nextProps.url;
    delete nextProps.fileName;
    await optimisticUpdateBlock(block.id, { props: nextProps });
  };

  return (
    <div className="my-1.5 select-none">
      {!fileUrl ? (
        <MediaPicker
          accept="*/*"
          showUnsplashTab={false}
          submitButtonText="Attach link"
          onUpload={uploadFile}
          onSelectUrl={(url, selectedFileName) => {
            void handleSelectUrl(url, selectedFileName);
          }}
          triggerButton={
            <button
              type="button"
              className="flex items-center gap-2.5 w-full py-2.5 px-3 rounded-md bg-[#F2F1EE]/90 hover:bg-[#EBEAE5] text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xs font-medium border border-transparent hover:border-gray-300/50 select-none"
            >
              <FileUp className="size-4 text-gray-500 shrink-0" />
              <span>Upload or embed a file</span>
            </button>
          }
        />
      ) : (
        <FileCard
          fileName={fileName}
          fileUrl={getAssetUrl(fileUrl)}
          {...(!isReadOnly && {
            onRemove: () => {
              void handleRemove();
            }
          })}
        />
      )}
    </div>
  );
};

