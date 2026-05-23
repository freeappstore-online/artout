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
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 10000 })
  })

  test('location picker pill is visible on map', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByText('All places')).toBeVisible({ timeout: 10000 })
  })

  test('location picker opens and shows countries', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await expect(page.getByPlaceholder('Search places...')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Australia').first()).toBeVisible({ timeout: 5000 })
  })

  test('location picker search works', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await expect(page.locator('text=Melbourne').first()).toBeVisible({ timeout: 5000 })
  })

  test('selecting a location filters posts', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await page.locator('button:has-text("Melbourne")').first().click()
    // Pill should now show Melbourne
    await expect(page.getByText('Melbourne')).toBeVisible({ timeout: 5000 })
  })

  test('wall tab shows photo grid', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('wall has newest sort toggle', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.getByText('Newest')).toBeVisible({ timeout: 10000 })
  })

  test('wall has grid/feed layout toggle', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('location picker visible on wall too', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.getByText('All places')).toBeVisible({ timeout: 5000 })
  })

  test('add tab requires sign-in', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('nav button').nth(2).click()
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
    const real = errors.filter((e) =>
      !e.includes('Permissions policy') &&
      !e.includes('favicon') &&
      !e.includes('Geolocation')
    )
    expect(real).toEqual([])
  })

  test('4 tabs in nav bar', async ({ page }) => {
    await page.goto(BASE)
    const navButtons = page.locator('nav button')
    await expect(navButtons).toHaveCount(4, { timeout: 5000 })
  })
})
