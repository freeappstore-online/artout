# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: artout.spec.ts >> Map >> cluster labels show location names
- Location: e2e/artout.spec.ts:47:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "All places (1800)" [ref=e5]:
    - img [ref=e6]
    - generic [ref=e9]: All places
    - generic [ref=e10]: (1800)
    - img [ref=e11]
  - main [ref=e13]:
    - generic [ref=e16]:
      - generic:
        - generic:
          - button [ref=e17] [cursor=pointer]
          - button "110 Western Australia" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]:
              - generic [ref=e21]: "110"
              - text: Western Australia
          - button "4 Queensland" [ref=e22] [cursor=pointer]:
            - generic [ref=e23]:
              - generic [ref=e24]: "4"
              - text: Queensland
          - button "603 Australia" [ref=e25] [cursor=pointer]:
            - generic [ref=e26]:
              - generic [ref=e27]: "603"
              - text: Australia
          - button "8 India" [ref=e28] [cursor=pointer]:
            - generic [ref=e29]:
              - generic [ref=e30]: "8"
              - text: India
          - button "10 India" [ref=e31] [cursor=pointer]:
            - generic [ref=e32]:
              - generic [ref=e33]: "10"
              - text: India
          - button "3" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: "3"
          - button "9" [ref=e36] [cursor=pointer]:
            - generic [ref=e37]: "9"
          - button [ref=e38] [cursor=pointer]
          - button [ref=e40] [cursor=pointer]
          - button "9 Peru" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]:
              - generic [ref=e44]: "9"
              - text: Peru
          - button "33 Brazil" [ref=e45] [cursor=pointer]:
            - generic [ref=e46]:
              - generic [ref=e47]: "33"
              - text: Brazil
          - button "2 Chile" [ref=e48] [cursor=pointer]:
            - generic [ref=e49]:
              - generic [ref=e50]: "2"
              - text: Chile
          - button "8" [ref=e51] [cursor=pointer]:
            - generic [ref=e52]: "8"
          - button "26 California" [ref=e53] [cursor=pointer]:
            - generic [ref=e54]:
              - generic [ref=e55]: "26"
              - text: California
          - button "8" [ref=e56] [cursor=pointer]:
            - generic [ref=e57]: "8"
          - button "123 Colorado" [ref=e58] [cursor=pointer]:
            - generic [ref=e59]:
              - generic [ref=e60]: "123"
              - text: Colorado
          - button "10 Arkansas" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]:
              - generic [ref=e63]: "10"
              - text: Arkansas
          - button "67" [ref=e64] [cursor=pointer]:
            - generic [ref=e65]: "67"
          - button "10 United States" [ref=e66] [cursor=pointer]:
            - generic [ref=e67]:
              - generic [ref=e68]: "10"
              - text: United States
          - button "2 Calle Puerto Rico" [ref=e69] [cursor=pointer]:
            - generic [ref=e70]:
              - generic [ref=e71]: "2"
              - text: Calle Puerto Rico
          - button "98" [ref=e72] [cursor=pointer]:
            - generic [ref=e73]: "98"
          - button "7" [ref=e74] [cursor=pointer]:
            - generic [ref=e75]: "7"
          - button "5 United States" [ref=e76] [cursor=pointer]:
            - generic [ref=e77]:
              - generic [ref=e78]: "5"
              - text: United States
          - button "17 Mexico" [ref=e79] [cursor=pointer]:
            - generic [ref=e80]:
              - generic [ref=e81]: "17"
              - text: Mexico
          - button [ref=e82] [cursor=pointer]
          - button [ref=e84] [cursor=pointer]
          - button "35 Samara" [ref=e86] [cursor=pointer]:
            - generic [ref=e87]:
              - generic [ref=e88]: "35"
              - text: Samara
          - button "8 Kazakhstan" [ref=e89] [cursor=pointer]:
            - generic [ref=e90]:
              - generic [ref=e91]: "8"
              - text: Kazakhstan
          - button "39" [ref=e92] [cursor=pointer]:
            - generic [ref=e93]: "39"
          - button [ref=e94] [cursor=pointer]
          - button [ref=e96] [cursor=pointer]
          - button [ref=e98] [cursor=pointer]
          - button "7" [ref=e100] [cursor=pointer]:
            - generic [ref=e101]: "7"
          - button "6" [ref=e102] [cursor=pointer]:
            - generic [ref=e103]: "6"
          - button [ref=e104] [cursor=pointer]
          - button "19" [ref=e106] [cursor=pointer]:
            - generic [ref=e107]: "19"
          - button "37" [ref=e108] [cursor=pointer]:
            - generic [ref=e109]: "37"
          - button "30 United Kingdom" [ref=e110] [cursor=pointer]:
            - generic [ref=e111]:
              - generic [ref=e112]: "30"
              - text: United Kingdom
          - button "7" [ref=e113] [cursor=pointer]:
            - generic [ref=e114]: "7"
          - button "6" [ref=e115] [cursor=pointer]:
            - generic [ref=e116]: "6"
          - button "64" [ref=e117] [cursor=pointer]:
            - generic [ref=e118]: "64"
          - button "31" [ref=e119] [cursor=pointer]:
            - generic [ref=e120]: "31"
          - button "330" [ref=e121] [cursor=pointer]:
            - generic [ref=e122]: "330"
  - navigation [ref=e123]:
    - generic [ref=e124]:
      - button "Map" [ref=e125]:
        - img [ref=e126]
        - generic [ref=e129]: Map
      - button "Wall" [ref=e130]:
        - img [ref=e131]
        - generic [ref=e136]: Wall
      - button [ref=e137]:
        - img [ref=e139]
      - button "Saved" [ref=e141]:
        - img [ref=e142]
        - generic [ref=e144]: Saved
      - button "You" [ref=e145]:
        - img [ref=e146]
        - generic [ref=e149]: You
    - link "freeappstore.online" [ref=e150] [cursor=pointer]:
      - /url: https://freeappstore.online
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE = 'https://artout.freeappstore.online'
  4   | 
  5   | test.describe('App load', () => {
  6   |   test('renders map with dark background', async ({ page }) => {
  7   |     await page.goto(BASE)
  8   |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
  9   |     const bg = await page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)
  10  |     const [, r] = bg.match(/rgb\(\s*(\d+)/) || [, '255']
  11  |     expect(Number(r)).toBeLessThan(30)
  12  |   })
  13  | 
  14  |   test('no console errors on load', async ({ page }) => {
  15  |     const errors: string[] = []
  16  |     page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  17  |     await page.goto(BASE)
  18  |     await page.waitForTimeout(3000)
  19  |     const real = errors.filter((e) =>
  20  |       !e.includes('Permissions policy') && !e.includes('favicon') && !e.includes('Geolocation')
  21  |     )
  22  |     expect(real).toEqual([])
  23  |   })
  24  | 
  25  |   test('5 tabs in nav bar', async ({ page }) => {
  26  |     await page.goto(BASE)
  27  |     await expect(page.locator('nav button')).toHaveCount(5, { timeout: 5000 })
  28  |   })
  29  | 
  30  |   test('has freeappstore.online link', async ({ page }) => {
  31  |     await page.goto(BASE)
  32  |     await expect(page.locator('a[href="https://freeappstore.online"]')).toBeVisible({ timeout: 5000 })
  33  |   })
  34  | })
  35  | 
  36  | test.describe('Map', () => {
  37  |   test('shows cluster markers', async ({ page }) => {
  38  |     await page.goto(BASE)
  39  |     await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 15000 })
  40  |   })
  41  | 
  42  |   test('location picker pill visible', async ({ page }) => {
  43  |     await page.goto(BASE)
  44  |     await expect(page.getByText('All places')).toBeVisible({ timeout: 10000 })
  45  |   })
  46  | 
  47  |   test('cluster labels show location names', async ({ page }) => {
  48  |     await page.goto(BASE)
  49  |     await page.waitForTimeout(3000)
  50  |     // At world zoom, clusters should have text content (counts or labels)
  51  |     const markers = page.locator('.leaflet-marker-icon')
  52  |     const count = await markers.count()
> 53  |     expect(count).toBeGreaterThan(0)
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  54  |   })
  55  | 
  56  |   test('dark map tiles loaded', async ({ page }) => {
  57  |     await page.goto(BASE)
  58  |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
  59  |     const leafletBg = await page.locator('.leaflet-container').evaluate((el) => getComputedStyle(el).backgroundColor)
  60  |     // Should be dark (#1a1a1a)
  61  |     expect(leafletBg).not.toBe('rgb(255, 255, 255)')
  62  |   })
  63  | })
  64  | 
  65  | test.describe('Location picker', () => {
  66  |   test('opens on pill tap', async ({ page }) => {
  67  |     await page.goto(BASE)
  68  |     await page.getByText('All places').click()
  69  |     await expect(page.getByPlaceholder('Search places...')).toBeVisible({ timeout: 5000 })
  70  |   })
  71  | 
  72  |   test('shows countries', async ({ page }) => {
  73  |     await page.goto(BASE)
  74  |     await page.getByText('All places').click()
  75  |     await expect(page.locator('text=Australia').first()).toBeVisible({ timeout: 5000 })
  76  |   })
  77  | 
  78  |   test('search filters locations', async ({ page }) => {
  79  |     await page.goto(BASE)
  80  |     await page.getByText('All places').click()
  81  |     await page.getByPlaceholder('Search places...').fill('Melbourne')
  82  |     await expect(page.locator('text=Melbourne').first()).toBeVisible({ timeout: 5000 })
  83  |   })
  84  | 
  85  |   test('search for non-existent shows empty message', async ({ page }) => {
  86  |     await page.goto(BASE)
  87  |     await page.getByText('All places').click()
  88  |     await page.getByPlaceholder('Search places...').fill('xyznonexistent')
  89  |     await expect(page.getByText('No places matching')).toBeVisible({ timeout: 5000 })
  90  |   })
  91  | 
  92  |   test('selecting a location updates pill', async ({ page }) => {
  93  |     await page.goto(BASE)
  94  |     await page.getByText('All places').click()
  95  |     await page.getByPlaceholder('Search places...').fill('Melbourne')
  96  |     await page.locator('.text-left:has-text("Melbourne")').first().click()
  97  |     await expect(page.getByText('Melbourne')).toBeVisible({ timeout: 5000 })
  98  |   })
  99  | 
  100 |   test('drill-down shows breadcrumb', async ({ page }) => {
  101 |     await page.goto(BASE)
  102 |     await page.getByText('All places').click()
  103 |     // Find the › button next to Australia to drill down
  104 |     const row = page.locator('.flex.items-center:has-text("Australia")').first()
  105 |     await row.locator('button:has-text("›")').click()
  106 |     await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible()
  107 |   })
  108 | 
  109 |   test('closes on backdrop tap', async ({ page }) => {
  110 |     await page.goto(BASE)
  111 |     await page.getByText('All places').click()
  112 |     await expect(page.getByPlaceholder('Search places...')).toBeVisible()
  113 |     // Tap the backdrop (top area)
  114 |     await page.locator('.bg-black\\/60').click()
  115 |     await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  116 |   })
  117 | 
  118 |   test('closes on × button', async ({ page }) => {
  119 |     await page.goto(BASE)
  120 |     await page.getByText('All places').click()
  121 |     await page.locator('button:has-text("×")').click()
  122 |     await expect(page.getByPlaceholder('Search places...')).not.toBeVisible()
  123 |   })
  124 | })
  125 | 
  126 | test.describe('Wall', () => {
  127 |   test('shows photo grid', async ({ page }) => {
  128 |     await page.goto(BASE)
  129 |     await page.getByText('Wall').click()
  130 |     await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  131 |   })
  132 | 
  133 |   test('has Newest sort pill', async ({ page }) => {
  134 |     await page.goto(BASE)
  135 |     await page.getByText('Wall').click()
  136 |     await expect(page.getByText('Newest')).toBeVisible({ timeout: 10000 })
  137 |   })
  138 | 
  139 |   test('has Popular sort pill', async ({ page }) => {
  140 |     await page.goto(BASE)
  141 |     await page.getByText('Wall').click()
  142 |     await expect(page.getByText('Popular')).toBeVisible({ timeout: 10000 })
  143 |   })
  144 | 
  145 |   test('Popular sort changes order', async ({ page }) => {
  146 |     await page.goto(BASE)
  147 |     await page.getByRole('button', { name: 'Wall' }).click()
  148 |     await expect(page.locator('img[loading="lazy"]').first()).toBeVisible({ timeout: 10000 })
  149 |     await page.getByRole('button', { name: 'Popular' }).click()
  150 |     await expect(page.locator('img[loading="lazy"]').first()).toBeVisible()
  151 |   })
  152 | 
  153 |   test('grid/feed layout toggle works', async ({ page }) => {
```