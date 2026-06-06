import { Router } from "express";
import { basePrompt as nodeBasePrompt } from "../defaults/node";
import { basePrompt as reactBasePrompt } from "../defaults/react";
import { BASE_PROMPT } from "../prompt";
import { promptWithSystem } from "../client";

const router = Router();

const TEMPLATE_SYSTEM =
  "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

router.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const answer = (await promptWithSystem(TEMPLATE_SYSTEM, prompt)).trim();

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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to classify template";
    return res.status(500).json({ error: message });
  }
});

export default router;
