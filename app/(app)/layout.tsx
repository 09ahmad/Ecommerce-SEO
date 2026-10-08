import { connection } from "next/server";
import { cookies } from "next/headers";
import TopBar from "@/components/top-bar";
import { SESSION_COOKIE, getSessionPayload } from "@/lib/auth/session";

export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = getSessionPayload(value);

  return (
    <>
      <TopBar name={payload?.name} email={payload?.email} />
      {children}
    </>
  );
}
