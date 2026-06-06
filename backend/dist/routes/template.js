"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_1 = require("../defaults/node");
const react_1 = require("../defaults/react");
const prompt_1 = require("../prompt");
const client_1 = require("../client");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const prompt = req.body.prompt;
    const response = await client_1.client.messages.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "claude-opus-4-8",
        max_tokens: 200,
        system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    });
    const answer = response.content[0].text;
    if (answer != "react" && answer != "node") {
        return res.status(400).json({
            error: "Invalid answer",
        });
    }
    if (answer === "react") {
        return res.json({
            prompts: [
                prompt_1.BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [react_1.basePrompt],
        });
    }
    if (answer === "node") {
        return res.json({
            prompts: [
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [node_1.basePrompt],
        });
    }
});
exports.default = router;
