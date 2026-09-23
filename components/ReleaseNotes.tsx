import { plugin, membersOf, formatDate, compareVersions } from '@/lib/manifest'

/**
 * A plugin's or a set's release history, rendered from the manifest's
 * changelog bodies.
 *
 * The bodies are Markdown as written in each plugin's `CHANGELOG.md` — the
 * same text that becomes the GitHub release body and the same text the Discord
 * publisher posts to `#releases`. One source, three destinations, no
 * transcription.
 *
 * The rendering here is deliberately shallow: bullets and inline code, which
 * is all release notes have ever used in this family. It is not a Markdown
 * engine and should not become one. If notes ever need headings or tables, the
 * right fix is to render them through MDX at build, not to grow this function.
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
    return (
      <p className="text-fd-muted-foreground">
        Nothing has been released yet.
      </p>
    )
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
          <ul className="mt-2 space-y-1 text-sm text-fd-muted-foreground">
            {bullets(e.body).map((line, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true" className="text-fd-primary">
                  ·
                </span>
                <span>{inlineCode(line)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** Release bodies are bullet lists; anything else is passed through as a line. */
function bullets(body: string): string[] {
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*]\s+/, ''))
}

/** `backticks` become <code>, which is the only inline markup notes ever use. */
function inlineCode(line: string): React.ReactNode[] {
  return line.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
      <code
        key={i}
        className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.9em] text-fd-foreground"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
