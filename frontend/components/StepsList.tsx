"use client";

import {
  CheckCircle2,
  Circle,
  FileCode2,
  FolderOpen,
  Loader2,
  Terminal,
} from "lucide-react";
import { StepType, type Step } from "@/lib/types";

const stepIcon = {
  [StepType.CreateFile]: FileCode2,
  [StepType.CreateFolder]: FolderOpen,
  [StepType.RunScript]: Terminal,
};

function StepStatus({ status }: { status: Step["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
  if (status === "in-progress") {
    return <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />;
  }
  return <Circle className="w-4 h-4 text-zinc-600 shrink-0" />;
}

export function StepsList({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Step[];
  currentStep: number;
  onStepClick: (id: number) => void;
}) {
  const completed = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-zinc-100">Build Steps</h2>
          <span className="text-xs text-zinc-500 tabular-nums">
            {completed}/{steps.length}
          </span>
        </div>
        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{
              width: steps.length
                ? `${(completed / steps.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-panel scrollbar-auto-hide">
        {steps.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            Steps will appear here…
          </p>
        ) : (
          steps.map((step) => {
            const Icon = stepIcon[step.type] ?? FileCode2;
            const active = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  active
                    ? "bg-violet-500/10 border border-violet-500/20"
                    : "hover:bg-zinc-800/60 border border-transparent"
                }`}
              >
                <StepStatus status={step.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <p className="text-sm text-zinc-200 truncate">{step.title}</p>
                  </div>
                  {step.path && (
                    <p className="text-xs text-zinc-600 truncate mt-0.5 font-mono">
                      {step.path}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
