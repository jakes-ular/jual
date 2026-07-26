import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  // Sentry.init with no DSN simply no-ops, so this is safe to ship before
  // a real Sentry project/DSN exists — see .env.example.
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
