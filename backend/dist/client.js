"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = prompt;
exports.promptWithSystem = promptWithSystem;
exports.chatWithSystem = chatWithSystem;
const path_1 = __importDefault(require("path"));
const sdk_1 = require("@cursor/sdk");
const apiKey = () => process.env.CURSOR_API_KEY;
const agentOptions = {
    get apiKey() {
        return apiKey();
    },
    model: { id: "composer-2.5" },
    local: { cwd: path_1.default.resolve(__dirname, "../..") },
};
function formatConversation(messages) {
    return messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
}
async function prompt(message) {
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
async function promptWithSystem(system, userMessage) {
    return prompt(`${system}\n\n---\n\n${userMessage}`);
}
async function chatWithSystem(system, messages) {
    const conversation = formatConversation(messages);
    return prompt(`${system}\n\n---\n\nConversation:\n\n${conversation}`);
}
