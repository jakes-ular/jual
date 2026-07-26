/**
 * Sends order/payment notifications to a Discord channel via webhook. This
 * stands in for a payment-gateway callback in this deployment: instead of a
 * gateway calling our webhook, WE notify the admin's Discord on every order
 * event so they can manually confirm payment in /admin/orders.
 *
 * Silently no-ops if DISCORD_WEBHOOK_URL isn't configured, so local dev
 * doesn't require a Discord server to function.
 */

interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

async function sendDiscordWebhook(embed: DiscordEmbed): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [{ ...embed, timestamp: new Date().toISOString() }] }),
    });
  } catch (err) {
    console.error("Failed to send Discord webhook:", err);
  }
}

export async function notifyNewOrder(params: {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerContact: string;
  total: string;
  method: string;
  referenceCode: string;
  itemNames: string[];
}) {
  await sendDiscordWebhook({
    title: "🛒 Pesanan Baru Menunggu Pembayaran",
    color: 0xf59e0b,
    fields: [
      { name: "No. Order", value: params.orderNumber, inline: true },
      { name: "Kode Referensi", value: params.referenceCode, inline: true },
      { name: "Metode", value: params.method, inline: true },
      { name: "Pembeli", value: `${params.buyerName} (${params.buyerEmail})` },
      { name: "Discord/WhatsApp", value: params.buyerContact, inline: true },
      { name: "Total", value: params.total, inline: true },
      { name: "Produk", value: params.itemNames.join(", ") },
    ],
  });
}

export async function notifyContactMessage(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await sendDiscordWebhook({
    title: "✉️ Pesan Kontak Baru",
    color: 0x8b5cf6,
    fields: [
      { name: "Nama", value: params.name, inline: true },
      { name: "Email", value: params.email, inline: true },
      { name: "Subjek", value: params.subject },
      { name: "Pesan", value: params.message.slice(0, 1000) },
    ],
  });
}

export async function notifyAppeal(params: {
  buyerName: string;
  buyerEmail: string;
  suspensionReason: string | null;
  message: string;
}) {
  await sendDiscordWebhook({
    title: "🙋 Appeal Akun Suspended",
    color: 0x3b82f6,
    fields: [
      { name: "User", value: `${params.buyerName} (${params.buyerEmail})` },
      { name: "Alasan Suspend", value: params.suspensionReason?.trim() || "-" },
      { name: "Pesan Appeal", value: params.message.slice(0, 1000) },
    ],
  });
}

export async function notifyPaymentConfirmed(params: {
  orderNumber: string;
  buyerName: string;
  total: string;
}) {
  await sendDiscordWebhook({
    title: "✅ Pembayaran Dikonfirmasi",
    color: 0x22c55e,
    fields: [
      { name: "No. Order", value: params.orderNumber, inline: true },
      { name: "Pembeli", value: params.buyerName, inline: true },
      { name: "Total", value: params.total, inline: true },
    ],
  });
}

export async function notifyNewTopupOrder(params: {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerContact: string;
  gameName: string;
  itemName: string;
  targetId: string;
  serverId: string | null;
  total: string;
  method: string;
  referenceCode: string;
}) {
  await sendDiscordWebhook({
    title: "🎮 Order Topup Baru",
    color: 0xf59e0b,
    fields: [
      { name: "No. Order", value: params.orderNumber, inline: true },
      { name: "Kode Referensi", value: params.referenceCode, inline: true },
      { name: "Metode", value: params.method, inline: true },
      { name: "Pembeli", value: `${params.buyerName} (${params.buyerEmail})` },
      { name: "Discord/WhatsApp", value: params.buyerContact, inline: true },
      { name: "Total", value: params.total, inline: true },
      { name: "Game", value: `${params.gameName} — ${params.itemName}` },
      { name: "ID Game", value: params.serverId ? `${params.targetId} (Server: ${params.serverId})` : params.targetId },
    ],
  });
}
