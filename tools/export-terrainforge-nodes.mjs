#!/usr/bin/env node
/**
 * Export TerrainForge's node catalog from the plugin source into
 * data/terrainforge-nodes.json, for tools/gen-terrainforge-nodes.mjs.
 *
 *   node tools/export-terrainforge-nodes.mjs <path to TerrainForge plugin folder>
 *
 * Every native node is one file in Source/TerrainForgeCore/Private/tfnodes/
 * that registers itself with TF_REGISTER_NODE(Type, Impl) and carries its
 * catalog entry as an embedded JSON string, `static const char* const Spec`,
 * written as one or more adjacent R"tfjson(...)tfjson" literals. That string is
 * exactly what the editor's node library and the agent toolset read, so it is
 * the only thing this script trusts. Nothing here is typed by hand.
 *
 * Order follows the engine's own catalog order: the types listed in
 * Private/tf/TfPythonCatalogData.cpp first, in that order, then the remaining
 * types sorted by name (tf::Registry::Types()). Types whose name starts with
 * "__" are test-only and never reach a catalog, so they are skipped.
 *
 * The source repository is private; the JSON it produces is the same
 * information the published page carries, and nothing more.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const plugin = process.argv[2]
if (!plugin) {
  console.error('usage: node tools/export-terrainforge-nodes.mjs <TerrainForge plugin folder>')
  process.exit(2)
}

const core = join(resolve(plugin), 'Source', 'TerrainForgeCore', 'Private')
const nodesDir = join(core, 'tfnodes')

/** Concatenate every raw literal between `Spec =` and the closing `;`. */
function specOf(text, file) {
  const start = text.indexOf('static const char* const Spec')
  if (start < 0) throw new Error(`${file}: no Spec string`)
  const re = /R"tfjson\(([\s\S]*?)\)tfjson"\s*(;)?/g
  re.lastIndex = start
  let json = ''
  let m
  while ((m = re.exec(text))) {
    json += m[1]
    if (m[2]) break
  }
  if (!json) throw new Error(`${file}: empty Spec string`)
  return JSON.parse(json)
}

const nodes = []
for (const file of readdirSync(nodesDir).filter((f) => f.endsWith('.cpp')).sort()) {
  const text = readFileSync(join(nodesDir, file), 'utf8')
  const reg = /TF_REGISTER_NODE\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/.exec(text)
  if (!reg) continue
  const type = reg[1]
  if (type.startsWith('__')) continue
  nodes.push({ type, ...specOf(text, file) })
}

// The reference catalog order: one `// Type` comment per entry.
const catalog = readFileSync(join(core, 'tf', 'TfPythonCatalogData.cpp'), 'utf8')
const order = [...catalog.matchAll(/^\t\/\/ ([A-Za-z_][A-Za-z0-9_]*)\s*$/gm)].map((m) => m[1])
const rank = new Map(order.map((t, i) => [t, i]))

nodes.sort((a, b) => {
  const ra = rank.has(a.type) ? rank.get(a.type) : Infinity
  const rb = rank.has(b.type) ? rank.get(b.type) : Infinity
  if (ra !== rb) return ra - rb
  return a.type < b.type ? -1 : a.type > b.type ? 1 : 0
})

const out = { source: 'TerrainForge/Source/TerrainForgeCore/Private/tfnodes', count: nodes.length, nodes }
const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'terrainforge-nodes.json')
writeFileSync(target, JSON.stringify(out, null, 1) + '\n')
console.log(`export-terrainforge-nodes: ${nodes.length} node types -> ${target}`)
