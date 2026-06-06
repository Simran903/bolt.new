"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../client");
const prompt_1 = require("../prompt");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const messages = req.body.messages;
        const text = await (0, client_1.chatWithSystem)((0, prompt_1.getSystemPrompt)(), messages);
        return res.json({ response: text });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate response";
        return res.status(500).json({ error: message });
    }
});
exports.default = router;
