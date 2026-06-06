import axios from "axios";
import { BACKEND_URL } from "@/config";
import type { ChatMessage } from "./types";

export async function getTemplate(prompt: string) {
  const { data } = await axios.post(`${BACKEND_URL}/template`, {
    prompt: prompt.trim(),
  });
  return data as {
    prompts: string[];
    uiPrompts: string[];
  };
}

export async function chat(messages: ChatMessage[]) {
  const { data } = await axios.post(`${BACKEND_URL}/chat`, { messages });
  const response = data.response;
  if (typeof response === "string") return response;
  // Fallback if API returns a message object instead of plain text
  const block = response?.content?.[0];
  if (block && typeof block.text === "string") return block.text;
  return "";
}
