import type { FileSystemTree } from "@webcontainer/api";
import type { FileItem } from "./types";

export function convertToWebContainerTree(files: FileItem[]): FileSystemTree {
  const result: FileSystemTree = {};

  function process(items: FileItem[], target: FileSystemTree) {
    for (const item of items) {
      if (item.type === "file") {
        target[item.name] = {
          file: {
            contents: item.content ?? "",
          },
        };
      } else {
        const directory: FileSystemTree = {};
        target[item.name] = { directory };
        process(item.children ?? [], directory);
      }
    }

  }
  process(files, result);

  return result;
}