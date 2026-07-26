import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit, clientIp } from "./rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and blocks the next one", () => {
    const key = `test-${crypto.randomUUID()}`;
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(false);
  });

  it("resets the bucket after the window elapses", () => {
    vi.useFakeTimers();
    const key = `test-${crypto.randomUUID()}`;

    expect(rateLimit(key, 1, 1000)).toBe(true);
    expect(rateLimit(key, 1, 1000)).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(rateLimit(key, 1, 1000)).toBe(true);
  });

  it("tracks distinct keys independently", () => {
    const keyA = `test-${crypto.randomUUID()}`;
    const keyB = `test-${crypto.randomUUID()}`;

    expect(rateLimit(keyA, 1, 60_000)).toBe(true);
    expect(rateLimit(keyA, 1, 60_000)).toBe(false);
    expect(rateLimit(keyB, 1, 60_000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("returns the first IP from a comma-separated x-forwarded-for header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("trims whitespace around the IP", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "  1.2.3.4  , 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when the header is missing", () => {
    const req = new Request("http://localhost");
    expect(clientIp(req)).toBe("unknown");
  });
});
