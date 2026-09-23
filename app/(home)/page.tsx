import Link from 'next/link'
import { manifest, releaseFeed, formatDate, generatedAt } from '@/lib/manifest'
import { KovatiMark } from '@/components/KovatiMark'

/**
 * The front door.
 *
 * A wiki's landing page has one job: get someone into the right section in one
 * click. It is not a pitch — kovati.dev is the pitch — so there is no hero
 * copy here beyond a sentence saying what this site is, and the three product
 * lines are the page.
 */

export const metadata = {
  /**
   * Absolute, or the root layout's `%s · Kovati Docs` template renders this
   * page as "Kovati Docs · Kovati Docs".
   */
  title: { absolute: 'Kovati Docs' },
  description:
    'Documentation for Automation Forge, the Kovati tools, and the PlayableOps discipline behind them.',
}

const LINES = [
  {
    href: '/docs/automation-forge',
    title: 'Automation Forge',
    tagline: 'The plugin family for Unreal Engine',
    body: 'Motion, speech, face, mesh and performance — generated, judged, retargeted and wired into a game that plays. Plus the hub, the command line and the pipelines that run them unattended.',
  },
  {
    href: '/docs/tools',
    title: 'Tools',
    tagline: 'Utilities that are not part of a Forge set',
    body: 'Smaller things built because a production needed them: skinning-weight transfer between meshes, and the Narrative Pro add-ons that bridge Automation Forge into an existing framework.',
  },
  {
    href: '/docs/company',
    title: 'Company',
    tagline: 'PlayableOps, the vision, and who we are',
    body: 'What the playable gap is and why closing it is the whole product. The manifesto, how the work is organised, and the entities behind Kovati.',
  },
]

export default function Home() {
  const feed = releaseFeed()
  const recent = feed.slice(0, 6)
  const setCount = manifest.sets.length
  const pluginCount = manifest.plugins.length
  const versionCount = feed.length

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <header className="mb-14 max-w-2xl">
        <KovatiMark className="mb-6 h-12 w-12 text-fd-foreground" />
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Kovati Docs
        </h1>
        <p className="mt-4 text-lg text-fd-muted-foreground">
          The wiki for Automation Forge, the tools around it, and the discipline
          they exist to serve. Everything here is written against what the code
          actually does — where a page is only an overview, it says so.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {LINES.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent"
          >
            <h2 className="text-base font-semibold tracking-tight group-hover:text-fd-primary">
              {l.title}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
              {l.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fd-muted-foreground">
              {l.body}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Recently released
          </h2>
          <Link
            href="/releases"
            className="text-sm text-fd-muted-foreground underline decoration-dotted underline-offset-4 hover:text-fd-primary"
          >
            All {versionCount} published versions
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-fd-border rounded-xl border border-fd-border">
          {recent.map((r) => (
            <li
              key={`${r.pluginId}-${r.version}`}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm"
            >
              <span className="font-mono">{r.pluginId}</span>
              <span className="font-mono text-fd-primary">{r.version}</span>
              <span className="text-fd-muted-foreground">{r.setName}</span>
              <span className="ml-auto text-xs text-fd-muted-foreground">
                {formatDate(r.releasedAt)}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs text-fd-muted-foreground">
          {setCount} sets · {pluginCount} plugins · read from the release
          manifest, generated {formatDate(generatedAt)}. Nothing on this site
          types a version number by hand.
        </p>
      </section>
    </main>
  )
}
