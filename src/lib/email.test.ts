import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// email.ts reads GMAIL_USER/GMAIL_APP_PASSWORD once at module load time, so
// each branch needs its own fresh module instance (vi.resetModules + dynamic
// import) with the env vars set beforehand.

describe("sendVerificationCodeEmail", () => {
  const originalUser = process.env.GMAIL_USER;
  const originalPass = process.env.GMAIL_APP_PASSWORD;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.GMAIL_USER = originalUser;
    process.env.GMAIL_APP_PASSWORD = originalPass;
    vi.doUnmock("nodemailer");
  });

  it("logs and does not throw when Gmail credentials are unconfigured", async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { sendVerificationCodeEmail } = await import("./email");
    await expect(sendVerificationCodeEmail("a@b.com", "Budi", "123456")).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("123456"));
    warnSpy.mockRestore();
  });

  it("sends via nodemailer when Gmail credentials are configured", async () => {
    process.env.GMAIL_USER = "bot@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "app-password";

    const sendMail = vi.fn().mockResolvedValue(undefined);
    vi.doMock("nodemailer", () => ({
      default: { createTransport: vi.fn().mockReturnValue({ sendMail }) },
    }));

    const { sendVerificationCodeEmail } = await import("./email");
    await sendVerificationCodeEmail("a@b.com", "Budi", "123456");

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.com", subject: expect.stringContaining("123456") })
    );
  });

  it("wraps a send failure in a user-facing error", async () => {
    process.env.GMAIL_USER = "bot@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "app-password";

    const sendMail = vi.fn().mockRejectedValue(new Error("smtp down"));
    vi.doMock("nodemailer", () => ({
      default: { createTransport: vi.fn().mockReturnValue({ sendMail }) },
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { sendVerificationCodeEmail } = await import("./email");
    await expect(sendVerificationCodeEmail("a@b.com", "Budi", "123456")).rejects.toThrow(
      "Gagal mengirim email verifikasi"
    );
  });
});
