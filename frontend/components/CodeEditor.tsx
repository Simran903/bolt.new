"use client";

import dynamic from "next/dynamic";
import type { FileItem } from "@/lib/types";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeEditor({ file }: { file: FileItem | null }) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={file.content || ""}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
