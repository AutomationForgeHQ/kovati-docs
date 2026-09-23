import { createSearchAPI } from 'fumadocs-core/search/server'
import { proseIndex } from '@/lib/search-index'

/**
 * A static search index, minus the changelogs.
 *
 * The site exports to plain files, so there is no server to answer a query at
 * request time. `staticGET` writes the whole index out at build; the browser
 * downloads it once and searches locally. That costs the reader a one-off
 * download and costs us nothing to operate — which is the same trade the
 * manifesto makes about plugins that run on your own machine.
 *
 * Release notes are deliberately not in here. They have their own index at
 * `/api/search-changelogs`, because they grow with every release and this one
 * must not. See `lib/search-index.ts`.
 *
 * If this index ever gets large enough to be felt on a slow connection, the
 * answer is a hosted index (Orama Cloud or Algolia), not a server.
 */
export const revalidate = false

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: proseIndex() as never,
})
