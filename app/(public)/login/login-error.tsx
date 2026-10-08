"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized:
    "This Google account is not authorized to use Commerce Keyword Lab.",
  invalid_state: "Your sign-in session expired. Please try again.",
  oauth_failed: "Google sign-in failed. Please try again.",
};

export default function LoginError() {
  const code = useSearchParams().get("error");
  const message = code ? ERROR_MESSAGES[code] : null;
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
    >
      {message}
    </p>
  );
}
