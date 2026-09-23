#!/usr/bin/env node
/**
 * Write flat aliases for Next 16's RSC segment-prefetch files.
 *
 * Next 16 prefetches route segments. On a static export the two halves
 * disagree about where those files live:
 *
 *   written by the export   out/docs/company/__next.docs/$oc$slug/__PAGE__.txt
 *   requested by the client /docs/company/__next.docs.$oc$slug.__PAGE__.txt
 *
 * Every prefetch therefore 404s. Navigation still works — Next falls back to a
 * full page load — so the cost is a lost optimisation plus a console full of
 * red on every page, which makes a real error impossible to notice.
 *
 * A host-side rewrite cannot express this (the mapping is per-route), so for a
 * static export the fix is to put a copy at the name the client actually asks
 * for. The rule: for any file beneath a directory named `__next.*`, join the
 * path from that directory downwards with dots and write it as that
 * directory's sibling.
 *
 * This only ever *adds* files. It never deletes or rewrites anything the
 * export produced, so if Next changes its mind the worst case is some unused
 * copies — delete this script and the `postbuild` hook then.
 *
 * Usage: node tools/flatten-segments.mjs [outDir]
 */
import { readdir, copyFile, stat } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(process.argv[2] ?? join(root, 'out'))

try {
  const s = await stat(out)
  if (!s.isDirectory()) throw new Error('not a directory')
} catch {
  console.error(`No export at ${out}. Run \`next build\` first.`)
  process.exit(1)
}

let written = 0
let skipped = 0

/**
 * Walk the export. When a directory named `__next.*` is found, every file
 * under it gets a flat copy beside that directory.
 */
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (!entry.isDirectory()) continue

    if (entry.name.startsWith('__next.')) {
      await flatten(dir, entry.name, full, [])
    } else {
      await walk(full)
    }
  }
}

/**
 * @param parent   the route directory the aliases are written into
 * @param prefix   the `__next.*` directory's own name
 * @param dir      the directory currently being read
 * @param segments path components between `prefix` and `dir`
 */
async function flatten(parent, prefix, dir, segments) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await flatten(parent, prefix, full, [...segments, entry.name])
      continue
    }

    const flat = [prefix, ...segments, entry.name].join('.')
    const target = join(parent, flat)

    try {
      await stat(target)
      skipped++ // already there; never overwrite what the export wrote
      continue
    } catch {
      // not there, so write it
    }

    await copyFile(full, target)
    written++
  }
}

await walk(out)

console.log(
  `segment aliases: ${written} written, ${skipped} already present ` +
    `(${resolve(out)})`,
)
