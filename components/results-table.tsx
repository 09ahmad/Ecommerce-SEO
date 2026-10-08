"use client";

import type { KeywordRow } from "@/lib/keyword-rows";
import {
  competitionBadge,
  fmtGrowth,
  fmtInt,
  fmtMoney,
  type SortableKey,
} from "./format";
import Sparkline from "./sparkline";

const PAGE_SIZE = 25;

const COLUMNS: { key: SortableKey; label: string; numeric?: boolean }[] = [
  { key: "keyword", label: "Keyword" },
  { key: "avgMonthlySearches", label: "Avg monthly searches", numeric: true },
  { key: "competition", label: "Competition" },
  { key: "competitionIndex", label: "Competition index", numeric: true },
  { key: "lowTopOfPageBid", label: "Low bid", numeric: true },
  { key: "highTopOfPageBid", label: "High bid", numeric: true },
  { key: "growthPercent", label: "Growth %", numeric: true },
];

interface ResultsTableProps {
  rows: KeywordRow[];
  totalRows: number;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  textFilter: string;
  onTextFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  availableTags: string[];
  sortKey: SortableKey;
  sortDir: "asc" | "desc";
  onSortToggle: (key: SortableKey) => void;
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i}>
          {Array.from({ length: COLUMNS.length + 3 }).map((_, j) => (
            <td
              key={j}
              className="border-b border-black/[.06] px-3 py-3 dark:border-white/[.1]"
            >
              <div
                className="h-4 animate-pulse rounded bg-black/[.08] dark:bg-white/[.12]"
                style={{ width: `${45 + ((i * 17 + j * 31) % 45)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ResultsTable({
  rows,
  totalRows,
  loading,
  page,
  onPageChange,
  textFilter,
  onTextFilterChange,
  tagFilter,
  onTagFilterChange,
  availableTags,
  sortKey,
  sortDir,
  onSortToggle,
}: ResultsTableProps) {
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="text-filter" className="sr-only">
            Filter by keyword
          </label>
          <input
            id="text-filter"
            type="search"
            value={textFilter}
            onChange={(e) => onTextFilterChange(e.target.value)}
            placeholder="Filter keywords…"
            className="rounded-lg border border-black/[.15] bg-transparent px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-white/[.2] dark:text-zinc-100 dark:focus:border-zinc-400"
          />
          <label htmlFor="tag-filter" className="sr-only">
            Filter by tag
          </label>
          <select
            id="tag-filter"
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            className="rounded-lg border border-black/[.15] bg-transparent px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-white/[.2] dark:text-zinc-500 dark:focus:border-zinc-400"
          >
            <option value="">All tags</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {rows.length} of {totalRows} rows
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.14]">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="text-left">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={
                    sortKey === c.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={`border-b border-black/[.08] px-3 py-2.5 font-medium whitespace-nowrap dark:border-white/[.14] ${c.numeric ? "text-right" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onSortToggle(c.key)}
                    className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {c.label}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {sortKey === c.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </button>
                </th>
              ))}
              <th
                scope="col"
                className="border-b border-black/[.08] px-3 py-2.5 font-medium dark:border-white/[.14]"
              >
                12-month trend
              </th>
              <th
                scope="col"
                className="border-b border-black/[.08] px-3 py-2.5 font-medium dark:border-white/[.14]"
              >
                Tags
              </th>
              <th
                scope="col"
                className="border-b border-black/[.08] px-3 py-2.5 font-medium dark:border-white/[.14]"
              >
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows />}
            {!loading &&
              visible.map((r) => (
                <tr key={`${r.source}-${r.keyword}`} className="align-middle">
                  <td className="border-b border-black/[.06] px-3 py-2.5 font-medium text-zinc-900 dark:border-white/[.1] dark:text-zinc-100">
                    {r.keyword}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 text-right tabular-nums dark:border-white/[.1]">
                    {fmtInt(r.avgMonthlySearches)}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 dark:border-white/[.1]">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${competitionBadge(r.competition)}`}
                    >
                      {r.competition}
                    </span>
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 text-right tabular-nums dark:border-white/[.1]">
                    {fmtInt(r.competitionIndex)}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 text-right tabular-nums dark:border-white/[.1]">
                    {fmtMoney(r.lowTopOfPageBid)}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 text-right tabular-nums dark:border-white/[.1]">
                    {fmtMoney(r.highTopOfPageBid)}
                  </td>
                  <td
                    className={`border-b border-black/[.06] px-3 py-2.5 text-right tabular-nums dark:border-white/[.1] ${
                      r.growthPercent === null
                        ? ""
                        : r.growthPercent >= 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {fmtGrowth(r.growthPercent)}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 dark:border-white/[.1]">
                    <Sparkline
                      volumes={r.monthlySearchVolumes.map((m) => m.searches)}
                    />
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 dark:border-white/[.1]">
                    {r.tags.length === 0 ? (
                      <span className="text-zinc-400 dark:text-zinc-500">
                        —
                      </span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-black/[.06] px-3 py-2.5 text-zinc-600 dark:border-white/[.1] dark:text-zinc-400">
                    {r.source === "user" ? "Your keyword" : "Idea"}
                  </td>
                </tr>
              ))}
            {!loading && visible.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 3}
                  className="px-3 py-10 text-center text-zinc-600 dark:text-zinc-400"
                >
                  {totalRows === 0
                    ? "No results yet. Enter keywords above and click “Get metrics”."
                    : "No rows match the current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-black/[.15] px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.2]"
          >
            Previous
          </button>
          <span className="text-zinc-600 dark:text-zinc-400">
            Page {safePage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pageCount, safePage + 1))}
            disabled={safePage >= pageCount}
            className="rounded-lg border border-black/[.15] px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.2]"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
