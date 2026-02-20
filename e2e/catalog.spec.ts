import { expect, test } from "@playwright/test"

test.describe("Catalog page", () => {
  test("navigates from landing to catalog", async ({ page }) => {
    await page.goto("./")
    await page.click('a[href="/catalog"]')
    await expect(page).toHaveURL(/\/catalog/)
    await expect(page.locator('input[type="search"], input[placeholder*="Search"]')).toBeVisible()
  })

  test("displays featured tracks on load", async ({ page }) => {
    await page.goto("./catalog")
    await expect(page.locator('[role="list"]')).toBeVisible({ timeout: 15000 })
    const cards = page.locator('[role="listitem"]')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test("searches for tracks and shows results", async ({ page }) => {
    await page.goto("./catalog")
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    await searchInput.fill("Beatles")
    // Wait for debounce + fetch
    await expect(page.locator('[role="list"]')).toBeVisible({ timeout: 15000 })
    const cards = page.locator('[role="listitem"]')
    await expect(cards.first()).toBeVisible()
  })

  test("shows empty state for nonsense query", async ({ page }) => {
    await page.goto("./catalog")
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    // Type character-by-character to reliably trigger React onChange in all browsers
    await searchInput.pressSequentially("xyznonexistent", { delay: 30 })
    // Wait for debounce (300ms) + API round-trip
    await expect(page.getByText(/No results for/)).toBeVisible({ timeout: 25000 })
  })
})
