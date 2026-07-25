import sharp from "sharp";
import { saveImageBuffer } from "../src/lib/storage";

/**
 * Renders a simple gradient + label PNG so seed products have real image
 * files to display (no external network / stock-photo dependency). Swap for
 * real product photography by re-uploading through the admin panel later.
 * Goes through the same storage adapter as admin uploads, so seeding writes
 * to Vercel Blob in production and to local disk in dev.
 */

let counter = 0;

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function generatePlaceholder(params: {
  label: string;
  tag: string;
  from: string;
  to: string;
}): Promise<string> {
  counter += 1;

  const { label, tag, from, to } = params;
  const lines = wrapLines(label, 22);
  const width = 900;
  const height = 900;

  const textSvg = lines
    .map((line, i) => {
      const y = height / 2 - ((lines.length - 1) * 44) / 2 + i * 44;
      return `<text x="60" y="${y}" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="white" fill-opacity="0.95">${escapeXml(
        line
      )}</text>`;
    })
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-opacity="0.06" stroke-width="2"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
      <rect width="${width}" height="${height}" fill="url(#grid)" />
      <circle cx="${width - 120}" cy="120" r="180" fill="white" fill-opacity="0.08" />
      <circle cx="100" cy="${height - 100}" r="140" fill="black" fill-opacity="0.12" />
      <rect x="60" y="60" width="220" height="44" rx="22" fill="white" fill-opacity="0.15" />
      <text x="80" y="89" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="white">${escapeXml(
        tag.toUpperCase()
      )}</text>
      ${textSvg}
    </svg>
  `;

  const fileName = `seed-${counter}-${Date.now()}.png`;
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const stored = await saveImageBuffer(buffer, fileName, "image/png");

  return stored.url;
}
