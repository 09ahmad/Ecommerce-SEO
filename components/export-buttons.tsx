"use client";

import { useState } from "react";
import type { KeywordRow } from "@/lib/keyword-rows";

const secondaryBtn =
  "rounded-lg border border-black/[.15] px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[.2] dark:text-zinc-200 dark:hover:bg-white/[.06]";

interface ExportButtonsProps {
  rows: KeywordRow[];
  onError?: (message: string) => void;
}

export default function ExportButtons({ rows, onError }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<"xlsx" | "csv" | null>(null);

  async function runExport(format: "xlsx" | "csv") {
    setExporting(format);
    try {
      const res = await fetch("/api/keywords/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, format }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Export failed.");
      }
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] ?? `commerce-keyword-lab.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => runExport("xlsx")}
        disabled={exporting !== null || rows.length === 0}
        className={secondaryBtn}
      >
        {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
      </button>
      <button
        onClick={() => runExport("csv")}
        disabled={exporting !== null || rows.length === 0}
        className={secondaryBtn}
      >
        {exporting === "csv" ? "Exporting…" : "Export CSV"}
      </button>
    </div>
  );
}
