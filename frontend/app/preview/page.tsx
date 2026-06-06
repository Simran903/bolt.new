"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function getPreviewUrl(raw: string | null): string {
  if (!raw) return "";
  return raw.trim();
}

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const previewUrl = useMemo(
    () => getPreviewUrl(searchParams?.get("url") ?? null),
    [searchParams],
  );

  if (!previewUrl) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <p className="text-lg mb-2">Preview URL is missing.</p>
          <p className="text-sm text-zinc-500 mb-5">
            Reopen preview from the builder once the dev server is ready.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-zinc-950 p-3">
      <iframe
        src={previewUrl}
        className="w-full h-full border border-zinc-800 rounded-lg bg-zinc-950"
        title="Preview (new tab)"
        allow="cross-origin-isolated"
        style={{ colorScheme: "dark" }}
      />
    </main>
  );
}
