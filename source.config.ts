import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
import { z } from 'zod'

/**
 * One collection, not one per product line.
 *
 * The product lines are expressed as *docs roots* — a `meta.json` with
 * `"root": true` at `content/docs/<line>/` — which gives each line its own
 * sidebar tree and puts a switcher at the top of it. That is a content
 * decision, so it lives in content, and adding Kovati Pro later is a folder
 * rather than a build change.
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      /**
       * How far to trust the page. A set we have built and shipped against a
       * real production reads `shipped`; one we only summarise reads
       * `overview`, and the page says so rather than implying depth it has
       * not got. Anything unreleased is `planned` and must say what is
       * missing.
       */
      status: z.enum(['shipped', 'overview', 'planned', 'internal']).optional(),
      /** Plugin ids this page describes, for the version badge and releases. */
      plugins: z.array(z.string()).optional(),
      /** Shown under the title, above the body. */
      tagline: z.string().optional(),
      /** Ordering hint for card grids; the sidebar uses meta.json. */
      index: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
    },
  },
})
