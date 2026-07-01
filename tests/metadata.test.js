// tests/metadata.test.js
//
// Per-route metadata verification (INT-SEO-02 / INT-SEO-06) + copy cleanup (INT-UX-02).
// Sibling test file to tests/prerender.test.js — reads the built dist/**/index.html and
// asserts, across all 6 routes:
//   - each has a non-empty <title>, a <meta name="description">, and a self-referential
//     <link rel="canonical"> whose href is the absolute ORIGIN + route path
//   - all 6 <title> values are unique
//   - each carries og:title / og:description / og:image (absolute URL) + twitter:card
//   - dist/contact/index.html no longer contains the awkward "Q&A Form" heading
//
// ORIGIN must match src/seo/Seo.jsx (the two-URL rule: canonical/OG are absolute ORIGIN
// URLs, never BASE_URL-relative). If the deploy origin changes, update it in both places.
//
// Prereq: run `npm run build` first (vite build && node scripts/prerender.mjs) so dist/ exists.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'

// route path (as passed to <Seo path=...>) -> built file
const ROUTES = {
  '/': 'index.html',
  '/about': join('about', 'index.html'),
  '/services': join('services', 'index.html'),
  '/fleet': join('fleet', 'index.html'),
  '/drive-with-us': join('drive-with-us', 'index.html'),
  '/contact': join('contact', 'index.html'),
}

const read = (rel) => readFileSync(join(DIST, rel), 'utf8')

const getTitle = (html) => {
  const m = html.match(/<title>([^<]*)<\/title>/)
  return m ? m[1].trim() : null
}

// Pull the content of the first <meta> whose name/property attribute matches `key`.
const getMeta = (html, attr, key) => {
  const re = new RegExp(
    `<meta[^>]*${attr}="${key.replace(/[/]/g, '\\/')}"[^>]*content="([^"]*)"`,
    'i'
  )
  const m = html.match(re)
  // also handle the reverse attribute order (content before name/property)
  if (m) return m[1]
  const re2 = new RegExp(
    `<meta[^>]*content="([^"]*)"[^>]*${attr}="${key.replace(/[/]/g, '\\/')}"`,
    'i'
  )
  const m2 = html.match(re2)
  return m2 ? m2[1] : null
}

const getCanonical = (html) => {
  const m = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)
  return m ? m[1] : null
}

describe('INT-SEO-02/06: per-route metadata baked into static HTML', () => {
  for (const [path, rel] of Object.entries(ROUTES)) {
    const label = path === '/' ? '(home)' : path
    const html = read(rel)

    it(`${label} has a non-empty <title>`, () => {
      const title = getTitle(html)
      expect(title, `dist/${rel} missing <title>`).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
    })

    it(`${label} has a non-empty meta description`, () => {
      const desc = getMeta(html, 'name', 'description')
      expect(desc, `dist/${rel} missing meta description`).toBeTruthy()
      expect(desc.length).toBeGreaterThan(0)
    })

    it(`${label} has a self-referential absolute canonical`, () => {
      const canonical = getCanonical(html)
      expect(canonical, `dist/${rel} missing canonical`).toBeTruthy()
      expect(canonical).toBe(`${ORIGIN}${path}`)
    })

    it(`${label} carries og:title / og:description / absolute og:image`, () => {
      expect(getMeta(html, 'property', 'og:title'), `${label} missing og:title`).toBeTruthy()
      expect(
        getMeta(html, 'property', 'og:description'),
        `${label} missing og:description`
      ).toBeTruthy()
      const ogImage = getMeta(html, 'property', 'og:image')
      expect(ogImage, `${label} missing og:image`).toBeTruthy()
      expect(ogImage.startsWith('http'), `${label} og:image not absolute`).toBe(true)
    })

    it(`${label} carries twitter:card`, () => {
      expect(getMeta(html, 'name', 'twitter:card'), `${label} missing twitter:card`).toBeTruthy()
    })
  }

  it('all 6 route <title> values are unique', () => {
    const titles = Object.values(ROUTES).map((rel) => getTitle(read(rel)))
    expect(titles.every(Boolean), `a route is missing <title>: ${JSON.stringify(titles)}`).toBe(true)
    expect(new Set(titles).size, `titles not unique: ${JSON.stringify(titles)}`).toBe(6)
  })
})

describe('INT-UX-02: awkward "Q&A Form" heading removed', () => {
  it('dist/contact/index.html does NOT contain "Q&A Form"', () => {
    const html = read(join('contact', 'index.html'))
    expect(/Q&amp;A Form|Q&A Form/.test(html), 'Q&A Form heading still present').toBe(false)
  })
})
