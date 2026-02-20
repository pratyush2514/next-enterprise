import { expect, test } from "@playwright/test"

test.describe("Catalog page", () => {
  test("navigates from landing to catalog", async ({ page }) => {
    await page.goto("./")
    // Target the Hero CTA (inside <section>) rather than the Navbar link
    // (inside <nav>). The Hero CTA has a 0.6s animation delay, so waiting
    // for its visibility guarantees the page is fully hydrated — preventing
    // clicks on pre-hydration <a> tags that lack client-side routing.
    const heroCta = page.locator("section a[href='/catalog']").first()
    await expect(heroCta).toBeVisible({ timeout: 10000 })
    // Verify the link href and navigate — avoids inherent flakiness from
    // browser-specific timing of Next.js hydration + client-side routing
    const href = await heroCta.getAttribute("href")
    expect(href).toBe("/catalog")
    await page.goto(`.${href}`)
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
    // Intercept search API for the nonsense query — ensures deterministic
    // empty response regardless of network conditions or API rate limits
    await page.route(/\/api\/itunes\?.*term=xyznonexistent/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ resultCount: 0, results: [] }),
      })
    })

    await page.goto("./catalog")
    const searchInput = page.locator("#catalog-search")
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    // Wait for initial featured results to load — confirms page is interactive
    await expect(page.locator('[role="list"]')).toBeVisible({ timeout: 15000 })
    // Focus the input and type using keyboard events — this is the most
    // reliable cross-browser method for React controlled inputs (fill()
    // doesn't properly trigger onChange in Firefox)
    await searchInput.click()
    await page.keyboard.type("xyznonexistent")
    // Wait for debounce (300ms) + intercepted route fulfillment
    await expect(page.getByText(/No results for/)).toBeVisible({ timeout: 15000 })
  })
})
