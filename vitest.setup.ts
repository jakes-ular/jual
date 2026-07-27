import { vi } from "vitest";

process.env.DOWNLOAD_TOKEN_SECRET ??= "test-download-secret-do-not-use-in-prod";
process.env.NEXTAUTH_SECRET ??= "test-nextauth-secret";

// Route handler tests call POST/GET directly, outside any real Next.js
// request scope, so next/server's after() has no waitUntil to attach to and
// throws. Tests don't care about response-vs-background timing, so just run
// the callback right away.
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (task: () => void | Promise<void>) => {
      void task();
    },
  };
});
