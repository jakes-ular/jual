import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateWhitelistSecret } from "@/lib/roblox";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Public endpoint polled by ServerScriptService.Main's security gate in the
// Roblox place -- NOT authenticated via NextAuth (Roblox HttpService can't
// hold a browser session), just the shared x-whitelist-key header. See
// src/lib/roblox.ts for why that header isn't the real security boundary.
export async function GET(req: Request) {
  if (!rateLimit(`roblox-whitelist:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const secret = await getOrCreateWhitelistSecret();
  if (req.headers.get("x-whitelist-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.robloxWhitelist.findMany({
    select: { robloxUsername: true, robloxUserId: true, type: true },
  });

  return NextResponse.json({
    users: entries.map((e) => ({ username: e.robloxUsername, userId: Number(e.robloxUserId), type: e.type })),
  });
}
