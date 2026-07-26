"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/product/category-icon";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count: { products: number };
}

const ICON_OPTIONS = [
  "Palette",
  "Box",
  "Map",
  "LayoutTemplate",
  "Code2",
  "Car",
  "Shirt",
  "Sparkles",
  "Music",
  "Cpu",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Palette");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setIcon("Palette");
    setError("");
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setDescription(c.description ?? "");
    setIcon(c.icon ?? "Palette");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan kategori");
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
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
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Kategori dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl">Kategori</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat kategori...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-gradient-brand/15 flex items-center justify-center text-primary-2">
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mt-3">{c.name}</h3>
              <p className="text-xs text-muted mt-1 line-clamp-2">{c.description}</p>
              <p className="text-xs text-muted-2 mt-2">{c._count.products} produk</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Kategori" : "Tambah Kategori"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="catName">Nama Kategori</Label>
            <Input id="catName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="catDesc">Deskripsi</Label>
            <Textarea id="catDesc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-10 rounded-lg border flex items-center justify-center ${
                    icon === i ? "border-primary bg-primary/10 text-primary-2" : "border-border text-muted"
                  }`}
                >
                  <CategoryIcon name={i} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" loading={saving}>
            {editing ? "Simpan Perubahan" : "Tambah Kategori"}
          </Button>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Kategori">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus kategori <span className="text-foreground font-medium">{deleteTarget?.name}</span>?
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
