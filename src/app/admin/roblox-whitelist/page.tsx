"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Copy, RefreshCw, Eye, EyeOff, ShieldCheck, ListChecks, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AssetSession {
  id: string;
  assetKey: string;
  placeId: string;
  placeName: string | null;
  lastSeenAt: string;
}

interface WhitelistEntry {
  id: string;
  type: "USER" | "GROUP";
  robloxUsername: string;
  robloxUserId: string;
  note: string | null;
  createdAt: string;
  sessions: AssetSession[];
}

const WHITELIST_URL_PATH = "/api/roblox-whitelist";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// A session counts as "online" if it's reported within 2x the script's
// recheck interval (WHITELIST_RECHECK_INTERVAL = 300s in the gate script)
// -- generous enough to not flicker offline between recheck ticks.
const ONLINE_THRESHOLD_MS = 10 * 60 * 1000;

function timeAgo(iso: string, now: number): string {
  const diffSec = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

export default function AdminRobloxWhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WhitelistEntry | null>(null);

  const [now, setNow] = useState(() => Date.now());

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<"USER" | "GROUP">("USER");
  const [identifier, setIdentifier] = useState("");
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

  // Live tracking table below re-polls independently of user actions so
  // "last active" / online status stays current without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      load();
    }, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  function openCreate() {
    setType("USER");
    setIdentifier("");
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
        body: JSON.stringify({ type, identifier, note }),
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

  const allSessions = entries
    .flatMap((e) => e.sessions.map((s) => ({ ...s, username: e.robloxUsername })))
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

  function buildFullScript(keyValue: string) {
    return `--!strict

--[[
	SECURITY GATE: this script only lets whatever comes after it run if the
	place's Creator (game.CreatorId + game.CreatorType) -- by id, not
	username/group name -- is present in the whitelist hosted on the
	VoxMarket admin dashboard (/admin/roblox-whitelist). Works for places
	owned by a personal account OR published under a Group (matched on the
	group's own id -- a member's rank inside the group is irrelevant). An
	unauthorized copy of this place -- e.g. leaked and republished under
	someone else's account/group, or just this script pasted into a
	different place -- silently gets nothing.

	Enforced everywhere, including Studio (Edit/Play/Team Test) -- there is
	no bypass. Only a whitelisted owner (user or group) ever passes the
	check, in Studio or live.
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
-- {"users": [{"username": "SomeRobloxUser", "userId": 123456, "type": "USER"}, ...]}
-- "type" is "USER" for a personal account (matched against game.CreatorId
-- when the place is owned by a user) or "GROUP" (matched against
-- game.CreatorId when the place is published under a Group -- membership
-- rank inside the group does NOT matter, only the group's own id does).
-- Matches directly on the id, not username/group name, so this keeps
-- working even if the whitelisted account or group is later renamed.
local function isCreatorWhitelisted(): boolean
	if WHITELIST_URL == "" then
		return false
	end

	local creatorId = game.CreatorId
	local creatorType = game.CreatorType

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
			local entryType = if entry.type == "GROUP" then Enum.CreatorType.Group else Enum.CreatorType.User
			if creatorType == entryType then
				return true
			end
		end
	end
	return false
end

-- Live tracking: reports "this asset is running in this place" to the same
-- admin dashboard's live-tracking table, every time the whitelist is
-- (re-)checked -- place + timestamp only, no player data. ASSET_KEY only
-- needs to be unique per asset; reuse this whole gate (with a different
-- ASSET_KEY) to get the same whitelist + tracking for another asset, and
-- it shows up in the same table without any dashboard changes.
local ASSET_KEY = "marching"

local function sendHeartbeat()
	local placeName = nil
	pcall(function()
		local info = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId)
		placeName = info and info.Name
	end)

	pcall(function()
		HttpService:RequestAsync({
			Url = WHITELIST_URL .. "/heartbeat",
			Method = "POST",
			Headers = {
				["x-whitelist-key"] = WHITELIST_KEY,
				["Content-Type"] = "application/json",
			},
			Body = HttpService:JSONEncode({
				creatorId = game.CreatorId,
				creatorType = if game.CreatorType == Enum.CreatorType.Group then "GROUP" else "USER",
				placeId = tostring(game.PlaceId),
				placeName = placeName,
				assetKey = ASSET_KEY,
			}),
		})
	end)
end

SystemEnabled = isCreatorWhitelisted()
if not SystemEnabled then
	warn("[Security] This place's owner is not whitelisted -- protected systems will not load.")
	return
end
sendHeartbeat()

task.spawn(function()
	while true do
		task.wait(WHITELIST_RECHECK_INTERVAL)
		local ok = isCreatorWhitelisted()
		if ok then
			sendHeartbeat()
		end
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl">Roblox Whitelist</h2>
          <p className="text-sm text-muted mt-1">
            Akun Roblox yang boleh menjalankan sistem Marching. Owner place yang tidak ada di sini
            otomatis dinonaktifkan oleh security gate di Main script.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
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
            <span className="text-foreground font-medium">Tempel script di bawah</span> jadi seisi{" "}
            <span className="font-mono text-xs">ServerScriptService.Main</span> — satu script ini
            sudah lengkap: cek whitelist (<span className="font-mono text-xs">game.CreatorId</span>)
            sekaligus live tracking (lapor lagi dipakai di place mana), URL &amp; key di dalamnya sudah
            otomatis terisi nilai akun kamu, tidak perlu ubah apa-apa lagi selain menaruh kode sistem
            yang mau dilindungi di bawah komentar paling akhir.
          </li>
          <li>
            <span className="text-foreground font-medium">Tambahkan akun/group ke whitelist</span> — klik{" "}
            <span className="font-mono text-xs">Tambah Akun</span> di bawah.{" "}
            <span className="text-foreground font-medium">Wajib termasuk pemilik place itu sendiri</span>,
            karena yang dicek script adalah pemilik place (Creator), bukan pemain yang masuk ke server.
            Cek dulu di <span className="font-mono text-xs">Game Settings &gt; Basic Info</span>: kalau
            Creator-nya nama akun biasa, pilih tipe <span className="text-foreground">Akun</span> dan isi
            username-nya (User ID otomatis diambil). Kalau Creator-nya nama Group, wajib pilih tipe{" "}
            <span className="text-foreground">Group</span> dan isi Group ID-nya (angka di URL halaman
            group, mis. <span className="font-mono text-xs">roblox.com/groups/123456/...</span>) —
            whitelist akun pribadi member/admin group itu <span className="italic">tidak</span> ikut
            meloloskan, karena yang dicocokkan script adalah id Group-nya, bukan rank member di dalamnya.
          </li>
          <li>
            <span className="text-foreground font-medium">Publish ulang ke Roblox</span> — dari Studio,{" "}
            <span className="font-mono text-xs">File &gt; Publish to Roblox</span>, supaya server live
            memakai script yang sudah berisi URL &amp; key di atas.
          </li>
          <li>
            <span className="text-foreground font-medium">Berlaku juga di Studio</span>{" "}— pengecekan
            whitelist &amp; live tracking ini aktif di Edit/Play/Team Test juga, bukan cuma server live.
            Kalau akun owner belum ada di whitelist, semuanya tidak akan jalan saat testing di Studio —
            itu perilaku normal, pastikan akun owner sudah ditambahkan di langkah 3.
          </li>
        </ol>
        <div className="mt-4 rounded-lg bg-surface-2 border border-border p-3">
          <p className="text-xs font-medium text-foreground mb-1">
            Mau pakai whitelist + live tracking yang sama untuk aset lain (bukan Marching)?
          </p>
          <p className="text-xs text-muted-2">
            Whitelist akunnya tetap satu (per akun Roblox, bukan per aset) — cukup tempel script yang
            sama persis di aset lain itu, lalu ganti nilai <span className="font-mono">ASSET_KEY</span>{" "}
            (baris di dekat <span className="font-mono">sendHeartbeat</span>, defaultnya{" "}
            <span className="font-mono">&quot;marching&quot;</span>) jadi nama unik buat aset itu. Tracking-nya
            otomatis muncul terpisah di tabel Live Tracking, dibedakan per aset, tanpa perubahan apa pun
            di dashboard ini.
          </p>
        </div>
        <p className="text-xs text-muted-2 mt-3">
          Kalau secret di-regenerate lewat tombol refresh di bawah, tempel ulang script (nilainya sudah
          otomatis ter-update) dan publish ulang — sampai itu dilakukan, whitelist dan live tracking
          berhenti berfungsi di server live maupun di Studio.
        </p>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-1">
            Script lengkap (whitelist + live tracking) — tinggal tempel
          </p>
          <div className="rounded-lg bg-surface-2 border border-border p-3 flex items-start justify-between gap-2">
            <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground max-h-96 overflow-y-auto">
              {buildFullScript(loading ? "" : showSecret ? secret : "•".repeat(24))}
            </pre>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => copyToClipboard(buildFullScript(secret), "Script lengkap")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
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
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-2">
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Username / Group</th>
                <th className="px-4 py-3 font-medium">Roblox ID</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Badge variant={e.type === "GROUP" ? "warning" : "neutral"}>
                      {e.type === "GROUP" ? "Group" : "Akun"}
                    </Badge>
                  </td>
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

      <div className="mt-8 mb-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary-2" />
          <h3 className="font-display font-bold text-lg">Live Tracking</h3>
        </div>
        <p className="text-sm text-muted mt-1">
          Map/place Roblox mana saja yang sedang menjalankan aset ini sekarang, berdasarkan laporan
          terakhir dari script — otomatis refresh tiap 30 detik.
        </p>
      </div>

      {!loading && allSessions.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada laporan live tracking — muncul otomatis begitu ada server yang lolos whitelist dan
          melakukan recheck pertamanya.
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-2">
                <th className="px-4 py-3 font-medium">Akun</th>
                <th className="px-4 py-3 font-medium">Aset</th>
                <th className="px-4 py-3 font-medium">Place</th>
                <th className="px-4 py-3 font-medium">Terakhir Aktif</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map((s) => {
                const online = now - new Date(s.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{s.username}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{s.assetKey}</td>
                    <td className="px-4 py-3 text-muted">
                      <div>{s.placeName || "(nama tidak tersedia)"}</div>
                      <div className="text-xs text-muted-2 font-mono">ID: {s.placeId}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{timeAgo(s.lastSeenAt, now)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={online ? "success" : "danger"}>{online ? "Online" : "Offline"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Akun ke Whitelist">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipe Pemilik Place</Label>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setType("USER")}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${
                  type === "USER"
                    ? "border-primary bg-primary/10 text-primary-2"
                    : "border-border text-muted-2 hover:border-border-strong"
                }`}
              >
                Akun
              </button>
              <button
                type="button"
                onClick={() => setType("GROUP")}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${
                  type === "GROUP"
                    ? "border-primary bg-primary/10 text-primary-2"
                    : "border-border text-muted-2 hover:border-border-strong"
                }`}
              >
                Group
              </button>
            </div>
            <p className="text-xs text-muted-2 mt-1.5">
              Cek di Studio: <span className="font-mono">Game Settings &gt; Basic Info &gt; Creator</span> —
              kalau isinya nama Group, pilih Group, bukan akun member/admin-nya.
            </p>
          </div>
          <div>
            <Label htmlFor="rbxIdentifier">{type === "GROUP" ? "Group ID" : "Username Roblox"}</Label>
            <Input
              id="rbxIdentifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={type === "GROUP" ? "cth. 123456" : "cth. BuilderMan"}
              required
            />
            <p className="text-xs text-muted-2 mt-1.5">
              {type === "GROUP"
                ? "Angka ID Group, ada di URL halaman group (roblox.com/groups/<ID>/...). Nama Group diambil otomatis saat disimpan."
                : "User ID diambil otomatis dari username ini lewat Roblox API saat disimpan."}
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
