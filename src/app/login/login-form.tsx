"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
          setError("Email Anda belum diverifikasi.");
        } else {
          setError(res.error);
        }
        return;
      }
      toast.success("Berhasil masuk");
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:py-24 w-full">
      <h1 className="font-display font-bold text-2xl text-center">Masuk ke Akun Anda</h1>
      <p className="text-sm text-muted text-center mt-2">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary-2 font-medium">
          Daftar sekarang
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <FieldError>{error}</FieldError>}
        {needsVerification && (
          <p className="text-sm">
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="text-primary-2 font-medium"
            >
              Verifikasi email sekarang
            </Link>
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Masuk
        </Button>
      </form>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormFields />
    </Suspense>
  );
}
