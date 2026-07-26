import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatRupiah, formatDateTime } from "@/lib/utils";

interface ReceiptOrder {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerContact: string;
  subtotal: number;
  total: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  items: {
    productName: string;
    unitPrice: number;
    quantity: number;
    topupTargetId?: string | null;
    topupServerId?: string | null;
  }[];
  payment: { method: string; status: string; referenceCode: string } | null;
}

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

export async function generateReceiptPdf(order: ReceiptOrder): Promise<Uint8Array> {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "VoxMarket";

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.1, 0.1, 0.12);
  const muted = rgb(0.42, 0.45, 0.5);
  const border = rgb(0.85, 0.86, 0.88);

  let y = PAGE_HEIGHT - MARGIN;

  function text(
    value: string,
    x: number,
    yPos: number,
    opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb> } = {}
  ) {
    page.drawText(value, {
      x,
      y: yPos,
      size: opts.size ?? 10,
      font: opts.f ?? font,
      color: opts.color ?? dark,
    });
  }

  function line(yPos: number) {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness: 1,
      color: border,
    });
  }

  // Header
  text(siteName, MARGIN, y, { size: 20, f: bold });
  text("RESI PEMBAYARAN", PAGE_WIDTH - MARGIN - 140, y, { size: 12, f: bold, color: muted });
  y -= 30;
  line(y);
  y -= 30;

  // Order meta
  text("No. Order", MARGIN, y, { size: 9, color: muted });
  text("Tanggal", MARGIN + 200, y, { size: 9, color: muted });
  text("Status", MARGIN + 380, y, { size: 9, color: muted });
  y -= 16;
  text(order.orderNumber, MARGIN, y, { size: 11, f: bold });
  text(formatDateTime(order.createdAt), MARGIN + 200, y, { size: 11 });
  text(order.status, MARGIN + 380, y, { size: 11, f: bold });
  y -= 30;

  // Buyer
  text("Ditagihkan kepada", MARGIN, y, { size: 9, color: muted });
  y -= 16;
  text(order.buyerName, MARGIN, y, { size: 11, f: bold });
  y -= 15;
  text(order.buyerEmail, MARGIN, y, { size: 10 });
  y -= 15;
  text(order.buyerContact, MARGIN, y, { size: 10 });
  y -= 30;
  line(y);
  y -= 20;

  // Items table header
  const colProduct = MARGIN;
  const colQty = PAGE_WIDTH - MARGIN - 210;
  const colPrice = PAGE_WIDTH - MARGIN - 140;
  const colSubtotal = PAGE_WIDTH - MARGIN - 70;

  text("Produk", colProduct, y, { size: 9, f: bold, color: muted });
  text("Qty", colQty, y, { size: 9, f: bold, color: muted });
  text("Harga", colPrice, y, { size: 9, f: bold, color: muted });
  text("Subtotal", colSubtotal, y, { size: 9, f: bold, color: muted });
  y -= 12;
  line(y);
  y -= 20;

  for (const item of order.items) {
    text(item.productName, colProduct, y, { size: 10 });
    text(String(item.quantity), colQty, y, { size: 10 });
    text(formatRupiah(item.unitPrice), colPrice, y, { size: 10 });
    text(formatRupiah(item.unitPrice * item.quantity), colSubtotal, y, { size: 10 });
    y -= 15;
    if (item.topupTargetId) {
      const serverPart = item.topupServerId ? ` · Server: ${item.topupServerId}` : "";
      text(`ID Game: ${item.topupTargetId}${serverPart}`, colProduct, y, { size: 8, color: muted });
      y -= 15;
    } else {
      y -= 5;
    }
  }

  y -= 10;
  line(y);
  y -= 25;

  text("Subtotal", colPrice, y, { size: 10, color: muted });
  text(formatRupiah(order.subtotal), colSubtotal, y, { size: 10 });
  y -= 20;
  text("Total", colPrice, y, { size: 12, f: bold });
  text(formatRupiah(order.total), colSubtotal, y, { size: 12, f: bold });
  y -= 35;

  if (order.payment) {
    line(y);
    y -= 20;
    text("Metode Pembayaran", MARGIN, y, { size: 9, color: muted });
    text("Kode Referensi", MARGIN + 200, y, { size: 9, color: muted });
    text("Status Pembayaran", MARGIN + 380, y, { size: 9, color: muted });
    y -= 16;
    text(order.payment.method.replace("_", " "), MARGIN, y, { size: 10, f: bold });
    text(order.payment.referenceCode, MARGIN + 200, y, { size: 10, f: bold });
    text(order.payment.status, MARGIN + 380, y, { size: 10, f: bold });
    y -= 15;
  }

  page.drawText(
    `Resi dibuat otomatis oleh ${siteName} pada ${formatDateTime(new Date())}.`,
    { x: MARGIN, y: MARGIN, size: 8, font, color: muted }
  );

  return pdf.save();
}
