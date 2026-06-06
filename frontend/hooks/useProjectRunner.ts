import { useEffect, useRef, useState } from "react";
import type { WebContainer } from "@webcontainer/api";
import { convertToWebContainerTree } from "@/lib/webcontainer";
import type { FileItem } from "@/lib/types";
import { filesSignature } from "@/lib/parse";

export function useProjectRunner(
  webcontainer: WebContainer | undefined,
  files: FileItem[],
) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const signature = filesSignature(files);
  const lastSignature = useRef("");

  useEffect(() => {
    if (!webcontainer || !signature) return;
    if (signature === lastSignature.current) return;

    lastSignature.current = signature;
    const container = webcontainer;
    let cancelled = false;

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl("");

    const onServerReady = (_port: number, url: string) => {
      if (!cancelled) {
        setPreviewUrl(url);
        setPreviewLoading(false);
      }
    };

    container.on("server-ready", onServerReady);

    async function run() {
      try {
        await container.mount(convertToWebContainerTree(files));

        const installProcess = await container.spawn("npm", ["install"]);
        const installExitCode = await installProcess.exit;

        if (cancelled) return;

        if (installExitCode !== 0) {
          setPreviewError("npm install failed in WebContainer");
          setPreviewLoading(false);
          return;
        }

        await container.spawn("npm", ["run", "dev"]);
      } catch (err) {
        if (!cancelled) {
          setPreviewError(
            err instanceof Error ? err.message : "Failed to start preview",
          );
          setPreviewLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [webcontainer, signature, files]);

  return { previewUrl, previewLoading, previewError };
}
