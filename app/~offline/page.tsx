import Link from "next/link";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      <p className="font-display text-3xl font-bold text-text-primary">
        You&apos;re offline
      </p>
      <p className="max-w-sm text-sm text-text-secondary">
        Ledger needs a connection to load this page. Your last-viewed dashboard
        and recent transactions are stored on this device and will appear once
        you&apos;re back online.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-orange-btn-text hover:bg-orange-hover"
      >
        Go to dashboard
      </Link>
    </div>
  );
}