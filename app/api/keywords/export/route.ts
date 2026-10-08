import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ExcelJS from "exceljs";
import type { KeywordRow } from "@/lib/google-ads/types";

const rowSchema = z.object({
  keyword: z.string(),
  avgMonthlySearches: z.number().nullable(),
  competition: z.string(),
  competitionIndex: z.number().nullable(),
  lowTopOfPageBid: z.number().nullable(),
  highTopOfPageBid: z.number().nullable(),
  monthlySearchVolumes: z.array(
    z.object({ year: z.number(), month: z.number(), searches: z.number() })
  ),
  growthPercent: z.number().nullable(),
  tags: z.array(z.string()),
  source: z.string(),
});

const exportSchema = z.object({
  rows: z.array(rowSchema).min(1).max(500),
  format: z.enum(["xlsx", "csv"]),
});

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(m: { year: number; month: number }): string {
  return `${MONTH_NAMES[m.month - 1] ?? m.month}-${m.year}`;
}

function collectMonthColumns(rows: KeywordRow[]): { year: number; month: number }[] {
  const seen = new Map<string, { year: number; month: number }>();
  for (const r of rows) {
    for (const m of r.monthlySearchVolumes) seen.set(`${m.year}-${m.month}`, m);
  }
  return [...seen.values()].sort((a, b) => a.year - b.year || a.month - b.month);
}

function rowValues(r: KeywordRow, months: { year: number; month: number }[]) {
  const volumeByMonth = new Map(r.monthlySearchVolumes.map((m) => [`${m.year}-${m.month}`, m.searches]));
  return [
    r.keyword,
    r.avgMonthlySearches,
    r.competition,
    r.competitionIndex,
    r.lowTopOfPageBid,
    r.highTopOfPageBid,
    r.growthPercent === null ? null : Math.round(r.growthPercent * 10) / 10,
    r.tags.join(", "),
    r.source === "user" ? "Your keyword" : "Idea",
    ...months.map((m) => volumeByMonth.get(`${m.year}-${m.month}`) ?? null),
  ];
}

function baseHeaders(months: { year: number; month: number }[]): string[] {
  return [
    "Keyword",
    "Avg Monthly Searches",
    "Competition",
    "Competition Index",
    "Low Top-of-Page Bid",
    "High Top-of-Page Bid",
    "Growth %",
    "Tags",
    "Source",
    ...months.map(monthLabel),
  ];
}

function toCsv(rows: KeywordRow[]): string {
  const months = collectMonthColumns(rows);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    baseHeaders(months).map(escape).join(","),
    ...rows.map((r) => rowValues(r, months).map(escape).join(",")),
  ];
  return lines.join("\r\n");
}

async function toXlsx(rows: KeywordRow[]): Promise<Buffer> {
  const months = collectMonthColumns(rows);
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet("Keywords");
  ws.addRow(baseHeaders(months));
  ws.getRow(1).font = { bold: true };
  for (const r of rows) ws.addRow(rowValues(r, months));
  ws.getColumn(1).width = 34;

  // NOTE: This "Noon SEO" layout is a placeholder until the client supplies
  // the official Noon template with its exact columns and ordering.
  const noon = wb.addWorksheet("Noon SEO");
  noon.addRow(["Keyword", "Volume", "Tag"]);
  noon.getRow(1).font = { bold: true };
  const byVolume = [...rows].sort(
    (a, b) => (b.avgMonthlySearches ?? 0) - (a.avgMonthlySearches ?? 0)
  );
  for (const r of byVolume) noon.addRow([r.keyword, r.avgMonthlySearches, r.tags.join(", ")]);
  noon.getColumn(1).width = 34;

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}

export async function POST(request: NextRequest) {
  const parsed = exportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export payload. Expected { rows: [...], format: \"xlsx\" | \"csv\" }." },
      { status: 400 }
    );
  }
  const { rows, format } = parsed.data;
  const filename = `commerce-keyword-lab-${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === "csv") {
    return new Response(toCsv(rows as KeywordRow[]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }
  const buf = await toXlsx(rows as KeywordRow[]);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
