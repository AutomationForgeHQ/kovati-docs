import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'

/**
 * A static search index.
 *
 * The site exports to plain files, so there is no server to answer a query at
 * request time. `staticGET` writes the whole index out at build; the browser
 * downloads it once and searches locally. That costs the reader a one-off
 * download and costs us nothing to operate — which is the same trade the
 * manifesto makes about plugins that run on your own machine.
 *
 * If the index ever gets large enough to be felt on a slow connection, the
 * answer is a hosted index (Orama Cloud or Algolia), not a server.
 */
export const revalidate = false

export const { staticGET: GET } = createFromSource(source)
