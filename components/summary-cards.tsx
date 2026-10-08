import { useMemo } from "react";
import type { KeywordRow } from "@/lib/keyword-rows";
import { fmtInt } from "./format";

interface SummaryCardsProps {
  rows: KeywordRow[];
}

export default function SummaryCards({ rows }: SummaryCardsProps) {
  const summary = useMemo(() => {
    const userRows = rows.filter((r) => r.source === "user");
    const total = rows.reduce((acc, r) => acc + (r.avgMonthlySearches ?? 0), 0);
    const top = rows.reduce<KeywordRow | null>(
      (best, r) =>
        (r.avgMonthlySearches ?? 0) > (best?.avgMonthlySearches ?? -1) ? r : best,
      null
    );
    const highGrowth = rows.filter((r) => r.tags.includes("High-growth")).length;
    return {
      analysed: userRows.length,
      total,
      topKeyword: top?.keyword ?? "—",
      topSearches: top?.avgMonthlySearches ?? null,
      highGrowth,
    };
  }, [rows]);

  const card =
    "rounded-2xl border border-black/[.08] p-4 dark:border-white/[.14]";
  const label = "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
  const value = "mt-1 text-lg font-semibold text-black dark:text-zinc-50";

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Search summary">
      <div className={card}>
        <p className={label}>Keywords analysed</p>
        <p className={value}>{summary.analysed}</p>
      </div>
      <div className={card}>
        <p className={label}>Total monthly searches</p>
        <p className={value}>{fmtInt(summary.total)}</p>
      </div>
      <div className={`${card} min-w-0`}>
        <p className={label}>Top keyword</p>
        <p className={`${value} truncate`}>
          {summary.topKeyword}
          {summary.topSearches !== null && (
            <span className="ml-1.5 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              ({fmtInt(summary.topSearches)})
            </span>
          )}
        </p>
      </div>
      <div className={card}>
        <p className={label}>High-growth keywords</p>
        <p className={value}>{summary.highGrowth}</p>
      </div>
    </section>
  );
}
