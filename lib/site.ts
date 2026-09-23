import { manifest } from '@/lib/manifest'

/**
 * The wiki's own facts, in one place.
 *
 * Small on purpose. Everything about *plugins* is read from the manifest and
 * belongs in `lib/manifest.ts`; this is only the things the site itself needs
 * to say about itself — its address, its name, and how it is measured.
 */

const DOMAIN = 'docs.kovati.dev'

/**
 * The same GA4 property as kovati.dev, on purpose.
 *
 * One property with two hostnames beats two properties nobody compares. GA4
 * carries `hostname` on every event, so "the wiki" and "the marketing site"
 * are a filter rather than a second login — and a reader crossing from one to
 * the other stays one session rather than becoming two.
 *
 * Null switches analytics off entirely: no script, no banner. That is what a
 * preview or a fork should be. The id is public by design; it ships in the
 * page.
 */
const GA_MEASUREMENT_ID: string | null = 'G-Z7CV3TTGEK'

export const site = {
  name: 'Kovati Docs',
  url: `https://${DOMAIN}`,
  domain: DOMAIN,

  /** The marketing site, the account, and the source. */
  www: 'https://kovati.dev',
  app: 'https://app.kovati.dev',
  repo: 'https://github.com/AutomationForgeHQ/kovati-docs',

  description:
    'Documentation for Automation Forge, the Kovati tools, and the PlayableOps discipline behind them.',

  /** What the share card says. Short enough to read at card size. */
  claim: 'Written against the source, not from memory.',

  analytics: { ga4: GA_MEASUREMENT_ID },

  /**
   * The consent key is deliberately the same string kovati.dev uses, even
   * though `localStorage` is per-origin and the two can never share it. If the
   * sites are ever served from one origin, the answer carries over instead of
   * being asked twice; until then it costs nothing and documents the intent.
   */
  consentKey: 'af.consent.v1',
} as const

/** Counts for the share card, derived rather than typed. */
export function counts() {
  const plugins = manifest.plugins.length
  const versions = manifest.plugins.reduce(
    (n, p) => n + p.versions.filter((v) => v.channel === 'stable').length,
    0,
  )
  return { plugins, versions, sets: manifest.sets.length }
}
