"use client";

import { useMemo, useState } from "react";
import { normalizeTerms } from "@/lib/validate";
import type { KeywordRow } from "@/lib/keyword-rows";
import { compareRows, type SortableKey } from "./format";
import SearchForm from "./search-form";
import SummaryCards from "./summary-cards";
import ResultsTable from "./results-table";
import ExportButtons from "./export-buttons";

const MAX_KEYWORDS = 200;
const MAX_SEEDS = 20;

const COARSE_BUCKETS = new Set([10, 100, 1000, 10000, 100000, 1000000]);

function looksLikeCoarseBuckets(rows: KeywordRow[]): boolean {
  const values = rows
    .flatMap((r) => r.monthlySearchVolumes.map((m) => m.searches))
    .filter((v) => v > 0);
  if (values.length < 12) return false;
  const coarse = values.filter((v) => COARSE_BUCKETS.has(v) || v % 1000 === 0).length;
  return coarse / values.length >= 0.8;
}

export default function DashboardClient() {
  const [input, setInput] = useState("");
  const [userRows, setUserRows] = useState<KeywordRow[]>([]);
  const [ideaRows, setIdeaRows] = useState<KeywordRow[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textFilter, setTextFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortableKey>("avgMonthlySearches");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const keywords = useMemo(() => normalizeTerms(input.split("\n")), [input]);
  const overLimit = keywords.length > MAX_KEYWORDS;

  const allRows = useMemo(() => {
    const seen = new Set(userRows.map((r) => r.keyword.toLowerCase()));
    return [...userRows, ...ideaRows.filter((r) => !seen.has(r.keyword.toLowerCase()))];
  }, [userRows, ideaRows]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const r of allRows) for (const t of r.tags) tags.add(t);
    return [...tags].sort();
  }, [allRows]);

  const filteredSorted = useMemo(() => {
    const q = textFilter.trim().toLowerCase();
    const rows = allRows.filter((r) => {
      if (tagFilter && !r.tags.includes(tagFilter)) return false;
      if (q && !r.keyword.includes(q)) return false;
      return true;
    });
    return rows.sort((a, b) => compareRows(a, b, sortKey, sortDir === "asc" ? 1 : -1));
  }, [allRows, textFilter, tagFilter, sortKey, sortDir]);

  const busy = metricsLoading || ideasLoading;
  const hasResults = allRows.length > 0;
  const coarseData = hasResults && !busy && looksLikeCoarseBuckets(filteredSorted);

  function toggleSort(key: SortableKey) {
    setPage(1);
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "keyword" ? "asc" : "desc");
    }
  }

  function changeTextFilter(value: string) {
    setPage(1);
    setTextFilter(value);
  }

  function changeTagFilter(value: string) {
    setPage(1);
    setTagFilter(value);
  }

  async function runMetrics() {
    setMetricsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keywords/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.slice(0, MAX_KEYWORDS) }),
      });
      const data = (await res.json()) as { rows?: KeywordRow[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not fetch metrics.");
      setUserRows(data.rows ?? []);
      setPage(1);
      if ((data.rows ?? []).length === 0) {
        setError("Google returned no metrics for these keywords. Try broader terms.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setMetricsLoading(false);
    }
  }

  async function runIdeas() {
    setIdeasLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keywords/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seeds: keywords.slice(0, MAX_SEEDS) }),
      });
      const data = (await res.json()) as { rows?: KeywordRow[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not fetch keyword ideas.");
      setIdeaRows((prev) => {
        const seen = new Set([...userRows, ...prev].map((r) => r.keyword.toLowerCase()));
        const fresh = (data.rows ?? []).filter((r) => !seen.has(r.keyword.toLowerCase()));
        return [...prev, ...fresh];
      });
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIdeasLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Keyword research
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Google Keyword Planner data for the United Arab Emirates.
        </p>
      </div>

      <SearchForm
        value={input}
        onInputChange={setInput}
        keywordCount={keywords.length}
        overLimit={overLimit}
        onGetMetrics={runMetrics}
        onFindIdeas={runIdeas}
        metricsLoading={metricsLoading}
        ideasLoading={ideasLoading}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {coarseData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Most monthly volumes look like coarse buckets (10, 100, 1,000…). Your Google Ads
          account may have little ad spend, so Keyword Planner may return rounded data.
        </div>
      )}

      {hasResults && <SummaryCards rows={allRows} />}

      {hasResults && (
        <>
          <ResultsTable
            rows={filteredSorted}
            totalRows={allRows.length}
            loading={busy}
            page={page}
            onPageChange={setPage}
            textFilter={textFilter}
            onTextFilterChange={changeTextFilter}
            tagFilter={tagFilter}
            onTagFilterChange={changeTagFilter}
            availableTags={availableTags}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortToggle={toggleSort}
          />
          <ExportButtons rows={filteredSorted} onError={setError} />
        </>
      )}
    </main>
  );
}
