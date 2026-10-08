import { NextRequest, NextResponse } from "next/server";
import { getKeywordIdeas } from "@/lib/google-ads/keywords";
import { errorMessage, seedsSchema, normalizeTerms, ApiError } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const parsed = seedsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: "Provide between 1 and 20 seed keywords as { seeds: string[] }." },
      { status: 400 }
    );
  }
  const seeds = normalizeTerms(parsed.data.seeds);
  if (seeds.length === 0) {
    return NextResponse.json<ApiError>({ error: "No valid seed keywords provided." }, { status: 400 });
  }
  try {
    const rows = await getKeywordIdeas(seeds);
    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json<ApiError>({ error: errorMessage(err) }, { status: 502 });
  }
}
