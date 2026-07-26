"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatDateTime } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  suspensionReason: string | null;
  emailVerified: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

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

  async function updateUser(user: AdminUser, patch: Partial<{ status: string; role: string; suspensionReason: string | null }>) {
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

  function toggleStatus(user: AdminUser) {
    if (user.status === "ACTIVE") {
      setSuspendReason("");
      setSuspendTarget(user);
    } else {
      updateUser(user, { status: "ACTIVE" });
    }
  }

  async function confirmSuspend() {
    if (!suspendTarget) return;
    await updateUser(suspendTarget, { status: "SUSPENDED", suspensionReason: suspendReason.trim() || null });
    setSuspendTarget(null);
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
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Login Terakhir</th>
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
                    <button onClick={() => toggleStatus(u)} title={u.suspensionReason ?? undefined}>
                      <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>{u.status}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.emailVerified ? "success" : "warning"}>
                      {u.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{u._count.orders}</td>
                  <td className="px-4 py-3 text-muted-2">
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Belum pernah"}
                  </td>
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
          {deleteTarget && deleteTarget._count.orders > 0 && (
            <>
              {" "}
              User ini punya {deleteTarget._count.orders} order.{" "}
              {deleteTarget.status === "SUSPENDED"
                ? "Karena akun sudah SUSPENDED, riwayat order/download/review-nya akan ikut terhapus permanen."
                : "Suspend akun ini dulu sebelum bisa dihapus."}
            </>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={!!deleteTarget && deleteTarget._count.orders > 0 && deleteTarget.status !== "SUSPENDED"}
          >
            Hapus
          </Button>
        </div>
      </Dialog>

      <Dialog open={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspend User">
        <p className="text-sm text-muted mb-3">
          Menangguhkan <span className="text-foreground font-medium">{suspendTarget?.name}</span>. User tidak akan
          bisa memakai situs dan hanya melihat pesan di bawah ini sampai diaktifkan lagi.
        </p>
        <Textarea
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Alasan suspend (opsional, ditampilkan ke user)..."
          rows={3}
          className="mb-5"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setSuspendTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmSuspend}>
            Suspend
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
