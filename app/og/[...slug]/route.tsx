import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { source } from '@/lib/source'
import { site } from '@/lib/site'

/**
 * A share card per page, carrying that page's own title.
 *
 * Pages here are shared individually far more often than the site is — a link
 * to the garment pipeline or to one plugin's changelog, dropped into a thread.
 * One site-wide card would make every one of those look identical, which is
 * barely better than the grey text it replaces.
 *
 * Why this is a route and not `opengraph-image.tsx` beside the page: Next
 * refuses a metadata file underneath an *optional* catch-all — "optional
 * catch-all must be the last part of the URL" — and `/docs/[[...slug]]` is
 * exactly that, because it also serves `/docs` itself.
 *
 * Why the path ends in `.png`: on a static export there is no server to honour
 * the `Content-Type` this handler sets. Firebase serves the emitted file from
 * disk and infers its type from the extension, so an extensionless card would
 * reach a social scraper as `application/octet-stream` and render as nothing.
 */
export const dynamic = 'force-static'

const size = { width: 1200, height: 630 }

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: [...(page.slugs.length ? page.slugs : ['index'])].map((s, i, a) =>
      i === a.length - 1 ? `${s}.png` : s,
    ),
  }))
}

function markDataUri(): string {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'brand', 'kovati-mark.svg'), 'utf8')
    return `data:image/svg+xml;base64,${Buffer.from(raw).toString('base64')}`
  } catch {
    return ''
  }
}

/** The line above the title, so a card says where in the wiki it came from. */
const SECTION: Record<string, string> = {
  'automation-forge': 'Automation Forge',
  releases: 'Changelogs',
  company: 'Company',
  tools: 'Tools',
}

export async function GET(_req: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params
  const parts = slug.map((s, i, a) => (i === a.length - 1 ? s.replace(/\.png$/, '') : s))
  const lookup = parts.length === 1 && parts[0] === 'index' ? [] : parts

  const page = source.getPage(lookup)
  const title = page?.data.title ?? site.name
  const description = page?.data.description ?? site.description
  const section = SECTION[lookup[0] ?? ''] ?? 'Documentation'

  // Long titles have to shrink, or they wrap into the description.
  const titleSize = title.length > 34 ? 62 : title.length > 22 ? 74 : 86
  const mark = markDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08090a',
          padding: '68px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {mark && <img src={mark} width={60} height={60} alt="" />}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 23, letterSpacing: 6, color: '#9098a5' }}>KOVATI</span>
            <span style={{ fontSize: 23, color: '#667486' }}>/</span>
            <span style={{ fontSize: 23, letterSpacing: 2, color: '#9098a5' }}>
              {section.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: titleSize,
              lineHeight: 1.06,
              color: '#f1f0ec',
              fontWeight: 700,
              letterSpacing: -1.5,
              maxWidth: 1000,
              display: 'flex',
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 29,
                lineHeight: 1.3,
                color: '#9098a5',
                maxWidth: 960,
                display: 'flex',
              }}
            >
              {description.length > 140 ? `${description.slice(0, 137)}…` : description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 23 }}>
          <span style={{ color: '#ebaa28' }}>{site.domain}</span>
        </div>
      </div>
    ),
    size,
  )
}
