"use client";

import { useEffect } from "react";

/**
 * Registers the Serwist service worker.
 *
 * `@serwist/window` is dynamically imported so the SW registration code does
 * not load in the initial bundle (protects Core Web Vitals). The SW itself is
 * built with `skipWaiting` + `clientsClaim` (see app/sw.ts), so a newer worker
 * activates immediately and this component never needs an update prompt.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let disposed = false;

    void import("@serwist/window")
      .then(({ Serwist }) => {
        if (disposed) return;
        const serwist = new Serwist("/serwist/sw.js", {
          scope: "/",
          type: "module",
        });
        serwist.register().catch(() => {
          // SW registration is non-critical; never let it surface an error.
        });
      })
      .catch(() => {
        // Module failed to load; app still works, just without offline support.
      });

    return () => {
      disposed = true;
    };
  }, []);

  return null;
}