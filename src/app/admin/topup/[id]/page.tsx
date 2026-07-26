"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { formatRupiah } from "@/lib/utils";
import { Coins } from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: number;
  status: string;
}

interface Game {
  id: string;
  name: string;
  items: Item[];
}

export default function AdminTopupGameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/topup/games/${id}`);
    const data = await res.json();
    setGame(data.game ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setPrice("");
    setStatus("PUBLISHED");
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setName(item.name);
    setPrice(String(item.price));
    setStatus(item.status as "PUBLISHED" | "DRAFT");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { name, price: Number(price), status, ...(editing ? {} : { gameId: id }) };
      const res = await fetch(editing ? `/api/admin/topup/items/${editing.id}` : "/api/admin/topup/items", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan item");
      toast.success(editing ? "Item diperbarui" : "Item ditambahkan");
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/topup/items/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Item dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus item");
    }
  }

  if (loading) return <p className="text-sm text-muted">Memuat...</p>;
  if (!game) return <p className="text-sm text-muted">Game tidak ditemukan.</p>;

  return (
    <div>
      <Link href="/admin/topup" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Topup Game
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl">{game.name} — Item Denominasi</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Item
        </Button>
      </div>

      {game.items.length === 0 ? (
        <EmptyState icon={Coins} title="Belum ada item" description="Tambahkan denominasi topup pertama untuk game ini." />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-2 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {game.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{formatRupiah(item.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "draft"}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Item" : "Tambah Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemName">Nama Item</Label>
            <Input id="itemName" value={name} onChange={(e) => setName(e.target.value)} placeholder="86 Diamond" required />
          </div>
          <div>
            <Label htmlFor="itemPrice">Harga (Rp)</Label>
            <Input id="itemPrice" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="itemStatus">Status</Label>
            <Select id="itemStatus" value={status} onChange={(e) => setStatus(e.target.value as "PUBLISHED" | "DRAFT")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </div>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" loading={saving}>
            {editing ? "Simpan Perubahan" : "Tambah Item"}
          </Button>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Item">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus item <span className="text-foreground font-medium">{deleteTarget?.name}</span>?
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
