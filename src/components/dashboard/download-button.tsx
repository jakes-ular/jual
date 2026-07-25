"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DownloadButton({ fileId, label = "Download" }: { fileId: string; label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/downloads/${fileId}/request`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memulai download");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memulai download");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {label}
    </Button>
  );
}
