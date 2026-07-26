"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1 style={{ fontWeight: 700, fontSize: "1.5rem" }}>Terjadi kesalahan</h1>
        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
          Maaf, situs mengalami kesalahan tak terduga. Silakan muat ulang halaman.
        </p>
      </body>
    </html>
  );
}
