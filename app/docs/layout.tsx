import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'

/**
 * Sidebar tabs come from the page tree's *roots* — each product line declares
 * `"root": true` in its `meta.json` and appears in the switcher at the top of
 * the sidebar. Nothing here enumerates the lines, which is the point: adding
 * Kovati Pro is a folder, not an edit to this file.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  )
}
