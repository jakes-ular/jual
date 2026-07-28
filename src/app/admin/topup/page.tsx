"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  Gamepad2,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { TopupTabs } from "@/components/admin/topup-tabs";
import { ImageCropper } from "@/components/admin/image-cropper";
import { buildTopupBackgroundStyle } from "@/lib/topup-theme";

interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  bannerUrl: string | null;
  bgColors: string[];
  gradientDirection: number;
  textColor: string | null;
  patternUrl: string | null;
  status: string;
  _count: { items: number };
}

const DEFAULT_BG_COLORS = ["#ffffff"];
const DEFAULT_TEXT_COLOR = "#12141b";
const DEFAULT_GRADIENT_DIRECTION = 135;
const MAX_BG_COLORS = 6;

const GRADIENT_DIRECTIONS: { deg: number; label: string; icon: typeof ArrowUp }[] = [
  { deg: 315, label: "Kiri atas", icon: ArrowUpLeft },
  { deg: 0, label: "Atas", icon: ArrowUp },
  { deg: 45, label: "Kanan atas", icon: ArrowUpRight },
  { deg: 270, label: "Kiri", icon: ArrowLeft },
  { deg: 90, label: "Kanan", icon: ArrowRight },
  { deg: 225, label: "Kiri bawah", icon: ArrowDownLeft },
  { deg: 180, label: "Bawah", icon: ArrowDown },
  { deg: 135, label: "Kanan bawah", icon: ArrowDownRight },
];

export default function AdminTopupGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bgColors, setBgColors] = useState<string[]>(DEFAULT_BG_COLORS);
  const [gradientDirection, setGradientDirection] = useState(DEFAULT_GRADIENT_DIRECTION);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [patternUrl, setPatternUrl] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("DRAFT");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPattern, setUploadingPattern] = useState(false);
  const [cropTarget, setCropTarget] = useState<"logo" | "banner" | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

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
    setBannerUrl("");
    setBgColors(DEFAULT_BG_COLORS);
    setGradientDirection(DEFAULT_GRADIENT_DIRECTION);
    setTextColor(DEFAULT_TEXT_COLOR);
    setPatternUrl("");
    setStatus("DRAFT");
    setError("");
    setModalOpen(true);
  }

  function openEdit(g: Game) {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? "");
    setIcon(g.icon ?? "");
    setBannerUrl(g.bannerUrl ?? "");
    setBgColors(g.bgColors.length > 0 ? g.bgColors : DEFAULT_BG_COLORS);
    setGradientDirection(g.gradientDirection ?? DEFAULT_GRADIENT_DIRECTION);
    setTextColor(g.textColor || DEFAULT_TEXT_COLOR);
    setPatternUrl(g.patternUrl ?? "");
    setStatus(g.status as "PUBLISHED" | "DRAFT");
    setError("");
    setModalOpen(true);
  }

  function updateBgColor(index: number, value: string) {
    setBgColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addBgColor() {
    setBgColors((prev) => (prev.length >= MAX_BG_COLORS ? prev : [...prev, "#ffffff"]));
  }

  function removeBgColor(index: number) {
    setBgColors((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleLogoFileSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setCropTarget("logo");
    setCropFile(file);
  }

  function handleBannerFileSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setCropTarget("banner");
    setCropFile(file);
  }

  async function uploadCroppedImage(file: File, target: "logo" | "banner") {
    const setUploadingFlag = target === "logo" ? setUploading : setUploadingBanner;
    setUploadingFlag(true);
    try {
      const formData = new FormData();
      formData.append("kind", "image");
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
      if (target === "logo") setIcon(data.url);
      else setBannerUrl(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploadingFlag(false);
    }
  }

  function handleCropped(file: File) {
    const target = cropTarget;
    setCropFile(null);
    setCropTarget(null);
    if (target) uploadCroppedImage(file, target);
  }

  function handleCropCancel() {
    setCropFile(null);
    setCropTarget(null);
  }

  async function handlePatternUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploadingPattern(true);
    try {
      const formData = new FormData();
      formData.append("kind", "image");
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
      setPatternUrl(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploadingPattern(false);
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
        body: JSON.stringify({
          name,
          description,
          icon,
          bannerUrl,
          bgColors,
          gradientDirection,
          textColor,
          patternUrl,
          status,
        }),
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
            <Label>Logo</Label>
            <p className="text-xs text-muted-2 mb-2">
              Icon persegi kecil, dipakai di kartu game dan header halaman. Ukuran ideal 512×512px (rasio 1:1) —
              gambar yang diunggah bisa langsung dipotong (crop) ke rasio ini.
            </p>
            {icon && (
              <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-border mb-2">
                <Image src={icon} alt="" fill sizes="96px" className="object-cover" />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2 w-fit px-4">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {icon ? "Ganti gambar" : "Unggah gambar"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFileSelect(e.target.files)} />
            </label>
          </div>
          <div className="pt-3 border-t border-border">
            <Label>Banner Halaman</Label>
            <p className="text-xs text-muted-2 mb-2">
              Gambar lebar yang tampil di paling atas halaman <span className="font-mono">/topup/{"{slug}"}</span> game ini.
              Ukuran ideal 1600×400px (rasio 4:1) — gambar yang diunggah bisa langsung dipotong (crop) ke rasio ini.
            </p>
            {bannerUrl && (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-border mb-2">
                <Image src={bannerUrl} alt="" fill sizes="400px" className="object-cover object-center" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2 w-fit px-4">
                {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {bannerUrl ? "Ganti banner" : "Unggah banner"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerFileSelect(e.target.files)} />
              </label>
              {bannerUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setBannerUrl("")}>
                  Hapus
                </Button>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <Label>Tema Halaman</Label>
            <p className="text-xs text-muted-2 mb-2">
              Warna background bisa lebih dari satu jadi gradasi, plus warna teks dan motif/pattern opsional.
            </p>

            <Label className="text-xs">Warna Background (gradasi)</Label>
            <div className="space-y-2 mt-1 mb-2">
              {bgColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateBgColor(i, e.target.value)}
                    className="h-10 w-11 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input value={color} onChange={(e) => updateBgColor(i, e.target.value)} className="font-mono text-xs" />
                  {bgColors.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBgColor(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-danger" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {bgColors.length < MAX_BG_COLORS && (
              <Button type="button" variant="outline" size="sm" onClick={addBgColor}>
                <Plus className="h-3.5 w-3.5" /> Tambah Warna
              </Button>
            )}

            {bgColors.length >= 2 && (
              <div className="mt-4">
                <Label className="text-xs">Arah Gradasi</Label>
                <p className="text-xs text-muted-2 mb-2">Pilih ke arah mana warna-warna di atas mengalir.</p>
                <div className="grid grid-cols-4 gap-2 w-fit">
                  {GRADIENT_DIRECTIONS.map(({ deg, label, icon: Icon }) => (
                    <button
                      key={deg}
                      type="button"
                      title={label}
                      aria-label={label}
                      onClick={() => setGradientDirection(deg)}
                      className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
                        gradientDirection === deg
                          ? "border-primary bg-primary/10 text-primary-2"
                          : "border-border text-muted-2 hover:border-border-strong"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="gameTextColor" className="text-xs">Warna Teks</Label>
              <div className="flex items-center gap-2">
                <input
                  id="gameTextColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-11 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>

            <div className="mt-4">
              <Label>Motif / Pattern (opsional)</Label>
              <p className="text-xs text-muted-2 mb-2">
                Gambar tekstur/pola yang diulang menutupi background — pakai PNG transparan biar gradasinya tetap kelihatan.
              </p>
              {patternUrl && (
                <div
                  className="h-20 w-full rounded-xl border border-border mb-2"
                  style={{ backgroundImage: `url(${patternUrl})`, backgroundRepeat: "repeat" }}
                />
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-border-strong text-sm text-muted-2 w-fit px-4">
                  {uploadingPattern ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {patternUrl ? "Ganti motif" : "Unggah motif"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePatternUpload(e.target.files)} />
                </label>
                {patternUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPatternUrl("")}>
                    Hapus
                  </Button>
                )}
              </div>
            </div>

            <div
              className="mt-4 rounded-xl border border-border p-4 text-center transition-colors"
              style={buildTopupBackgroundStyle(bgColors, patternUrl, gradientDirection)}
            >
              <p className="text-sm font-semibold" style={{ color: textColor }}>
                Pratinjau Halaman {name || "Game"}
              </p>
              <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.8 }}>
                Contoh tampilan gradasi, teks &amp; motif
              </p>
            </div>
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

      {cropFile && cropTarget && (
        <ImageCropper
          file={cropFile}
          title={cropTarget === "logo" ? "Sesuaikan Logo" : "Sesuaikan Banner"}
          aspectRatio={cropTarget === "logo" ? 1 : 4}
          outputWidth={cropTarget === "logo" ? 512 : 1600}
          outputHeight={cropTarget === "logo" ? 512 : 400}
          mimeType={cropTarget === "logo" ? "image/png" : "image/jpeg"}
          onCancel={handleCropCancel}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}
