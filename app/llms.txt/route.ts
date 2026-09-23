import { source } from '@/lib/source'
import { site, counts } from '@/lib/site'
import { manifest } from '@/lib/manifest'

// A static export emits this as a file rather than resolving it per request.
export const dynamic = 'force-static'

/**
 * /llms.txt — the wiki as an index a model can read in one request.
 *
 * The convention (llmstxt.org) is young and nobody is obliged to honour it.
 * It is here for a reason particular to this product: we sell an agent-native
 * suite, and an assistant asked "how do I fit a garment to a character in
 * Unreal?" should be able to find the page without crawling ninety-seven of
 * them. Documentation agents cannot read would be an odd thing for us to ship.
 *
 * An index, not the text. `/llms-full.txt` is the whole corpus for anything
 * that wants it; this one stays small enough to be worth fetching first.
 *
 * Generated from the same loader the sidebar is built from, so it cannot list
 * a page that does not exist or miss one that does.
 */

const SECTIONS: Array<{ slug: string; title: string; blurb: string }> = [
  {
    slug: 'automation-forge',
    title: 'Automation Forge',
    blurb: 'The plugin family: motion, mesh, speech, face, performance, montage and surface.',
  },
  { slug: 'tools', title: 'Tools', blurb: 'Utilities that are not part of a Forge set.' },
  { slug: 'company', title: 'Company', blurb: 'PlayableOps, the manifesto, and how the work is organised.' },
  {
    slug: 'releases',
    title: 'Changelogs',
    blurb: 'Every released version of every plugin, one page per plugin.',
  },
]

export function GET() {
  const pages = source.getPages()
  const { plugins, versions, sets } = counts()

  const byRoot = new Map<string, typeof pages>()
  for (const page of pages) {
    const root = page.slugs[0] ?? ''
    const list = byRoot.get(root)
    if (list) list.push(page)
    else byRoot.set(root, [page])
  }

  const section = (slug: string, title: string, blurb: string) => {
    const list = (byRoot.get(slug) ?? []).slice().sort((a, b) => a.url.localeCompare(b.url))
    if (list.length === 0) return ''
    const lines = list.map((p) => {
      const desc = p.data.description ? `: ${p.data.description}` : ''
      return `- [${p.data.title}](${site.url}${p.url})${desc}`
    })
    return `## ${title}\n\n${blurb}\n\n${lines.join('\n')}\n`
  }

  const body = `# ${site.name}

> ${site.description}

${site.claim} Every page states how far to trust it: *documented in depth* means
written against the code and used in production, *overview* means what it is and
what it does. No page contains a hand-typed version number, date or file size —
those are read from the release manifest CI generates from the git tags and the
published releases, so this wiki cannot disagree with what shipped.

Scope today: ${sets} sets, ${plugins} plugins, ${versions} released versions.

The software documented here is a family of Unreal Engine 5.8 **editor**
plugins. Nothing from Automation Forge ships inside a packaged game.

Two terms are used throughout and are not general industry vocabulary:

- **Graduation** — the moment automation stops owning a target. When a person
  records the final voice, hand-fixes the motion or rebuilds a mesh, that result
  is marked owned and no pipeline overwrites it again.
- **PlayableOps** — the discipline of turning creative intent into content that
  is playable, reviewable, traceable and replaceable.

${SECTIONS.map((s) => section(s.slug, s.title, s.blurb)).filter(Boolean).join('\n')}
## Elsewhere

- [The full text of this wiki](${site.url}/llms-full.txt): every page as one document.
- [kovati.dev](${site.www}): the product site, the whitepaper and the downloads.
- [The account app](${site.app}): where plugins are added and bought.
- [Source of this wiki](${site.repo}).

-- Generated ${manifest.generatedAt.slice(0, 10)} from the release manifest.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
