import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CONTACT_EMAIL = "REPLACE_WITH_MY_EMAIL";

export const metadata: Metadata = {
  title: "Commerce Keyword Lab",
  description:
    "Keyword research for UAE e-commerce sellers on Noon and Amazon, powered by Google Keyword Planner data via the Google Ads API. See monthly search volume, competition, and related keyword ideas, with Excel/CSV export.",
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-black/[.08] dark:border-white/[.145] py-6 px-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <a href="/privacy" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100">
              Privacy Policy
            </a>
            <span>
              Contact:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {CONTACT_EMAIL}
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
