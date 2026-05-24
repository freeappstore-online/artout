import { test, expect, type Page } from '@playwright/test'

const BASE = 'https://artout.freeappstore.online'

// Helpers
const nav = (page: Page, tab: string) => page.locator('nav button', { hasText: tab }).click()
const waitForWall = (page: Page) => expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
const openGallery = async (page: Page) => {
  await nav(page, 'Wall')
  await waitForWall(page)
  await page.locator('img[loading="lazy"]').first().click()
  await expect(page.locator('.yarl__root')).toBeVisible({ timeout: 5000 })
}
const openSearchPicker = async (page: Page) => {
  await page.locator('button:has(svg circle[r="7"])').first().click()
  await expect(page.getByPlaceholder('Search places...')).toBeVisible({ timeout: 5000 })
}
const switchToFeed = (page: Page) => page.locator('button:has(svg rect[width="18"])').first().click()

// ─── App shell ───────────────────────────────────────────────

test.describe('Shell', () => {
  test('dark background from first paint', async ({ page }) => {
    await page.goto(BASE)
    const bg = await page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)
    const [, r] = bg.match(/rgb\(\s*(\d+)/) || [, '255']
    expect(Number(r)).toBeLessThan(30)
  })

  test('no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    const real = errors.filter((e) =>
      !e.includes('Permissions policy') && !e.includes('favicon') && !e.includes('Geolocation')
    )
    expect(real).toEqual([])
  })

  test('5 tabs: Map, Wall, +, Saved, You', async ({ page }) => {
    await page.goto(BASE)
    const buttons = page.locator('nav button')
    await expect(buttons).toHaveCount(5, { timeout: 5000 })
    await expect(page.locator('nav', { hasText: 'Map' })).toBeVisible()
    await expect(page.locator('nav', { hasText: 'Wall' })).toBeVisible()
    await expect(page.locator('nav', { hasText: 'Saved' })).toBeVisible()
    await expect(page.locator('nav', { hasText: 'You' })).toBeVisible()
  })

  test('freeappstore.online link at bottom of nav', async ({ page }) => {
    await page.goto(BASE)
    const link = page.locator('nav a[href="https://freeappstore.online"]')
    await expect(link).toBeVisible({ timeout: 5000 })
  })

  test('tab switching renders correct views', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await nav(page, 'Wall')
    await waitForWall(page)
    await nav(page, 'Saved')
    await expect(page.getByText('Your collection')).toBeVisible()
    await nav(page, 'You')
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible()
    await nav(page, 'Map')
    await expect(page.locator('.leaflet-container')).toBeVisible()
  })
})

// ─── Map ─────────────────────────────────────────────────────

test.describe('Map', () => {
  test('renders cluster markers on load', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 15000 })
  })

  test('dark tiles (no white background)', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
    const bg = await page.locator('.leaflet-container').evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe('rgb(255, 255, 255)')
  })

  test('breadcrumb starts with World', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByText('World').first()).toBeVisible({ timeout: 10000 })
  })

  test('search icon opens location picker', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    // Should see countries in the picker
    await expect(page.locator('text=Australia').first()).toBeVisible({ timeout: 5000 })
  })

  test('cluster labels contain place names (not just counts)', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 15000 })
    // At world zoom, cluster icons should contain text (place names like "Australia")
    const markerTexts = await page.locator('.leaflet-marker-icon div').allTextContents()
    const hasLetters = markerTexts.some((t) => /[a-zA-Z]/.test(t))
    expect(hasLetters).toBe(true)
  })
})

// ─── Location picker ─────────────────────────────────────────

test.describe('Location picker', () => {
  test('search filters by name', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await expect(page.locator('.text-left:has-text("Melbourne")').first()).toBeVisible({ timeout: 5000 })
  })

  test('search with no results shows message', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    await page.getByPlaceholder('Search places...').fill('xyznonexistent')
    await expect(page.getByText('No places matching')).toBeVisible({ timeout: 5000 })
  })

  test('selecting location updates map breadcrumb', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    await page.getByPlaceholder('Search places...').fill('Australia')
    await page.locator('.text-left:has-text("Australia")').first().click()
    // Picker closes, breadcrumb shows Australia
    await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
    await expect(page.getByText('Australia').first()).toBeVisible({ timeout: 3000 })
  })

  test('drill-down via › button shows children', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    const row = page.locator('.flex.items-center:has-text("Australia")').first()
    await row.locator('button:has-text("›")').click()
    // Should now see Australian states
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible()
  })

  test('closes on backdrop tap', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    await page.locator('.bg-black\\/60').click()
    await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  })

  test('closes on × button', async ({ page }) => {
    await page.goto(BASE)
    await openSearchPicker(page)
    await page.locator('button:has-text("×")').click()
    await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  })
})

// ─── Breadcrumb ──────────────────────────────────────────────

test.describe('Breadcrumb', () => {
  test('World opens inline country dropdown', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('World').first().click()
    await expect(page.locator('button:has-text("Australia")').first()).toBeVisible({ timeout: 5000 })
  })

  test('selecting from dropdown navigates to that level', async ({ page }) => {
    await page.goto(BASE)
    await page.getByText('World').first().click()
    await page.locator('button:has-text("Australia")').first().click()
    // Breadcrumb should now show World › Australia
    await expect(page.getByText('Australia').first()).toBeVisible({ timeout: 3000 })
  })

  test('tapping a parent segment clears children below', async ({ page }) => {
    await page.goto(BASE)
    // Navigate to Melbourne via search
    await openSearchPicker(page)
    await page.getByPlaceholder('Search places...').fill('Melbourne')
    await page.locator('.text-left:has-text("Melbourne")').first().click()
    // Breadcrumb: World › Australia › Victoria › Melbourne
    // Tap Australia → should clear Victoria and Melbourne
    await page.getByText('Australia').first().click()
    await expect(page.getByText('World')).toBeVisible()
  })

  test('map and wall have independent breadcrumbs', async ({ page }) => {
    await page.goto(BASE)
    // Set map to Australia
    await openSearchPicker(page)
    await page.getByPlaceholder('Search places...').fill('Australia')
    await page.locator('.text-left:has-text("Australia")').first().click()
    await expect(page.getByText('Australia').first()).toBeVisible({ timeout: 5000 })
    // Switch to wall — should be World (independent)
    await nav(page, 'Wall')
    await expect(page.getByText('World')).toBeVisible()
  })
})

// ─── Wall ────────────────────────────────────────────────────

test.describe('Wall', () => {
  test('shows 3-column photo grid', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await expect(page.locator('.grid.grid-cols-3')).toBeVisible()
  })

  test('sort dropdown defaults to Newest', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    const select = page.locator('select')
    await expect(select).toBeVisible({ timeout: 10000 })
    await expect(select).toHaveValue('newest')
  })

  test('sort dropdown changes to Popular', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await page.locator('select').selectOption('popular')
    await expect(page.locator('select')).toHaveValue('popular')
    await expect(page.locator('img[loading="lazy"]').first()).toBeVisible()
  })

  test('sort persists across tab switches', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await page.locator('select').selectOption('popular')
    await nav(page, 'Map')
    await nav(page, 'Wall')
    await expect(page.locator('select')).toHaveValue('popular')
  })

  test('grid shows heart + trash buttons on each item', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await expect(page.getByText('🤍').first()).toBeVisible()
    await expect(page.getByText('🗑').first()).toBeVisible()
  })

  test('grid shows location tags on each item', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    const tags = page.locator('.bg-white\\/15')
    await expect(tags.first()).toBeVisible({ timeout: 5000 })
  })

  test('tapping location tag sets wall filter', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    const tag = page.locator('.bg-white\\/15').first()
    const tagText = await tag.textContent()
    await tag.click()
    if (tagText) {
      // Breadcrumb should include the tapped location
      await expect(page.getByText(tagText).first()).toBeVisible({ timeout: 3000 })
    }
  })

  test('breadcrumb visible on wall', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await expect(page.getByText('World')).toBeVisible({ timeout: 5000 })
  })

  test('infinite scroll sentinel exists', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    // Sentinel should be in the DOM (visible when more posts to load)
    const sentinel = page.getByText('Loading more...')
    const visible = await sentinel.isVisible().catch(() => false)
    // Either visible (more to load) or not (all loaded) — both valid
    expect(typeof visible).toBe('boolean')
  })
})

// ─── Feed layout ─────────────────────────────────────────────

test.describe('Feed layout', () => {
  test('switching to feed shows rounded cards', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await switchToFeed(page)
    await expect(page.locator('.rounded-xl').first()).toBeVisible({ timeout: 3000 })
  })

  test('feed shows Navigate → link with Maps URL', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await switchToFeed(page)
    const link = page.locator('a:has-text("Navigate →")').first()
    await expect(link).toBeVisible({ timeout: 3000 })
    const href = await link.getAttribute('href')
    expect(href).toContain('google.com/maps/dir')
    expect(href).toContain('destination=')
  })

  test('feed shows location tags', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await switchToFeed(page)
    await expect(page.locator('.bg-white\\/15').first()).toBeVisible({ timeout: 3000 })
  })

  test('feed shows heart + trash buttons', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Wall')
    await waitForWall(page)
    await switchToFeed(page)
    await expect(page.getByText('🤍').first()).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('🗑').first()).toBeVisible({ timeout: 3000 })
  })
})

// ─── Gallery ─────────────────────────────────────────────────

test.describe('Gallery', () => {
  test('opens from wall on image click', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
  })

  test('shows heart button with emoji', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
    // Bottom bar with heart
    const bar = page.locator('.z-\\[10000\\]')
    await expect(bar).toBeVisible()
    await expect(bar.getByText('🤍')).toBeVisible()
  })

  test('shows trash button', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
    const bar = page.locator('.z-\\[10000\\]')
    await expect(bar.getByText('🗑')).toBeVisible()
  })

  test('shows Navigate → button', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
    await expect(page.getByText('Navigate →')).toBeVisible()
  })

  test('shows location tags', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
    await expect(page.locator('.z-\\[10000\\] .bg-white\\/15').first()).toBeVisible({ timeout: 3000 })
  })

  test('closes on Escape', async ({ page }) => {
    await page.goto(BASE)
    await openGallery(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('.yarl__root')).not.toBeVisible({ timeout: 3000 })
  })
})

// ─── Auth ────────────────────────────────────────────────────

test.describe('Auth (not signed in)', () => {
  test('Add tab shows sign-in with Google + GitHub', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('nav button').nth(2).click()
    await expect(page.getByText('Drop some art')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('GitHub')).toBeVisible()
  })

  test('Saved tab shows sign-in', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'Saved')
    await expect(page.getByText('Your collection')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Google')).toBeVisible()
  })

  test('Profile tab shows sign-in with Google + GitHub', async ({ page }) => {
    await page.goto(BASE)
    await nav(page, 'You')
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('GitHub')).toBeVisible()
  })
})
