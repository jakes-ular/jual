import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const E2E_BUYER_EMAIL = "e2e-buyer@voxmarket.test";
const E2E_BUYER_PASSWORD = "E2eBuyer123!";

test("browse catalog, add to cart, and complete checkout", async ({ page }) => {
  await loginAs(page, E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD);

  await page.goto("/catalog");
  await page.getByRole("button", { name: "Add to Cart" }).first().click();

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  await page.getByLabel("Username Discord / No. WhatsApp").fill("e2e-buyer#0000");
  await page.getByRole("button", { name: "Buat Pesanan" }).click();

  await page.waitForURL(/\/checkout\/success/);
  await expect(page.getByText(/No\. Order/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Menunggu Pembayaran" })).toBeVisible();
});
