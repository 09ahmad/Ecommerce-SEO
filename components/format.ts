import type { KeywordRow } from "@/lib/keyword-rows";

export type SortableKey =
  | "keyword"
  | "avgMonthlySearches"
  | "competition"
  | "competitionIndex"
  | "lowTopOfPageBid"
  | "highTopOfPageBid"
  | "growthPercent";

export const COMPETITION_RANK: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  UNSPECIFIED: 3,
};

export function fmtInt(n: number | null): string {
  return n === null ? "—" : n.toLocaleString("en-US");
}

export function fmtMoney(n: number | null): string {
  return n === null ? "—" : n.toFixed(2);
}

export function fmtGrowth(n: number | null): string {
  if (n === null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function competitionBadge(competition: KeywordRow["competition"]): string {
  switch (competition) {
    case "LOW":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "HIGH":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export function compareRows(
  a: KeywordRow,
  b: KeywordRow,
  key: SortableKey,
  dir: 1 | -1
): number {
  if (key === "keyword") return dir * a.keyword.localeCompare(b.keyword);
  if (key === "competition") {
    const ra = COMPETITION_RANK[a.competition] ?? 3;
    const rb = COMPETITION_RANK[b.competition] ?? 3;
    return dir * (ra - rb);
  }
  const av = a[key];
  const bv = b[key];
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  return dir * (av - bv);
}
