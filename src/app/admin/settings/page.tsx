"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
        </div>
      ))}
      <Button type="submit" size="lg" loading={saving}>
        Simpan Semua Pengaturan
      </Button>
    </form>
  );
}
