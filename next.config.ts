import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSerwist } from "@serwist/turbopack";

// Pin workspace root to this package so Next does not pick up ~/package-lock.json
// (breaks asset tracing / can desync client chunks during dev).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  async headers() {
    return [
      {
        // The service worker must never be cached by the CDN/HTTP cache,
        // otherwise a stale SW brick updates (browser only updates a SW it
        // can re-fetch).
        source: "/serwist/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);