"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  Eye,
  Loader2,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { StepsList } from "@/components/StepsList";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader } from "@/components/Loader";
import { chat, getTemplate } from "@/lib/api";
import {
  appendSteps,
  buildFilesFromSteps,
  completedSteps,
  findFileByPath,
  findFirstFile,
  parseXml,
} from "@/lib/parse";
import type { ChatMessage, Step } from "@/lib/types";
import { useWebContainer } from "@/hooks/useWebContainer";
import { useProjectRunner } from "@/hooks/useProjectRunner";

type Tab = "code" | "preview";

export function BuilderPage() {
  const router = useRouter();
  const prompt = useSearchParams()?.get("prompt")?.trim() ?? "";
  const webcontainer = useWebContainer();

  const [steps, setSteps] = useState<Step[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [tab, setTab] = useState<Tab>("code");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const files = useMemo(() => buildFilesFromSteps(steps), [steps]);

  const activeFile = useMemo(() => {
    if (selectedPath) {
      const match = findFileByPath(files, selectedPath);
      if (match) return match;
    }
    return findFirstFile(files);
  }, [files, selectedPath]);

  const { previewUrl, previewLoading, previewError } = useProjectRunner(
    webcontainer,
    files,
    !loading,
  );

  useEffect(() => {
    if (!prompt) router.replace("/");
  }, [prompt, router]);

  useEffect(() => {
    if (!prompt) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { prompts, uiPrompts } = await getTemplate(prompt);
        setSteps(completedSteps(parseXml(uiPrompts[0])));

        const userMessages: ChatMessage[] = [...prompts, prompt].map(
          (content) => ({ role: "user", content }),
        );
        const reply = await chat(userMessages);
        setSteps((s) => appendSteps(s, completedSteps(parseXml(reply))));
        setMessages([...userMessages, { role: "assistant", content: reply }]);
        setReady(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not reach the API. Start the backend with: cd backend && npm run dev",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [prompt]);

  async function handleSend() {
    if (!userPrompt.trim() || loading) return;

    const newMessage: ChatMessage = { role: "user", content: userPrompt };
    setPendingPrompt(userPrompt.trim());
    setUserPrompt("");
    setLoading(true);
    try {
      const reply = await chat([...messages, newMessage]);
      setMessages((m) => [
        ...m,
        newMessage,
        { role: "assistant", content: reply },
      ]);
      setSteps((s) => appendSteps(s, completedSteps(parseXml(reply))));
    } finally {
      setPendingPrompt(null);
      setLoading(false);
    }
  }

  if (!prompt) return null;

  const isInitialLoad = loading && !ready;
  const isApplyingChanges = loading && ready;
  const showChat = ready;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      <header className="shrink-0 flex items-center gap-4 px-4 h-14 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="w-px h-5 bg-zinc-800" />
        <div className="flex items-center gap-2 min-w-0">
          <Wand2 className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="text-sm font-medium truncate">{prompt}</span>
        </div>
        {isInitialLoad && (
          <div className="ml-auto flex items-center gap-2 text-xs text-violet-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating…
          </div>
        )}
        {isApplyingChanges && (
          <div className="ml-auto flex items-center gap-2 text-xs text-violet-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Applying changes…
          </div>
        )}
        {ready && !loading && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500/80">
            <Sparkles className="w-3.5 h-3.5" />
            Ready
          </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        {/* Left sidebar — steps + chat */}
        <aside className="col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0">
            <StepsList
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              processing={isApplyingChanges}
              processingLabel={
                pendingPrompt
                  ? `Working on: "${pendingPrompt}"`
                  : "Applying your changes…"
              }
            />
          </div>

          <div className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            {error && (
              <p className="text-sm text-red-400 mb-3 leading-relaxed">
                {error}
              </p>
            )}
            {isInitialLoad && !error && (
              <Loader label="Building your project…" />
            )}
            {showChat && (
              <div className="space-y-2">
                {isApplyingChanges && pendingPrompt && (
                  <div className="flex items-start gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <span className="text-zinc-500">You asked: </span>
                      &ldquo;{pendingPrompt}&rdquo;
                    </p>
                  </div>
                )}
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask for changes…"
                  rows={3}
                  disabled={loading}
                  className="w-full p-3 text-sm bg-zinc-950/50 text-zinc-100 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none placeholder-zinc-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!userPrompt.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {isApplyingChanges ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* File explorer */}
        <div className="col-span-2 min-h-0">
          <FileExplorer
            files={files}
            selectedPath={activeFile?.path}
            onFileSelect={(file) => setSelectedPath(file.path)}
          />
        </div>

        {/* Main panel — code / preview */}
        <main className="col-span-7 flex flex-col min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
            <div className="inline-flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
              {(
                [
                  ["code", Code2, "Code"],
                  ["preview", Eye, "Preview"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    tab === id
                      ? "bg-zinc-800 text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {id === "preview" && previewLoading && (
                    <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                  )}
                </button>
              ))}
            </div>
            {tab === "preview" && previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
              >
                Open in new tab ↗
              </a>
            )}
          </div>

          <div className="flex-1 min-h-0 p-3">
            {tab === "code" && <CodeEditor file={activeFile} />}
            {tab === "preview" && previewUrl && (
              <div className="h-full rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                  allow="cross-origin-isolated"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            )}
            {tab === "preview" && !previewUrl && (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
                {previewLoading ? (
                  <>
                    <Loader label="Starting dev server…" />
                    <p className="text-xs text-zinc-600 max-w-xs text-center">
                      Running npm install and starting Vite. This may take a
                      minute.
                    </p>
                  </>
                ) : (
                  <>
                    <Eye className="w-10 h-10 opacity-30" />
                    <p className="text-sm whitespace-pre-wrap max-w-md text-center">
                      {previewError ??
                        "Preview will appear once the dev server is ready"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
