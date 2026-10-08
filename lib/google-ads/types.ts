import "server-only";

export type { Competition, KeywordRow, MonthlyVolume } from "../keyword-rows";

/** Raw Google Ads API shapes (REST JSON, camelCase) */
export interface RawMonthlyVolume {
  year?: string;
  month?: string; // enum, e.g. "JANUARY"
  monthlySearches?: string; // int64 as string
}

export interface RawKeywordMetrics {
  avgMonthlySearches?: string;
  competition?: string;
  competitionIndex?: string;
  lowTopOfPageBidMicros?: string;
  highTopOfPageBidMicros?: string;
  monthlySearchVolumes?: RawMonthlyVolume[];
}

export interface RawKeywordResult {
  text?: string;
  keywordIdeaMetrics?: RawKeywordMetrics;
  keywordMetrics?: RawKeywordMetrics;
}
