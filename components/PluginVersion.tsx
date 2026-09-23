import { latest, latestInSet, formatDate } from '@/lib/manifest'

/**
 * A version number in running prose, read from the manifest.
 *
 * Use it wherever a sentence would otherwise carry a number someone has to
 * remember to update:
 *
 *   MotionForge <PluginVersion plugin="MotionForge" /> ships the quality gate.
 *   As of <PluginVersion set="meshforge" withDate />, the garment step is …
 *
 * An unreleased plugin renders as "unreleased" rather than as a number, and
 * that is not a placeholder to be filled in later — several plugins in the
 * register have genuinely shipped nothing, and a page that implies otherwise
 * is wrong in the way that costs a reader an afternoon.
 */
export function PluginVersion({
  plugin: id,
  set,
  withDate = false,
}: {
  plugin?: string
  set?: string
  withDate?: boolean
}) {
  const v = id ? latest(id) : set ? latestInSet(set)?.version : undefined

  if (!v) {
    return <span className="text-fd-muted-foreground">unreleased</span>
  }

  return (
    <span className="font-mono text-[0.95em]">
      {v.version}
      {withDate ? (
        <span className="font-sans text-fd-muted-foreground">
          {' '}
          ({formatDate(v.releasedAt)})
        </span>
      ) : null}
    </span>
  )
}
