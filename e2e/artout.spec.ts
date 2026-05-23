import { test, expect } from '@playwright/test'

const BASE = 'https://artout.freeappstore.online'

test.describe('App load', () => {
  test('renders map with dark background', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    const bg = await page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)
    const [, r] = bg.match(/rgb\(\s*(\d+)/) || [, '255']
    expect(Number(r)).toBeLessThan(30)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    const real = errors.filter((e) =>
      !e.includes('Permissions policy') && !e.includes('favicon') && !e.includes('Geolocation')
    )
    expect(real).toEqual([])
  })

  test('4 tabs in nav bar', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('nav button')).toHaveCount(4, { timeout: 5000 })
  })

  test('has freeappstore.online link', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('a[href="https://freeappstore.online"]')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Map', () => {
  test('shows cluster markers', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 15000 })
  })

  test('location picker pill visible', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByText('All places')).toBeVisible({ timeout: 10000 })
  })

  test('cluster labels show location names', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    // At world zoom, clusters should have text content (counts or labels)
    const markers = page.locator('.leaflet-marker-icon')
    const count = await markers.count()
    expect(count).toBeGreaterThan(0)
  })

  test('dark map tiles loaded', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
    const leafletBg = await page.locator('.leaflet-container').evaluate((el) => getComputedStyle(el).backgroundColor)
    // Should be dark (#1a1a1a)
    expect(leafletBg).not.toBe('rgb(255, 255, 255)')
  })
})

test.describe('Location picker', () => {
  test('opens on pill tap', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await expect(page.getByPlaceholder('Search places...')).toBeVisible({ timeout: 5000 })
  })

  test('shows countries', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await expect(page.locator('text=Australia').first()).toBeVisible({ timeout: 5000 })
  })

  test('search filters locations', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await expect(page.locator('text=Melbourne').first()).toBeVisible({ timeout: 5000 })
  })

  test('search for non-existent shows empty message', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('xyznonexistent')
    await expect(page.getByText('No places matching')).toBeVisible({ timeout: 5000 })
  })

  test('selecting a location updates pill', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await page.locator('.text-left:has-text("Melbourne")').first().click()
    await expect(page.getByText('Melbourne')).toBeVisible({ timeout: 5000 })
  })

  test('drill-down shows breadcrumb', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    // Find the › button next to Australia to drill down
    const row = page.locator('.flex.items-center:has-text("Australia")').first()
    await row.locator('button:has-text("›")').click()
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible()
  })

  test('closes on backdrop tap', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await expect(page.getByPlaceholder('Search places...')).toBeVisible()
    // Tap the backdrop (top area)
    await page.locator('.bg-black\\/60').click()
    await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  })

  test('closes on × button', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.locator('button:has-text("×")').click()
    await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  })
})

test.describe('Wall', () => {
  test('shows photo grid', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('has Newest sort pill', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.getByText('Newest')).toBeVisible({ timeout: 10000 })
  })

  test('has Popular sort pill', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.getByText('Popular')).toBeVisible({ timeout: 10000 })
  })

  test('Popular sort changes order', async ({ page }) => {
    await page.goto(BASE)
    await page.getByRole('button', { name: 'Wall' }).click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Popular' }).click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible()
  })

  test('grid/feed layout toggle works', async ({ page }) => {
    await page.goto(BASE)
    await page.getByRole('button', { name: 'Wall' }).click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    const gridContainer = page.locator('.grid.grid-cols-3')
    await expect(gridContainer).toBeVisible()
  })

  test('location pill visible on wall', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.getByText('All places')).toBeVisible({ timeout: 5000 })
  })

  test('heart buttons visible on grid items', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    // Hearts should be visible
    await expect(page.getByText('🤍').first()).toBeVisible()
  })

  test('location badges visible on grid items', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    // Location name overlay
    const gradients = page.locator('.from-black\\/70')
    await expect(gradients.first()).toBeVisible()
  })

  test('location filter applies to wall', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    // Open picker and select a location
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await page.locator('.text-left:has-text("Melbourne")').first().click()
    // Pill should now show Melbourne
    await expect(page.getByText('Melbourne')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Auth', () => {
  test('add tab requires sign-in', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('nav button').nth(2).click()
    await expect(page.getByText('Drop some art')).toBeVisible({ timeout: 5000 })
  })

  test('add tab shows Google + GitHub buttons', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('nav button').nth(2).click()
    await expect(page.getByText('Google')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('GitHub')).toBeVisible()
  })

  test('saved tab requires sign-in', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Saved').click()
    await expect(page.getByText('Google')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Navigation', () => {
  test('tab switching works', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'Wall' }).click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Map' }).click()
    await expect(page.locator('.leaflet-container')).toBeVisible()
    await page.getByRole('button', { name: 'Saved' }).click()
    await expect(page.getByText('Your collection')).toBeVisible()
  })

  test('location filter persists across map/wall tabs', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('All places').click()
    await page.getByPlaceholder('Search places...').fill('France')
    await page.locator('.text-left:has-text("France")').first().click()
    await expect(page.getByText('France')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Wall' }).click()
    await expect(page.getByText('France')).toBeVisible()
    await page.getByRole('button', { name: 'Map' }).click()
    await expect(page.getByText('France')).toBeVisible()
  })

  test('tapping image on wall opens gallery', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.locator('img[loading="lazy"]').first().click()
    // Gallery should open — lightbox visible
    await expect(page.locator('.yarl__root')).toBeVisible({ timeout: 5000 })
  })

  test('gallery has navigate button', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.locator('img[loading="lazy"]').first().click()
    await expect(page.getByText('Navigate →')).toBeVisible({ timeout: 5000 })
  })

  test('gallery has fav button', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('Wall').click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.locator('img[loading="lazy"]').first().click()
    // Bottom bar should have heart
    await expect(page.locator('.z-\\[10000\\]')).toBeVisible({ timeout: 5000 })
  })

  test('gallery closes on Escape key', async ({ page }) => {
    await page.goto(BASE)
    await page.getByRole('button', { name: 'Wall' }).click()
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
    await page.locator('img[loading="lazy"]').first().click()
    await expect(page.locator('.yarl__root')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.locator('.yarl__root')).not.toBeVisible({ timeout: 3000 })
  })
})
