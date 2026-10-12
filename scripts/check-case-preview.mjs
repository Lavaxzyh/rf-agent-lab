import { mkdirSync } from 'node:fs'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const [url, executablePath, playwrightEntry] = process.argv.slice(2)
const { chromium } = await import(pathToFileURL(playwrightEntry).href)
mkdirSync('.local-preview', { recursive: true })
const browser = await chromium.launch({ executablePath, headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
try {
  await page.goto(`${url}/#hero`)
  await page.getByRole('button', { name: 'Go to skills', exact: true }).click()
  assert.equal(await page.locator('#skills .skill-card').count(), 1)
  assert.equal(await page.locator('#skills .skill-card h3').innerText(), 'Codex Profile Switch')
  await page.screenshot({ path: '.local-preview/skills-real-project.png' })
  await page.getByRole('button', { name: 'Go to mcp', exact: true }).click()
  assert.equal(await page.locator('#mcp .mcp-card h3').first().innerText(), 'ads-mcp')
  assert.equal(await page.locator('#mcp .mcp-card a').first().getAttribute('href'), 'https://github.com/Lavaxzyh/ads-mcp')
  assert.equal(await page.locator('#mcp .mcp-card-featured').count(), 1)
  assert.equal(await page.locator('#mcp .mcp-card').count(), 1)
  assert.equal(await page.locator('#mcp .mcp-planned-note').count(), 0)
  await page.screenshot({ path: '.local-preview/mcp-pinned-project.png' })
  const docsEnabled = await page.getByRole('button', { name: 'Go to docs', exact: true }).count() > 0
  const paperEnabled = await page.getByRole('button', { name: 'Go to paper2hfss', exact: true }).count() > 0
  if (paperEnabled) {
    await page.goto(`${url}/#paper2hfss`)
    await page.locator('.case-teaser').waitFor()
    assert.notEqual(await page.locator('.case-teaser').evaluate((el) => getComputedStyle(el).borderStyle), 'none')
  } else {
    await page.goto(`${url}/#paper2hfss`)
    await page.locator('#hero.panel-active').waitFor()
    assert.equal(await page.locator('#paper2hfss').count(), 0)
    assert.equal(await page.evaluate(() => location.hash), '#hero')
  }
  await page.getByRole('button', { name: 'Go to cases', exact: true }).click()
  await page.locator('.case-feature').waitFor()
  assert.equal(await page.locator('#cases .eyebrow').innerText(), '04 / CASE STUDIES')
  assert.equal((await page.getByRole('button', { name: 'Go to cases', exact: true }).textContent()).trim(), 'Case Studies')
  await page.screenshot({ path: '.local-preview/cases-desktop.png' })
  await page.locator('.case-feature').click()
  await page.locator('.case-source').waitFor()
  assert.match(await page.locator('.case-source').innerText(), /10\.1109\/TAP\.2025\.3623329/)
  assert.equal(await page.getByRole('link', { name: 'IEEE Xplore 原文 ↗' }).getAttribute('href'), 'https://ieeexplore.ieee.org/document/11217334')
  await page.screenshot({ path: '.local-preview/case-detail-desktop.png' })
  await page.locator('.structure-layout').scrollIntoViewIfNeeded()
  await page.locator('.antenna-stage canvas').waitFor()
  await page.waitForTimeout(400)
  await page.locator('.structure-layout').screenshot({ path: '.local-preview/structure-desktop.png' })
  const auto = page.getByRole('button', { name: 'Auto rotate · OFF', exact: true })
  assert.equal(await auto.getAttribute('aria-pressed'), 'false')
  await auto.click()
  await page.getByRole('button', { name: '俯视', exact: true }).click()
  await page.locator('.layer-toggles input').first().uncheck()
  await page.getByRole('button', { name: '重置结构与视角 ↺' }).click()
  assert.equal(await page.locator('.layer-toggles input:checked').count(), 6)
  assert.equal(await page.locator('.spread-control input').inputValue(), '0.65')
  assert.equal(await page.getByRole('button', { name: 'Auto rotate · OFF' }).getAttribute('aria-pressed'), 'false')
  await page.locator('.chart-card').scrollIntoViewIfNeeded()
  await page.locator('.chart-card').screenshot({ path: '.local-preview/chart-desktop.png' })
  for (const tab of await page.locator('.range-tabs button').all()) {
    await tab.click()
    assert.equal(await page.locator('.chart-readouts > div').count(), 4)
  }
  for (const button of await page.locator('.curve-toggles button').all()) if (await button.getAttribute('aria-pressed') === 'true') await button.click()
  await page.locator('.empty-curves').waitFor()
  await page.locator('.curve-toggles button').first().click()
  await page.getByRole('tab', { name: 'FEKO', exact: true }).click()
  await page.getByRole('tabpanel').getByText('10,374 MoM 未知量').waitFor()
  assert.equal(await page.locator('tbody .minimum-status.boundary').count(), 2)
  await page.getByLabel('选择指标频段').selectOption('3')
  assert.equal(await page.locator('tbody .minimum-status.boundary').count(), 0)
  await page.reload()
  await page.locator('.case-source').waitFor()
  await page.getByRole('link', { name: '← Back to Case Studies' }).click()
  await page.locator('.case-feature').waitFor()
  await page.goBack()
  await page.locator('.case-source').waitFor()
  await page.goForward()
  await page.locator('.case-feature').waitFor()
  if (docsEnabled) {
    await page.getByRole('button', { name: 'Go to docs', exact: true }).click()
    await page.getByRole('button', { name: '复现案例', exact: true }).click()
    assert.equal(await page.locator('.article-row:visible').count(), 1)
    await page.locator('.article-row:visible').click()
  } else await page.locator('.case-feature').click()
  await page.locator('.case-source').waitFor()
  for (const [name, width, height] of [['tablet', 834, 1112], ['mobile', 390, 844], ['narrow', 320, 740]]) {
    await page.setViewportSize({ width, height })
    await page.locator('#cases').evaluate((el) => el.scrollTo(0, 0))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: document overflow`)
    assert(await page.locator('#cases').evaluate((el) => el.scrollWidth <= el.clientWidth), `${name}: panel overflow`)
    await page.screenshot({ path: `.local-preview/case-${name}.png` })
    await page.locator('.chart-card').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `.local-preview/chart-${name}.png` })
  }
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.getByRole('button', { name: 'Go to mcp', exact: true }).click()
    assert(await page.locator('.mcp-card-featured').evaluate((el) => el.scrollWidth <= el.clientWidth), `MCP card overflow at ${width}`)
    await page.locator('.mcp-card-featured').screenshot({ path: `.local-preview/mcp-${width}.png` })
  }
  if (docsEnabled) {
    await page.goto(`${url}/#/docs/hfss-automation-boundaries`)
    await page.locator('.article-detail').waitFor()
  } else {
    for (const hash of ['#docs', '#/docs', '#/docs/hfss-automation-boundaries']) {
      await page.goto(`${url}/${hash}`)
      await page.locator('#hero.panel-active').waitFor()
      assert.equal(await page.locator('#docs').count(), 0)
      assert.equal(await page.evaluate(() => location.hash), '#hero')
    }
    assert.equal(await page.locator('a[href^="#/docs"], a[href="#docs"], a[href="#paper2hfss"]').count(), 0)
  }
  await page.getByRole('button', { name: 'Go to demos', exact: true }).click()
  await page.locator('#demos canvas').waitFor()
  const staticFigure = await context.request.get(`${url}/cases/qr-grid-patch/s11-comparison.svg`)
  assert(staticFigure.ok(), 'Static scientific plot is missing')
  assert.match(await staticFigure.text(), /<svg/)
  assert.deepEqual(errors, [], 'Uncaught page errors')
  console.log('PASS: real Skill only, pinned ads-mcp, hidden section routes, sources, model controls, curves, metrics, history, responsive layout, static SVG; screenshots in .local-preview')
} finally { await browser.close() }
const fallbackBrowser = await chromium.launch({ executablePath, headless: true, args: ['--disable-webgl'] })
try {
  const fallbackPage = await fallbackBrowser.newPage()
  await fallbackPage.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes('webgl')) return null
      return getContext.call(this, type, ...args)
    }
  })
  await fallbackPage.goto(`${url}/#/cases/qr-grid-patch`)
  await fallbackPage.locator('.model-fallback').waitFor()
  assert(await fallbackPage.getByRole('button', { name: '俯视', exact: true }).isDisabled())
  assert(await fallbackPage.locator('.model-fallback svg').isVisible())
  console.log('PASS: WebGL-unavailable static fallback')
} finally { await fallbackBrowser.close() }
