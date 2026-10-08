import "server-only";
import { z } from "zod";

const digitsOnly = z
  .string()
  .min(1)
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^\d+$/.test(v), { message: "must contain digits only" });

const optionalString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().optional()
);

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional()
);

const toolSchema = z.object({
  GOOGLE_ADS_CLIENT_ID: z.string().min(1),
  GOOGLE_ADS_CLIENT_SECRET: z.string().min(1),
  GOOGLE_ADS_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_ADS_CUSTOMER_ID: digitsOnly,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: digitsOnly,
  GOOGLE_ADS_API_VERSION: z
    .string()
    .regex(/^v\d+$/, { message: "must look like v<NUMBER>, e.g. v25" })
    .default("v25"),
  GOOGLE_ADS_DEVELOPER_TOKEN: optionalString,
  APP_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  ALLOWED_EMAILS: optionalString,
  NEXT_PUBLIC_CONTACT_EMAIL: optionalString,
});

const authSchema = toolSchema.pick({ APP_PASSWORD: true, SESSION_SECRET: true });

const googleOAuthSchema = z.object({
  GOOGLE_ADS_CLIENT_ID: z.string().min(1),
  GOOGLE_ADS_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url({ message: "must be a full URL, e.g. http://localhost:3000" }),
  ALLOWED_EMAILS: z
    .string()
    .min(1, { message: "must list at least one allowed email (comma-separated)" }),
});

export type ToolEnv = z.infer<typeof toolSchema>;
export type GoogleOAuthEnv = z.infer<typeof googleOAuthSchema>;

let cachedToolEnv: ToolEnv | null = null;
let cachedAuthEnv: { APP_PASSWORD: string; SESSION_SECRET: string } | null = null;
let cachedGoogleOAuthEnv: GoogleOAuthEnv | null = null;

function missingVars(issues: z.ZodIssue[]): string {
  return issues.map((i) => i.path.join(".")).join(", ");
}

function fail(issues: z.ZodIssue[]): never {
  throw new Error(
    `Server configuration is incomplete. Missing or invalid environment variables: ${missingVars(issues)}`
  );
}

/**
 * Lazy validation: only parses process.env when first called, so public
 * pages (/, /login, /privacy) never break when tool variables are missing.
 * Errors name the offending variable, never its value.
 */
export function getEnv(): ToolEnv {
  if (cachedToolEnv) return cachedToolEnv;
  const parsed = toolSchema.safeParse(process.env);
  if (!parsed.success) fail(parsed.error.issues);
  cachedToolEnv = parsed.data;
  return cachedToolEnv;
}

export function getAuthEnv() {
  if (cachedAuthEnv) return cachedAuthEnv;
  const parsed = authSchema.safeParse(process.env);
  if (!parsed.success) fail(parsed.error.issues);
  cachedAuthEnv = parsed.data;
  return cachedAuthEnv;
}

export function getGoogleOAuthEnv(): GoogleOAuthEnv {
  if (cachedGoogleOAuthEnv) return cachedGoogleOAuthEnv;
  const parsed = googleOAuthSchema.safeParse(process.env);
  if (!parsed.success) fail(parsed.error.issues);
  cachedGoogleOAuthEnv = parsed.data;
  return cachedGoogleOAuthEnv;
}
