import "server-only";
import { getEnv } from "@/lib/env";
import { getAccessToken } from "./auth";

interface GoogleAdsErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      errors?: Array<{ errorCode?: Record<string, string>; message?: string }>;
    }>;
  };
}

function collectCodes(body: GoogleAdsErrorBody): string[] {
  const codes: string[] = [];
  for (const d of body.error?.details ?? []) {
    for (const e of d.errors ?? []) {
      if (e.errorCode) codes.push(...Object.values(e.errorCode));
    }
  }
  if (body.error?.status) codes.push(body.error.status);
  return codes;
}

export function friendlyError(status: number, body: GoogleAdsErrorBody): Error {
  const codes = collectCodes(body);
  const message = body.error?.message ?? "";

  if (status === 401 || codes.includes("UNAUTHENTICATED")) {
    return new Error(
      "Google rejected the request credentials (UNAUTHENTICATED). The access token may be invalid or expired."
    );
  }
  if (
    status === 403 ||
    codes.includes("PERMISSION_DENIED") ||
    codes.includes("USER_PERMISSION_DENIED") ||
    codes.includes("CUSTOMER_NOT_ACCESSIBLE_FROM_LOGIN_CUSTOMER")
  ) {
    const codeLabel = codes.length > 0 ? ` [${codes.join(", ")}]` : "";
    if (
      codes.includes("CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION") ||
      /access level|test account|basic access/i.test(message)
    ) {
      return new Error(
        "The Google Cloud project's API access level does not permit this call — often Test access level used against a production account. Check and upgrade the access level (Explorer or Basic) at console.cloud.google.com → APIs & Services → Google Ads API."
      );
    }
    if (codes.includes("PROJECT_DISABLED")) {
      return new Error(
        "The Google Ads API is not enabled for the Google Cloud project that issued your OAuth credentials. Enable it in APIs & Services → Library."
      );
    }
    if (codes.includes("INVALID_LOGIN_CUSTOMER_ID_SERVING_CUSTOMER_ID_COMBINATION")) {
      return new Error(
        "The GOOGLE_ADS_CUSTOMER_ID and GOOGLE_ADS_LOGIN_CUSTOMER_ID combination was rejected. The login customer ID must be a manager account linked above the client account, or the client account itself."
      );
    }
    if (codes.includes("CUSTOMER_NOT_ENABLED")) {
      return new Error(
        "The Google Ads customer account is cancelled or not enabled. Check GOOGLE_ADS_CUSTOMER_ID."
      );
    }
    if (
      codes.includes("CUSTOMER_NOT_ACCESSIBLE_FROM_LOGIN_CUSTOMER") ||
      /not (accessible|linked)/i.test(message)
    ) {
      return new Error(
        "The client account is not accessible from the manager account. Link GOOGLE_ADS_CUSTOMER_ID under the manager account in GOOGLE_ADS_LOGIN_CUSTOMER_ID."
      );
    }
    if (codes.includes("USER_PERMISSION_DENIED")) {
      return new Error(
        "The Google user that generated the refresh token does not have access to this Ads account. Re-generate the refresh token (OAuth Playground) with a user that can access GOOGLE_ADS_CUSTOMER_ID via GOOGLE_ADS_LOGIN_CUSTOMER_ID."
      );
    }
    return new Error(
      `Google denied permission (PERMISSION_DENIED${codeLabel}). Verify the OAuth user can access the Ads account, the Google Ads API is enabled for the Cloud project, and the client account is linked to the manager account.`
    );
  }
  if (status === 429 || codes.includes("RESOURCE_EXHAUSTED") || codes.includes("RATE_EXCEEDED_ERROR") || codes.includes("QUOTA_ERROR")) {
    return new Error(
      "Google Ads API rate limit / quota exceeded (RESOURCE_EXHAUSTED). Wait a moment and try again."
    );
  }
  if (codes.includes("CUSTOMER_NOT_FOUND") || codes.includes("INVALID_CUSTOMER_ID") || /customer.*(not found|invalid)/i.test(message)) {
    return new Error(
      "The Google Ads customer ID is invalid or was not found. Check GOOGLE_ADS_CUSTOMER_ID (digits only)."
    );
  }
  if (status === 404) {
    return new Error(
      "The Google Ads resource was not found. Verify the customer ID and API version (GOOGLE_ADS_API_VERSION)."
    );
  }
  return new Error(`Google Ads API request failed (HTTP ${status}). Please try again later.`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * POST to https://googleads.googleapis.com/{version}/customers/{customerId}:{method}.
 * Sends the developer-token header only when GOOGLE_ADS_DEVELOPER_TOKEN is set.
 * Retries once with backoff on 429 and 5xx.
 */
export async function googleAdsFetch<T = unknown>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const env = getEnv();
  const url = `https://googleads.googleapis.com/${env.GOOGLE_ADS_API_VERSION}/customers/${env.GOOGLE_ADS_CUSTOMER_ID}:${method}`;

  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "login-customer-id": env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    "Content-Type": "application/json",
  };
  if (env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    headers["developer-token"] = env.GOOGLE_ADS_DEVELOPER_TOKEN;
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(800);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      lastError = new Error("Network error contacting the Google Ads API. Check connectivity and try again.");
      continue;
    }

    if (res.ok) {
      return (await res.json()) as T;
    }

    const errBody = (await res.json().catch(() => ({}))) as GoogleAdsErrorBody;
    if (res.status === 429 || res.status >= 500) {
      lastError = friendlyError(res.status, errBody);
      continue; // retry once
    }
    throw friendlyError(res.status, errBody);
  }
  throw lastError ?? new Error("Google Ads API request failed. Please try again later.");
}
