import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Pin workspace root to this package so Next does not pick up ~/package-lock.json
// (breaks asset tracing / can desync client chunks during dev).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
