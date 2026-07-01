// scripts/prerender.mjs
//
// Post-build prerender (INT-SEO-01). Boots Vite's programmatic preview() server —
// which serves `dist/` UNDER the project base path `/a2c-logistics-website/` so that
// base-prefixed assets resolve correctly in headless Chrome — then drives puppeteer
// across all 6 routes and snapshots the fully-hydrated DOM (React 19 metadata hoist +
// any inline JSON-LD included) to FOLDER-FORM static HTML:
//   ''             -> dist/index.html
//   'about'        -> dist/about/index.html   ... etc.
//
// Folder form is mandatory: GitHub Pages serves dist/<route>/index.html directly for
// deep links, so the SPA 404->?/ redirect hack is never triggered for known routes.
//
// Exit behavior:
//   - Any ROUTE that fails to render => exit non-zero (CI build must fail loudly).
//   - If Chromium cannot LAUNCH and we are NOT in CI => warn + exit 0 (local-only skip),
//     because the authoritative prerender runs in GitHub Actions. In CI a launch
//     failure is fatal (exit non-zero) so the deploy never ships an empty #root shell.

import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const BASE = '/a2c-logistics-website/'
const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website' // must match src/seo/Seo.jsx
const ROUTES = ['', 'about', 'services', 'fleet', 'drive-with-us', 'contact']
const SETTLE_MS = 250 // let React 19 metadata hoist + JSON-LD land in the DOM
const IS_CI = process.env.CI === 'true' || process.env.CI === '1'

// Boot the preview server first; this is unrelated to Chromium and must always work.
const server = await preview({ preview: { port: 4173 } }) // serves dist under BASE
const origin = server.resolvedUrls.local[0].replace(/\/$/, '') // .../a2c-logistics-website

async function closeServer() {
  await new Promise((resolve) => server.httpServer.close(resolve))
}

let browser
try {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
} catch (err) {
  await closeServer()
  if (IS_CI) {
    console.error('[prerender] FATAL: Chromium failed to launch in CI:', err.message)
    process.exit(1)
  }
  console.warn(
    '[prerender] WARNING: Chromium could not launch locally (' +
      err.message +
      ').\n' +
      '[prerender] Skipping prerender for THIS LOCAL build only. The authoritative\n' +
      '[prerender] prerender runs in GitHub Actions CI (ubuntu-latest has the libs).\n' +
      '[prerender] dist/ will contain the un-prerendered SPA shell until then.',
  )
  process.exit(0)
}

const failures = []
// Snapshots are collected in-memory and written ONLY after the whole loop finishes.
// Writing mid-loop would overwrite dist/index.html with the home snapshot; every later
// deep-link route then falls back (vite preview SPA fallback) to that mutated index.html
// and inherits Home's <title>/description/canonical/OG — producing duplicate, conflicting
// metadata in each deep-link's static HTML. Deferring writes keeps the SPA fallback pinned
// to the pristine vite-built shell for every route.
const snapshots = []

for (const route of ROUTES) {
  const page = await browser.newPage()
  const assetErrors = []

  // Surface base-path / asset 404s so a broken preview mount fails loudly.
  page.on('response', (res) => {
    const status = res.status()
    if (status >= 400) assetErrors.push(`${status} ${res.url()}`)
  })
  page.on('requestfailed', (req) => {
    assetErrors.push(`FAILED ${req.failure()?.errorText ?? ''} ${req.url()}`)
  })

  try {
    const url = `${origin}/${route}`
    // Route path exactly as passed to <Seo path=...> (home is '/', others '/<route>').
    const expectedUrl = `${ORIGIN}/${route}`
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.waitForSelector('main h1', { timeout: 15000 })
    await new Promise((r) => setTimeout(r, SETTLE_MS))

    // Sanitize <head> before snapshotting: the served SPA shell contributes its own static
    // <title>/description, and React 19 hoists the route's tags alongside them (it appends,
    // it does not replace). Keep exactly ONE authoritative value per metadata slot:
    //   - canonical / og:url  -> the element matching this route's absolute ORIGIN+path
    //   - <title> / og:title  -> the live document.title (the value React set for this route)
    //   - meta description    -> the element whose content matches the route's og:description
    // This makes each route's static HTML carry a single, self-consistent metadata set.
    const html =
      '<!doctype html>\n' +
      (await page.evaluate((expectedUrl) => {
        const head = document.head
        const keepOne = (nodes, keeper) =>
          nodes.forEach((n) => {
            if (keeper && n !== keeper) n.remove()
          })

        const canon = [...head.querySelectorAll('link[rel="canonical"]')]
        keepOne(canon, canon.find((l) => l.getAttribute('href') === expectedUrl) || canon[0])

        const ogUrl = [...head.querySelectorAll('meta[property="og:url"]')]
        keepOne(ogUrl, ogUrl.find((m) => m.getAttribute('content') === expectedUrl) || ogUrl[0])

        const activeTitle = document.title
        const titles = [...head.querySelectorAll('title')]
        keepOne(titles, titles.find((t) => t.textContent === activeTitle) || titles[0])

        const ogTitles = [...head.querySelectorAll('meta[property="og:title"]')]
        keepOne(ogTitles, ogTitles.find((m) => m.getAttribute('content') === activeTitle) || ogTitles[0])

        const ogDescEl = head.querySelector('meta[property="og:description"]')
        const activeDesc = ogDescEl && ogDescEl.getAttribute('content')
        const descs = [...head.querySelectorAll('meta[name="description"]')]
        if (descs.length > 1) {
          keepOne(descs, descs.find((m) => m.getAttribute('content') === activeDesc) || descs[0])
        }

        return document.documentElement.outerHTML
      }, expectedUrl))

    const outPath = route ? join('dist', route, 'index.html') : join('dist', 'index.html')
    snapshots.push({ route, outPath, html })

    if (assetErrors.length) {
      console.warn(
        `[prerender] WARNING: ${route || '(home)'} produced ${assetErrors.length} sub-resource error(s):\n  - ` +
          assetErrors.join('\n  - '),
      )
    }
    console.log(`[prerender] ✓ /${route} rendered (${html.length} bytes)`)
  } catch (err) {
    failures.push({ route: route || '(home)', message: err.message })
    console.error(`[prerender] ✗ /${route} failed: ${err.message}`)
  } finally {
    await page.close()
  }
}

await browser.close()
await closeServer()

// All routes captured from the pristine shell — now flush snapshots to disk.
for (const { route, outPath, html } of snapshots) {
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, html, 'utf8')
  console.log(`[prerender] ✓ /${route} -> ${outPath}`)
}

if (failures.length) {
  console.error(`[prerender] FAILED: ${failures.length}/${ROUTES.length} route(s) did not render.`)
  process.exit(1)
}

console.log(`[prerender] Done — ${ROUTES.length} routes snapshot to folder-form HTML.`)
process.exit(0)
