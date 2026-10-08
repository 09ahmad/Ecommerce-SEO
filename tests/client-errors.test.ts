import { describe, expect, it } from "vitest";
import { friendlyError } from "@/lib/google-ads/client";

describe("friendlyError", () => {
  it("maps PERMISSION_DENIED with a not-linked message to the manager-account hint", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        message: "The customer 123 cannot be accessed from login customer 456.",
        status: "PERMISSION_DENIED",
      },
    });
    expect(err.message).toMatch(/manager account/i);
  });

  it("maps access level problems to the access-level hint", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        message: "User doesn't have permission to access customer. Access level is insufficient.",
        status: "PERMISSION_DENIED",
      },
    });
    expect(err.message).toMatch(/access level/i);
  });

  it("maps Test access level (CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION) to the access-level hint", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        status: "PERMISSION_DENIED",
        details: [{ errors: [{ errorCode: { authorizationError: "CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION" } }] }],
      },
    });
    expect(err.message).toMatch(/access level/i);
  });

  it("maps PROJECT_DISABLED to the enable-the-API hint", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        status: "PERMISSION_DENIED",
        details: [{ errors: [{ errorCode: { authorizationError: "PROJECT_DISABLED" } }] }],
      },
    });
    expect(err.message).toMatch(/not enabled/i);
  });

  it("maps an invalid login/serving customer combination", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        status: "PERMISSION_DENIED",
        details: [{ errors: [{ errorCode: { authorizationError: "INVALID_LOGIN_CUSTOMER_ID_SERVING_CUSTOMER_ID_COMBINATION" } }] }],
      },
    });
    expect(err.message).toMatch(/GOOGLE_ADS_CUSTOMER_ID/);
  });

  it("maps USER_PERMISSION_DENIED to the refresh-token-user hint", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        status: "PERMISSION_DENIED",
        details: [{ errors: [{ errorCode: { authorizationError: "USER_PERMISSION_DENIED" } }] }],
      },
    });
    expect(err.message).toMatch(/refresh token/i);
  });

  it("includes the specific error codes in the generic permission message", () => {
    const err = friendlyError(403, {
      error: {
        code: 403,
        status: "PERMISSION_DENIED",
        details: [{ errors: [{ errorCode: { authorizationError: "UNKNOWN" } }] }],
      },
    });
    expect(err.message).toMatch(/\[UNKNOWN, PERMISSION_DENIED\]/);
  });

  it("maps generic PERMISSION_DENIED", () => {
    const err = friendlyError(403, { error: { code: 403, status: "PERMISSION_DENIED" } });
    expect(err.message).toMatch(/PERMISSION_DENIED/);
  });

  it("maps 429 and RESOURCE_EXHAUSTED to the rate-limit message", () => {
    expect(friendlyError(429, {}).message).toMatch(/rate limit|quota/i);
    expect(
      friendlyError(429, { error: { code: 429, status: "RESOURCE_EXHAUSTED" } }).message
    ).toMatch(/RESOURCE_EXHAUSTED/);
  });

  it("maps an invalid or unknown customer ID", () => {
    const err = friendlyError(400, {
      error: { code: 400, message: "Customer not found.", status: "INVALID_ARGUMENT" },
    });
    expect(err.message).toMatch(/customer ID/i);
  });

  it("maps UNAUTHENTICATED", () => {
    const err = friendlyError(401, { error: { code: 401, status: "UNAUTHENTICATED" } });
    expect(err.message).toMatch(/UNAUTHENTICATED/);
  });

  it("falls back to a generic message for unknown errors", () => {
    const err = friendlyError(500, { error: { code: 500, status: "INTERNAL" } });
    expect(err.message).toMatch(/Google Ads API request failed/);
  });
});
