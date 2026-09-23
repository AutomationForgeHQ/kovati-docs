'use client'

import { useDocsSearch } from 'fumadocs-core/search/client'
import { staticClient } from 'fumadocs-core/search/client/orama-static'
import type { SharedProps } from 'fumadocs-ui/contexts/search'
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search'

/**
 * The search dialog, wired to the statically exported index.
 *
 * The site exports to plain files, so there is no server to answer a query.
 * `createFromSource(...).staticGET` writes the whole index out at build time
 * and `staticClient()` downloads it once and searches in the browser.
 *
 * The dialog is assembled here rather than configured, because the built-in
 * one's `type: 'static'` shortcut is deprecated in this version — its own type
 * says "re-create the dialog instead for other clients". Building it is the
 * supported route and survives that option being removed.
 *
 * The index is ~3 MB uncompressed and is fetched on first open, not on page
 * load. If it grows enough to be felt on a slow connection, the answer is a
 * hosted index, not a server — see the note in `app/api/search/route.ts`.
 *
 * Note for anyone testing this: **search does not work against `next dev`
 * reached over `127.0.0.1`.** The dev server blocks cross-origin access to
 * `/_next/` resources, the dialog's chunk is one, and it fails silently with
 * nothing in the console. Test against `next build` + a static server.
 */
export default function KovatiSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({
    client: staticClient(),
  })

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          {/* The placeholder is the theme's own translated string. */}
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== 'empty' ? query.data : null}
        />
        <SearchDialogFooter>
          <p className="text-xs text-fd-muted-foreground">
            The whole index runs in your browser {"—"} nothing is sent
            anywhere.
          </p>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  )
}
