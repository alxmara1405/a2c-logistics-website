// scripts/gen-og-image.mjs
//
// Generates public/og-image.jpg — the 1200×630 social-share preview image (INT-SEO-06).
// The absolute URL `ORIGIN + '/og-image.jpg'` is referenced by the Seo component default
// (Plan 04-03) and by localBusiness.image in src/seo/schema.js; this script supplies the
// actual file. Vite copies public/* verbatim to dist/ root.
//
// Branded composition: darkened truck photo + white A2C logo + tagline + driver-jobs line.
// Deterministic + re-runnable, but the committed public/og-image.jpg is the deliverable.
//
// Run: node scripts/gen-og-image.mjs

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const PHOTO = join(ROOT, 'public/assets/images/hero-truck.jpg')
const LOGO = join(ROOT, 'public/assets/images/A2C_Original_Primary_White.png')
const OUTPUT = join(ROOT, 'public/og-image.jpg')

const W = 1200
const H = 630
const LOGO_W = 400

// Dark overlay for legibility + brand feel, plus tagline / red accent / driver-jobs line.
const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#000000" stop-opacity="0.45"/>
      <stop offset="52%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.84"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="600" y="472" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="54">
    <tspan fill="#FFFFFF">Driven to be</tspan><tspan fill="#EF392C" dx="18">different.</tspan>
  </text>
  <rect x="500" y="498" width="200" height="4" rx="2" fill="#EF392C"/>
  <text x="600" y="552" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="25"
        letter-spacing="3" fill="#E6E6E6">CDL CLASS A DRIVER JOBS &#183; LINCOLN, NE</text>
</svg>`)

const logo = await sharp(LOGO).resize({ width: LOGO_W }).toBuffer()
const logoMeta = await sharp(logo).metadata()

await sharp(PHOTO)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 78, left: Math.round((W - logoMeta.width) / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUTPUT)

console.log(`og-image written: ${OUTPUT} (${W}x${H})`)
