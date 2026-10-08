import { z } from "zod";

export const keywordsSchema = z.object({
  keywords: z.array(z.string().max(200)).min(1).max(200),
});

export const seedsSchema = z.object({
  seeds: z.array(z.string().max(200)).min(1).max(20),
});

export type ApiError = { error: string };

/** Trim, lowercase, drop empties, dedupe. */
export function normalizeTerms(input: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const t = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected server error. Please try again.";
}
