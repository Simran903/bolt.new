export enum StepType {
  CreateFile,
  CreateFolder,
  RunScript,
}

export type StepStatus = "pending" | "in-progress" | "completed";

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  code?: string;
  path?: string;
}

export interface FileItem {
  name: string;
  type: "file" | "folder";
  children?: FileItem[];
  content?: string;
  path: string;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };
