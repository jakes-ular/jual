import * as Sentry from "@sentry/nextjs";

// The Vercel Sentry integration only provisions NEXT_PUBLIC_SENTRY_DSN (the
// DSN isn't a secret — it's safe to use the same value server-side).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
