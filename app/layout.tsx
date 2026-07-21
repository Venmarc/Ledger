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

export const metadata: Metadata = {
  title: "Ledger — Personal Finance Tracker for Nigerian Professionals",
  description: "Personal finance OS for tracking every Naira, killing bad spending, hitting budgets, and building real financial clarity.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    // apple-touch-logo.png — add when the PNG is ready; do not invent a placeholder.
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
