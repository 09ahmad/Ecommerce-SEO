# Commerce Keyword Lab

Keyword research tool for UAE e-commerce sellers on Noon and Amazon. Enter product
keywords and get Google Keyword Planner data for the United Arab Emirates: monthly
searches, competition, 12-month trend, bid ranges and related keyword ideas, with
Excel/CSV export.

Built with Next.js 16 (App Router, route groups, Turbopack), Tailwind CSS, and the
Google Ads REST API (no client libraries, no gRPC).

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page. Authenticated visitors are redirected to `/dashboard`. |
| `/login` | Public | Sign-in with Google (openid email profile, PKCE) or password. Authenticated visitors are redirected to `/dashboard`. |
| `/dashboard` | Protected | The analysis app: search, summary cards, results table, export. |
| `/dashboard` ← `/tool` | Protected | `/tool` redirects to `/dashboard`. |
| `/privacy` | Public | Privacy policy (linked from Google's OAuth consent screen). |
| `POST /api/auth/login`, `POST /api/auth/logout` | Public | Password sign-in / sign-out. |
| `GET /api/auth/google/start`, `GET /api/auth/google/callback` | Public | Google sign-in OAuth flow (state + PKCE, ALLOWED_EMAILS gate). |
| `POST /api/keywords/metrics` | Protected | Historical metrics for exact keywords. |
| `POST /api/keywords/ideas` | Protected | Keyword ideas from seed terms. |
| `POST /api/keywords/export` | Protected | Excel/CSV file download. |
| `GET /api/health` | Protected | Step-by-step check: env → token exchange → real API call. |

`proxy.ts` protects `/dashboard`, `/tool`, `/api/keywords/*` and `/api/health`;
everything else stays public.

## Environment variables

Copy `.env.example` to `.env.local` (and set the same on Vercel):

| Variable | Required | Description |
| --- | --- | --- |
| `GOOGLE_ADS_CLIENT_ID` | Yes | OAuth client ID from the Google Cloud project (used for both sign-in and the Ads API client) |
| `GOOGLE_ADS_CLIENT_SECRET` | Yes | OAuth client secret |
| `GOOGLE_ADS_REFRESH_TOKEN` | Yes | Long-lived refresh token for the Google Ads API (see below) |
| `GOOGLE_ADS_CUSTOMER_ID` | Yes | Client (advertiser) account ID, digits only — dashes/whitespace stripped automatically |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Yes | Manager (MCC) account ID, digits only |
| `GOOGLE_ADS_API_VERSION` | Yes | Google Ads API version, e.g. `v25` (latest stable at time of writing — confirm at [developers.google.com/google-ads/api/docs](https://developers.google.com/google-ads/api/docs)) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Optional | Sent as the `developer-token` header only when set |
| `NEXT_PUBLIC_SITE_URL` | Yes (for Google sign-in) | Full origin, e.g. `http://localhost:3000` or `https://keywordlab.opendraw.live`. Used for the OAuth redirect URI, robots and sitemap. |
| `ALLOWED_EMAILS` | Yes (for Google sign-in) | Comma-separated, case-insensitive allow-list of Google accounts that may sign in |
| `APP_PASSWORD` | Yes (for password sign-in) | Password for the secondary sign-in option |
| `SESSION_SECRET` | Yes | 32+ random characters, used to sign the session cookie |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Contact email shown in the public footer |
| `UPSTASH_REDIS_REST_URL` | Optional | Enables Upstash REST cache for keyword results (3-day TTL) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash REST token |

Validation is lazy (zod, in `lib/env.ts`): the public pages never break when tool
variables are missing. Error messages name the variable, never its value. All Google
Ads credentials are used server-side only (`server-only` modules) and are never
logged, returned or rendered. Google sign-in and Google Ads data access never mix:
sign-in uses only `openid email profile`; Ads data uses the server-side refresh token.

## How each credential is obtained

1. **Google Cloud project with API access** — create/select a project at
   [console.cloud.google.com](https://console.cloud.google.com), enable the
   **Google Ads API** (APIs & Services → Library). API access levels attach to the
   Cloud project; a developer token is no longer required (the `developer-token`
   header is only sent if `GOOGLE_ADS_DEVELOPER_TOKEN` is set).
2. **Web OAuth client** — APIs & Services → Credentials → Create Credentials →
   OAuth client ID → Web application. Add your origins as authorized redirect URIs:
   `${NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` (for sign-in) and
   `https://developers.google.com/oauthplayground` (while minting the refresh
   token). Copy the client ID/secret into `GOOGLE_ADS_CLIENT_ID` /
   `GOOGLE_ADS_CLIENT_SECRET`.
3. **Refresh token for the Google Ads API** — open
   [OAuth Playground](https://developers.google.com/oauthplayground), click the gear
   icon, check "Use your own OAuth credentials", paste the client ID/secret, add the
   scope `https://www.googleapis.com/auth/adwords`, authorize with the Google user
   that owns/has access to the Ads accounts, exchange the code for a refresh token,
   copy it into `GOOGLE_ADS_REFRESH_TOKEN`.
   - Note: OAuth apps in **Testing** status expire refresh tokens after **7 days** —
     publish the app (or re-generate the token weekly) for a long-lived token.
   - This credential is held server-side by the operator; app users never grant
     access to their own Google Ads accounts.
4. **Customer IDs** — find the 10-digit account IDs (top-right of the Google Ads UI).
   `GOOGLE_ADS_CUSTOMER_ID` is the advertiser account you query;
   `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is the manager account it sits under. The client
   account must be **linked** to the manager account (Tools & Settings → Access and
   security → Managers).
5. **Sign-in allow-list** — set `ALLOWED_EMAILS` to the Google accounts that may
   sign in (e.g. `you@example.com,colleague@example.com`). Also authorize those
   users as test users while the OAuth consent screen is in Testing status.
6. **App password** — choose any strong value for `APP_PASSWORD`; generate
   `SESSION_SECRET` with `openssl rand -base64 32`.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint
npm test           # vitest unit tests
npm run build      # production build
```

Sign in at `/login` (Google or password), then use `/dashboard`:

- **Get metrics** — historical metrics for your exact keywords.
- **Find related ideas** — keyword ideas from your seed terms, merged into the same
  table with a Source column.
- **Test connection** (top bar) — step-by-step health check (env → token exchange →
  API call).
- **Export Excel / Export CSV** — downloads of the current filtered and sorted rows.

## Deploying on Vercel

Import the repository, then set the same environment variables in
Project → Settings → Environment Variables (Production + Preview). Add
`https://<your-domain>/api/auth/google/callback` to the OAuth client's authorized
redirect URIs. The password gate, proxy-based route protection and server-side
credential use work unchanged.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `invalid_grant` on Ads token exchange | Refresh token expired or revoked. Generate a new one via OAuth Playground. Apps in Testing status expire tokens after 7 days — publish the app. |
| `invalid_client` | Wrong `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET`. |
| `PERMISSION_DENIED [CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION]` | The Cloud project's Google Ads API access level is **Test**, which only works against Google Ads **test** accounts. Check the access level and apply to upgrade to **Explorer** (automatic after application) or **Basic** (requires brand verification) at console.cloud.google.com → APIs & Services → Google Ads API. |
| `PERMISSION_DENIED [PROJECT_DISABLED]` | The Google Ads API is not enabled for the Cloud project that issued your OAuth credentials. Enable it in APIs & Services → Library. |
| `PERMISSION_DENIED [USER_PERMISSION_DENIED]` | The Google user that minted the refresh token has no access to the Ads account. Re-generate the refresh token with a user that can access `GOOGLE_ADS_CUSTOMER_ID`. |
| `PERMISSION_DENIED [INVALID_LOGIN_CUSTOMER_ID_SERVING_CUSTOMER_ID_COMBINATION]` | The login/serving customer combination is invalid: `GOOGLE_ADS_LOGIN_CUSTOMER_ID` must be a manager account linked above `GOOGLE_ADS_CUSTOMER_ID` (or the client account itself). |
| "not accessible from the manager account" | The client account is not linked under `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, or the OAuth user lacks access to it. |
| "access level" errors | The Cloud project's API access level is insufficient or quota is exceeded. |
| "customer ID is invalid or was not found" | `GOOGLE_ADS_CUSTOMER_ID` must be digits only (10 digits), the account must exist. |
| `RESOURCE_EXHAUSTED` / 429 | Rate limit or quota exceeded — the client retries once with backoff; wait and retry. |
| Google sign-in shows "not authorized" | The account's email is not in `ALLOWED_EMAILS`, or the account is not a test user of the OAuth consent screen. |
| Google sign-in redirects back with an error | Check the OAuth redirect URI matches `${NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` exactly (e.g. `http://localhost:3000/api/auth/google/callback`). |
| Rounded search volumes (10 / 100 / 1,000) | The dashboard shows a notice when this happens: the Ads account likely has little ad spend, so Keyword Planner returns coarse buckets. |
| Login says configuration incomplete | The named variables are not set (or `SESSION_SECRET` is shorter than 32 chars). |

The **developer token** was sunset by Google on September 9, 2026: it is optional and
ignored by the API servers, and access levels attach to the Google Cloud project that
issued your OAuth credentials. `GOOGLE_ADS_DEVELOPER_TOKEN` is still supported (sent
only when set) but is normally unnecessary.
