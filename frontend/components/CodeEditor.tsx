"use client";

import dynamic from "next/dynamic";
import { FileCode2 } from "lucide-react";
import type { FileItem } from "@/lib/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ".tsx": "typescript",
  ".jsx": "typescript",
  ".ts": "typescript",
  ".css": "css",
  ".html": "html",
  ".json": "json",
  ".js": "javascript",
};

function languageForPath(path: string): string {
  const match = path.match(/\.[^./]+$/);
  if (match) {
    return LANGUAGE_BY_EXTENSION[match[0]] ?? "plaintext";
  }
  return "plaintext";
}

export function CodeEditor({ file }: { file: FileItem | null }) {
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
        <FileCode2 className="w-10 h-10 opacity-40" />
        <p className="text-sm">Select a file to view its contents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border border-zinc-800">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-b border-zinc-800 shrink-0">
        <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs font-mono text-zinc-400 truncate">
          {file.path.replace(/^\//, "")}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={languageForPath(file.path)}
          theme="vs-dark"
          value={file.content || ""}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), monospace",
            lineNumbers: "on",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: "none",
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
            },
          }}
        />
      </div>
    </div>
  );
}
