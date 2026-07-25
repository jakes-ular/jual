import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { saveProductImage, saveProductFile } from "@/lib/storage";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_FILE_BYTES = 500 * 1024 * 1024;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const formData = await req.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (kind === "image") {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 8MB" }, { status: 400 });
    }
    const result = await saveProductImage(file);
    return NextResponse.json(result, { status: 201 });
  }

  if (kind === "file") {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Ukuran file maksimal 500MB" }, { status: 400 });
    }
    const result = await saveProductFile(file);
    return NextResponse.json(result, { status: 201 });
  }

  return NextResponse.json({ error: "kind harus 'image' atau 'file'" }, { status: 400 });
}
