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

async function mountProject(container: WebContainer, files: FileItem[]) {
  await container.mount(convertToWebContainerTree(withDefaultPackageLock(files)));
}

async function clearNodeModules(container: WebContainer) {
  try {
    await container.fs.rm("node_modules", {
      recursive: true,
      force: true,
    });
  } catch {
    // node_modules may not exist yet.
  }
}

async function runInstallWithRetry(
  container: WebContainer,
): Promise<{ code: number; output: string }> {
  let result = await runInstall(container, false);
  if (result.code !== 0) {
    result = await runInstall(container, true);
  }
  return result;
}

async function startDevServer(container: WebContainer): Promise<WebContainerProcess> {
  return container.spawn("npm", ["run", "dev"]);
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
  const latestFilesRef = useRef(files);

  useEffect(() => {
    latestFilesRef.current = files;
  }, [files]);

  useEffect(() => {
    if (!webcontainer || !signature || !enabled) return;
    if (signature === lastSuccessfulSignature.current) return;
    if (!findFileByPath(latestFilesRef.current, "/package.json")) return;

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
      const latestFiles = latestFilesRef.current;
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewUrl("");

      async function run() {
        try {
          await mountProject(container, latestFiles);
          await clearNodeModules(container);
          const { code, output } = await runInstallWithRetry(container);

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

          devProcess = await startDevServer(container);
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
  }, [webcontainer, signature, enabled]);

  return { previewUrl, previewLoading, previewError };
}
