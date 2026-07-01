// src/seo/Seo.jsx
// Per-route SEO metadata via React 19 native document metadata (<title>/<meta>/<link>).
// React 19 hoists these tags into <head> client-side; the Plan 04-01 puppeteer prerender
// snapshots the post-hydration DOM, baking them into the static HTML so crawlers and
// social scrapers (which do not run JS) see them.
//
// TWO URL RULES: canonical + OG/Twitter URLs are ABSOLUTE ORIGIN URLs, never
// `import.meta.env.BASE_URL`-relative (that pattern is only for runtime <img>/CSS assets).
// Relative OG image URLs are rejected by most scrapers — hence the absolute ORIGIN.

const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'

export default function Seo({ path, title, description, ogImage = '/og-image.jpg' }) {
  const url = `${ORIGIN}${path}` // path like '/drive-with-us' (home is '/')
  const img = `${ORIGIN}${ogImage}`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </>
  )
}

// JsonLd — inline <script type="application/ld+json"> for structured data. React 19
// renders it in place; Google reads JSON-LD anywhere in the document; puppeteer bakes it
// into the static HTML.
//
// SECURITY (T-04-03-XSS): dangerouslySetInnerHTML is SAFE here ONLY because `data` is a
// static, developer-authored constant from src/seo/schema.js (NAP, pay ranges). NEVER
// pass user/request/form/URL input to this component.
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
