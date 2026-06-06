import { FileItem, Step, StepType } from "./types";

export function parseXml(response: string): Step[] {
  if (typeof response !== "string") return [];

  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/,
  );
  if (!xmlMatch) return [];

  const xmlContent = xmlMatch[1];
  const titleMatch = response.match(/title="([^"]*)"/);
  const steps: Step[] = [
    {
      id: 1,
      title: titleMatch?.[1] ?? "Project Files",
      description: "",
      type: StepType.CreateFolder,
      status: "pending",
    },
  ];

  let id = 2;
  const actionRegex =
    /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;

  for (const match of xmlContent.matchAll(actionRegex)) {
    const [, type, filePath, content] = match;
    if (type === "file") {
      steps.push({
        id: id++,
        title: `Create ${filePath || "file"}`,
        description: "",
        type: StepType.CreateFile,
        status: "pending",
        code: content.trim(),
        path: filePath,
      });
    } else if (type === "shell") {
      steps.push({
        id: id++,
        title: "Run command",
        description: "",
        type: StepType.RunScript,
        status: "pending",
        code: content.trim(),
      });
    }
  }

  return steps;
}

export function completedSteps(steps: Step[]): Step[] {
  return steps.map((s) => ({ ...s, status: "completed" as const }));
}

export function buildFilesFromSteps(steps: Step[]): FileItem[] {
  return steps.reduce<FileItem[]>((tree, step) => {
    if (step.type !== StepType.CreateFile || !step.path) return tree;
    return addFile(tree, step.path, step.code ?? "");
  }, []);
}

function addFile(tree: FileItem[], filePath: string, content: string): FileItem[] {
  const segments = filePath.split("/").filter(Boolean);
  if (!segments.length) return tree;

  const root = [...tree];
  let level = root;
  let path = "";

  for (let i = 0; i < segments.length; i++) {
    const name = segments[i];
    path += `/${name}`;
    const isFile = i === segments.length - 1;

    if (isFile) {
      const existing = level.find((n) => n.path === path);
      if (existing) existing.content = content;
      else level.push({ name, type: "file", path, content });
      break;
    }

    let folder = level.find((n) => n.path === path);
    if (!folder) {
      folder = { name, type: "folder", path, children: [] };
      level.push(folder);
    }
    level = folder.children!;
  }

  return root;
}
