"use client";

const chip =
  "inline-flex items-center rounded-full border border-black/[.15] px-3 py-1 text-sm text-zinc-700 dark:border-white/[.2] dark:text-zinc-300";
const primaryBtn =
  "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

interface SearchFormProps {
  value: string;
  onInputChange: (value: string) => void;
  keywordCount: number;
  overLimit: boolean;
  onGetMetrics: () => void;
  onFindIdeas: () => void;
  metricsLoading: boolean;
  ideasLoading: boolean;
}

const MAX_KEYWORDS = 200;

export default function SearchForm({
  value,
  onInputChange,
  keywordCount,
  overLimit,
  onGetMetrics,
  onFindIdeas,
  metricsLoading,
  ideasLoading,
}: SearchFormProps) {
  const busy = metricsLoading || ideasLoading;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/[.08] p-4 sm:p-6 dark:border-white/[.14]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={chip}>United Arab Emirates</span>
          <span className={chip}>English</span>
        </div>
        <p
          className={`text-sm ${overLimit ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          {keywordCount} / {MAX_KEYWORDS} keywords
          {overLimit ? ` — only the first ${MAX_KEYWORDS} will be used` : ""}
        </p>
      </div>

      <label htmlFor="keywords-input" className="sr-only">
        Keywords, one per line
      </label>
      <textarea
        id="keywords-input"
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        rows={6}
        placeholder={"abaya\nwater bottle\noffice chair dubai"}
        className="w-full rounded-xl border border-black/[.15] bg-transparent px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-white/[.2] dark:text-zinc-100 dark:focus:border-zinc-400"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onGetMetrics}
          disabled={busy || keywordCount === 0}
          className={primaryBtn}
        >
          {metricsLoading ? "Getting metrics…" : "Get metrics"}
        </button>
        <button
          onClick={onFindIdeas}
          disabled={busy || keywordCount === 0}
          className={primaryBtn}
        >
          {ideasLoading ? "Finding ideas…" : "Find related ideas"}
        </button>
      </div>
    </section>
  );
}
