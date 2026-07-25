"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesan");
      setSent(true);
      toast.success("Pesan berhasil dikirim");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-center">
          Hubungi <span className="text-gradient">Kami</span>
        </h1>
        <p className="text-muted text-center mt-4 max-w-xl mx-auto">
          Ada pertanyaan, kendala teknis, atau ingin menjadi creator/seller? Kirim pesan kepada
          kami.
        </p>

        <div className="grid lg:grid-cols-5 gap-8 mt-12">
          <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-6">
            {sent ? (
              <div className="text-center py-10">
                <h2 className="font-display font-bold text-xl">Terima kasih!</h2>
                <p className="text-sm text-muted mt-2">Pesan Anda telah kami terima dan akan segera direspon.</p>
                <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
                  Kirim Pesan Lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subjek</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                {error && <FieldError>{error}</FieldError>}
                <Button type="submit" size="lg" loading={sending}>
                  Kirim Pesan
                </Button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <ContactInfo icon={Mail} title="Email" value="support@voxmarket.dev" />
            <ContactInfo icon={MessageCircle} title="Discord" value="voxmarket.gg/discord" />
            <ContactInfo icon={MapPin} title="Lokasi" value="Jakarta, Indonesia" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ContactInfo({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-gradient-brand/15 flex items-center justify-center text-primary-2 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-2">{title}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
