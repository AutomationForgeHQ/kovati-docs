import { latest, membersOf, type ManifestPlugin } from '@/lib/manifest'

/**
 * The plugins in a Forge set, read from the register.
 *
 * The unit of the product is a *set*, not a plugin — nobody installs
 * "MotionForge Kimodo" on its own, they install motion generation, which
 * happens to be a core plugin, a provider, a quality add-on and three
 * toolsets. So every set page opens with what it actually contains.
 *
 * Every column here comes from `manifest.json`. Writing this table by hand is
 * how you end up publishing a version that shipped two weeks ago.
 */

const ROLE_NOTE: Record<ManifestPlugin['role'], string> = {
  core: 'The subsystem. Install this one.',
  provider: 'A route to a generator — a vendor API, or a container on your own GPU.',
  addon: 'Optional capability on top of the core.',
  adapter: 'Bridges the core into a framework you already build on.',
  toolset: 'The same subsystem as typed MCP tools, for an agent. Adds nothing of its own.',
  post: 'Runs after generation, on the result.',
  app: 'A standalone application rather than an engine plugin.',
}

const DIST_LABEL = {
  open: 'Open',
  fab: 'Free',
  paid: 'Paid',
} as const

export function SetMembers({ set }: { set: string }) {
  const members = membersOf(set)
  if (members.length === 0) {
    return (
      <p className="text-fd-muted-foreground">
        No plugins are registered under <code>{set}</code>.
      </p>
    )
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-fd-muted/60">
          <tr className="text-left">
            <th className="px-3 py-2 font-semibold">Plugin</th>
            <th className="px-3 py-2 font-semibold">Role</th>
            <th className="px-3 py-2 font-semibold">Licence</th>
            <th className="px-3 py-2 font-semibold">Version</th>
          </tr>
        </thead>
        <tbody>
          {members.map((p) => {
            const v = latest(p.id)
            return (
              <tr key={p.id} className="border-t border-fd-border align-top">
                <td className="px-3 py-2">
                  <span className="font-mono text-[0.92em]">{p.id}</span>
                  {p.source ? (
                    <>
                      {' '}
                      <a
                        href={p.source}
                        className="text-fd-muted-foreground underline decoration-dotted underline-offset-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        source
                      </a>
                    </>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <span className="capitalize">{p.role}</span>
                  <span className="block text-xs text-fd-muted-foreground">
                    {ROLE_NOTE[p.role]}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {DIST_LABEL[p.distribution]}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-[0.92em]">
                  {v ? (
                    v.version
                  ) : (
                    <span className="text-fd-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
