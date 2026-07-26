import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const E2E_BUYER_EMAIL = "e2e-buyer@voxmarket.test";
const E2E_BUYER_PASSWORD = "E2eBuyer123!";

test.describe("auth", () => {
  test("a pre-verified buyer can log in and reach the dashboard", async ({ page }) => {
    await loginAs(page, E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("the registration form submits and routes to email verification", async ({ page }) => {
    const uniqueEmail = `e2e-register-${Date.now()}@voxmarket.test`;

    await page.goto("/register");
    await page.getByLabel("Nama Lengkap").fill("E2E New User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("BrandNewUser123!");
    await page.getByRole("button", { name: "Daftar" }).click();

    await page.waitForURL(/\/verify-email/);
    expect(decodeURIComponent(page.url())).toContain(uniqueEmail);
  });
});
