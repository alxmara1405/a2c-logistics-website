// tests/static-assets.test.js
//
// Crawl-discovery static assets (INT-SEO-05, INT-SEO-06). Asserts that Vite copied
// public/* verbatim into the dist/ ROOT during the build, so that GitHub Pages serves
// them at the site root:
//   dist/sitemap.xml  — 6 absolute base-path route URLs
//   dist/robots.txt   — references the sitemap
//   dist/og-image.jpg — 1200×630 social-share preview
//
// Prereq: run `npm run build` first (vite build && node scripts/prerender.mjs) so dist/
// exists. This suite reads the filesystem output, not a server. Sibling to
// prerender.test.js / structured-data.test.js — no edits to other test files.

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'

describe('INT-SEO-05: sitemap.xml + robots.txt land at the dist/ root', () => {
  it('dist/sitemap.xml exists', () => {
    expect(existsSync(join(DIST, 'sitemap.xml')), 'missing dist/sitemap.xml — run npm run build').toBe(true)
  })

  it('sitemap lists exactly 6 <loc> entries', () => {
    const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
    const count = (xml.match(/<loc>/g) || []).length
    expect(count, `expected 6 <loc> URLs, got ${count}`).toBe(6)
  })

  it('every sitemap URL is an absolute base-path ORIGIN URL (not BASE_URL-relative)', () => {
    const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toHaveLength(6)
    for (const url of locs) {
      expect(url.startsWith(`${ORIGIN}/`), `sitemap URL not absolute-ORIGIN: ${url}`).toBe(true)
    }
    // The 6 concrete routes from src/App.jsx.
    expect(locs).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/about`,
      `${ORIGIN}/services`,
      `${ORIGIN}/fleet`,
      `${ORIGIN}/drive-with-us`,
      `${ORIGIN}/contact`,
    ])
  })

  it('dist/robots.txt exists and references the sitemap', () => {
    expect(existsSync(join(DIST, 'robots.txt')), 'missing dist/robots.txt — run npm run build').toBe(true)
    const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8')
    expect(robots).toMatch(/Sitemap:.*sitemap\.xml/)
  })
})

describe('INT-SEO-06: og-image.jpg lands at the dist/ root', () => {
  it('dist/og-image.jpg exists', () => {
    expect(existsSync(join(DIST, 'og-image.jpg')), 'missing dist/og-image.jpg — run npm run build').toBe(true)
  })

  it('og-image is a non-trivial JPEG (> 1KB)', () => {
    const bytes = readFileSync(join(DIST, 'og-image.jpg')).length
    expect(bytes, `dist/og-image.jpg is suspiciously small (${bytes}B)`).toBeGreaterThan(1024)
  })
})
