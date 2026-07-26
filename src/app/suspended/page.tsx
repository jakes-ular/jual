import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ShieldAlert } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SuspendedSignOut } from "./suspended-signout";

export default async function SuspendedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.status !== "SUSPENDED") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspensionReason: true },
  });

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-danger" />
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight mb-3">SUSPENDED</h1>
        <p className="text-sm text-muted mb-6">
          {user?.suspensionReason?.trim()
            ? user.suspensionReason
            : "Akun Anda telah ditangguhkan oleh admin. Hubungi kami jika ini sebuah kesalahan."}
        </p>

        <SuspendedSignOut />
      </div>
    </main>
  );
}
