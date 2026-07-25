"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function updateUser(user: AdminUser, patch: Partial<{ status: string; role: string }>) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("User diperbarui");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui user");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("User dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus user");
    }
  }

  return (
    <div>
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..." className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat user...</p>
      ) : users.length === 0 ? (
        <EmptyState title="Tidak ada user" />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-2 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-2">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={u.role}
                      onChange={(e) => updateUser(u, { role: e.target.value })}
                      className="h-8 w-28 text-xs"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => updateUser(u, { status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}>
                      <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>{u.status}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{u._count.orders}</td>
                  <td className="px-4 py-3 text-muted-2">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(u)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus User">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus user <span className="text-foreground font-medium">{deleteTarget?.name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
