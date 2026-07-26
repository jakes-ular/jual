import { describe, it, expect } from "vitest";
import { signDownloadToken, verifyDownloadToken } from "./download-token";

describe("download-token", () => {
  it("round-trips a signed token", async () => {
    const token = await signDownloadToken({ userId: "user_1", productFileId: "file_1" });
    const payload = await verifyDownloadToken(token);
    expect(payload).toEqual({ userId: "user_1", productFileId: "file_1" });
  });

  it("returns null for a garbage token", async () => {
    expect(await verifyDownloadToken("not-a-real-token")).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const token = await signDownloadToken({ userId: "user_1", productFileId: "file_1" });

    const originalSecret = process.env.DOWNLOAD_TOKEN_SECRET;
    process.env.DOWNLOAD_TOKEN_SECRET = "a-completely-different-secret";
    try {
      expect(await verifyDownloadToken(token)).toBeNull();
    } finally {
      process.env.DOWNLOAD_TOKEN_SECRET = originalSecret;
    }
  });
});
