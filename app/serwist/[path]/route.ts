import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Revision for the precached /~offline page so an updated page replaces the
// stale cached copy. Uses the deploy commit SHA when available (Vercel),
// falls back to the local HEAD, then to a static constant.
const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  "ledger-pwa";

// Precache only the app shell (_next/static JS/CSS/fonts) and the PWA icons.
// Default Serwist globs (public/**/*) would precache the untracked mobile
// screenshot PNGs in public/ (~4MB) and bloat the SW install.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    globPatterns: [
      ".next/static/**/*.{js,css,html,ico,apng,png,avif,jpg,jpeg,jfif,pjpeg,pjp,gif,svg,webp,json,webmanifest}",
      "public/logo.svg",
      "public/icon-192x192.png",
      "public/icon-512x512.png",
      "public/icon-512-maskable.png",
      "public/apple-touch-logo.png",
    ],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });