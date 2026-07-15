// tests/structured-data.test.js
//
// Structured-data + NAP verification (INT-SEO-03 / INT-SEO-04). Sibling test file to
// tests/prerender.test.js — reads the built dist/**/index.html plus the NAP source files
// and asserts:
//   - /drive-with-us carries a valid JobPosting JSON-LD with Google-required keys
//   - home carries an Organization/LocalBusiness JSON-LD (name === 'A2C Logistics CO.')
//   - the address-block NAP (street/locality/region/phone) is byte-identical across
//     Contact.jsx (the single-source-of-truth) and Footer.jsx
//   - the business name is byte-identical across Footer.jsx and schema.js
//
// NAP field ownership note: src/pages/Contact.jsx `contactInfo` is the source-of-truth for
// street/locality/region/phone/email/hours but does NOT carry the business NAME string.
// The canonical business-name source is src/seo/schema.js (localBusiness.name), which the
// Footer NAP block copies. Contact.jsx is out of this plan's edit scope, so the name is
// asserted against Footer + schema (its real owners) rather than forced into Contact.jsx.
//
// Prereq: run `npm run build` first (vite build && node scripts/prerender.mjs) so dist/ exists.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'

// Pull every <script type="application/ld+json"> payload out of an HTML string and parse it.
// JSON.parse throws on a malformed payload, which correctly fails the test.
function extractJsonLd(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  const out = []
  let m
  while ((m = re.exec(html)) !== null) {
    out.push(JSON.parse(m[1]))
  }
  return out
}

const typeList = (t) => (Array.isArray(t) ? t : [t])

describe('INT-SEO-03: JobPosting JSON-LD baked into /drive-with-us', () => {
  const html = readFileSync(join(DIST, 'drive-with-us', 'index.html'), 'utf8')
  const blocks = extractJsonLd(html)
  const job = blocks.find((b) => typeList(b['@type']).includes('JobPosting'))

  it('exposes a parseable JobPosting block', () => {
    expect(job, 'no JobPosting JSON-LD found in dist/drive-with-us/index.html').toBeTruthy()
  })

  it('carries all Google-required JobPosting keys', () => {
    expect(job.title, 'JobPosting.title missing').toBeTruthy()
    expect(job.description, 'JobPosting.description missing').toBeTruthy()
    expect(job.datePosted, 'JobPosting.datePosted missing').toBeTruthy()
    expect(job.hiringOrganization, 'JobPosting.hiringOrganization missing').toBeTruthy()
    expect(
      job.jobLocation?.address?.addressCountry,
      'JobPosting.jobLocation.address.addressCountry missing'
    ).toBeTruthy()
  })
})

describe('INT-SEO-04: Organization/LocalBusiness JSON-LD baked into home', () => {
  const html = readFileSync(join(DIST, 'index.html'), 'utf8')
  const blocks = extractJsonLd(html)
  const biz = blocks.find((b) =>
    typeList(b['@type']).some((t) => t === 'Organization' || t === 'LocalBusiness')
  )

  it('exposes a parseable Organization/LocalBusiness block', () => {
    expect(biz, 'no Organization/LocalBusiness JSON-LD found in dist/index.html').toBeTruthy()
  })

  it('names the business exactly "A2C Logistics CO."', () => {
    expect(biz.name).toBe('A2C Logistics CO.')
  })
})

describe('INT-SEO-04: NAP byte-equality across source files', () => {
  const contact = readFileSync(join('src', 'pages', 'Contact.jsx'), 'utf8')
  const footer = readFileSync(join('src', 'components', 'layout', 'Footer.jsx'), 'utf8')
  const schema = readFileSync(join('src', 'seo', 'schema.js'), 'utf8')

  // Address-block NAP owned by Contact.jsx contactInfo — must match byte-for-byte in the Footer.
  const ADDRESS_NAP = ['5950 Colfax Avenue', 'Lincoln', 'NE', '(833) 562-3222']
  for (const s of ADDRESS_NAP) {
    it(`"${s}" is byte-identical in Contact.jsx and Footer.jsx`, () => {
      expect(contact.includes(s), `Contact.jsx missing NAP token: ${s}`).toBe(true)
      expect(footer.includes(s), `Footer.jsx missing NAP token: ${s}`).toBe(true)
    })
  }

  // Business name owned by schema.js (localBusiness.name) — must match byte-for-byte in the Footer.
  it('"A2C Logistics CO." is byte-identical in Footer.jsx and schema.js', () => {
    expect(footer.includes('A2C Logistics CO.'), 'Footer.jsx missing business name').toBe(true)
    expect(schema.includes('A2C Logistics CO.'), 'schema.js missing business name').toBe(true)
  })
})
