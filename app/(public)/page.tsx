import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Commerce Keyword Lab",
  description:
    "Keyword research for UAE e-commerce sellers on Noon and Amazon, powered by Google Keyword Planner data via the Google Ads API.",
};

const card =
  "rounded-2xl border border-black/[.08] p-6 dark:border-white/[.14]";
const primaryBtn =
  "rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
const secondaryBtn =
  "rounded-lg border border-black/[.15] px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-black/[.04] dark:border-white/[.2] dark:text-zinc-200 dark:hover:bg-white/[.06]";
const navLink =
  "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

const sampleRows = [
  { keyword: "abaya with belt", searches: "1,900", competition: "Medium", trend: "+18%" },
  { keyword: "work abaya dubai", searches: "480", competition: "Low", trend: "+42%" },
  { keyword: "summer abaya linen", searches: "210", competition: "Low", trend: "-5%" },
];

export default function Home() {
  return (
    <>
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            CK
          </span>
          <span className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
            Commerce Keyword Lab
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <a href="#how-it-works" className={navLink}>
            How it works
          </a>
          <Link href="/privacy" className={navLink}>
            Privacy
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 pb-20 pt-8 sm:px-6">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl dark:text-zinc-50">
              Find what UAE shoppers are searching for
            </h1>
            <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              Commerce Keyword Lab gives UAE e-commerce sellers real Google Keyword
              Planner data — monthly searches, competition, and keyword ideas for
              Noon and Amazon listings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={primaryBtn}>
                Sign in to start
              </Link>
              <a href="#how-it-works" className={secondaryBtn}>
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -top-3 right-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Sample
            </span>
            <div className="rounded-2xl border border-black/[.08] bg-white p-4 shadow-sm dark:border-white/[.14] dark:bg-zinc-950">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                UAE · English · 12-month trend
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                    <th scope="col" className="py-1.5 font-medium">Keyword</th>
                    <th scope="col" className="py-1.5 text-right font-medium">Searches</th>
                    <th scope="col" className="py-1.5 font-medium">Competition</th>
                    <th scope="col" className="py-1.5 text-right font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((r) => (
                    <tr key={r.keyword}>
                      <td className="border-t border-black/[.06] py-2 font-medium text-zinc-900 dark:border-white/[.1] dark:text-zinc-100">
                        {r.keyword}
                      </td>
                      <td className="border-t border-black/[.06] py-2 text-right tabular-nums text-zinc-700 dark:border-white/[.1] dark:text-zinc-300">
                        {r.searches}
                      </td>
                      <td className="border-t border-black/[.06] py-2 text-zinc-700 dark:border-white/[.1] dark:text-zinc-300">
                        {r.competition}
                      </td>
                      <td className="border-t border-black/[.06] py-2 text-right tabular-nums text-green-700 dark:border-white/[.1] dark:text-green-400">
                        {r.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={card}>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              UAE search volume
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Monthly searches and a 12-month trend for the United Arab Emirates,
              so you can see real demand before you list a product.
            </p>
          </div>
          <div className={card}>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              Related keyword ideas
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Long-tail suggestions with growth signals, generated from the seed
              keywords you type.
            </p>
          </div>
          <div className={card}>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              One-click export
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Export to Excel or CSV, ready for your Noon and Amazon listing
              workflows.
            </p>
          </div>
        </section>

        <section id="how-it-works" className="space-y-6 scroll-mt-8">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            How it works
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            <li className={card}>
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">1</span>
              <p className="mt-1 font-medium text-black dark:text-zinc-50">Sign in</p>
              <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                Use your password or Google account.
              </p>
            </li>
            <li className={card}>
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">2</span>
              <p className="mt-1 font-medium text-black dark:text-zinc-50">
                Enter your product keywords
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                One per line, up to 200 at a time.
              </p>
            </li>
            <li className={card}>
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">3</span>
              <p className="mt-1 font-medium text-black dark:text-zinc-50">
                Review and export
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                Compare volume, competition and growth, then export to Excel/CSV.
              </p>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-black/[.08] p-6 dark:border-white/[.14]">
          <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
            Keyword data comes from Google Keyword Planner via the Google Ads API.
            Commerce Keyword Lab only reads keyword research data and never creates
            or changes campaigns.
          </p>
        </section>
      </main>
    </>
  );
}
