"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Upload, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { TopupTabs } from "@/components/admin/topup-tabs";

interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  status: string;
  _count: { items: number };
}

export default function AdminTopupGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("DRAFT");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/topup/games");
    const data = await res.json();
    setGames(data.games ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setIcon("");
    setStatus("DRAFT");
    setError("");
    setModalOpen(true);
  }

  function openEdit(g: Game) {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? "");
    setIcon(g.icon ?? "");
    setStatus(g.status as "PUBLISHED" | "DRAFT");
    setError("");
    setModalOpen(true);
  }

  async function handleIconUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("kind", "image");
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
      setIcon(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/topup/games/${editing.id}` : "/api/admin/topup/games", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan game");
      toast.success(editing ? "Game diperbarui" : "Game ditambahkan");
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
      const res = await fetch(`/api/admin/topup/games/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Game dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus game");
    }
  }

  return (
    <div>
      <TopupTabs />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl">Topup Game</h2>
          <p className="text-sm text-muted mt-1">
            Kelola game dan denominasi topup — terpisah dari katalog produk aset.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Game
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat game...</p>
      ) : games.length === 0 ? (
        <EmptyState icon={Gamepad2} title="Belum ada game" description="Tambahkan game topup pertama Anda." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g) => (
            <div key={g.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                  {g.icon ? (
                    <Image src={g.icon} alt={g.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <Gamepad2 className="h-5 w-5 text-muted-2" />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(g)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(g)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mt-3">{g.name}</h3>
              <p className="text-xs text-muted mt-1 line-clamp-2">{g.description}</p>
              <div className="flex items-center justify-between mt-3">
                <Badge variant={g.status === "PUBLISHED" ? "success" : "draft"}>{g.status}</Badge>
                <span className="text-xs text-muted-2">{g._count.items} item</span>
              </div>
              <Link href={`/admin/topup/${g.id}`} className="mt-3 block">
                <Button size="sm" variant="secondary" className="w-full">
                  Kelola Item
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Game" : "Tambah Game"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gameName">Nama Game</Label>
            <Input id="gameName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="gameDesc">Deskripsi</Label>
            <Textarea id="gameDesc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Logo / Banner</Label>
            {icon && (
              <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-border mb-2">
                <Image src={icon} alt="" fill sizes="96px" className="object-cover" />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2 w-fit px-4">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {icon ? "Ganti gambar" : "Unggah gambar"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleIconUpload(e.target.files)} />
            </label>
          </div>
          <div>
            <Label htmlFor="gameStatus">Status</Label>
            <Select id="gameStatus" value={status} onChange={(e) => setStatus(e.target.value as "PUBLISHED" | "DRAFT")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </div>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" loading={saving}>
            {editing ? "Simpan Perubahan" : "Tambah Game"}
          </Button>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Game">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus game <span className="text-foreground font-medium">{deleteTarget?.name}</span>?
          Semua item denominasinya akan ikut terhapus.
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
