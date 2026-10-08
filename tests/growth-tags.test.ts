import { describe, expect, it } from "vitest";
import { computeGrowthPercent, computeTags } from "@/lib/google-ads/keywords";
import type { MonthlyVolume } from "@/lib/keyword-rows";

const months = (searches: number[]): MonthlyVolume[] =>
  searches.map((s, i) => ({
    year: 2025 + Math.floor(i / 12),
    month: (i % 12) + 1,
    searches: s,
  }));

describe("computeGrowthPercent", () => {
  it("returns null when fewer than 6 months exist", () => {
    expect(computeGrowthPercent(months([100, 100, 100, 100]))).toBeNull();
    expect(computeGrowthPercent([])).toBeNull();
  });

  it("computes average of latest 3 months vs earliest 3 months", () => {
    const series = months([100, 100, 100, 200, 200, 200]);
    expect(computeGrowthPercent(series)).toBeCloseTo(100, 5);
  });

  it("returns 0 for flat data", () => {
    const series = months([500, 500, 500, 500, 500, 500]);
    expect(computeGrowthPercent(series)).toBe(0);
  });

  it("returns null when earliest average is zero (zero-safe)", () => {
    const series = months([0, 0, 0, 100, 200, 300]);
    expect(computeGrowthPercent(series)).toBeNull();
  });

  it("uses only the latest and earliest 3 of a 12-month window", () => {
    const series = months([10, 10, 10, 9999, 9999, 9999, 9999, 9999, 9999, 40, 40, 40]);
    expect(computeGrowthPercent(series)).toBeCloseTo(300, 5);
  });
});

describe("computeTags", () => {
  it("tags 4+ word keywords as Long-tail", () => {
    expect(computeTags({ keyword: "best office chair dubai", growthPercent: null, volume: null, seeds: [] })).toContain("Long-tail");
    expect(computeTags({ keyword: "office chair", growthPercent: null, volume: null, seeds: [] })).not.toContain("Long-tail");
  });

  it("tags High-growth only when growth >= 25 and volume >= 100", () => {
    expect(computeTags({ keyword: "abaya", growthPercent: 25, volume: 100, seeds: [] })).toContain("High-growth");
    expect(computeTags({ keyword: "abaya", growthPercent: 30, volume: 99, seeds: [] })).not.toContain("High-growth");
    expect(computeTags({ keyword: "abaya", growthPercent: 24.9, volume: 100, seeds: [] })).not.toContain("High-growth");
    expect(computeTags({ keyword: "abaya", growthPercent: null, volume: 500, seeds: [] })).not.toContain("High-growth");
  });

  it("tags Product when the keyword contains a seed term", () => {
    expect(computeTags({ keyword: "abaya dubai online", growthPercent: null, volume: null, seeds: ["abaya"] })).toContain("Product");
    expect(computeTags({ keyword: "ABAYA DUBAI ONLINE", growthPercent: null, volume: null, seeds: ["Abaya"] })).toContain("Product");
    expect(computeTags({ keyword: "office chair", growthPercent: null, volume: null, seeds: ["abaya"] })).not.toContain("Product");
  });

  it("can apply multiple tags at once", () => {
    const tags = computeTags({
      keyword: "long tail product keyword",
      growthPercent: 50,
      volume: 500,
      seeds: ["product"],
    });
    expect(tags).toEqual(["Long-tail", "High-growth", "Product"]);
  });
});
