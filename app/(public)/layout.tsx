import Link from "next/link";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="border-t border-black/[.08] dark:border-white/[.145] py-6 px-6 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Commerce Keyword Lab</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Privacy Policy
            </Link>
            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {CONTACT_EMAIL}
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
