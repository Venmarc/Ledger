/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type {
  PrecacheEntry,
  RouteMatchCallback,
  RuntimeCaching,
  SerwistGlobalConfig,
} from "serwist";
import { NetworkOnly, Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest at build time.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Clerk serves auth traffic from *.clerk.accounts.dev (and clerk.* hosts).
// Never cache it: responses carry session/cookie state.
const CLERK_HOST_RE = /(^|\.)clerk\.accounts\.dev$/i;

const isClerkHost: RouteMatchCallback = ({ url }) =>
  CLERK_HOST_RE.test(url.hostname) || url.hostname.startsWith("clerk.");

// Never cache Server Action POSTs. Prepended so they win over defaultCache,
// which would otherwise try to cache non-GET requests (cache.put throws on
// POST) or cross-origin Clerk responses via its NetworkFirst rule.
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ request }) => request.method === "POST",
    handler: new NetworkOnly(),
    method: "POST",
  },
  {
    matcher: isClerkHost,
    handler: new NetworkOnly(),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();