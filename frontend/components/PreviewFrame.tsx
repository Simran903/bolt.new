"use client";

import { FileItem } from "@/lib/types";

interface PreviewFrameProps {
  files: FileItem[];
}

export function PreviewFrame({ files }: PreviewFrameProps) {
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="mb-2">Preview</p>
        <p className="text-sm text-gray-500">
          {files.length > 0
            ? `${files.length} top-level item(s) in the project`
            : "Generated files will appear here"}
        </p>
      </div>
    </div>
  );
}
