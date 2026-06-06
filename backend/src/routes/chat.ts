import { Router } from "express";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { getSystemPrompt } from "../prompt";
import { client } from "../client";

const router = Router();

router.post("/", async (req, res) => {
  const messages = req.body.messages;
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 5000,
    system: getSystemPrompt(),
    messages: messages,
  });

  const text = (response.content[0] as TextBlock).text;
  return res.json({ response: text });
});

export default router;
