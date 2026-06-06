import axios from "axios";
import { BACKEND_URL } from "@/config";
import type { ChatMessage } from "./types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Could not reach the API. Start the backend with: cd backend && npm run dev";
    }
    const data = err.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    return `${fallback} (${err.response.status})`;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export async function getTemplate(prompt: string) {
  try {
    const { data } = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });
    return data as {
      prompts: string[];
      uiPrompts: string[];
    };
  } catch (err) {
    throw new Error(apiErrorMessage(err, "Failed to load project template"));
  }
}

export async function chat(messages: ChatMessage[]) {
  try {
    const { data } = await axios.post(`${BACKEND_URL}/chat`, { messages });
    const response = data.response;
    if (typeof response === "string") return response;
    const block = response?.content?.[0];
    if (block && typeof block.text === "string") return block.text;
    return "";
  } catch (err) {
    throw new Error(apiErrorMessage(err, "Failed to generate response"));
  }
}
