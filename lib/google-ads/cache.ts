import "server-only";
import { getEnv } from "@/lib/env";
import type { KeywordRow } from "./types";

const TTL_SECONDS = 3 * 24 * 60 * 60; // 3 days
const memory = new Map<string, { value: KeywordRow; expiresAt: number }>();

function upstashConfig(): { url: string; token: string } | null {
  try {
    const env = getEnv();
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      return { url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN };
    }
  } catch {
    // env not validated yet in this code path
  }
  return null;
}

export function cacheKey(keyword: string, geo: string, language: string): string {
  return `kw:${keyword}|${geo}|${language}`;
}

export async function cacheGet(key: string): Promise<KeywordRow | null> {
  const up = upstashConfig();
  if (up) {
    try {
      const res = await fetch(`${up.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${up.token}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { result?: string | null };
      return data.result ? (JSON.parse(data.result) as KeywordRow) : null;
    } catch {
      return null;
    }
  }
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value;
}

export async function cacheSet(key: string, value: KeywordRow): Promise<void> {
  const up = upstashConfig();
  if (up) {
    try {
      await fetch(`${up.url}/set/${encodeURIComponent(key)}?EX=${TTL_SECONDS}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${up.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    } catch {
      // cache failure is non-fatal
    }
    return;
  }
  // Simple size guard for the in-memory fallback
  if (memory.size > 10_000) memory.clear();
  memory.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 });
}
