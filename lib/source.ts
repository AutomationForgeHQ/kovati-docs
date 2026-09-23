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
  icon(name) {
    if (!name) return
    if (name in icons) return createElement(icons[name as keyof typeof icons])
  },
})

export type Page = ReturnType<typeof source.getPage>
