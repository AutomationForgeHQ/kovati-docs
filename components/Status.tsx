import { latest, plugin, type Distribution } from '@/lib/manifest'

/**
 * How far to trust this page, and what it is describing.
 *
 * A reader cannot tell a page we wrote from the source, against a shipped
 * plugin we use daily, from a page that summarises something we have merely
 * built — not from tone, and certainly not from length. So every page says
 * which it is, in the same place, in the same words.
 *
 * This matters more than it sounds. The whole family has one recurring defect:
 * a true statement in one repository and a stale copy of it in three others.
 * A page that silently implies depth it has not got is the same defect wearing
 * better clothes.
 */
const STATUS = {
  shipped: {
    label: 'Documented in depth',
    hint: 'Written against the source and used in production. Gaps are named where they exist.',
    className:
      'border-emerald-600/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  },
  overview: {
    label: 'Overview',
    hint: 'What it is and what it does. The detail is in the plugin’s own README until this page grows.',
    className: 'border-fd-border bg-fd-muted text-fd-muted-foreground',
  },
  planned: {
    label: 'Not released',
    hint: 'Described because it is being built. Nothing here is installable yet.',
    className:
      'border-kv-amber-dim bg-kv-amber/10 text-amber-800 dark:text-kv-amber',
  },
  internal: {
    label: 'Internal',
    hint: 'For people working on Kovati, not for customers.',
    className: 'border-sky-600/40 bg-sky-500/10 text-sky-800 dark:text-sky-300',
  },
} as const

export type StatusKind = keyof typeof STATUS

const DIST: Record<Distribution, { label: string; hint: string }> = {
  open: {
    label: 'Open source',
    hint: 'Apache-2.0. Source published to a public mirror on every release.',
  },
  fab: {
    label: 'Free, closed source',
    hint: 'Free to use. The implementation stays in the private monorepo.',
  },
  paid: {
    label: 'Paid',
    hint: 'Bought once on the account app. Not published to the public releases repository.',
  },
}

export function Status({
  kind,
  plugins,
}: {
  kind?: StatusKind
  plugins?: string[]
}) {
  const s = kind ? STATUS[kind] : undefined
  const chips: React.ReactNode[] = []

  if (s) {
    chips.push(
      <span key="status" className={`kv-chip ${s.className}`} title={s.hint}>
        {s.label}
      </span>,
    )
  }

  for (const id of plugins ?? []) {
    const p = plugin(id)
    if (!p) continue
    const v = latest(id)
    const d = DIST[p.distribution]
    chips.push(
      <span
        key={id}
        className="kv-chip border-fd-border bg-fd-card text-fd-muted-foreground"
        title={d.hint}
      >
        <span className="font-mono">{id}</span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        {/*
          An unreleased plugin says so. Falling back to a plausible number here
          would be inventing a release that does not exist — the one thing a
          generated badge must never do.
        */}
        <span>{v ? v.version : 'unreleased'}</span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>{d.label}</span>
      </span>,
    )
  }

  if (chips.length === 0) return null

  return <div className="mb-6 flex flex-wrap gap-2 not-prose">{chips}</div>
}
