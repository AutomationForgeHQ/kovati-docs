'use client'

import { useMemo, useState } from 'react'
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
 * The search dialog, wired to two statically exported indexes.
 *
 * The site exports to plain files, so there is no server to answer a query.
 * `createSearchAPI(...).staticGET` writes each index out at build time and
 * `staticClient()` downloads one and searches in the browser.
 *
 * There are two because release notes grow without limit and the pages people
 * read do not — see `lib/search-index.ts`. **Docs** is the default and holds
 * everything anyone normally wants. **Changelogs** is every release note of
 * every plugin, and is only downloaded if somebody presses it.
 *
 * The dialog is assembled here rather than configured, because the built-in
 * one's `type: 'static'` shortcut is deprecated in this version — its own type
 * says "re-create the dialog instead for other clients". Building it is the
 * supported route and survives that option being removed.
 *
 * Note for anyone testing this: **search does not work against `next dev`
 * reached over `127.0.0.1`.** The dev server blocks cross-origin access to
 * `/_next/` resources, the dialog's chunk is one, and it fails silently with
 * nothing in the console. Test against `next build` + a static server.
 */

const SCOPES = {
  docs: { label: 'Docs', from: '/api/search' },
  changelogs: { label: 'Changelogs', from: '/api/search-changelogs' },
} as const

type Scope = keyof typeof SCOPES

export default function KovatiSearchDialog(props: SharedProps) {
  const [scope, setScope] = useState<Scope>('docs')

  return (
    <SearchDialogFor
      // Remounting is what swaps the index. The hook downloads its database
      // once and keeps it; handing the same hook a different client mid-life
      // leaves the old results on screen under the new label.
      key={scope}
      scope={scope}
      onScopeChange={setScope}
      {...props}
    />
  )
}

function SearchDialogFor({
  scope,
  onScopeChange,
  ...props
}: SharedProps & { scope: Scope; onScopeChange: (s: Scope) => void }) {
  const client = useMemo(() => staticClient({ from: SCOPES[scope].from }), [scope])
  const { search, setSearch, query } = useDocsSearch({ client })

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

        <div className="flex gap-1 border-b px-3 pb-2 not-prose">
          {(Object.keys(SCOPES) as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScopeChange(s)}
              aria-pressed={s === scope}
              className={
                'rounded-md px-2.5 py-1 text-xs transition-colors ' +
                (s === scope
                  ? 'bg-fd-primary/10 text-fd-primary'
                  : 'text-fd-muted-foreground hover:bg-fd-accent')
              }
            >
              {SCOPES[s].label}
            </button>
          ))}
        </div>

        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
        <SearchDialogFooter>
          <p className="text-xs text-fd-muted-foreground">
            {scope === 'changelogs'
              ? 'Every release note of every plugin.'
              : 'Everything but the release notes — those are under Changelogs.'}{' '}
            Runs in your browser {'—'} nothing is sent anywhere.
          </p>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  )
}
