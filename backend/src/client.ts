import fs from "fs";
import os from "os";
import path from "path";
import { Agent, CursorAgentError } from "@cursor/sdk";
import { stripIndents } from "./stripindents";

const apiKey = () => process.env.CURSOR_API_KEY as string;

/** Isolated cwd so the local Cursor agent never writes into the app repo. */
function agentScratchDir(): string {
  const dir =
    process.env.AGENT_SCRATCH_DIR ??
    path.join(os.tmpdir(), "bolt-new-agent-scratch");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const TEXT_ONLY_DIRECTIVE = stripIndents`
  CRITICAL: You are powering a browser-based app builder. Generated projects run
  only inside an in-browser WebContainer — never on the host machine.
  DO NOT use write, edit, delete, or shell tools. DO NOT create files or folders
  on disk. Respond with plain text that includes a <boltArtifact> XML block only.
`;

const agentOptions = {
  get apiKey() {
    return apiKey();
  },
  model: { id: "composer-2.5" as const },
  local: { cwd: agentScratchDir() },
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

function joinSections(...parts: string[]): string {
  return parts.join("\n\n---\n\n");
}

function formatConversation(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
}

async function runAgent(message: string, options?: { artifact?: boolean }): Promise<string> {
  const input = options?.artifact
    ? joinSections(TEXT_ONLY_DIRECTIVE, message)
    : message;
  try {
    const result = await Agent.prompt(input, agentOptions);

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

export async function chatWithSystem(
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  const conversation = formatConversation(messages);
  return runAgent(
    joinSections(system, `Conversation:\n\n${conversation}`),
    { artifact: true },
  );
}
