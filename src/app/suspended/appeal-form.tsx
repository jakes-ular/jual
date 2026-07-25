"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface PendingAppeal {
  message: string;
  createdAt: string;
}

export function AppealForm({ pendingAppeal }: { pendingAppeal: PendingAppeal | null }) {
  const [appeal, setAppeal] = useState(pendingAppeal);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error("Pesan minimal 10 karakter");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim appeal");
      toast.success("Appeal terkirim ke admin");
      setAppeal({ message, createdAt: new Date().toISOString() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  if (appeal) {
    return (
      <div className="w-full text-left rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-2 mb-1.5">
          Appeal terkirim {formatDateTime(appeal.createdAt)} · menunggu review admin
        </p>
        <p className="text-sm text-muted whitespace-pre-wrap">{appeal.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full text-left space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Jelaskan kenapa akun ini seharusnya diaktifkan kembali..."
        rows={4}
        required
      />
      <Button type="submit" className="w-full" loading={submitting}>
        Kirim Appeal ke Admin
      </Button>
    </form>
  );
}
