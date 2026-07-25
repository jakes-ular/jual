import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl">Admin Panel</h1>
          <span className="text-xs text-muted rounded-full border border-border px-3 py-1">
            {session.user.email}
          </span>
        </div>
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <AdminSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
