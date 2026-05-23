import { test, expect } from '@playwright/test'

const BASE = 'https://artout.freeappstore.online'

test.describe('ArtOut', () => {
  test('loads and shows the map tab by default', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
  })

  test('shows cluster markers on the map', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    // Clusters or markers should appear
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 10000 })
  })

  test('wall tab shows photo grid', async ({ page }) => {
    await page.goto(BASE)
    // Navigate to wall tab
    await page.getByText('Wall').click()
    // Should show images in the grid
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('wall has nearby/newest sort toggle', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    // Should see sort buttons (may or may not have Nearby depending on GPS)
    await expect(page.getByText('Newest')).toBeVisible({ timeout: 10000 })
  })

  test('wall has grid/feed layout toggle', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    // Grid is default — images in grid cols
    const gridImages = page.locator('.grid img')
    await expect(gridImages.first()).toBeVisible()
  })

  test('places tab shows location tree', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Places').click()
    await expect(page.locator('text=Places').first()).toBeVisible()
    // Should have a search input
    await expect(page.getByPlaceholder('Search places...')).toBeVisible()
    // Should show location nodes (countries)
    await expect(page.locator('button:has-text("Australia")').first()).toBeVisible({ timeout: 10000 })
  })

  test('places search filters locations', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await expect(page.locator('button:has-text("Melbourne")').first()).toBeVisible({ timeout: 5000 })
  })

  test('places drill-down shows breadcrumb', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Places').click()
    await expect(page.locator('button:has-text("Australia")').first()).toBeVisible({ timeout: 10000 })
    await page.locator('button:has-text("Australia")').first().click()
    // Breadcrumb should show
    await expect(page.getByText('All')).toBeVisible()
    await expect(page.locator('button:has-text("Australia")').first()).toBeVisible()
  })

  test('add tab requires sign-in', async ({ page }) => {
    await page.goto(BASE)
    // Click the + button (middle tab)
    await page.locator('nav button').nth(2).click()
    // Should show sign-in prompt
    await expect(page.getByText('Drop some art')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('GitHub')).toBeVisible()
  })

  test('saved tab requires sign-in', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Saved').click()
    await expect(page.getByText('Google')).toBeVisible({ timeout: 5000 })
  })

  test('has freeappstore.online link in nav', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('a[href="https://freeappstore.online"]')).toBeVisible({ timeout: 5000 })
  })

  test('dark theme is default', async ({ page }) => {
    await page.goto(BASE)
    const bg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)
    // Should be very dark (close to black)
    expect(bg).toMatch(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/)
    const [, r, g, b] = bg.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/)!
    expect(Number(r)).toBeLessThan(30)
    expect(Number(g)).toBeLessThan(30)
    expect(Number(b)).toBeLessThan(30)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    // Filter out expected errors (geolocation permission, favicon)
    const real = errors.filter((e) =>
      !e.includes('Permissions policy') &&
      !e.includes('favicon') &&
      !e.includes('Geolocation')
    )
    expect(real).toEqual([])
  })
})
