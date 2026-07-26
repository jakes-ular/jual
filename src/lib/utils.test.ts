import { describe, it, expect } from "vitest";
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  slugify,
  generateOrderNumber,
  generateReferenceCode,
  formatBytes,
} from "./utils";

describe("formatRupiah", () => {
  it("formats an integer amount as Indonesian Rupiah with no decimals", () => {
    expect(formatRupiah(75000)).toMatch(/^Rp\s75\.000$/);
  });

  it("formats zero", () => {
    expect(formatRupiah(0)).toMatch(/^Rp\s0$/);
  });
});

describe("formatDate", () => {
  it("formats a Date into long Indonesian day/month/year", () => {
    expect(formatDate(new Date("2026-01-15T00:00:00Z"))).toBe("15 Januari 2026");
  });

  it("accepts a date string", () => {
    expect(formatDate("2026-01-15T00:00:00Z")).toBe("15 Januari 2026");
  });
});

describe("formatDateTime", () => {
  it("includes short month and time", () => {
    const result = formatDateTime(new Date("2026-01-15T10:30:00Z"));
    expect(result).toContain("2026");
    expect(result).toMatch(/\d{2}[.:]\d{2}/);
  });
});

describe("slugify", () => {
  it("lowercases, strips punctuation, and hyphenates", () => {
    expect(slugify("Roblox Military Vehicle Pack!")).toBe("roblox-military-vehicle-pack");
  });

  it("collapses whitespace/underscores into single hyphens", () => {
    expect(slugify("  Foo   Bar_Baz  ")).toBe("foo-bar-baz");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("-Leading and trailing-")).toBe("leading-and-trailing");
  });
});

describe("generateOrderNumber", () => {
  it("matches the INV-YYYYMMDD-#### format", () => {
    expect(generateOrderNumber()).toMatch(/^INV-\d{8}-\d{4}$/);
  });
});

describe("generateReferenceCode", () => {
  it("matches the PAY-prefixed uppercase alphanumeric format", () => {
    expect(generateReferenceCode()).toMatch(/^PAY[A-Z0-9]+$/);
  });
});

describe("formatBytes", () => {
  it("returns 0 B for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes under 1024 with no decimal", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
