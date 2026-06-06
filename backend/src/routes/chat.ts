import { Router } from "express";
import { chatWithSystem } from "../client";
import { getSystemPrompt } from "../prompt";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const messages = req.body.messages;
    const text = await chatWithSystem(getSystemPrompt(), messages);
    return res.json({ response: text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate response";
    return res.status(500).json({ error: message });
  }
});

export default router;
