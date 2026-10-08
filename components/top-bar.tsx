"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HealthStep {
  step: string;
  ok: boolean;
  detail?: string;
}

const secondaryBtn =
  "rounded-lg border border-black/[.15] px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[.2] dark:text-zinc-200 dark:hover:bg-white/[.06]";

export default function TopBar({ name, email }: { name?: string; email?: string }) {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<HealthStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runHealth() {
    setTesting(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      const data = (await res.json()) as { steps?: HealthStep[]; error?: string };
      if (!res.ok && !data.steps) throw new Error(data.error ?? "Health check failed.");
      setResult(data.steps ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Health check failed.");
    } finally {
      setTesting(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const userLabel = name || email || "Signed in";

  return (
    <div className="border-b border-black/[.08] dark:border-white/[.14]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
          Commerce Keyword Lab
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{userLabel}</span>
          <button onClick={runHealth} disabled={testing} className={secondaryBtn}>
            {testing ? "Testing…" : "Test connection"}
          </button>
          <button onClick={signOut} className={secondaryBtn}>
            Sign out
          </button>
        </div>
      </div>

      {result && (
        <div className="mx-auto w-full max-w-5xl px-4 pb-4 sm:px-6">
          <ul className="space-y-1.5 rounded-xl border border-black/[.08] dark:border-white/[.14] p-4 text-sm">
            {result.map((s) => (
              <li key={s.step} className="flex gap-2">
                <span
                  className={s.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                >
                  {s.ok ? "✓" : "✗"}
                </span>
                <span>
                  <span className="font-medium">{s.step}</span>
                  {s.detail && (
                    <span className="text-zinc-600 dark:text-zinc-400"> — {s.detail}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mx-auto w-full max-w-5xl px-4 pb-4 sm:px-6">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
