import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  experimental: {
    // /chat calls Claude with large prompts and can exceed the default 30s proxy limit
    proxyTimeout: 120_000,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
