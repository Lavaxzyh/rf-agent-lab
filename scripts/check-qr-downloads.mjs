import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const [url, executablePath, playwrightEntry] = process.argv.slice(2)
const { chromium } = await import(pathToFileURL(playwrightEntry).href)
const downloads = JSON.parse(readFileSync('src/data/qr-downloads.json', 'utf8'))
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
assert.deepEqual(downloads.map((item) => item.id), ['hfss', 'cst', 'feko'])
assert.deepEqual(readdirSync('public/models/qr-grid-patch').sort(), downloads.map((item) => item.filename).sort())
assert(!/[A-Za-z]:[\\/]/.test(JSON.stringify(downloads)), 'Public metadata must not expose local paths')
mkdirSync('.local-preview', { recursive: true })
const browser = await chromium.launch({ executablePath, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
try {
  await page.goto(`${url}/#cases`)
  const card = page.locator('a.case-feature[href="#/cases/qr-grid-patch"]')
  assert.match(await card.innerText(), /可下载/)
  await card.click()
  const select = page.getByLabel('工程版本', { exact: true })
  await select.waitFor()
  assert.equal(await select.inputValue(), 'hfss')
  assert.deepEqual(await select.locator('option').allTextContents(), downloads.map((item) => `${item.label} · ${item.revision}`))
  assert.match(await page.locator('.case-source').innerText(), /10\.1109\/TAP\.2025\.3623329/)
  for (const variant of downloads) {
    await select.selectOption(variant.id)
    const button = page.getByRole('link', { name: `下载 ${variant.label} ${variant.revision} 工程`, exact: true })
    assert.equal(await button.getAttribute('download'), variant.filename)
    assert.match(await page.locator('.qr-download-info').innerText(), new RegExp(variant.software.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    for (const file of variant.files) assert.match(await page.locator('.qr-download-info').innerText(), new RegExp(file.name.replaceAll('.', '\\.')))
    const href = new URL(await button.getAttribute('href'), page.url())
    const expectedPrefix = new URL(`${url}/`).pathname
    assert(href.pathname.startsWith(`${expectedPrefix}models/qr-grid-patch/`), 'Downloads must respect the Pages base path')
    const response = await page.request.get(href.href)
    assert.equal(response.status(), 200)
    const bytes = await response.body()
    assert.equal(bytes.length, variant.bytes)
    assert.equal(sha256(bytes), variant.sha256)
    assert.equal(sha256(readFileSync(`public/models/qr-grid-patch/${variant.filename}`)), variant.sha256)
    const downloadEvent = page.waitForEvent('download')
    await button.click()
    const download = await downloadEvent
    assert.equal(download.suggestedFilename(), variant.filename)
    const path = await download.path()
    assert.equal(sha256(readFileSync(path)), variant.sha256, 'Browser download must match the packaged project')
  }
  await select.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('Enter')
  assert.equal(await select.inputValue(), 'hfss', 'Native dropdown is keyboard accessible')
  for (const width of [1440, 834, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await select.selectOption('feko')
    await page.locator('.qr-downloads').scrollIntoViewIfNeeded()
    const bounds = await page.locator('.qr-downloads').evaluate((el) => ({ width: el.clientWidth, scrollWidth: el.scrollWidth }))
    assert(bounds.scrollWidth <= bounds.width, `Download card overflow at ${width}`)
    assert(await page.locator('#cases').evaluate((el) => el.scrollWidth <= el.clientWidth), `Case panel overflow at ${width}`)
    const rect = await select.boundingBox()
    assert(rect.x >= 0 && rect.x + rect.width <= width, `Dropdown stays on screen at ${width}`)
    await page.locator('.qr-downloads').screenshot({ path: `.local-preview/qr-downloads-${width}.png` })
  }
  await page.reload()
  await select.waitFor()
  assert.equal(await select.inputValue(), 'hfss')
  assert.deepEqual(errors, [])
  console.log(`QR download checks passed (${url}): three variants, byte-identical browser downloads, keyboard, refresh and four viewport sizes.`)
} finally { await browser.close() }
