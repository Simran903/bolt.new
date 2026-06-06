// hooks/useProjectRunner.ts

import { useEffect, useState } from "react";
import type { WebContainer } from "@webcontainer/api";
import { convertToWebContainerTree } from "@/lib/webcontainer";
import type { FileItem } from "@/lib/types";

export function useProjectRunner(
  webcontainer: WebContainer | undefined,
  files: FileItem[],
) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!webcontainer || files.length === 0) return;
    const container = webcontainer;

    async function run() {
      const mountTree = convertToWebContainerTree(files);

      // Mount files
      await container.mount(mountTree);

      // Install dependencies
      const installProcess = await container.spawn(
        "npm",
        ["install"]
      );

      const installExitCode = await installProcess.exit;

      if (installExitCode !== 0) {
        console.error("npm install failed");
        return;
      }

      // Start dev server
      await container.spawn(
        "npm",
        ["run", "dev"]
      );
    }

    container.on("server-ready", (port, url) => {
      setPreviewUrl(url);
    });

    run();
  }, [webcontainer, files]);

  return { previewUrl };
}