import { describe, expect, it } from "vitest";
import { normalizeTerms } from "@/lib/validate";

describe("normalizeTerms", () => {
  it("trims, lowercases and collapses internal whitespace", () => {
    expect(normalizeTerms(["  Office Chair ", "WATER  bottle "])).toEqual([
      "office chair",
      "water bottle",
    ]);
  });

  it("drops empty entries and dedupes case-insensitively", () => {
    expect(normalizeTerms(["abaya", "", "   ", "Abaya", "ABAYA"])).toEqual(["abaya"]);
  });

  it("preserves first-seen order", () => {
    expect(normalizeTerms(["mouse", "keyboard", "Mouse"])).toEqual(["mouse", "keyboard"]);
  });
});
