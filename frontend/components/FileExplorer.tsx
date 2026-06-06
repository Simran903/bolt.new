"use client";

import { useState } from "react";
import {
  FolderTree,
  File,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { FileItem } from "@/lib/types";

function FileNode({
  item,
  depth,
  onSelect,
}: {
  item: FileItem;
  depth: number;
  onSelect: (file: FileItem) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={() =>
          item.type === "folder" ? setOpen(!open) : onSelect(item)
        }
      >
        {item.type === "folder" && (
          <span className="text-gray-400">
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {item.type === "folder" ? (
          <FolderTree className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-gray-200">{item.name}</span>
      </div>
      {item.type === "folder" && open && item.children?.map((child) => (
        <FileNode
          key={child.path}
          item={child}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function FileExplorer({
  files,
  onFileSelect,
}: {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100">
        <FolderTree className="w-5 h-5" />
        File Explorer
      </h2>
      <div className="space-y-1">
        {files.map((file) => (
          <FileNode
            key={file.path}
            item={file}
            depth={0}
            onSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
