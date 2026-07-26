import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1,
      // Sentry.init with no DSN simply no-ops, so this is safe to ship
      // before a real Sentry project/DSN exists — see .env.example.
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
