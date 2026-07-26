"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kode tidak valid");

      toast.success("Email berhasil diverifikasi. Silakan masuk.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Gagal mengirim ulang kode");
      }
      toast.success("Kode baru telah dikirim ke email Anda");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:py-24 w-full">
      <h1 className="font-display font-bold text-2xl text-center">Verifikasi Email</h1>
      <p className="text-sm text-muted text-center mt-2">
        Kami mengirim kode 6 digit ke{" "}
        <span className="text-foreground font-medium">{email || "email Anda"}</span>. Masukkan
        kode tersebut untuk mengaktifkan akun Anda.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="code">Kode Verifikasi</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            required
          />
        </div>
        {error && <FieldError>{error}</FieldError>}
        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={code.length !== 6}>
          Verifikasi
        </Button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-muted">
          Tidak menerima kode?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-primary-2 font-medium disabled:text-muted-2 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : "Kirim ulang kode"}
          </button>
        </p>
        <p className="text-sm text-muted">
          <Link href="/login" className="text-primary-2 font-medium">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export function VerifyEmailForm() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailFields />
    </Suspense>
  );
}
