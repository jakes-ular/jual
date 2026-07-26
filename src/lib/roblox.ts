import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WHITELIST_SECRET_KEY = "robloxWhitelistSecret";

// Must match ServerScriptService.Main's WHITELIST_KEY in the Roblox place --
// this is the value the very first deploy lazily seeds into Setting, so the
// two sides agree without any manual copy step. Regenerating the secret from
// the admin page (below) requires re-pasting the new value into the Roblox
// script by hand.
const INITIAL_WHITELIST_SECRET = "189abb94eb0feb9d636a524aa3133c7b9f17b5c3ba45050c52989d6439bb04e3";

/**
 * The shared secret sent as the x-whitelist-key header by the Roblox place's
 * Main script. This is NOT the actual security boundary -- that's the
 * per-robloxUserId check the Roblox script does against this endpoint's
 * response -- it just keeps random internet scanners from finding and
 * scraping the whitelist endpoint.
 */
export async function getOrCreateWhitelistSecret(): Promise<string> {
  const existing = await prisma.setting.findUnique({ where: { key: WHITELIST_SECRET_KEY } });
  if (existing) return existing.value;

  await prisma.setting.upsert({
    where: { key: WHITELIST_SECRET_KEY },
    update: {},
    create: { key: WHITELIST_SECRET_KEY, value: INITIAL_WHITELIST_SECRET },
  });
  return INITIAL_WHITELIST_SECRET;
}

export async function regenerateWhitelistSecret(): Promise<string> {
  const secret = crypto.randomBytes(32).toString("hex");
  await prisma.setting.upsert({
    where: { key: WHITELIST_SECRET_KEY },
    update: { value: secret },
    create: { key: WHITELIST_SECRET_KEY, value: secret },
  });
  return secret;
}

interface RobloxUserLookup {
  id: number;
  name: string;
}

/** Resolves a Roblox username to its current numeric userId via the public Roblox API. */
export async function resolveRobloxUser(username: string): Promise<RobloxUserLookup | null> {
  const res = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  });
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const match = data?.data?.[0];
  if (!match || typeof match.id !== "number" || typeof match.name !== "string") return null;
  return { id: match.id, name: match.name };
}
