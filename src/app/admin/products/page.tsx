"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { formatRupiah } from "@/lib/utils";

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  status: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  category: { name: string };
  images: { url: string }[];
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Produk dihapus");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk..." className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            <option value="">Semua Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Tambah Produk
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat produk...</p>
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada produk" description="Tambahkan produk pertama Anda." />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-2 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                        {p.images[0] ? (
                          <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-2">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px]">{p.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.isFeatured && <Badge variant="featured" />}
                          {p.isBestSeller && <Badge variant="bestseller" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category.name}</td>
                  <td className="px-4 py-3">
                    {formatRupiah(p.discountPrice ?? p.price)}
                    {p.discountPrice && (
                      <span className="text-muted-2 line-through ml-1.5 text-xs">
                        {formatRupiah(p.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "PUBLISHED" ? "success" : "draft"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(p)}>
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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Produk">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus <span className="text-foreground font-medium">{deleteTarget?.name}</span>?
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            Hapus
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
