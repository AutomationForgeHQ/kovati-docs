import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { site, counts } from '@/lib/site'

/**
 * The link preview card.
 *
 * Without one, a shared link is a line of grey text beside the domain — which
 * is exactly what docs.kovati.dev looked like next to kovati.dev's card the
 * day it launched. Generated rather than exported by hand, so it inherits the
 * palette and cannot go stale: the counts on it are read from the release
 * manifest at build.
 *
 * Satori draws this, not a browser. It supports a subset of CSS, no external
 * stylesheets and no fetching, so the layout is flat — flex, absolute colours,
 * and the mark inlined as a data URI.
 */
// A static export has no server to render this on request.
export const dynamic = 'force-static'

export const alt = `${site.name} — ${site.claim}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Satori refuses `dangerouslySetInnerHTML` and will not read a relative path,
 * so an <img> with the SVG base64'd into it is the one route that works.
 */
function markDataUri(): string {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'brand', 'kovati-mark.svg'), 'utf8')
    return `data:image/svg+xml;base64,${Buffer.from(raw).toString('base64')}`
  } catch {
    return ''
  }
}

export default function OpengraphImage() {
  const mark = markDataUri()
  const { plugins, versions, sets } = counts()

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
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {mark && <img src={mark} width={72} height={72} alt="" />}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontSize: 26, letterSpacing: 6, color: '#9098a5' }}>KOVATI</span>
            <span style={{ fontSize: 26, color: '#667486' }}>/</span>
            <span style={{ fontSize: 34, color: '#f1f0ec', fontWeight: 600 }}>Docs</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              color: '#f1f0ec',
              fontWeight: 700,
              letterSpacing: -1.5,
              maxWidth: 980,
              display: 'flex',
            }}
          >
            {site.claim}
          </div>
          <div style={{ fontSize: 30, color: '#9098a5', maxWidth: 940, display: 'flex' }}>
            Automation Forge for Unreal Engine 5.8 — every set, page by page.
          </div>
        </div>

        {/* Read from the manifest, so the card cannot overstate the product. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 24 }}>
          <span style={{ color: '#ebaa28' }}>
            {sets} sets · {plugins} plugins · {versions} released versions
          </span>
        </div>
      </div>
    ),
    size,
  )
}
