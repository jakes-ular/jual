import "dotenv/config";
import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@voxmarket.dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin123!";

test("admin can create, edit, and delete a category", async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

  const categoryName = `E2E Category ${Date.now()}`;
  const updatedName = `${categoryName} (edited)`;

  await page.goto("/admin/categories");
  await page.getByRole("button", { name: "Tambah Kategori" }).click();
  await page.getByLabel("Nama Kategori").fill(categoryName);
  await page.getByRole("button", { name: "Tambah Kategori" }).last().click();

  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

  await page
    .locator(".rounded-2xl", { hasText: categoryName })
    .getByRole("button")
    .first()
    .click();
  await page.getByLabel("Nama Kategori").fill(updatedName);
  await page.getByRole("button", { name: "Simpan Perubahan" }).click();

  await expect(page.getByText(updatedName, { exact: true })).toBeVisible();

  await page
    .locator(".rounded-2xl", { hasText: updatedName })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("button", { name: "Hapus" }).click();
  await expect(page.getByRole("button", { name: "Hapus" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: updatedName, exact: true })).not.toBeVisible();
});
