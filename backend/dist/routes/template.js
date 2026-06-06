"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_1 = require("../defaults/node");
const react_1 = require("../defaults/react");
const prompt_1 = require("../prompt");
const router = (0, express_1.Router)();
function guessTemplate(prompt) {
    const text = prompt.toLowerCase();
    const webHints = /\b(page|website|landing|react|ui|frontend|app|dashboard|portfolio|saas|todo|jewelry|store|shop)\b/;
    const nodeHints = /\b(node|cli|server|api|script|backend|express|terminal|tool)\b/;
    if (nodeHints.test(text) && !webHints.test(text))
        return "node";
    return "react";
}
function templatePayload(template) {
    if (template === "react") {
        return {
            prompts: [
                prompt_1.BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [react_1.basePrompt],
        };
    }
    return {
        prompts: [
            `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [node_1.basePrompt],
    };
}
router.post("/", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({ error: "Missing prompt" });
        }
        return res.json(templatePayload(guessTemplate(prompt)));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to classify template";
        return res.status(500).json({ error: message });
    }
});
exports.default = router;
