"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Code2, Eye } from "lucide-react";
import { StepsList } from "@/components/StepsList";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader } from "@/components/Loader";
import { chat, getTemplate } from "@/lib/api";
import { buildFilesFromSteps, completedSteps, parseXml } from "@/lib/parse";
import type { ChatMessage, FileItem, Step } from "@/lib/types";
import { useWebContainer } from "@/hooks/useWebContainer";
import { useProjectRunner } from "@/hooks/useProjectRunner";

type Tab = "code" | "preview";

const panelClass = "bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto";

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
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const files = useMemo(() => buildFilesFromSteps(steps), [steps]);

  const { previewUrl } = useProjectRunner(webcontainer, files);

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
        setSteps((s) => [...s, ...completedSteps(parseXml(reply))]);
        setMessages([...userMessages, { role: "assistant", content: reply }]);
        setReady(true);
      } catch {
        setError(
          "Could not reach the API. Start the backend with: cd backend && npm run dev",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [prompt]);

  async function handleSend() {
    if (!userPrompt.trim()) return;

    const newMessage: ChatMessage = { role: "user", content: userPrompt };
    setLoading(true);
    try {
      const reply = await chat([...messages, newMessage]);
      setMessages((m) => [
        ...m,
        newMessage,
        { role: "assistant", content: reply },
      ]);
      setSteps((s) => [...s, ...completedSteps(parseXml(reply))]);
      setUserPrompt("");
    } finally {
      setLoading(false);
    }
  }

  if (!prompt) return null;

  const showChat = ready && !loading;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div className="max-h-[75vh] overflow-scroll">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
            <div className="flex flex-col gap-2">
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              {!showChat && !error ? (
                <Loader />
              ) : showChat ? (
                <>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="p-2 w-full"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-purple-400 px-4"
                  >
                    Send
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          <div className={`col-span-2 ${panelClass} h-[calc(100vh-8rem)]`}>
            <div className="flex space-x-2 mb-4">
              {(
                [
                  ["code", Code2, "Code"],
                  ["preview", Eye, "Preview"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${tab === id
                      ? "bg-gray-700 text-gray-100"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="h-[calc(100%-4rem)]">
              {tab === "preview" && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
