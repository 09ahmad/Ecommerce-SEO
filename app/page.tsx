export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-16 px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Commerce Keyword Lab
      </h1>

      <div className="space-y-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
        <p>
          Commerce Keyword Lab is a keyword research tool built for UAE
          e-commerce sellers on Noon and Amazon. It helps you understand what
          shoppers in the UAE are actually searching for, so you can optimize
          product titles, descriptions, and ad targeting with real data instead
          of guesswork.
        </p>
        <p>
          The app uses Google Keyword Planner data via the Google Ads API to
          show monthly search volume, competition level, and related keyword
          ideas for the terms you research. You can export your results to
          Excel/CSV for use in your own spreadsheets and workflows.
        </p>
        <p>
          Commerce Keyword Lab requests read-only access to your Google Ads
          account (scope{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/[.08]">
            https://www.googleapis.com/auth/adwords
          </code>
          ). It only reads Keyword Planner data — it does not create, modify, or
          manage campaigns, ads, or budgets of any kind.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
          How it works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          <li>Sign in with your Google account and grant read-only access.</li>
          <li>Enter keywords related to your products to get UAE search volume, competition, and related keyword ideas.</li>
          <li>Export the results to Excel/CSV and use them in your listings and ads.</li>
        </ol>
      </section>
    </main>
  );
}
