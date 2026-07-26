"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

const FIELDS: { section: string; keys: { key: string; label: string; textarea?: boolean }[] }[] = [
  {
    section: "Identitas Toko",
    keys: [
      { key: "storeName", label: "Nama Toko" },
      { key: "storeTagline", label: "Tagline" },
      { key: "logoUrl", label: "URL Logo" },
      { key: "bannerUrl", label: "URL Banner" },
    ],
  },
  {
    section: "Homepage",
    keys: [
      { key: "heroTitle", label: "Judul Hero" },
      { key: "heroSubtitle", label: "Subjudul Hero", textarea: true },
      { key: "footerText", label: "Teks Footer" },
    ],
  },
  {
    section: "Kontak & Sosial Media",
    keys: [
      { key: "contactEmail", label: "Email Kontak" },
      { key: "contactDiscord", label: "Discord" },
      { key: "socialTwitter", label: "Twitter URL" },
      { key: "socialYoutube", label: "YouTube URL" },
      { key: "socialInstagram", label: "Instagram URL" },
    ],
  },
  {
    section: "Informasi Pembayaran Manual",
    keys: [
      { key: "bankName", label: "Nama Bank" },
      { key: "bankAccountNumber", label: "Nomor Rekening" },
      { key: "bankAccountName", label: "Atas Nama" },
      { key: "ewalletNumber", label: "Nomor E-Wallet" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQris, setUploadingQris] = useState(false);

  async function handleQrisUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploadingQris(true);
    try {
      const formData = new FormData();
      formData.append("kind", "image");
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
      setValues((v) => ({ ...v, qrisImageUrl: data.url }));
      toast.success("Foto QRIS diunggah — klik Simpan untuk menerapkan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploadingQris(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setValues(data.settings ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Memuat pengaturan...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {FIELDS.map((group) => (
        <div key={group.section} className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold text-sm">{group.section}</h2>
          {group.keys.map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.textarea ? (
                <Textarea
                  id={f.key}
                  rows={3}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          {group.section === "Informasi Pembayaran Manual" && (
            <div>
              <Label htmlFor="qrisImageUrl">Foto QRIS</Label>
              {values.qrisImageUrl && (
                <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-border mb-2">
                  <Image src={values.qrisImageUrl} alt="QRIS" fill sizes="160px" className="object-contain bg-white" />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2 w-fit px-4">
                {uploadingQris ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {values.qrisImageUrl ? "Ganti foto QRIS" : "Unggah foto QRIS"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQrisUpload(e.target.files)} />
              </label>
              <p className="text-xs text-muted-2 mt-1.5">Ditampilkan ke pembeli di halaman konfirmasi pesanan saat memilih QRIS.</p>
            </div>
          )}
        </div>
      ))}
      <Button type="submit" size="lg" loading={saving}>
        Simpan Semua Pengaturan
      </Button>
    </form>
  );
}
