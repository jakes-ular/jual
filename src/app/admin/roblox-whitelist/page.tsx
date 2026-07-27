"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Copy, RefreshCw, Eye, EyeOff, ShieldCheck, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

interface WhitelistEntry {
  id: string;
  robloxUsername: string;
  robloxUserId: string;
  note: string | null;
  createdAt: string;
}

const WHITELIST_URL_PATH = "/api/roblox-whitelist";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function AdminRobloxWhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showFullScript, setShowFullScript] = useState(true);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WhitelistEntry | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/roblox-whitelist");
    const data = await res.json();
    setEntries(data.entries ?? []);
    setSecret(data.secret ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  function openCreate() {
    setUsername("");
    setNote("");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/roblox-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxUsername: username, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menambahkan akun");
      toast.success(`${data.entry.robloxUsername} ditambahkan ke whitelist`);
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
      const res = await fetch(`/api/admin/roblox-whitelist/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Akun dihapus dari whitelist");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus akun");
    }
  }

  async function handleRegenerateSecret() {
    if (!confirm("Regenerate secret? Kamu harus update WHITELIST_KEY di Main script Roblox juga, atau whitelist berhenti berfungsi sampai diupdate.")) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await fetch("/api/admin/roblox-whitelist/secret", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal regenerate secret");
      setSecret(data.secret);
      setShowSecret(true);
      toast.success("Secret baru dibuat — jangan lupa update Main script Roblox");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setRegenerating(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  }

  const fullUrl = `${SITE_URL}${WHITELIST_URL_PATH}`;

  function buildFullScript(keyValue: string) {
    return `--!strict

--[[
	SECURITY GATE: this script only lets whatever comes after it run if the
	place's Creator (game.CreatorId) -- by robloxUserId, not just username --
	is present in the whitelist hosted on the VoxMarket admin dashboard
	(/admin/roblox-whitelist). An unauthorized copy of this place -- e.g.
	leaked and republished under someone else's account, or just this
	script pasted into a different place -- silently gets nothing.

	Enforced everywhere, including Studio (Edit/Play/Team Test) -- there is
	no bypass. Only the whitelisted owner's own place ever passes the check,
	in Studio or live.
]]

local HttpService = game:GetService("HttpService")

-- Public endpoint on the VoxMarket admin dashboard; managed from
-- /admin/roblox-whitelist. WHITELIST_KEY must match the secret shown on
-- that page -- it isn't the real security boundary (that's the per-
-- robloxUserId check below), just cheap scraping/noise protection on the
-- endpoint. Re-copy both if the secret is ever regenerated.
local WHITELIST_URL = "${fullUrl}"
local WHITELIST_KEY = "${keyValue}"
local WHITELIST_RECHECK_INTERVAL = 300 -- seconds; re-checked in Studio and live alike

-- Every protected remote handler / loop below must check this before doing
-- anything -- it starts false and is only ever flipped by the gate below
-- and by the recheck loop.
local SystemEnabled = false

-- Response shape expected from WHITELIST_URL:
-- {"users": [{"username": "SomeRobloxUser", "userId": 123456}, ...]}
-- Matches directly on robloxUserId (game.CreatorId) -- no
-- Players:GetUserIdFromNameAsync round-trip needed, so this keeps working
-- even if the whitelisted account later changes its Roblox username.
local function isCreatorWhitelisted(): boolean
	if game.CreatorType ~= Enum.CreatorType.User then
		-- Group-owned places aren't supported by this simple check.
		return false
	end
	if WHITELIST_URL == "" then
		return false
	end

	local creatorId = game.CreatorId

	local fetchOk, response = pcall(function()
		return HttpService:RequestAsync({
			Url = WHITELIST_URL,
			Method = "GET",
			Headers = { ["x-whitelist-key"] = WHITELIST_KEY },
		})
	end)
	if not fetchOk or not response.Success then
		warn("[Security] Failed to fetch whitelist:", if fetchOk then response.StatusCode else response)
		return false
	end

	local decodeOk, data = pcall(function()
		return HttpService:JSONDecode(response.Body)
	end)
	if not decodeOk or typeof(data) ~= "table" or typeof(data.users) ~= "table" then
		warn("[Security] Whitelist response was not in the expected format")
		return false
	end

	for _, entry in ipairs(data.users) do
		if typeof(entry) == "table" and tonumber(entry.userId) == creatorId then
			return true
		end
	end
	return false
end

SystemEnabled = isCreatorWhitelisted()
if not SystemEnabled then
	warn("[Security] This place's owner is not whitelisted -- protected systems will not load.")
	return
end

task.spawn(function()
	while true do
		task.wait(WHITELIST_RECHECK_INTERVAL)
		local ok = isCreatorWhitelisted()
		if ok ~= SystemEnabled then
			SystemEnabled = ok
			warn(if ok
				then "[Security] Whitelist re-check passed -- protected systems re-enabled."
				else "[Security] Whitelist re-check failed -- protected systems disabled.")
		end
	end
end)

-- Everything below this line only ever runs for a whitelisted place's
-- owner. Put the rest of your protected code here, and make sure every
-- RemoteEvent/RemoteFunction handler and every loop checks SystemEnabled
-- before doing anything.
`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl">Roblox Whitelist</h2>
          <p className="text-sm text-muted mt-1">
            Akun Roblox yang boleh menjalankan sistem Marching. Owner place yang tidak ada di sini
            otomatis dinonaktifkan oleh security gate di Main script.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Akun
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-4 w-4 text-primary-2" />
          <h3 className="font-semibold text-sm">Cara Memasang Whitelist di Script Roblox</h3>
        </div>
        <ol className="space-y-3 text-sm text-muted list-decimal list-inside">
          <li>
            <span className="text-foreground font-medium">Nyalakan HTTP Requests</span> — di Roblox
            Studio buka <span className="font-mono text-xs">Game Settings &gt; Security</span> dan
            aktifkan <span className="font-mono text-xs">Allow HTTP Requests</span>. Tanpa ini script
            tidak bisa menghubungi endpoint whitelist sama sekali (gagal → dianggap tidak whitelisted).
          </li>
          <li>
            <span className="text-foreground font-medium">Buka script <span className="font-mono text-xs">ServerScriptService.Main</span></span> —
            skrip inti sistem Marching, cari dua baris <span className="font-mono text-xs">WHITELIST_URL</span>{" "}
            dan <span className="font-mono text-xs">WHITELIST_KEY</span> di bagian atas script itu, lalu
            ganti persis dengan potongan berikut (klik ikon copy buat salin dua baris sekaligus):
            <div className="mt-2 rounded-lg bg-surface-2 border border-border p-3 flex items-start justify-between gap-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground">
                {`local WHITELIST_URL = "${fullUrl}"\nlocal WHITELIST_KEY = "${loading ? "" : showSecret ? secret : "•".repeat(24)}"`}
              </pre>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() =>
                  copyToClipboard(
                    `local WHITELIST_URL = "${fullUrl}"\nlocal WHITELIST_KEY = "${secret}"`,
                    "Potongan script"
                  )
                }
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
          <li>
            <span className="text-foreground font-medium">Tambahkan akun ke whitelist</span> — klik{" "}
            <span className="font-mono text-xs">Tambah Akun</span> di bawah, isi{" "}
            <span className="text-foreground">username</span> Roblox-nya (bukan User ID, itu otomatis
            diambil). <span className="text-foreground font-medium">Wajib termasuk akun owner tempat/place itu sendiri</span>,
            karena yang dicek script adalah pemilik place (<span className="font-mono text-xs">game.CreatorId</span>),
            bukan pemain yang masuk ke server.
          </li>
          <li>
            <span className="text-foreground font-medium">Publish ulang ke Roblox</span> — dari Studio,{" "}
            <span className="font-mono text-xs">File &gt; Publish to Roblox</span>, supaya server live
            memakai script yang sudah berisi URL &amp; key di atas.
          </li>
          <li>
            <span className="text-foreground font-medium">Cek juga berlaku di Studio</span> — pengecekan
            whitelist ini aktif di Edit/Play/Team Test juga, bukan cuma server live. Kalau akun owner
            belum ada di whitelist, sistem Marching juga tidak akan jalan saat testing di Studio —
            itu perilaku normal, pastikan akun owner sudah ditambahkan di langkah 3.
          </li>
        </ol>
        <p className="text-xs text-muted-2 mt-3">
          Kalau secret di-regenerate lewat tombol refresh di bawah, ulangi langkah 2 dengan nilai
          WHITELIST_KEY yang baru dan publish ulang — sampai itu dilakukan, sistem berhenti berfungsi
          di server live maupun di Studio.
        </p>

        <div className="mt-5 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setShowFullScript((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            {showFullScript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Script Security Gate Lengkap (siap tempel jadi seisi ServerScriptService.Main)
          </button>
          <p className="text-xs text-muted-2 mt-1.5 mb-3">
            Ini kode gate keamanannya secara utuh, bukan cuma dua baris konfigurasi — URL &amp; key di
            dalamnya sudah otomatis terisi nilai akun kamu. Kalau <span className="font-mono">Main</span>{" "}
            belum ada / mau dibuat dari nol, tinggal salin semua ini jadi isi scriptnya; kode
            sistem yang mau kamu lindungi ditaruh di bawah komentar paling akhir. Kalau{" "}
            <span className="font-mono">Main</span> sudah ada dan cuma perlu update dua variabel,
            cukup pakai potongan kecil di langkah 2 di atas.
          </p>
          {showFullScript && (
            <div className="rounded-lg bg-surface-2 border border-border p-3 flex items-start justify-between gap-2">
              <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground max-h-96 overflow-y-auto">
                {buildFullScript(loading ? "" : showSecret ? secret : "•".repeat(24))}
              </pre>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(buildFullScript(secret), "Script keamanan lengkap")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary-2" />
          <h3 className="font-semibold text-sm">Konfigurasi untuk Main script Roblox</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label>WHITELIST_URL</Label>
            <div className="flex gap-2">
              <Input readOnly value={fullUrl} className="font-mono text-xs" />
              <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(fullUrl, "URL")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <Label>WHITELIST_KEY</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                type={showSecret ? "text" : "password"}
                value={loading ? "" : secret}
                className="font-mono text-xs"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowSecret((s) => !s)}>
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(secret, "Secret")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={handleRegenerateSecret} loading={regenerating}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-2 mt-1.5">
              Regenerate memutus akses whitelist sampai nilai baru ini ditempel ke WHITELIST_KEY di
              ServerScriptService.Main.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat whitelist...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">Belum ada akun di whitelist — sistem Marching nonaktif di semua server live.</p>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-2">
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Roblox User ID</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{e.robloxUsername}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{e.robloxUserId}</td>
                  <td className="px-4 py-3 text-muted">{e.note || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(e)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Akun ke Whitelist">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rbxUsername">Username Roblox</Label>
            <Input
              id="rbxUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cth. BuilderMan"
              required
            />
            <p className="text-xs text-muted-2 mt-1.5">
              User ID diambil otomatis dari username ini lewat Roblox API saat disimpan.
            </p>
          </div>
          <div>
            <Label htmlFor="rbxNote">Catatan (opsional)</Label>
            <Input id="rbxNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth. akun utama" />
          </div>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" loading={saving}>
            Tambah ke Whitelist
          </Button>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus dari Whitelist">
        <p className="text-sm text-muted mb-5">
          Yakin ingin menghapus{" "}
          <span className="text-foreground font-medium">{deleteTarget?.robloxUsername}</span> dari whitelist?
          Semua server live yang dijalankan akun ini akan otomatis nonaktif pada re-check berikutnya.
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
