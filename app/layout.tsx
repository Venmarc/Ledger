import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const SITE_URL = "https://ledgerix.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ledger — Personal Finance Tracker for Nigerian Professionals",
    template: "Ledger — %s",
  },
  description:
    "An open-source personal finance tracker built for NGN-first expense tracking, budgeting, and savings goals. Built with Next.js, Supabase, and Clerk.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Ledger",
    description: "Track every ₦. Kill bad spending. Build financial clarity.",
    url: SITE_URL,
    images: [{ url: "/dashboard.png" }],
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ theme: dark }}>
      <html
        lang="en"
        className={cn("h-full", "antialiased", "dark", spaceGrotesk.variable, inter.variable)}
        data-theme="dark"
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const theme = localStorage.getItem('ledger-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                })()
              `
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
          <ThemeProvider>
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
