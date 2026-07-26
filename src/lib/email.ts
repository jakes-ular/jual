/**
 * Transactional email via Resend. Silently logs (instead of throwing) when
 * RESEND_API_KEY isn't configured, so local dev without the integration
 * doesn't hard-fail registration — the code still shows up in server logs.
 */

import { Resend } from "resend";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "VoxMarket";
const domain = process.env.RESEND_EMAIL_DOMAIN;
const from = `${siteName} <noreply@${domain}>`;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY || !domain) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationCodeEmail(to: string, name: string, code: string) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY/RESEND_EMAIL_DOMAIN not set — verification code for ${to}: ${code}`);
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111827;">Verifikasi email Anda</h2>
      <p>Halo ${name},</p>
      <p>Gunakan kode berikut untuk memverifikasi akun ${siteName} Anda. Kode berlaku selama 10 menit.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px;">${code}</p>
      <p style="color: #6b7280; font-size: 13px;">Jika Anda tidak mendaftar di ${siteName}, abaikan email ini.</p>
    </div>
  `;

  const { error } = await resend.emails.send(
    {
      from,
      to: [to],
      subject: `${code} adalah kode verifikasi ${siteName} Anda`,
      html,
    },
    { idempotencyKey: `verify-email/${to}/${code}` }
  );

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Gagal mengirim email verifikasi");
  }
}
