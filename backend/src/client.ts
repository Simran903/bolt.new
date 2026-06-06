import path from "path";
import { Agent, CursorAgentError } from "@cursor/sdk";

const apiKey = () => process.env.CURSOR_API_KEY as string;

const agentOptions = {
  get apiKey() {
    return apiKey();
  },
  model: { id: "composer-2.5" as const },
  local: { cwd: path.resolve(__dirname, "../..") },
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

function formatConversation(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
}

export async function prompt(message: string): Promise<string> {
  try {
    const result = await Agent.prompt(message, agentOptions);

    if (result.status === "error") {
      throw new Error(`Cursor agent run failed: ${result.id}`);
    }

    return result.result ?? "";
  } catch (err) {
    if (err instanceof CursorAgentError) {
      throw new Error(`Cursor agent startup failed: ${err.message}`);
    }
    throw err;
  }
}

export async function promptWithSystem(
  system: string,
  userMessage: string,
): Promise<string> {
  return prompt(`${system}\n\n---\n\n${userMessage}`);
}

export async function chatWithSystem(
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  const conversation = formatConversation(messages);
  return prompt(`${system}\n\n---\n\nConversation:\n\n${conversation}`);
}
