import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(Buffer.from("stub")),
}));
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn().mockResolvedValue(undefined),
}));

import { saveImageBuffer, saveFileBuffer, deleteStoredFile } from "./storage";
import { writeFile, unlink } from "fs/promises";
import { put, del } from "@vercel/blob";

describe("storage (local filesystem fallback)", () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  it("saves an image buffer to the local uploads dir when Blob isn't configured", async () => {
    const result = await saveImageBuffer(Buffer.from("img"), "photo.png", "image/png");

    expect(writeFile).toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
    expect(result.url).toMatch(/^\/uploads\/products\//);
    expect(result.sizeBytes).toBe(Buffer.from("img").byteLength);
  });

  it("saves a digital file buffer locally", async () => {
    const result = await saveFileBuffer(Buffer.from("data"), "asset.zip");

    expect(writeFile).toHaveBeenCalled();
    expect(result.storagePath).toMatch(/^files\//);
  });

  it("unlinks a local file on delete", async () => {
    await deleteStoredFile("/uploads/products/abc.png");
    expect(unlink).toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });

  it("swallows delete errors best-effort", async () => {
    (unlink as any).mockRejectedValueOnce(new Error("gone"));
    await expect(deleteStoredFile("/uploads/products/missing.png")).resolves.toBeUndefined();
  });
});

describe("storage (Vercel Blob backend)", () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    (put as any).mockResolvedValue({ url: "https://blob.example.com/products/abc.png" });
  });

  afterEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  it("uploads to Blob instead of the filesystem when configured", async () => {
    const result = await saveImageBuffer(Buffer.from("img"), "photo.png", "image/png");

    expect(put).toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
    expect(result.url).toBe("https://blob.example.com/products/abc.png");
  });

  it("deletes via Blob when the path is a URL", async () => {
    await deleteStoredFile("https://blob.example.com/products/abc.png");
    expect(del).toHaveBeenCalledWith("https://blob.example.com/products/abc.png");
    expect(unlink).not.toHaveBeenCalled();
  });
});
