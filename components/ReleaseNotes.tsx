import Link from 'next/link'
import { plugin, membersOf, formatDate, compareVersions } from '@/lib/manifest'

/**
 * Recent activity for a plugin or a set — what shipped, not what changed in it.
 *
 * This used to render the full changelog body of every entry, which was
 * defensible when it was the only place the notes existed. It is not any more:
 * every plugin has its own changelog page, so the bodies here were a second
 * copy of them, sitting below everything anyone came to the page to read.
 * Measured on MotionForge, they were about a fifth of it — the page went from
 * 254 KB to 200 KB when they came out.
 *
 * So this is a list now: the three most recent, each linking to that exact
 * version on the plugin's changelog page, with a pointer to the rest beneath.
 * The notes live in one place and are read by people who went looking for
 * them.
 *
 * `limit` defaults rather than being passed. Thirteen pages each naming their
 * own number is thirteen places to edit when the answer changes, and they had
 * already drifted to three different values.
 */

/** Fumadocs slugs a `### 0.4.0` heading to `040`. */
const anchor = (version: string) => version.replace(/\./g, '')

export function ReleaseNotes({
  plugin: id,
  set,
  limit = 3,
}: {
  plugin?: string
  set?: string
  limit?: number
}) {
  const entries: Array<{ plugin: string; version: string; date: string }> = []

  const collect = (pluginId: string) => {
    const p = plugin(pluginId)
    if (!p) return
    for (const c of p.changelog) {
      entries.push({ plugin: p.id, version: c.version, date: c.date })
    }
  }

  if (id) collect(id)
  else if (set) for (const m of membersOf(set)) collect(m.id)

  entries.sort((a, b) => {
    const d = Date.parse(b.date) - Date.parse(a.date)
    if (d !== 0) return d
    return compareVersions(b.version, a.version)
  })

  const shown = entries.slice(0, limit)

  if (shown.length === 0) {
    return <p className="text-fd-muted-foreground">Nothing has been released yet.</p>
  }

  return (
    <ul className="not-prose my-6 divide-y divide-fd-border rounded-xl border border-fd-border">
      {shown.map((e) => (
        <li key={`${e.plugin}-${e.version}`}>
          <Link
            href={`/docs/releases/${e.plugin.toLowerCase()}#${anchor(e.version)}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-fd-accent"
          >
            <span className="font-mono font-medium">{e.plugin}</span>
            <span className="font-mono text-fd-primary">{e.version}</span>
            <span className="ml-auto text-xs text-fd-muted-foreground">
              {formatDate(e.date)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
