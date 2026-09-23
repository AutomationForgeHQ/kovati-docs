import type { ReactNode } from 'react'

/**
 * Render a release-note body.
 *
 * The bodies come from each plugin's `CHANGELOG.md` by way of the generated
 * manifest, so they are Markdown — and specifically the small dialect this
 * family's changelogs actually use:
 *
 *   ### Changed
 *   - **Bold lead.** A sentence that is hard-wrapped at about a hundred
 *     columns, continuing on an indented line.
 *   - Another entry, with `inline code`.
 *
 * Three things matter and the first version of this got two of them wrong:
 *
 * 1. `### Heading` is a section, not a bullet.
 * 2. **A wrapped line is a continuation, not a new bullet.** Changelogs are
 *    written to be read in a terminal, so nearly every entry is wrapped.
 *    Treating each physical line as an entry turned one sentence into four.
 * 3. `**bold**` and `` `code` `` carry meaning — the bold lead is the summary
 *    of the entry, and stripping it makes every entry read the same weight.
 *
 * This is deliberately not a Markdown engine. It handles what changelogs here
 * contain and nothing else. If notes ever need tables or nested lists, render
 * them through MDX at build rather than growing this.
 */

export type NoteBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: string[] }

export function parseNotes(body: string): NoteBlock[] {
  const blocks: NoteBlock[] = []
  let bullets: string[] | null = null

  const flush = () => {
    if (bullets && bullets.length > 0) blocks.push({ kind: 'bullets', items: bullets })
    bullets = null
  }

  for (const raw of body.split('\n')) {
    const line = raw.trimEnd()
    if (line.trim() === '') continue

    const heading = /^#{1,6}\s+(.*)$/.exec(line.trim())
    if (heading) {
      flush()
      blocks.push({ kind: 'heading', text: heading[1] })
      continue
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      if (!bullets) bullets = []
      bullets.push(bullet[1])
      continue
    }

    // Not a marker and not a heading: a wrapped continuation of the entry
    // above, unless nothing is open — in which case it is a loose paragraph
    // and becomes an entry of its own.
    if (bullets && bullets.length > 0) {
      bullets[bullets.length - 1] += ' ' + line.trim()
    } else {
      bullets = [line.trim()]
    }
  }

  flush()
  return blocks
}

/** `**bold**` and `` `code` ``, which is all these notes ever use. */
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let i = 0

  for (const part of text.split(pattern)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      out.push(
        <strong key={i++} className="font-semibold text-fd-foreground">
          {part.slice(2, -2)}
        </strong>,
      )
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      out.push(
        <code
          key={i++}
          className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.9em] text-fd-foreground"
        >
          {part.slice(1, -1)}
        </code>,
      )
    } else {
      out.push(<span key={i++}>{part}</span>)
    }
  }

  return out
}

/** The whole body, as blocks. Shared by the releases page and the MDX component. */
export function NoteBody({ body }: { body: string }) {
  const blocks = parseNotes(body)
  if (blocks.length === 0) return null

  return (
    <div className="mt-3 space-y-3">
      {blocks.map((block, i) =>
        block.kind === 'heading' ? (
          <h4
            key={i}
            className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground"
          >
            {block.text}
          </h4>
        ) : (
          <ul key={i} className="space-y-1.5 text-sm text-fd-muted-foreground">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2">
                <span aria-hidden="true" className="select-none text-fd-primary">
                  ·
                </span>
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}
