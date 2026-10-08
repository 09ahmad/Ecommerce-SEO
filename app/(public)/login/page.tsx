import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";
import LoginError from "./login-error";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            CK
          </span>
          <span className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
            Commerce Keyword Lab
          </span>
        </Link>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to open the keyword tool.
        </p>
      </div>

      <Suspense>
        <LoginError />
      </Suspense>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.14]">
        <a
          href="/api/auth/google/start"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-black/[.15] bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a3.83 3.83 0 0 1-1.66 2.52v2.1h2.68c1.57-1.45 2.78-3.58 2.78-6.26Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.86-2.18l-2.68-2.1c-.75.5-1.7.8-3.18.8a5.4 5.4 0 0 1-5.07-3.72H.19v2.17A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.93 10.8a5.41 5.41 0 0 1 0-3.6V5.53H.19a9 9 0 0 0 0 8.1l3.74-2.83Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .19 5.53L3.93 7.2A5.4 5.4 0 0 1 9 3.58Z"
            />
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.14]" />
          or
          <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.14]" />
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
