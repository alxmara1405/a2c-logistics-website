// src/seo/schema.js
// Structured-data (schema.org JSON-LD) builders for the A2C Logistics site.
//
// TWO URL RULES — every crawler-facing URL in this module is an ABSOLUTE ORIGIN URL,
// never an `import.meta.env.BASE_URL`-relative path (that pattern is only for runtime
// <img>/CSS assets). Canonical/OG/JSON-LD logo+url must be fully origin-qualified.
//
// NAP single-source-of-truth = src/pages/Contact.jsx `contactInfo` (lines 10-15).
// The strings below are byte-identical to that source (INT-SEO-04):
//   name 'A2C Logistics CO.' · street '5950 Colfax Avenue' · locality 'Lincoln' · region 'NE' · ZIP '68507'
//   phone '(833) 562-3222' -> telephone '+1-833-562-3222' · email 'kevin@a2clogisticsco.com'
//   hours 'Mon–Fri: 8AM–6PM' -> openingHours 'Mo-Fr 08:00-18:00'
//
// SECURITY (T-04-03-XSS): every value here is a static, developer-authored constant.
// These objects are JSON.stringify-ed and injected via dangerouslySetInnerHTML (see the
// JsonLd helper in Seo.jsx). NEVER interpolate user/request/form/URL input into them.

const ORIGIN = 'https://truckinga2c.com'

// datePosted = build date; validThrough = build date + 90 days. Both freeze at build
// time on a static host. A scheduled monthly CI rebuild (GH Actions cron) rolls them
// forward so Google for Jobs never sees an expired validThrough (Pitfall 3 / T-04-03-stale).
const _now = new Date()
const _validThrough = new Date(_now.getTime() + 90 * 864e5)
const datePosted = _now.toISOString().slice(0, 10)
const validThrough = _validThrough.toISOString().slice(0, 10)

export const jobPosting = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'CDL Class A Truck Driver Jobs — Lincoln, NE (Company & Owner-Operator)',
  // description is REQUIRED by Google and must be HTML.
  description:
    '<p>A2C Logistics CO. — a driver-first trucking company based in Lincoln, NE — ' +
    'is hiring <strong>Class A CDL truck drivers</strong> for both company (W-2) and ' +
    'owner-operator (lease-on) positions. Steady miles, real dispatch support, and ' +
    'consistent home time you can count on.</p>' +
    '<ul><li>Valid Class A CDL</li><li>Minimum 2 years CDL Class A experience</li>' +
    '<li>Clean driving record</li><li>Pass DOT physical and drug screening</li></ul>',
  datePosted, // REQUIRED, ISO 8601 (build date)
  validThrough, // RECOMMENDED (build date + 90d; monthly rebuild rolls it forward)
  employmentType: ['FULL_TIME', 'CONTRACTOR'], // FULL_TIME=company, CONTRACTOR=owner-op
  hiringOrganization: {
    // REQUIRED
    '@type': 'Organization',
    name: 'A2C Logistics CO.',
    sameAs: ORIGIN,
    logo: `${ORIGIN}/assets/images/A2C_Original_Primary_Color.png`,
  },
  jobLocation: {
    // REQUIRED for non-remote roles
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '5950 Colfax Avenue',
      addressLocality: 'Lincoln',
      addressRegion: 'NE',
      postalCode: '68507',
      addressCountry: 'US', // REQUIRED inside the address
    },
  },
  // baseSalary intentionally OMITTED — A2C is not publishing pay figures on the site.
  // Google allows JobPosting without baseSalary (it's recommended, not required).
  identifier: {
    '@type': 'PropertyValue',
    name: 'A2C Logistics CO.',
    value: 'a2c-cdl-driver',
  },
}

export const localBusiness = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'], // trucking co. — LocalBusiness for NAP / local SEO
  name: 'A2C Logistics CO.',
  url: ORIGIN,
  logo: `${ORIGIN}/assets/images/A2C_Original_Primary_Color.png`,
  image: `${ORIGIN}/og-image.jpg`,
  telephone: '+1-833-562-3222',
  email: 'kevin@a2clogisticsco.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5950 Colfax Avenue',
    addressLocality: 'Lincoln',
    addressRegion: 'NE',
    postalCode: '68507',
    addressCountry: 'US',
  },
  openingHours: 'Mo-Fr 08:00-18:00', // Mon–Fri 8AM–6PM per NAP
}
