"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Code2,
  Eye,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

const EXAMPLES = [
  "Build a landing page for a todo app",
  "Create a portfolio site with dark theme",
  "Make a pricing page for a SaaS product",
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-generated code",
    desc: "Full React + Vite projects from a single prompt",
  },
  {
    icon: Code2,
    title: "Live editor",
    desc: "Browse every file as the agent writes them",
  },
  {
    icon: Eye,
    title: "Instant preview",
    desc: "Runs in-browser with WebContainer — no setup",
  },
];

export function HomePage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/builder?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <Wand2 className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">
            Bolt Clone
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Zap className="w-3.5 h-3.5 text-violet-500" />
          Powered by Cursor AI
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16 pt-8">
        <div className="max-w-3xl w-full animate-fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered website builder
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-zinc-50 mb-5 tracking-tight leading-[1.1]">
              Turn ideas into{" "}
              <span className="bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                live websites
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Describe what you want to build. Get full source code and a
              running preview — all in your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/50 p-1.5 animate-pulse-glow">
              <div className="rounded-xl bg-zinc-900/90 p-5 sm:p-6">
                <label htmlFor="prompt" className="sr-only">
                  Website description
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A modern landing page for a task management app with hero, features, and pricing sections…"
                  rows={4}
                  className="w-full p-4 bg-zinc-950/60 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none placeholder-zinc-600 outline-none transition-all text-[15px] leading-relaxed"
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-violet-900/30"
                  >
                    Generate Website
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-zinc-600 text-center sm:text-right sm:max-w-[140px]">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[10px]">
                      Enter
                    </kbd>{" "}
                    to start
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-8">
            <p className="text-xs text-zinc-600 text-center mb-3 uppercase tracking-widest font-medium">
              Try an example
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="text-sm px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 text-center hover:border-zinc-700/80 transition-colors"
              >
                <div className="inline-flex p-2 rounded-lg bg-zinc-800/60 mb-3">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-zinc-600 border-t border-zinc-900">
        Built with Next.js, WebContainer & Cursor SDK
      </footer>
    </div>
  );
}
