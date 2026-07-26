"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatDateTime } from "@/lib/utils";

interface AdminAppeal {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; status: string; suspensionReason: string | null };
}

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/appeals?${params.toString()}`);
    const data = await res.json();
    setAppeals(data.appeals ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  async function act(appeal: AdminAppeal, action: "unsuspend" | "dismiss") {
    if (action === "unsuspend" && !confirm(`Un-suspend akun ${appeal.user.name}?`)) return;
    setActing(appeal.id);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "unsuspend" ? "Akun diaktifkan kembali" : "Appeal ditolak");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses appeal");
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="PENDING">Menunggu Review</option>
          <option value="RESOLVED">Sudah Diproses</option>
          <option value="">Semua</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat appeal...</p>
      ) : appeals.length === 0 ? (
        <EmptyState title="Tidak ada appeal" description="Belum ada permintaan banding dari user." />
      ) : (
        <div className="space-y-3">
          {appeals.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-sm">
                    {a.user.name} <span className="text-muted-2 font-normal">· {a.user.email}</span>
                  </p>
                  <p className="text-xs text-muted-2 mt-0.5">{formatDateTime(a.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.user.status === "SUSPENDED" ? "danger" : "success"}>
                    Akun: {a.user.status}
                  </Badge>
                  <Badge variant={a.status === "PENDING" ? "warning" : "success"}>{a.status}</Badge>
                </div>
              </div>

              {a.user.suspensionReason && (
                <p className="text-xs text-muted-2 mb-2">
                  Alasan suspend: <span className="text-muted">{a.user.suspensionReason}</span>
                </p>
              )}

              <p className="text-sm text-foreground/90 bg-surface-2 rounded-xl p-3 whitespace-pre-wrap">
                {a.message}
              </p>

              {a.status === "PENDING" && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    disabled={acting === a.id}
                    onClick={() => act(a, "unsuspend")}
                  >
                    Un-suspend Akun
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting === a.id}
                    onClick={() => act(a, "dismiss")}
                  >
                    Tolak Appeal
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
