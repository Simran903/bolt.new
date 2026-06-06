/** Browser calls same-origin /api/* (proxied to backend in next.config.ts). */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api";
