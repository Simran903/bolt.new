import { Router } from "express";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { basePrompt as nodeBasePrompt } from "../defaults/node";
import { basePrompt as reactBasePrompt } from "../defaults/react";
import { BASE_PROMPT } from "../prompt";
import { client } from "../client";

const router = Router();

router.post("/", async (req, res) => {
  const prompt = req.body.prompt;

  const response = await client.messages.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "claude-opus-4-8",
    max_tokens: 200,
    system:
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  });

  const answer = (response.content[0] as TextBlock).text;

  if (answer != "react" && answer != "node") {
    return res.status(400).json({
      error: "Invalid answer",
    });
  }

  if (answer === "react") {
    return res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
  }

  if (answer === "node") {
    return res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
  }
});

export default router;
