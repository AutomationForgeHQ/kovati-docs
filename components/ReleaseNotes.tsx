import { plugin, membersOf, formatDate, compareVersions } from '@/lib/manifest'
import { NoteBody } from '@/lib/notes'

/**
 * A plugin's or a set's release history, rendered from the manifest's
 * changelog bodies.
 *
 * The bodies are Markdown as written in each plugin's `CHANGELOG.md` — the
 * same text that becomes the GitHub release body and the same text the Discord
 * publisher posts to `#releases`. One source, three destinations, no
 * transcription.
 *
 * Rendering lives in `lib/notes` so this and the releases page cannot drift
 * apart about what a `### Changed` line means.
 */
export function ReleaseNotes({
  plugin: id,
  set,
  limit,
}: {
  plugin?: string
  set?: string
  limit?: number
}) {
  const entries: Array<{ plugin: string; version: string; date: string; body: string }> = []

  const collect = (pluginId: string) => {
    const p = plugin(pluginId)
    if (!p) return
    for (const c of p.changelog) {
      entries.push({ plugin: p.id, version: c.version, date: c.date, body: c.body })
    }
  }

  if (id) collect(id)
  else if (set) for (const m of membersOf(set)) collect(m.id)

  entries.sort((a, b) => {
    const d = Date.parse(b.date) - Date.parse(a.date)
    if (d !== 0) return d
    return compareVersions(b.version, a.version)
  })

  const shown = limit ? entries.slice(0, limit) : entries

  if (shown.length === 0) {
    return <p className="text-fd-muted-foreground">Nothing has been released yet.</p>
  }

  return (
    <div className="not-prose my-6 space-y-6">
      {shown.map((e) => (
        <section key={`${e.plugin}-${e.version}`}>
          <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
            <span className="font-mono">{e.plugin}</span>
            <span className="font-mono text-fd-primary">{e.version}</span>
            <span className="font-normal text-fd-muted-foreground">
              {formatDate(e.date)}
            </span>
          </h3>
          <NoteBody body={e.body} />
        </section>
      ))}
    </div>
  )
}
