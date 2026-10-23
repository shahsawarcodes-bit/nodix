"use client";

import * as React from "react";
import { File as FileIcon, Download } from "lucide-react";

export interface FileCardProps {
  fileName: string;
  fileUrl: string;
  onRemove?: () => void;
  className?: string;
  downloadLabel?: string;
}

export const FileCard = ({
  fileName,
  fileUrl,
  onRemove,
  className,
  downloadLabel = "Download"
}: FileCardProps): React.ReactElement => {
  return (
    <div
      className={
        className ||
        "group relative flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50/70 transition-all max-w-lg shadow-xs"
      }
    >
      <div className="flex items-center gap-2.5 truncate mr-3">
        <div className="size-8 rounded-md bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
          <FileIcon className="size-4.5" />
        </div>
        <span className="text-xs font-medium text-gray-800 truncate" title={fileName}>
          {fileName}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={fileUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>{downloadLabel}</span>
        </a>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 px-1.5 py-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all text-xs cursor-pointer"
            aria-label="Remove file"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};
