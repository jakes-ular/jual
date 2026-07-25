import { generateReferenceCode } from "@/lib/utils";

/**
 * Payment provider abstraction. The active provider is "manual": the buyer
 * picks a method, sees static instructions + a unique reference code, and an
 * admin confirms payment by hand after checking Discord/bank mutation (see
 * lib/discord.ts). To plug in a real gateway (Midtrans/Xendit/etc.) later,
 * implement this same interface and swap `getPaymentProvider()` — nothing
 * else in the app needs to change.
 */

export type PaymentMethod =
  | "QRIS"
  | "GOPAY"
  | "OVO"
  | "DANA"
  | "SHOPEEPAY"
  | "BANK_TRANSFER"
  | "VIRTUAL_ACCOUNT";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; group: string }[] = [
  { value: "QRIS", label: "QRIS (semua e-wallet & bank)", group: "QRIS" },
  { value: "GOPAY", label: "GoPay", group: "E-Wallet" },
  { value: "OVO", label: "OVO", group: "E-Wallet" },
  { value: "DANA", label: "DANA", group: "E-Wallet" },
  { value: "SHOPEEPAY", label: "ShopeePay", group: "E-Wallet" },
  { value: "BANK_TRANSFER", label: "Transfer Bank", group: "Bank" },
  { value: "VIRTUAL_ACCOUNT", label: "Virtual Account", group: "Bank" },
];

export interface PaymentInstructions {
  referenceCode: string;
  title: string;
  steps: string[];
  expiresInMinutes: number;
}

export interface PaymentCharge {
  method: PaymentMethod;
  amount: number;
  orderNumber: string;
}

export interface PaymentProvider {
  createCharge(charge: PaymentCharge): Promise<PaymentInstructions>;
}

class ManualPaymentProvider implements PaymentProvider {
  async createCharge(charge: PaymentCharge): Promise<PaymentInstructions> {
    const referenceCode = generateReferenceCode();

    const stepsByMethod: Record<PaymentMethod, string[]> = {
      QRIS: [
        "Buka aplikasi e-wallet atau mobile banking Anda",
        "Pilih menu Scan QRIS",
        `Pindai kode QR yang tampil dan pastikan nominal ${charge.amount.toLocaleString("id-ID")} sesuai`,
        `Cantumkan kode referensi ${referenceCode} pada catatan jika diminta`,
        "Selesaikan pembayaran, admin akan mengonfirmasi otomatis via notifikasi",
      ],
      GOPAY: [
        "Buka aplikasi Gojek, pilih GoPay > Transfer",
        `Kirim ke nomor tujuan pada halaman ini sejumlah ${charge.amount.toLocaleString("id-ID")}`,
        `Sertakan kode referensi ${referenceCode} di catatan transfer`,
      ],
      OVO: [
        "Buka aplikasi OVO, pilih Transfer",
        `Kirim sejumlah ${charge.amount.toLocaleString("id-ID")} ke nomor tujuan pada halaman ini`,
        `Sertakan kode referensi ${referenceCode} di catatan`,
      ],
      DANA: [
        "Buka aplikasi DANA, pilih Kirim",
        `Kirim sejumlah ${charge.amount.toLocaleString("id-ID")} ke nomor tujuan pada halaman ini`,
        `Sertakan kode referensi ${referenceCode} di catatan`,
      ],
      SHOPEEPAY: [
        "Buka aplikasi Shopee, pilih ShopeePay > Transfer",
        `Kirim sejumlah ${charge.amount.toLocaleString("id-ID")} ke nomor tujuan pada halaman ini`,
        `Sertakan kode referensi ${referenceCode} di catatan`,
      ],
      BANK_TRANSFER: [
        "Transfer ke rekening bank yang tertera pada halaman ini",
        `Nominal ${charge.amount.toLocaleString("id-ID")}`,
        `Cantumkan kode referensi ${referenceCode} pada berita transfer`,
        "Simpan bukti transfer untuk diunggah jika diminta",
      ],
      VIRTUAL_ACCOUNT: [
        "Buka aplikasi mobile banking Anda",
        "Pilih menu Transfer > Virtual Account",
        `Masukkan nomor VA dan bayar sejumlah ${charge.amount.toLocaleString("id-ID")}`,
        `Kode referensi: ${referenceCode}`,
      ],
    };

    return {
      referenceCode,
      title: `Pembayaran via ${charge.method.replace("_", " ")}`,
      steps: stepsByMethod[charge.method],
      expiresInMinutes: 60,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new ManualPaymentProvider();
}
