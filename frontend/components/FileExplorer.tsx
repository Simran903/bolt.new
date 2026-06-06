"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  FolderClosed,
  FolderOpen,
  FolderTree,
} from "lucide-react";
import type { FileItem } from "@/lib/types";

function FileNode({
  item,
  depth,
  selectedPath,
  onSelect,
}: {
  item: FileItem;
  depth: number;
  selectedPath?: string;
  onSelect: (file: FileItem) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isSelected = item.type === "file" && item.path === selectedPath;
  const hasSelectedChild =
    item.type === "folder" &&
    item.children?.some(
      (c) =>
        c.path === selectedPath ||
        (c.type === "folder" &&
          c.children?.some((gc) => gc.path === selectedPath)),
    );

  useEffect(() => {
    if (hasSelectedChild) setOpen(true);
  }, [hasSelectedChild]);

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? "bg-violet-500/15 text-violet-200"
            : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
        }`}
        style={{ paddingLeft: `${depth * 0.875 + 0.5}rem` }}
        onClick={() =>
          item.type === "folder" ? setOpen(!open) : onSelect(item)
        }
      >
        {item.type === "folder" ? (
          <span className="text-zinc-600 shrink-0">
            {open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {item.type === "folder" ? (
          open ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
          ) : (
            <FolderClosed className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
          )
        ) : (
          <File className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        )}
        <span className="text-sm truncate">{item.name}</span>
      </div>
      {item.type === "folder" &&
        open &&
        item.children?.map((child) => (
          <FileNode
            key={child.path}
            item={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

export function FileExplorer({
  files,
  selectedPath,
  onFileSelect,
}: {
  files: FileItem[];
  selectedPath?: string;
  onFileSelect: (file: FileItem) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-zinc-500" />
          Files
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-panel scrollbar-auto-hide">
        {files.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            No files yet…
          </p>
        ) : (
          files.map((file) => (
            <FileNode
              key={file.path}
              item={file}
              depth={0}
              selectedPath={selectedPath}
              onSelect={onFileSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
