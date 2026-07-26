import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { regenerateWhitelistSecret } from "@/lib/roblox";

// Rotates the shared x-whitelist-key secret. The Roblox place's Main script
// must be updated with the new value afterward, or its whitelist fetches
// start failing closed (401) -- which disables the whole Marching system,
// same as being removed from the whitelist outright.
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const secret = await regenerateWhitelistSecret();
  return NextResponse.json({ secret });
}
