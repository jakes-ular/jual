import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateWhitelistSecret } from "@/lib/roblox";
import { robloxHeartbeatSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const DEFAULT_ASSET_KEY = "marching";

// Public endpoint the same asset gate scripts poll on their whitelist
// recheck interval (see ServerScriptService.Main) to report "I'm still
// running here" -- place + timestamp only, no player data. Powers the
// live tracking table on /admin/roblox-whitelist. Same shared-secret model
// as GET /api/roblox-whitelist: the key just keeps random scanners out,
// the real check is that creatorId must already be an entry in
// RobloxWhitelist -- a heartbeat for an unlisted account is rejected.
export async function POST(req: Request) {
  if (!rateLimit(`roblox-heartbeat:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const secret = await getOrCreateWhitelistSecret();
  if (req.headers.get("x-whitelist-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = robloxHeartbeatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const entry = await prisma.robloxWhitelist.findUnique({
    where: {
      robloxUserId_type: { robloxUserId: String(parsed.data.creatorId), type: parsed.data.creatorType },
    },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not whitelisted" }, { status: 403 });
  }

  const assetKey = parsed.data.assetKey || DEFAULT_ASSET_KEY;

  await prisma.robloxAssetSession.upsert({
    where: {
      whitelistId_assetKey_placeId: {
        whitelistId: entry.id,
        assetKey,
        placeId: parsed.data.placeId,
      },
    },
    update: {
      placeName: parsed.data.placeName,
      lastSeenAt: new Date(),
    },
    create: {
      whitelistId: entry.id,
      assetKey,
      placeId: parsed.data.placeId,
      placeName: parsed.data.placeName,
    },
  });

  return NextResponse.json({ success: true });
}
