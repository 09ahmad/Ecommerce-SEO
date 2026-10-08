import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { getAccessToken, clearTokenCache } from "@/lib/google-ads/auth";
import { googleAdsFetch } from "@/lib/google-ads/client";

interface Step {
  step: string;
  ok: boolean;
  detail?: string;
}

export async function GET() {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const steps: Step[] = [];

  // Step 1: environment
  try {
    const env = getEnv();
    const missingRequired = [
      "GOOGLE_ADS_CLIENT_ID",
      "GOOGLE_ADS_CLIENT_SECRET",
      "GOOGLE_ADS_REFRESH_TOKEN",
      "GOOGLE_ADS_CUSTOMER_ID",
      "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
      "GOOGLE_ADS_API_VERSION",
    ].filter((name) => !process.env[name]);
    steps.push({
      step: "Environment variables present",
      ok: true,
      detail:
        (missingRequired.length === 0 ? "All required variables are set" : `Not set: ${missingRequired.join(", ")}`) +
        ` | API version: ${env.GOOGLE_ADS_API_VERSION}` +
        ` | developer-token header: ${env.GOOGLE_ADS_DEVELOPER_TOKEN ? "will be sent" : "not sent (var not set)"}` +
        ` | cache: ${env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? "Upstash" : "in-memory"}`,
    });
  } catch (err) {
    steps.push({ step: "Environment variables present", ok: false, detail: err instanceof Error ? err.message : "Invalid configuration" });
    return NextResponse.json({ ok: false, steps });
  }

  // Step 2: token exchange
  try {
    clearTokenCache();
    await getAccessToken();
    steps.push({ step: "Access token exchange", ok: true });
  } catch (err) {
    steps.push({ step: "Access token exchange", ok: false, detail: err instanceof Error ? err.message : "Token exchange failed" });
    return NextResponse.json({ ok: false, steps });
  }

  // Step 3: real API call
  try {
    await googleAdsFetch("generateKeywordHistoricalMetrics", {
      keywords: ["test"],
      geoTargetConstants: ["geoTargetConstants/2784"],
      language: "languageConstants/1000",
      keywordPlanNetwork: "GOOGLE_SEARCH",
    });
    steps.push({ step: "Google Ads API call (keyword \"test\")", ok: true });
  } catch (err) {
    steps.push({ step: "Google Ads API call (keyword \"test\")", ok: false, detail: err instanceof Error ? err.message : "API call failed" });
    return NextResponse.json({ ok: false, steps });
  }

  return NextResponse.json({ ok: true, steps });
}
