import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function requireAdmin(): Promise<
  { ok: true; session: Session } | { ok: false; status: number; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { ok: false, status: 403, error: "Forbidden" };
  return { ok: true, session };
}
