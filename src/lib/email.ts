/**
 * Transactional email via Gmail SMTP (nodemailer). Chosen over Resend
 * because Resend requires a verified custom domain to send to arbitrary
 * recipients, which this deployment doesn't have — Gmail sends from an
 * already-verified address (your own Gmail account) via an App Password.
 * Logs instead of throwing when unconfigured, so local dev without SMTP
 * set up doesn't hard-fail registration — the code still shows in logs.
 */

import nodemailer from "nodemailer";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "VoxMarket";
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

function getTransport() {
  if (!gmailUser || !gmailAppPassword) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });
}

export async function sendVerificationCodeEmail(to: string, name: string, code: string) {
  const transport = getTransport();
  if (!transport) {
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — verification code for ${to}: ${code}`);
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

  try {
    await transport.sendMail({
      from: `${siteName} <${gmailUser}>`,
      to,
      subject: `${code} adalah kode verifikasi ${siteName} Anda`,
      html,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw new Error("Gagal mengirim email verifikasi");
  }
}
