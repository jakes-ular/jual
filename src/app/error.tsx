"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display font-bold text-2xl">Terjadi kesalahan</h1>
      <p className="text-sm text-muted mt-2">
        Maaf, ada yang tidak beres saat memuat halaman ini. Tim kami sudah diberi tahu.
      </p>
      <Button className="mt-6" onClick={reset}>
        Coba lagi
      </Button>
    </div>
  );
}
