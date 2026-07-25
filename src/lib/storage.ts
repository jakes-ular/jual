import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Local filesystem storage adapter. Swap the implementation of these three
 * functions for an S3 / Supabase Storage client later — nothing outside this
 * file needs to change, since every caller only depends on this interface.
 */

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export interface StoredFile {
  url: string; // public URL (images) or storage path (protected files)
  storagePath: string; // path relative to UPLOAD_ROOT, used to read the file back
  sizeBytes: number;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export async function saveProductImage(file: File): Promise<StoredFile> {
  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, "products");
  await ensureDir(dir);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fileName), buffer);

  return {
    url: `/uploads/products/${fileName}`,
    storagePath: `products/${fileName}`,
    sizeBytes: buffer.byteLength,
  };
}

export async function saveProductFile(file: File): Promise<StoredFile & { fileName: string }> {
  const ext = path.extname(file.name) || "";
  const fileName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, "files");
  await ensureDir(dir);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fileName), buffer);

  return {
    url: `/uploads/files/${fileName}`, // never exposed directly; downloads go through the signed route
    storagePath: `files/${fileName}`,
    sizeBytes: buffer.byteLength,
    fileName: file.name,
  };
}

export function resolveStoragePath(storagePath: string): string {
  return path.join(UPLOAD_ROOT, storagePath);
}

export async function deleteStoredFile(storagePath: string): Promise<void> {
  try {
    await unlink(path.join(UPLOAD_ROOT, storagePath));
  } catch {
    // best-effort delete; file may already be gone
  }
}
