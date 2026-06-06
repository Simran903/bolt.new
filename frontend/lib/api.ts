import axios from "axios";
import { BACKEND_URL } from "@/config";
import type { ChatMessage } from "./types";

export const API_UNREACHABLE_MESSAGE =
  "Could not reach the API. Start the backend with: cd backend && npm run dev";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return API_UNREACHABLE_MESSAGE;
    }
    const data = err.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    return `${fallback} (${err.response.status})`;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const { data } = await axios.post(`${BACKEND_URL}${path}`, payload);
  return data as T;
}

export async function getTemplate(prompt: string) {
  try {
    return await postJson<{
      prompts: string[];
      uiPrompts: string[];
    }>("/template", {
      prompt: prompt.trim(),
    });
  } catch (err) {
    throw new Error(apiErrorMessage(err, "Failed to load project template"));
  }
}

function parseChatResponse(data: { response: unknown }): string {
  return typeof data.response === "string" ? data.response : "";
}

export async function chat(messages: ChatMessage[]) {
  try {
    const data = await postJson<{ response: unknown }>("/chat", { messages });
    return parseChatResponse(data);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "Failed to generate response"));
  }
}
