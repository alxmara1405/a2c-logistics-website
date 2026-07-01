// tests/prerender.test.js
//
// Wave 0 prerender scaffold (INT-SEO-01). Reads the built dist/<route>/index.html
// files and asserts each route was snapshotted to REAL static HTML — not an empty
// `#root` shell. Later Phase 4 plans add sibling test files (metadata, JSON-LD, NAP)
// that assert against these same built files.
//
// Prereq: run `npm run build` first (vite build && node scripts/prerender.mjs) so
// dist/ exists. This suite intentionally reads the filesystem output, not a server.

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// route slug -> built file (home is dist/index.html; others are folder-form)
const ROUTES = {
  '': 'index.html',
  about: join('about', 'index.html'),
  services: join('services', 'index.html'),
  fleet: join('fleet', 'index.html'),
  'drive-with-us': join('drive-with-us', 'index.html'),
  contact: join('contact', 'index.html'),
}

const DIST = 'dist'
const read = (rel) => readFileSync(join(DIST, rel), 'utf8')

// Matches the empty-shell signature Vite emits: <div id="root"></div><script ...>
const EMPTY_ROOT = /<div id="root"><\/div>\s*<script/

describe('INT-SEO-01: every route is prerendered to real static HTML', () => {
  for (const [slug, rel] of Object.entries(ROUTES)) {
    const label = slug === '' ? '(home)' : `/${slug}`

    it(`${label} → dist/${rel} exists`, () => {
      expect(existsSync(join(DIST, rel)), `missing dist/${rel} — run npm run build`).toBe(true)
    })

    it(`${label} is NOT an empty #root shell`, () => {
      const html = read(rel)
      expect(EMPTY_ROOT.test(html), `dist/${rel} still contains an empty #root shell`).toBe(false)
    })

    it(`${label} contains rendered <main> and an <h1>`, () => {
      const html = read(rel)
      expect(html).toMatch(/<main/)
      expect(html).toMatch(/<h1/)
    })
  }

  it('home contains hero / driver-facing body copy (not just chrome)', () => {
    const html = read('index.html').toLowerCase()
    // Home hero speaks to drivers ("driven to be different." tagline / driver copy)
    expect(html).toMatch(/driven to be different|driver/)
  })

  it('drive-with-us contains its "Drive With" recruiting copy', () => {
    const html = read(join('drive-with-us', 'index.html'))
    expect(html).toMatch(/Drive With/)
  })

  it('each route file is substantial (> 1KB), i.e. real content not a stub', () => {
    for (const rel of Object.values(ROUTES)) {
      const bytes = Buffer.byteLength(read(rel), 'utf8')
      expect(bytes, `dist/${rel} is suspiciously small (${bytes}B)`).toBeGreaterThan(1024)
    }
  })
})
