import { useEffect, useRef, useState } from "react";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { convertToWebContainerTree } from "@/lib/webcontainer";
import type { FileItem } from "@/lib/types";
import { ensureFile, filesSignature, findFileByPath } from "@/lib/parse";
import defaultPackageLock from "@/lib/react-package-lock.json";

const DEBOUNCE_MS = 600;

async function readProcessOutput(process: WebContainerProcess): Promise<string> {
  const lines: string[] = [];
  try {
    await process.output.pipeTo(
      new WritableStream<string>({
        write(chunk) {
          lines.push(chunk);
        },
      }),
    );
  } catch {
    // Stream closes when the process exits.
  }
  return lines.join("").trim();
}

function withDefaultPackageLock(files: FileItem[]): FileItem[] {
  if (findFileByPath(files, "/package-lock.json")) return files;
  if (!findFileByPath(files, "/package.json")) return files;
  return ensureFile(
    files,
    "/package-lock.json",
    JSON.stringify(defaultPackageLock, null, 2),
  );
}

async function runInstall(
  container: WebContainer,
  retry: boolean,
): Promise<{ code: number; output: string }> {
  const args = retry ? ["install"] : ["install", "--prefer-offline"];
  const installProcess = await container.spawn("npm", args);
  const [code, output] = await Promise.all([
    installProcess.exit,
    readProcessOutput(installProcess),
  ]);
  return { code, output };
}

export function useProjectRunner(
  webcontainer: WebContainer | undefined,
  files: FileItem[],
  enabled = true,
) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const signature = filesSignature(files);
  const lastSuccessfulSignature = useRef("");

  useEffect(() => {
    if (!webcontainer || !signature || !enabled) return;
    if (signature === lastSuccessfulSignature.current) return;
    if (!findFileByPath(files, "/package.json")) return;

    const container = webcontainer;
    let cancelled = false;
    let devProcess: WebContainerProcess | undefined;

    const onServerReady = (_port: number, url: string) => {
      if (!cancelled) {
        setPreviewUrl(url);
        setPreviewLoading(false);
        lastSuccessfulSignature.current = signature;
      }
    };

    container.on("server-ready", onServerReady);

    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewUrl("");

      async function run() {
        try {
          await container.mount(
            convertToWebContainerTree(withDefaultPackageLock(files)),
          );

          try {
            await container.fs.rm("node_modules", {
              recursive: true,
              force: true,
            });
          } catch {
            // node_modules may not exist yet.
          }

          let { code, output } = await runInstall(container, false);
          if (code !== 0) {
            ({ code, output } = await runInstall(container, true));
          }

          if (cancelled) return;

          if (code !== 0) {
            const detail = output.split("\n").slice(-6).join("\n");
            setPreviewError(
              detail
                ? `npm install failed:\n${detail}`
                : "npm install failed in WebContainer",
            );
            setPreviewLoading(false);
            return;
          }

          devProcess = await container.spawn("npm", ["run", "dev"]);
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
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      devProcess?.kill();
    };
  }, [webcontainer, signature, enabled, files]);

  return { previewUrl, previewLoading, previewError };
}
