import { NextRequest, NextResponse } from "next/server";
import { getHistoricalMetrics } from "@/lib/google-ads/keywords";
import { errorMessage, keywordsSchema, normalizeTerms, ApiError } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const parsed = keywordsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: "Provide between 1 and 200 keywords as { keywords: string[] }." },
      { status: 400 }
    );
  }
  const keywords = normalizeTerms(parsed.data.keywords);
  if (keywords.length === 0) {
    return NextResponse.json<ApiError>({ error: "No valid keywords provided." }, { status: 400 });
  }
  try {
    const rows = await getHistoricalMetrics(keywords);
    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json<ApiError>({ error: errorMessage(err) }, { status: 502 });
  }
}
