// scripts/gen-og-image.mjs
//
// Generates public/og-image.jpg — the 1200×630 social-share preview image (INT-SEO-06).
// The absolute URL `ORIGIN + '/og-image.jpg'` is already referenced by the Seo component
// default (Plan 04-03) and by localBusiness.image in src/seo/schema.js; this script
// supplies the actual file. Vite copies public/* verbatim to dist/ root, so the image
// lands at the GitHub Pages root where crawlers/social scrapers fetch it.
//
// Deterministic: cover-crops an in-repo source photo to exactly 1200×630 at quality 80.
// Re-runnable, but the committed public/og-image.jpg is the deliverable.
//
// Run: node scripts/gen-og-image.mjs

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SOURCE = join(ROOT, 'public/assets/images/hero-truck.jpg')
const OUTPUT = join(ROOT, 'public/og-image.jpg')

const OG_WIDTH = 1200
const OG_HEIGHT = 630

await sharp(SOURCE)
  .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(OUTPUT)

console.log(`og-image written: ${OUTPUT} (${OG_WIDTH}x${OG_HEIGHT})`)
