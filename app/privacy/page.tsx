import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Commerce Keyword Lab",
  description:
    "Privacy Policy for Commerce Keyword Lab: what data we access, store, and how we use Google Ads API data.",
};

const CONTACT_EMAIL = "REPLACE_WITH_MY_EMAIL";

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-16 px-6 text-zinc-700 dark:text-zinc-300 leading-8">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-500">Last updated: October 8, 2026</p>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">About Commerce Keyword Lab</h2>
        <p>
          Commerce Keyword Lab (https://keywordlab.opendraw.live) is a keyword
          research tool for UAE e-commerce sellers on Noon and Amazon. It uses
          Google Keyword Planner data accessed through the Google Ads API to
          show monthly search volume, competition, and related keyword ideas,
          and lets you export those results to Excel/CSV.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Google API access and scope</h2>
        <p>
          To fetch keyword data, the app requests the Google Ads API scope{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/[.08]">
            https://www.googleapis.com/auth/adwords
          </code>
          . This access is used strictly in a read-only manner to retrieve Google
          Keyword Planner data (search volumes, competition metrics, and
          related keyword ideas). Commerce Keyword Lab does not create, modify,
          pause, or delete campaigns, ad groups, ads, keywords, bids, or budgets
          in your Google Ads account. Even though the scope technically permits
          broader access, our application code is written to only call the read
          endpoints required for Keyword Planner data, and we do not use the
          scope for any other purpose.
        </p>
        <p>
          Authentication is handled through Google&apos;s official OAuth 2.0 flow. We
          never see or store your Google password, and access tokens are kept on
          the server only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">What we store</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>The keywords you search for within the app.</li>
          <li>Cached keyword results from the Google Ads API, stored temporarily to improve performance and reduce redundant API calls.</li>
          <li>Server-side credentials needed to connect to the Google Ads API, stored securely and never exposed to the browser.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">What we do not collect</h2>
        <p>
          We do not collect your Google password, payment information, campaign
          performance data for advertising purposes, or any personal data beyond
          what is needed to authenticate with Google and operate the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">How we use data</h2>
        <p>
          Data is used solely to provide the keyword research functionality of
          the app: running your keyword lookups, returning Keyword Planner
          metrics, and enabling Excel/CSV export. We do not sell, rent, or share
          your data with third parties. We do not use Google user data for
          advertising purposes, and we do not use it to train machine learning
          or AI models.
        </p>
        <p>
          Commerce Keyword Lab&apos;s use and transfer of information received from
          Google APIs adheres to the Google API Services User Data Policy,
          including the Limited Use requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Data retention and deletion</h2>
        <p>
          Cached keyword results are retained only as long as needed to operate
          the service efficiently and are periodically purged. If you would like
          any stored data associated with your usage deleted, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will delete it within a reasonable timeframe.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Revoking access</h2>
        <p>
          You can revoke Commerce Keyword Lab&apos;s access to your Google account at
          any time at{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            https://myaccount.google.com/permissions
          </a>
          . Revoking access stops the app from making any further requests on
          your behalf.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Security</h2>
        <p>
          We use industry-standard measures to protect stored data, including
          encrypted connections (HTTPS) and secure server-side storage of
          credentials. No system is perfectly secure, but we take reasonable
          steps to safeguard your information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Children&apos;s privacy</h2>
        <p>
          Commerce Keyword Lab is a business tool intended for adults and is not
          directed at children under 13 (or the applicable age in your
          jurisdiction). We do not knowingly collect personal information from
          children. If you believe a child has provided us personal information,
          please contact us so we can remove it promptly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Third-party services</h2>
        <p>
          The app relies on Google APIs (Google OAuth and the Google Ads API) to
          function, and on hosting infrastructure to serve the website. These
          providers process data only as needed to deliver their services and are
          governed by their own privacy policies. We do not integrate
          advertising networks, analytics trackers that profile you across
          sites, or data brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated &quot;Last updated&quot; date.
          Continued use of the app after changes are posted constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Contact</h2>
        <p>
          For questions about this Privacy Policy or your data, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          <a href="/" className="underline underline-offset-4">
            ← Back to Commerce Keyword Lab
          </a>
        </p>
      </section>
    </main>
  );
}
