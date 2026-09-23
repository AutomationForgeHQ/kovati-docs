#!/usr/bin/env node
/**
 * Check that every internal link in the wiki resolves to a page that exists.
 *
 * A wiki's credibility is its links. A reader who follows two dead ones stops
 * following any, and starts treating the whole site as approximate — which is
 * the opposite of what a documentation site is for.
 *
 * This reads the *exported* site rather than the content, so it checks what a
 * visitor actually gets: anchors in `out/**\/*.html`, resolved against the
 * directories the export produced. Run it after `npm run verify`.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Where the export landed.
 *
 * A default `next build` writes the exported site to `out/`. A verification
 * build sets NEXT_DIST_DIR, and Next 16 then writes the export inside that
 * scratch directory instead — so check both rather than making the caller
 * remember which build they last ran.
 */
const candidates = process.argv[2]
  ? [resolve(process.argv[2])]
  : [join(root, 'out'), join(root, '.next-verify')]

async function walk(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await walk(full)))
    else found.push(full)
  }
  return found
}

let files
let out
for (const dir of candidates) {
  try {
    files = await walk(dir)
    out = dir
    break
  } catch {
    // try the next one
  }
}

if (!out) {
  console.error(
    `No exported site found. Looked in:\n  ${candidates.join('\n  ')}\n` +
      'Run `npm run build` (or `npm run verify`) first.',
  )
  process.exit(1)
}

console.log(`Reading ${relative(root, out) || '.'}`)

const pages = files.filter((f) => f.endsWith('.html'))

/** Every route the export actually serves, with a trailing slash. */
const routes = new Set(
  pages.map((f) => {
    const rel = relative(out, f).replaceAll('\\', '/')
    const path = rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '')
    return path.endsWith('/') ? path : path + '/'
  }),
)

const HREF = /href="(\/[^"#?]*)(#[^"]*)?"/g

const broken = []
let checked = 0

for (const file of pages) {
  const html = await readFile(file, 'utf8')
  const from = '/' + relative(out, file).replaceAll('\\', '/')
  for (const m of html.matchAll(HREF)) {
    let target = m[1]
    // Assets are files, not routes.
    if (/\.(js|css|png|jpg|svg|ico|woff2?|txt|json|xml)$/.test(target)) continue
    if (target.startsWith('/_next/')) continue
    if (!target.endsWith('/')) target += '/'
    checked++
    if (!routes.has(target)) broken.push({ from, target })
  }
}

// One entry per distinct target, listing where it is linked from.
const byTarget = new Map()
for (const b of broken) {
  const list = byTarget.get(b.target) ?? []
  if (!list.includes(b.from)) list.push(b.from)
  byTarget.set(b.target, list)
}

console.log(`${pages.length} pages, ${routes.size} routes, ${checked} internal links checked.`)

if (byTarget.size === 0) {
  console.log('No broken internal links.')
  process.exit(0)
}

console.error(`\n${byTarget.size} broken target(s):\n`)
for (const [target, froms] of [...byTarget].sort()) {
  console.error(`  ${target}`)
  for (const f of froms.slice(0, 6)) console.error(`      from ${f}`)
  if (froms.length > 6) console.error(`      ... and ${froms.length - 6} more`)
}
process.exit(1)
