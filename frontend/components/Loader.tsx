"use client";

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 w-full py-6">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
      </div>
      <p className="text-sm text-zinc-500">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
