"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, FileArchive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface ImageItem {
  url: string;
  alt?: string;
}

interface FileItem {
  fileName: string;
  storagePath: string;
  sizeBytes: number;
}

export interface ProductFormValues {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  tags: string;
  features: string;
  fileFormat: string;
  fileSize: string;
  compatibility: string;
  version: string;
  changelog: string;
  status: "PUBLISHED" | "DRAFT";
  isFeatured: boolean;
  isBestSeller: boolean;
  images: ImageItem[];
  files: FileItem[];
}

const emptyForm: ProductFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  discountPrice: "",
  categoryId: "",
  tags: "",
  features: "",
  fileFormat: "",
  fileSize: "",
  compatibility: "",
  version: "",
  changelog: "",
  status: "DRAFT",
  isFeatured: false,
  isBestSeller: false,
  images: [],
  files: [],
};

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: Category[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...emptyForm, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleImageUpload(fileList: FileList | null) {
    if (!fileList) return;
    setUploadingImage(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("kind", "image");
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
        set("images", [...values.images, { url: data.url, alt: values.name }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleFileUpload(fileList: FileList | null) {
    if (!fileList) return;
    setUploadingFile(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("kind", "file");
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah file");
        set("files", [
          ...values.files,
          { fileName: file.name, storagePath: data.storagePath, sizeBytes: data.sizeBytes },
        ]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (values.images.length === 0) {
      setError("Minimal 1 gambar produk wajib diunggah");
      return;
    }
    if (values.files.length === 0) {
      setError("Minimal 1 file digital wajib diunggah");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...values,
        price: Number(values.price),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
      };

      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan produk");

      toast.success(productId ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">Informasi Dasar</h2>
          <div>
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
            <Input
              id="shortDescription"
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="description">Deskripsi Lengkap</Label>
            <Textarea
              id="description"
              rows={5}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="features">Fitur Produk (satu per baris)</Label>
            <Textarea
              id="features"
              rows={4}
              value={values.features}
              onChange={(e) => set("features", e.target.value)}
              placeholder={"Fitur 1\nFitur 2\nFitur 3"}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tag (pisahkan dengan koma)</Label>
            <Input
              id="tags"
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="vehicle, military, drivable"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">Informasi File</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fileFormat">Format File</Label>
              <Input id="fileFormat" value={values.fileFormat} onChange={(e) => set("fileFormat", e.target.value)} placeholder=".rbxm" />
            </div>
            <div>
              <Label htmlFor="fileSize">Ukuran File</Label>
              <Input id="fileSize" value={values.fileSize} onChange={(e) => set("fileSize", e.target.value)} placeholder="48 MB" />
            </div>
            <div>
              <Label htmlFor="compatibility">Kompatibilitas</Label>
              <Input id="compatibility" value={values.compatibility} onChange={(e) => set("compatibility", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="version">Versi</Label>
              <Input id="version" value={values.version} onChange={(e) => set("version", e.target.value)} placeholder="1.0.0" />
            </div>
          </div>
          <div>
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea id="changelog" rows={2} value={values.changelog} onChange={(e) => set("changelog", e.target.value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">Gambar Produk</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {values.images.map((img, i) => (
              <div key={img.url} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => set("images", values.images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-border-strong text-muted-2">
              {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-[11px]">Unggah</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">File Digital (Aset)</h2>
          <div className="space-y-2">
            {values.files.map((f, i) => (
              <div key={f.storagePath} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <FileArchive className="h-4 w-4 text-primary-2 shrink-0" />
                <span className="text-sm flex-1 truncate">{f.fileName}</span>
                <span className="text-xs text-muted-2">{formatBytes(f.sizeBytes)}</span>
                <button
                  type="button"
                  onClick={() => set("files", values.files.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2">
            {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Unggah file digital (.zip, .rbxm, dll)
            <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
          </label>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">Harga & Kategori</h2>
          <div>
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input id="price" type="number" min={0} value={values.price} onChange={(e) => set("price", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="discountPrice">Harga Diskon (opsional)</Label>
            <Input
              id="discountPrice"
              type="number"
              min={0}
              value={values.discountPrice}
              onChange={(e) => set("discountPrice", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <Select id="categoryId" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">Status & Visibilitas</h2>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={values.status} onChange={(e) => set("status", e.target.value as "PUBLISHED" | "DRAFT")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="h-4 w-4 rounded accent-[#8b5cf6]"
            />
            Tandai sebagai Featured
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={values.isBestSeller}
              onChange={(e) => set("isBestSeller", e.target.checked)}
              className="h-4 w-4 rounded accent-[#8b5cf6]"
            />
            Tandai sebagai Best Seller
          </label>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" size="lg" className="w-full" loading={saving}>
          {productId ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}
