import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyContactMessage } from "@/lib/discord";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak pesan. Coba lagi nanti." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  await notifyContactMessage(parsed.data);

  return NextResponse.json({ success: true });
}
