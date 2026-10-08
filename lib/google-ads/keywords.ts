import "server-only";
import { googleAdsFetch } from "./client";
import { cacheGet, cacheKey, cacheSet } from "./cache";
import type {
  Competition,
  KeywordRow,
  MonthlyVolume,
  RawKeywordMetrics,
  RawKeywordResult,
  RawMonthlyVolume,
} from "./types";

export const UAE_GEO = "geoTargetConstants/2784"; // United Arab Emirates
export const ENGLISH_LANGUAGE = "languageConstants/1000"; // English
export const DEFAULT_MAX_IDEAS = 100;

// Per-request limits verified in the Google Ads API v25 discovery doc
// (GenerateKeywordHistoricalMetricsRequest.keywords: "A maximum of 10,000
// keywords can be used"; KeywordSeed: "no more than 20 keywords").
// The request body is capped at 200 by the API routes, so one batch covers it.
const HISTORICAL_BATCH_SIZE = 1000;
const IDEA_SEED_BATCH_SIZE = 20;
const IDEAS_PAGE_SIZE = 100;

const MONTH_INDEX: Record<string, number> = {
  JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
  JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
};

const COMPETITIONS: Competition[] = ["LOW", "MEDIUM", "HIGH", "UNSPECIFIED"];

function parseInt64(value: string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function microsToCurrency(value: string | undefined): number | null {
  const micros = parseInt64(value);
  return micros === null ? null : micros / 1_000_000;
}

function normalizeMonthly(raw: RawMonthlyVolume[] | undefined): MonthlyVolume[] {
  return (raw ?? [])
    .map((m) => ({
      year: Number(m.year ?? 0),
      month: MONTH_INDEX[m.month ?? ""] ?? 0,
      searches: Number(m.monthlySearches ?? 0),
    }))
    .filter((m) => m.year > 0 && m.month > 0)
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .slice(-12);
}

export function computeGrowthPercent(months: MonthlyVolume[]): number | null {
  if (months.length < 6) return null;
  const latest = months.slice(-3).map((m) => m.searches);
  const earliest = months.slice(0, 3).map((m) => m.searches);
  const avgLatest = latest.reduce((a, b) => a + b, 0) / latest.length;
  const avgEarliest = earliest.reduce((a, b) => a + b, 0) / earliest.length;
  if (avgEarliest === 0) return null; // zero-safe
  return ((avgLatest - avgEarliest) / avgEarliest) * 100;
}

export function computeTags(args: {
  keyword: string;
  growthPercent: number | null;
  volume: number | null;
  seeds: string[];
}): string[] {
  const tags: string[] = [];
  if (args.keyword.trim().split(/\s+/).filter(Boolean).length >= 4) tags.push("Long-tail");
  if ((args.growthPercent ?? -Infinity) >= 25 && (args.volume ?? 0) >= 100) tags.push("High-growth");
  const lower = args.keyword.toLowerCase();
  if (args.seeds.some((s) => s && lower.includes(s.toLowerCase()))) tags.push("Product");
  return tags;
}

export function normalizeResult(
  raw: RawKeywordResult,
  seeds: string[],
  source: "user" | "idea"
): KeywordRow | null {
  const metrics: RawKeywordMetrics | undefined = raw.keywordIdeaMetrics ?? raw.keywordMetrics;
  const keyword = raw.text?.trim();
  if (!keyword) return null;

  const monthlySearchVolumes = normalizeMonthly(metrics?.monthlySearchVolumes);
  const avgMonthlySearches = parseInt64(metrics?.avgMonthlySearches);
  const growthPercent = computeGrowthPercent(monthlySearchVolumes);
  const competition: Competition = COMPETITIONS.includes(metrics?.competition as Competition)
    ? (metrics?.competition as Competition)
    : "UNSPECIFIED";

  return {
    keyword,
    avgMonthlySearches,
    competition,
    competitionIndex: parseInt64(metrics?.competitionIndex),
    lowTopOfPageBid: microsToCurrency(metrics?.lowTopOfPageBidMicros),
    highTopOfPageBid: microsToCurrency(metrics?.highTopOfPageBidMicros),
    monthlySearchVolumes,
    growthPercent,
    tags: computeTags({ keyword, growthPercent, volume: avgMonthlySearches, seeds }),
    source,
  };
}

interface HistoricalResponse {
  results?: RawKeywordResult[];
}

/**
 * Historical metrics for the exact keywords typed by the user.
 * Cached per keyword|geo|language for 3 days (memory by default, Upstash if configured).
 */
export async function getHistoricalMetrics(keywords: string[]): Promise<KeywordRow[]> {
  const out: KeywordRow[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    const key = cacheKey(kw, UAE_GEO, ENGLISH_LANGUAGE);
    const hit = await cacheGet(key);
    if (hit) out.push({ ...hit, source: "user" });
    else missing.push(kw);
  }

  for (let i = 0; i < missing.length; i += HISTORICAL_BATCH_SIZE) {
    const batch = missing.slice(i, i + HISTORICAL_BATCH_SIZE);
    const res = await googleAdsFetch<HistoricalResponse>("generateKeywordHistoricalMetrics", {
      keywords: batch,
      geoTargetConstants: [UAE_GEO],
      language: ENGLISH_LANGUAGE,
      keywordPlanNetwork: "GOOGLE_SEARCH",
    });

    for (const raw of res.results ?? []) {
      const row = normalizeResult(raw, batch, "user");
      if (!row) continue;
      out.push(row);
      await cacheSet(cacheKey(row.keyword.toLowerCase(), UAE_GEO, ENGLISH_LANGUAGE), row);
    }
  }

  // Preserve the caller's keyword order where possible
  const byKeyword = new Map(out.map((r) => [r.keyword.toLowerCase(), r]));
  return keywords.map((k) => byKeyword.get(k)).filter((r): r is KeywordRow => Boolean(r));
}

interface IdeasResponse {
  results?: RawKeywordResult[];
  nextPageToken?: string;
}

/** Keyword ideas from seed terms, following pagination up to maxIdeas. */
export async function getKeywordIdeas(
  seeds: string[],
  maxIdeas: number = DEFAULT_MAX_IDEAS
): Promise<KeywordRow[]> {
  const out: KeywordRow[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < seeds.length; i += IDEA_SEED_BATCH_SIZE) {
    const batch = seeds.slice(i, i + IDEA_SEED_BATCH_SIZE);
    let pageToken: string | undefined;

    do {
      const res = await googleAdsFetch<IdeasResponse>("generateKeywordIdeas", {
        keywordSeed: { keywords: batch },
        geoTargetConstants: [UAE_GEO],
        language: ENGLISH_LANGUAGE,
        keywordPlanNetwork: "GOOGLE_SEARCH",
        pageSize: IDEAS_PAGE_SIZE,
        ...(pageToken ? { pageToken } : {}),
      });

      for (const raw of res.results ?? []) {
        const row = normalizeResult(raw, batch, "idea");
        if (!row) continue;
        const id = row.keyword.toLowerCase();
        if (seen.has(id)) continue;
        seen.add(id);
        out.push(row);
        if (out.length >= maxIdeas) return out;
      }

      pageToken = res.nextPageToken || undefined;
    } while (pageToken && out.length < maxIdeas);
  }

  return out;
}
