"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptPlain = promptPlain;
exports.promptForArtifact = promptForArtifact;
exports.promptWithSystem = promptWithSystem;
exports.chatWithSystem = chatWithSystem;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const sdk_1 = require("@cursor/sdk");
const stripindents_1 = require("./stripindents");
const apiKey = () => process.env.CURSOR_API_KEY;
/** Isolated cwd so the local Cursor agent never writes into the app repo. */
function agentScratchDir() {
    const dir = process.env.AGENT_SCRATCH_DIR ??
        path_1.default.join(os_1.default.tmpdir(), "bolt-new-agent-scratch");
    fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
const TEXT_ONLY_DIRECTIVE = (0, stripindents_1.stripIndents) `
  CRITICAL: You are powering a browser-based app builder. Generated projects run
  only inside an in-browser WebContainer — never on the host machine.
  DO NOT use write, edit, delete, or shell tools. DO NOT create files or folders
  on disk. Respond with plain text that includes a <boltArtifact> XML block only.
`;
const agentOptions = {
    get apiKey() {
        return apiKey();
    },
    model: { id: "composer-2.5" },
    local: { cwd: agentScratchDir() },
};
function formatConversation(messages) {
    return messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
}
async function runAgent(message) {
    try {
        const result = await sdk_1.Agent.prompt(message, agentOptions);
        if (result.status === "error") {
            throw new Error(`Cursor agent run failed: ${result.id}`);
        }
        return result.result ?? "";
    }
    catch (err) {
        if (err instanceof sdk_1.CursorAgentError) {
            throw new Error(`Cursor agent startup failed: ${err.message}`);
        }
        throw err;
    }
}
/** Short, non-artifact replies (e.g. template classification). */
async function promptPlain(message) {
    return runAgent(message);
}
/** Code-generation replies that must stay in WebContainer artifact XML. */
async function promptForArtifact(message) {
    return runAgent(`${TEXT_ONLY_DIRECTIVE}\n\n---\n\n${message}`);
}
async function promptWithSystem(system, userMessage, options) {
    const message = `${system}\n\n---\n\n${userMessage}`;
    return options?.artifact ? promptForArtifact(message) : promptPlain(message);
}
async function chatWithSystem(system, messages) {
    const conversation = formatConversation(messages);
    return promptForArtifact(`${system}\n\n---\n\nConversation:\n\n${conversation}`);
}
