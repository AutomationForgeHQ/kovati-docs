import { docs } from '@/.source/server'
import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'

/**
 * The whole wiki is one collection under `/docs`, split into *roots* — a
 * `meta.json` carrying `"root": true` marks a product line, and Fumadocs then
 * gives that line its own sidebar tree with a switcher above it.
 *
 * That keeps the product-line split a content decision. Adding Kovati Pro or
 * Kovati Studio later is a folder and a `meta.json`, not a route or a build
 * change — which matters, because both are reserved and neither is written.
 */
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  /**
   * Resolve a frontmatter or `meta.json` icon name against lucide.
   *
   * The unhelpful part of the original was the silent `return`: a name lucide
   * no longer has produced no icon and no complaint, so `Building2`, `Smile`
   * and `Home` sat dead in the sidebar for weeks and were noticed by eye. They
   * had all been renamed upstream — `Building`, `FaceSlightlySmiling`,
   * `House`.
   *
   * It warns rather than throws because a missing icon is cosmetic and should
   * not stop a build, but it must be visible. The name is in the message, so
   * the fix is a search-and-replace rather than a hunt.
   */
  icon(name) {
    if (!name) return
    if (name in icons) return createElement(icons[name as keyof typeof icons])
    console.warn(
      `[icons] "${name}" is not a lucide icon in this version — nothing will render. ` +
        `It was probably renamed upstream.`,
    )
  },
})

export type Page = ReturnType<typeof source.getPage>
