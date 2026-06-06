import { Router } from "express";
import { basePrompt as nodeBasePrompt } from "../defaults/node";
import { basePrompt as reactBasePrompt } from "../defaults/react";
import { toErrorMessage } from "../http";
import { BASE_PROMPT } from "../prompt";

const router = Router();

function guessTemplate(prompt: string): "react" | "node" {
  const text = prompt.toLowerCase();
  const webHints =
    /\b(page|website|landing|react|ui|frontend|app|dashboard|portfolio|saas|todo|jewelry|store|shop)\b/;
  const nodeHints =
    /\b(node|cli|server|api|script|backend|express|terminal|tool)\b/;

  if (nodeHints.test(text) && !webHints.test(text)) return "node";
  return "react";
}

function templatePayload(template: "react" | "node") {
  const withArtifactContext = (prompt: string) =>
    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${prompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`;

  if (template === "react") {
    return {
      prompts: [
        BASE_PROMPT,
        withArtifactContext(reactBasePrompt),
      ],
      uiPrompts: [reactBasePrompt],
    };
  }

  return {
    prompts: [
      withArtifactContext(reactBasePrompt),
    ],
    uiPrompts: [nodeBasePrompt],
  };
}

router.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    return res.json(templatePayload(guessTemplate(prompt)));
  } catch (err) {
    const message = toErrorMessage(err, "Failed to classify template");
    return res.status(500).json({ error: message });
  }
});

export default router;
