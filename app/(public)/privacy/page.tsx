import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Commerce Keyword Lab: what Google Ads API data we access, store, share, retain and delete.",
};

const CONTACT_EMAIL = "forandomlogin@gmail.com";
const HOSTING = "Vercel";
const SITE_URL = "https://keywordlab.opendraw.live";
const LAST_UPDATED = "October 8, 2026";

const h2 = "text-2xl font-semibold text-black dark:text-zinc-50";
const link = "underline underline-offset-4";
const code =
  "rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/[.08]";

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-16 px-6 text-zinc-700 dark:text-zinc-300 leading-8">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

      <p>
        Commerce Keyword Lab (&quot;the App&quot;, &quot;we&quot;,
        &quot;us&quot;) is operated by the business identified in the Contact
        section below and is available at{" "}
        <a href={SITE_URL} className={link}>
          {SITE_URL}
        </a>
        . This policy explains what information the App accesses, how it is
        used, who it is shared with, how long it is kept, and how you can have
        it deleted. You can contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <section className="space-y-3">
        <h2 className={h2}>About Commerce Keyword Lab</h2>
        <p>
          Commerce Keyword Lab is a keyword research tool for UAE e-commerce
          sellers on Noon and Amazon. It uses Google Keyword Planner data
          accessed through the Google Ads API to show monthly search volume,
          competition, and related keyword ideas, and lets you export those
          results to Excel/CSV to improve product listings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Sign-in information</h2>
        <p>
          When you sign in with Google, we receive your name, email address and
          profile picture URL (scopes{" "}
          <code className={code}>openid</code>,{" "}
          <code className={code}>email</code>,{" "}
          <code className={code}>profile</code>) only to authenticate you. They
          are kept in a signed session cookie and are not shared or used for
          anything else.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Google API access and scope</h2>
        <p>
          To fetch keyword data, the App uses the Google Ads API scope{" "}
          <code className={code}>https://www.googleapis.com/auth/adwords</code>.
          This access is held by the operator as a server-side credential: users
          of the App do not grant access to their own Google Ads accounts. The
          access is used strictly in a read-only manner to retrieve Google
          Keyword Planner data (search volumes, competition metrics, and related
          keyword ideas). Commerce Keyword Lab does not create, modify, pause,
          or delete campaigns, ad groups, ads, keywords, bids, or budgets. Even
          though the scope technically permits broader access, our application
          code is written to only call the read endpoints required for Keyword
          Planner data, and we do not use the scope for any other purpose.
        </p>
        <p>
          Sign-in is handled through Google&apos;s official OAuth 2.0 flow. We
          never see or store your Google password, and all Google Ads API
          credentials are kept on the server only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Google user data we access</h2>
        <p>Through the Google Ads API, the App accesses only the following:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Keyword Planner keyword ideas for the seed keywords you enter.
          </li>
          <li>
            Historical keyword metrics: average monthly searches, monthly search
            volumes for the past 12 months, competition level, competition
            index, and top-of-page bid ranges.
          </li>
          <li>
            The operator&apos;s Google Ads customer ID and manager account ID
            needed to send these requests.
          </li>
        </ul>
        <p>
          The App does not read your campaigns, ads, conversions, audiences,
          billing information, or account performance reports.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>What we store</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>The keywords you search for within the App.</li>
          <li>
            Cached keyword results from the Google Ads API, stored temporarily
            to improve performance and reduce redundant API calls.
          </li>
          <li>
            Your sign-in profile (name, email address and profile picture URL)
            in a signed session cookie when you sign in with Google.
          </li>
          <li>
            Server-side credentials needed to connect to the Google Ads API,
            stored securely and never exposed to the browser.
          </li>
          <li>
            Basic technical logs, such as request times and error messages, used
            for security and troubleshooting.
          </li>
        </ul>
        <p>The App does not use advertising or tracking cookies.</p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>What we do not collect</h2>
        <p>
          We do not collect your Google password, payment information, campaign
          performance data, or any personal data beyond what is needed to
          authenticate with Google and operate the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>How we use data</h2>
        <p>
          Data is used solely to provide the keyword research functionality of
          the App: running your keyword lookups, returning Keyword Planner
          metrics, caching results for faster repeat searches, enabling
          Excel/CSV export, and keeping the App secure. We do not use Google
          user data for advertising purposes, and we do not use it to train
          machine learning or AI models.
        </p>
        <p>
          Commerce Keyword Lab&apos;s use and transfer of information received
          from Google APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Sharing and disclosure</h2>
        <p>
          We do not sell, rent, or trade your data, and we do not share data
          received from Google APIs with third parties. The only exceptions are:
          (1) our hosting provider ({HOSTING}), which processes data on our
          behalf solely to run the App; (2) disclosures required by law or
          needed to protect the security of the App; and (3) cases where you
          give us explicit consent. Humans do not read Google user data unless
          it is necessary for security purposes, to comply with the law, or with
          your consent.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Data retention and deletion</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Cached keyword results are deleted automatically after 3 days.
          </li>
          <li>
            Searched keywords and exported files are kept until you ask us to
            delete them.
          </li>
          <li>Server logs are kept for up to 90 days.</li>
          <li>
            To request deletion of any data associated with your usage, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
              {CONTACT_EMAIL}
            </a>
            . We will confirm and complete the deletion within 30 days.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Revoking access</h2>
        <p>
          When you sign in with Google, you connect your Google account for
          sign-in only (scopes openid, email, profile). You can revoke that
          access at any time at{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            https://myaccount.google.com/permissions
          </a>
          . Revoking it stops the App from recognizing your account for sign-in.
          The Google Ads API access described above is a server-side credential
          held by the operator and is not linked to your personal Google
          account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Security</h2>
        <p>
          We protect stored data with encrypted connections (HTTPS), keep
          credentials in server-side secrets, and restrict access to the App and
          its data. No system is perfectly secure, but we take reasonable steps
          to safeguard your information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Third-party services</h2>
        <p>
          The App relies on Google APIs (Google OAuth and the Google Ads API) to
          function, and on {HOSTING} to host the website. These providers
          process data only as needed to deliver their services and are governed
          by their own privacy policies. We do not integrate advertising
          networks, analytics trackers that profile you across sites, or data
          brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Children&apos;s privacy</h2>
        <p>
          Commerce Keyword Lab is a business tool intended for adults and is not
          directed at children under 13 (or the applicable age in your
          jurisdiction). We do not knowingly collect personal information from
          children. If you believe a child has provided us personal information,
          please contact us so we can remove it promptly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>Contact</h2>
        <p>
          Email:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
            {CONTACT_EMAIL}
          </a>
          <br />
          Website:{" "}
          <a href={SITE_URL} className={link}>
            {SITE_URL}
          </a>
        </p>
        <p>
          <Link href="/" className={link}>
            ← Back to Commerce Keyword Lab
          </Link>
        </p>
      </section>
    </main>
  );
}
