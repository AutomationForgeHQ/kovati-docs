import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { source } from '@/lib/source'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

/**
 * /llms-full.txt — every page as one document.
 *
 * The companion to `/llms.txt`: that one is an index worth fetching first,
 * this one is the corpus for anything that would rather hold the whole thing
 * than make ninety-seven requests.
 *
 * Read from the MDX on disk rather than from the rendered HTML. The source is
 * already Markdown, which is what the reader wants, and going through the DOM
 * would mean stripping navigation, sidebars and a table of contents back out
 * of every page.
 *
 * The cleaning below is deliberately conservative. A `<Shot>`'s `alt` is a
 * careful description of a screenshot somebody cannot see, which is exactly
 * what a model wants and exactly what a naive JSX strip would throw away.
 */

/** Turn one MDX file into something worth reading as plain text. */
function clean(mdx: string): string {
  let out = mdx

  // Frontmatter is carried separately, as a heading and a description.
  out = out.replace(/^---\n[\s\S]*?\n---\n/, '')

  // The generated changelog pages carry a note meant for whoever edits them.
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  // A screenshot becomes its description. The alt text is the only part a
  // reader without eyes can use, and it was written for exactly that job.
  out = out.replace(/<Shot\b[\s\S]*?\/>/g, (tag) => {
    const alt = /alt="([^"]*)"/.exec(tag)?.[1]
    const caption = /caption="([^"]*)"/.exec(tag)?.[1]
    const parts = [alt && `Screenshot: ${alt}`, caption].filter(Boolean)
    return parts.length ? `\n> ${parts.join(' — ')}\n` : ''
  })

  // A video becomes its title rather than an embed nobody can play.
  out = out.replace(/<YouTube\b[\s\S]*?\/>/g, (tag) => {
    const id = /id="([^"]*)"/.exec(tag)?.[1]
    const title = /title="([^"]*)"/.exec(tag)?.[1]
    return id ? `\n> Video: ${title ?? id} — https://youtu.be/${id}\n` : ''
  })

  // Callouts are prose with an emphasis. Keep the prose, mark the emphasis.
  out = out.replace(/<Callout\s+type="warn"[^>]*>/g, '\n**Warning:**\n')
  out = out.replace(/<Callout[^>]*>/g, '\n**Note:**\n')
  out = out.replace(/<\/Callout>/g, '\n')

  // Steps and Cards are layout. Their contents are the content.
  out = out.replace(/<\/?(Steps|Step|Cards|Tabs|Tab|Files|Folder|Accordions|Accordion)[^>]*>/g, '')

  // A Card is a link with a description; keep both.
  out = out.replace(/<Card\s+title="([^"]*)"\s+href="([^"]*)"\s+description="([^"]*)"\s*\/>/g,
    (_m, t, h, d) => `- [${t}](${h.startsWith('http') ? h : site.url + h}): ${d}`)

  // These read the manifest at render time; say so rather than leaving a tag.
  out = out.replace(/<SetMembers\s+set="([^"]*)"\s*\/>/g,
    (_m, s) => `_(The ${s} set's members, versions and licence tiers are listed at ${site.url}/docs/releases.)_`)
  out = out.replace(/<ReleaseNotes[^>]*\/>/g,
    `_(Recent releases. Full history per plugin at ${site.url}/docs/releases.)_`)
  out = out.replace(/<DistributionTable\s*\/>/g,
    `_(Every plugin by licence tier, at ${site.url}/docs/automation-forge/distribution.)_`)
  out = out.replace(/<PluginVersion[^>]*\/>/g, '')

  // Anything else self-closing that survived is layout we do not need.
  out = out.replace(/<[A-Z][\w.]*\b[^>]*\/>/g, '')

  // Relative links are meaningless in a file somebody fetched on its own.
  out = out.replace(/\]\((\/[^)]*)\)/g, (_m, href) => `](${site.url}${href})`)

  return out.replace(/\n{3,}/g, '\n\n').trim()
}

export function GET() {
  const pages = source
    .getPages()
    .slice()
    .sort((a, b) => a.url.localeCompare(b.url))

  const parts: string[] = [
    `# ${site.name} — full text`,
    '',
    `> ${site.description}`,
    '',
    `Every page of ${site.domain} as one document, newest build. The index, if you`,
    `would rather fetch pages individually, is at ${site.url}/llms.txt.`,
    '',
    'Screenshots appear as their alt text, which was written to describe them to',
    'somebody who cannot see them. Videos appear as a title and a link.',
    '',
    '---',
    '',
  ]

  for (const page of pages) {
    let body = ''
    try {
      // `page.absolutePath` is the MDX this route was generated from.
      const file = (page.data as { _file?: { absolutePath?: string } })._file?.absolutePath
      const path = file ?? join(process.cwd(), 'content', 'docs', `${page.slugs.join('/') || 'index'}.mdx`)
      body = clean(readFileSync(path, 'utf8'))
    } catch {
      // A page whose source cannot be read still belongs in the index, with
      // its title and its link, rather than vanishing without explanation.
      body = '_(Source unavailable at build; read this page on the site.)_'
    }

    parts.push(
      `# ${page.data.title}`,
      '',
      page.data.description ? `> ${page.data.description}` : '',
      '',
      `Source: ${site.url}${page.url}`,
      '',
      body,
      '',
      '---',
      '',
    )
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
