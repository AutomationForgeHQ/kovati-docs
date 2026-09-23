import { source } from '@/lib/source'

/**
 * Two search indexes, because one of them grows without limit.
 *
 * The site exports to plain files, so search is a whole index downloaded into
 * the browser. That is a fine trade for a wiki — until the changelogs are in
 * it. Every release adds a page, releases never stop, and at the rate this
 * family ships the index would pass ten megabytes inside a year. A reader
 * looking up how garment fit works should not download four years of patch
 * notes to do it.
 *
 * So the prose index holds everything a person reads, and the changelog index
 * holds the release notes. The dialog fetches the second one only when the
 * reader asks for it, which most never will.
 *
 * The split is by URL rather than by a frontmatter flag on purpose: the
 * changelog pages are generated, and a generator that has to remember to set a
 * flag is a generator that will one day forget.
 */

const CHANGELOG_PREFIX = 'releases'

export type IndexEntry = {
  id: string
  title: string
  description?: string
  url: string
  structuredData: unknown
}

function entriesWhere(keep: (slugs: string[]) => boolean): IndexEntry[] {
  return source.getPages().reduce<IndexEntry[]>((acc, page) => {
    if (!keep(page.slugs)) return acc
    acc.push({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData: page.data.structuredData,
    })
    return acc
  }, [])
}

const isChangelog = (slugs: string[]) => slugs[0] === CHANGELOG_PREFIX

/** Everything a person reads. What the search box searches by default. */
export const proseIndex = () => entriesWhere((s) => !isChangelog(s))

/** Release notes only. Fetched when the reader switches to Changelogs. */
export const changelogIndex = () => entriesWhere(isChangelog)
