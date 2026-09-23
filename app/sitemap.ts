import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

/**
 * Every page, from the same loader the sidebar is built from.
 *
 * Listing routes by hand would mean a file that is wrong the first time
 * somebody adds a page — and a third of this site is generated, so it would be
 * wrong within a day. The changelog pages are included: they are the reason
 * somebody searching "which version fixed X" should land here rather than on a
 * GitHub release.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${site.url}${page.url}`,
    changeFrequency: 'weekly' as const,
    // A changelog page moves when its plugin releases; a prose page when it is
    // rewritten. Neither is worth a fake `lastModified` we cannot substantiate.
    priority: page.slugs[0] === 'releases' ? 0.5 : 0.8,
  }))

  return [{ url: site.url, changeFrequency: 'weekly', priority: 1 }, ...pages]
}
