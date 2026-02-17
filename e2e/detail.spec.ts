import { expect, test } from "@playwright/test"

test.describe("Track detail page", () => {
  test("navigates from catalog card to detail page", async ({ page }) => {
    await page.goto("./catalog")
    // Wait for cards to load — cards use role="group" with onClick navigation
    const card = page.locator('[role="listitem"] [role="group"]').first()
    await expect(card).toBeVisible({ timeout: 15000 })
    await card.click()
    await expect(page).toHaveURL(/\/catalog\/\d+/)
    // Detail page should show back link and track info
    await expect(page.getByText("Back to Catalog")).toBeVisible()
  })

  test("deep link renders track detail standalone", async ({ page }) => {
    // Use a well-known track ID (Bohemian Rhapsody by Queen)
    await page.goto("./catalog/1440806041")
    await expect(page.getByText("Back to Catalog")).toBeVisible({ timeout: 15000 })
    // Should have track name, artist, and genre info
    await expect(page.locator("h1")).toBeVisible()
  })

  test("shows 404 for invalid track ID", async ({ page }) => {
    await page.goto("./catalog/999999999999")
    // Should show the 404 page (either "Track not found" or the custom 404)
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 15000 })
  })

  test("back link returns to catalog", async ({ page }) => {
    await page.goto("./catalog/1440806041")
    await expect(page.getByText("Back to Catalog")).toBeVisible({ timeout: 15000 })
    await page.click('a:has-text("Back to Catalog")')
    await expect(page).toHaveURL(/\/catalog$/)
  })

  test("favorite button toggles state on detail page", async ({ page }) => {
    // Deep link to a known track
    await page.goto("./catalog/1440806041")
    await expect(page.getByText("Back to Catalog")).toBeVisible({ timeout: 15000 })

    // Find and click the favorite button
    const favoriteBtn = page.locator('button[aria-label*="Add"]').first()
    await expect(favoriteBtn).toBeVisible({ timeout: 5000 })
    await favoriteBtn.click()

    // Should now show "Remove" aria-label
    await expect(page.locator('button[aria-label*="Remove"]').first()).toBeVisible()
  })

  test("favorites page shows saved tracks", async ({ page }) => {
    // Deep link to a track and favorite it
    await page.goto("./catalog/1440806041")
    await expect(page.getByText("Back to Catalog")).toBeVisible({ timeout: 15000 })
    const favoriteBtn = page.locator('button[aria-label*="Add"]').first()
    await expect(favoriteBtn).toBeVisible({ timeout: 5000 })
    await favoriteBtn.click()
    await expect(page.locator('button[aria-label*="Remove"]').first()).toBeVisible()

    // Navigate to favorites page
    await page.goto("./catalog/favorites")
    await expect(page.getByText("Your Favorites")).toBeVisible({ timeout: 15000 })
    // Should show at least one favorited track
    await expect(page.locator('[role="listitem"]').first()).toBeVisible()
  })
})
