export type Competition = "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";

export interface MonthlyVolume {
  year: number;
  month: number; // 1-12
  searches: number;
}

export interface KeywordRow {
  keyword: string;
  avgMonthlySearches: number | null;
  competition: Competition;
  competitionIndex: number | null;
  /** Currency units (micros / 1e6), null when absent */
  lowTopOfPageBid: number | null;
  highTopOfPageBid: number | null;
  monthlySearchVolumes: MonthlyVolume[];
  growthPercent: number | null;
  tags: string[];
  source: "user" | "idea";
}
