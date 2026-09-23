import { manifest, set as getSet, latest, type Distribution } from '@/lib/manifest'

/**
 * Every plugin, grouped by licence tier, read from the register.
 *
 * The equivalent table in the public docs repository is hand-written and has
 * to be remembered on every release. This one cannot be wrong about a tier,
 * because the tier is the field CI reads when it decides whether to strip the
 * source from a package — the same field, not a copy of it.
 */

const TIERS: Array<{
  id: Distribution
  title: string
  blurb: string
}> = [
  {
    id: 'open',
    title: 'Open source',
    blurb:
      'Apache-2.0. The source is published to a public mirror on every release, and the package carries it.',
  },
  {
    id: 'fab',
    title: 'Free, closed source',
    blurb:
      'Free to use. The implementation stays private — usually because it wraps a provider SDK or container image, or was written as a paid plugin’s neighbour rather than extracted from an open core.',
  },
  {
    id: 'paid',
    title: 'Paid',
    blurb:
      'Bought once on the account app. Published to a private releases repository, never to the public one.',
  },
]

export function DistributionTable() {
  return (
    <div className="not-prose my-6 space-y-8">
      {TIERS.map((tier) => {
        const rows = manifest.plugins
          .filter((p) => p.distribution === tier.id)
          .sort((a, b) => a.id.localeCompare(b.id))

        return (
          <section key={tier.id}>
            <h3 className="text-base font-semibold">
              {tier.title}{' '}
              <span className="font-normal text-fd-muted-foreground">
                ({rows.length})
              </span>
            </h3>
            <p className="mt-1 mb-3 text-sm text-fd-muted-foreground">
              {tier.blurb}
            </p>
            <div className="overflow-x-auto rounded-lg border border-fd-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-fd-muted/60">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold">Plugin</th>
                    <th className="px-3 py-2 font-semibold">Set</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const v = latest(p.id)
                    return (
                      <tr key={p.id} className="border-t border-fd-border">
                        <td className="px-3 py-2 font-mono text-[0.92em]">
                          {p.source ? (
                            <a
                              href={p.source}
                              target="_blank"
                              rel="noreferrer"
                              className="underline decoration-dotted underline-offset-2 hover:text-fd-primary"
                            >
                              {p.id}
                            </a>
                          ) : (
                            p.id
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {getSet(p.set)?.name ?? p.set}
                        </td>
                        <td className="px-3 py-2 capitalize">{p.role}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-[0.92em]">
                          {v ? (
                            v.version
                          ) : (
                            <span className="font-sans text-fd-muted-foreground">
                              unreleased
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
