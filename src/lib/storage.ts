import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

/**
 * Storage adapter. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is configured
 * (production), and falls back to the local filesystem otherwise (local dev
 * without a Blob store). Callers only depend on this interface, so the
 * backing store can change without touching product/upload/download/seed code.
 *
 * Digital asset files are never linked directly in the UI — the download
 * route always fetches them server-side (via storagePath) after verifying
 * purchase ownership, so a Blob "public" URL here is fine: it's a long
 * random path that's never exposed to the client.
 */

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export interface StoredFile {
  url: string; // public URL (images) or internal reference (protected files)
  storagePath: string; // opaque key used to read/delete the file later — a Blob URL or a local relative path
  sizeBytes: number;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

/** Core buffer-based primitive shared by the upload route and the seed script. */
export async function saveImageBuffer(
  buffer: Buffer,
  fileName: string,
  contentType = "image/png"
): Promise<StoredFile> {
  const ext = path.extname(fileName) || ".jpg";

  if (useBlob()) {
    const blob = await put(`products/${randomUUID()}${ext}`, buffer, { access: "public", contentType });
    return { url: blob.url, storagePath: blob.url, sizeBytes: buffer.byteLength };
  }

  const storedName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, "products");
  await ensureDir(dir);
  await writeFile(path.join(dir, storedName), buffer);

  return {
    url: `/uploads/products/${storedName}`,
    storagePath: `products/${storedName}`,
    sizeBytes: buffer.byteLength,
  };
}

/** Core buffer-based primitive shared by the upload route and the seed script. */
export async function saveFileBuffer(buffer: Buffer, fileName: string): Promise<StoredFile> {
  const ext = path.extname(fileName) || "";

  if (useBlob()) {
    const blob = await put(`files/${randomUUID()}${ext}`, buffer, {
      access: "public",
      contentType: "application/octet-stream",
    });
    return { url: blob.url, storagePath: blob.url, sizeBytes: buffer.byteLength };
  }

  const storedName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, "files");
  await ensureDir(dir);
  await writeFile(path.join(dir, storedName), buffer);

  return {
    url: `/uploads/files/${storedName}`,
    storagePath: `files/${storedName}`,
    sizeBytes: buffer.byteLength,
  };
}

export async function saveProductImage(file: File): Promise<StoredFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveImageBuffer(buffer, file.name, file.type || "image/jpeg");
}

export async function saveProductFile(file: File): Promise<StoredFile & { fileName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveFileBuffer(buffer, file.name);
  return { ...stored, fileName: file.name };
}

/** Reads a stored file's bytes back, regardless of backing store. */
export async function readStoredFile(storagePath: string): Promise<Buffer> {
  if (storagePath.startsWith("http")) {
    const res = await fetch(storagePath);
    if (!res.ok) throw new Error(`Failed to fetch stored file: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  const { readFile } = await import("fs/promises");
  return readFile(path.join(UPLOAD_ROOT, storagePath));
}

export async function deleteStoredFile(storagePathOrUrl: string): Promise<void> {
  try {
    if (storagePathOrUrl.startsWith("http")) {
      await del(storagePathOrUrl);
      return;
    }
    const relative = storagePathOrUrl.replace(/^\/uploads\//, "");
    await unlink(path.join(UPLOAD_ROOT, relative));
  } catch {
    // best-effort delete; file may already be gone or store unreachable
  }
}
