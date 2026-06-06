"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prompt_1 = require("../prompt");
const client_1 = require("../client");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const messages = req.body.messages;
    const response = await client_1.client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 5000,
        system: (0, prompt_1.getSystemPrompt)(),
        messages: messages,
    });
    const text = response.content[0].text;
    return res.json({ response: text });
});
exports.default = router;
