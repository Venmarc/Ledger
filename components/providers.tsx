"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";
import { useAuth } from "@clerk/nextjs";
import { Toaster } from "sonner";

const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
const QUERY_CACHE_BUSTER = "ledger-query-cache-v1";

/**
 * Persists the TanStack Query cache to localStorage, keyed per Clerk user,
 * and hydrates it on boot. This is what makes the last-viewed dashboard and
 * recent transactions render while offline (all reads go through server
 * actions, which the service worker cannot cache).
 *
 * Keyed per user id so one account's cached data can never surface for
 * another account on the same device.
 */
function QueryPersistence({ queryClient }: { queryClient: QueryClient }) {
  const { userId } = useAuth();

  const persister = React.useMemo(() => {
    if (!userId) return null;
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: `ledger-query-cache-${userId}`,
      throttleTime: 1000,
    });
  }, [userId]);

  const previousUserId = React.useRef(userId);

  React.useEffect(() => {
    if (!persister) return;

    if (previousUserId.current !== userId) {
      // A different account is now signed in (no full reload between them):
      // drop the previous account's in-memory cache before hydrating this one.
      queryClient.clear();
    }
    previousUserId.current = userId;

    const options = {
      queryClient,
      persister,
      maxAge: QUERY_CACHE_MAX_AGE,
      buster: QUERY_CACHE_BUSTER,
    };

    void persistQueryClientRestore(options).catch(() => {});
    const unsubscribe = persistQueryClientSubscribe(options);

    return () => {
      unsubscribe();
      previousUserId.current = undefined;
    };
  }, [persister, queryClient, userId]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            // While offline, render the hydrated cache instead of attempting
            // a refetch that would fail and flip the UI into an error state.
            refetchOnMount: () =>
              typeof navigator === "undefined" || navigator.onLine,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QueryPersistence queryClient={queryClient} />
      {children}
      <Toaster position="top-right" theme="dark" closeButton />
    </QueryClientProvider>
  );
}