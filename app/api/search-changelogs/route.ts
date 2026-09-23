import { createSearchAPI } from 'fumadocs-core/search/server'
import { changelogIndex } from '@/lib/search-index'

/**
 * The release notes, as their own index.
 *
 * Separate from the prose index for one reason: this one has no ceiling. Every
 * release adds to it and nothing ever leaves, so bundling it with the pages
 * people actually read would make every reader pay for history they did not
 * ask for.
 *
 * Fetched only when somebody switches the search dialog to Changelogs.
 */
export const revalidate = false

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: changelogIndex() as never,
})
