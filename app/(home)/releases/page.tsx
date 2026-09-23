import Link from 'next/link'
import {
  releaseFeed,
  manifest,
  formatDate,
  formatSize,
  generatedAt,
  releasesRepo,
  type ReleaseEvent,
} from '@/lib/manifest'
import { NoteBody } from '@/lib/notes'

/**
 * Every published version of every plugin, newest first.
 *
 * Assembled from the manifest, never written. That is the whole point: the
 * release log on the marketing site is hand-kept prose and has to be
 * remembered; this one cannot be wrong about what shipped, because it is the
 * same file CI generates from the tags and the published releases.
 *
 * A `paid` plugin publishes to a private repository. Its existence, its
 * version and its notes are public facts and belong here; its download link
 * would 404 for everyone but us, so it is not offered — the account app is.
 */

export const metadata = {
  title: 'Releases',
  description:
    'Every published version of every Automation Forge plugin, with its release notes, read from the generated manifest.',
}

export default function Releases() {
  const feed = releaseFeed()
  const byMonth = groupByMonth(feed)

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Releases
        </h1>
        <p className="mt-4 text-fd-muted-foreground">
          {feed.length} published versions across {manifest.plugins.length}{' '}
          plugins. Read from{' '}
          <a
            href="https://github.com/AutomationForgeHQ/automation-forge/blob/main/manifest.json"
            className="underline decoration-dotted underline-offset-4 hover:text-fd-primary"
            target="_blank"
            rel="noreferrer"
          >
            the release manifest
          </a>
          , which CI generates from the plugin register, the descriptors and the
          published releases — generated {formatDate(generatedAt)}.
        </p>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          Binaries for free plugins live in{' '}
          <a
            href={releasesRepo}
            className="underline decoration-dotted underline-offset-4 hover:text-fd-primary"
            target="_blank"
            rel="noreferrer"
          >
            the public releases repository
          </a>
          . Paid plugins publish privately and are installed through{' '}
          <a
            href="https://app.kovati.dev"
            className="underline decoration-dotted underline-offset-4 hover:text-fd-primary"
            target="_blank"
            rel="noreferrer"
          >
            the account app
          </a>
          . Either way the hub does the installing — see{' '}
          <Link
            href="/docs/automation-forge/getting-started"
            className="underline decoration-dotted underline-offset-4 hover:text-fd-primary"
          >
            getting started
          </Link>
          .
        </p>
      </header>

      <div className="space-y-12">
        {byMonth.map(([month, events]) => (
          <section key={month}>
            <h2 className="sticky top-16 z-10 -mx-2 mb-4 bg-fd-background/90 px-2 py-2 text-sm font-semibold uppercase tracking-wide text-fd-muted-foreground backdrop-blur">
              {month}
            </h2>
            <ul className="space-y-4">
              {events.map((e) => (
                <li
                  key={`${e.pluginId}-${e.version}`}
                  className="rounded-lg border border-fd-border bg-fd-card p-4"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-sm font-semibold">
                      {e.pluginId}
                    </span>
                    <span className="font-mono text-sm text-fd-primary">
                      {e.version}
                    </span>
                    <span className="text-xs text-fd-muted-foreground">
                      {e.setName}
                    </span>
                    {e.distribution === 'paid' ? (
                      <span className="kv-chip border-kv-amber-dim bg-kv-amber/10 text-amber-800 dark:text-kv-amber">
                        Paid
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs text-fd-muted-foreground">
                      {formatDate(e.releasedAt)}
                    </span>
                  </div>

                  {e.body ? (
                    <NoteBody body={e.body} />
                  ) : (
                    <p className="mt-3 text-sm italic text-fd-muted-foreground">
                      No notes were recorded for this version.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
                    {e.distribution === 'paid' ? (
                      <span>Installed through the account app</span>
                    ) : (
                      <>
                        <a
                          href={e.url}
                          className="underline decoration-dotted underline-offset-2 hover:text-fd-primary"
                        >
                          Download ({formatSize(e.size)})
                        </a>
                        {e.notes ? (
                          <a
                            href={e.notes}
                            className="underline decoration-dotted underline-offset-2 hover:text-fd-primary"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Release on GitHub
                          </a>
                        ) : null}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

function groupByMonth(feed: ReleaseEvent[]): Array<[string, ReleaseEvent[]]> {
  const map = new Map<string, ReleaseEvent[]>()
  for (const e of feed) {
    const key = new Date(e.releasedAt).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })
    const list = map.get(key)
    if (list) list.push(e)
    else map.set(key, [e])
  }
  return [...map.entries()]
}
