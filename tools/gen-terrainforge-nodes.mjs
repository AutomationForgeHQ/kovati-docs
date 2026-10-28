#!/usr/bin/env node
/**
 * Write content/docs/automation-forge/terrainforge/nodes.mdx from
 * data/terrainforge-nodes.json.
 *
 *   node tools/export-terrainforge-nodes.mjs <TerrainForge plugin folder>   # source -> JSON
 *   node tools/gen-terrainforge-nodes.mjs                                   # JSON -> page
 *
 * The page is a reference of every node in the catalog: purpose, ports and
 * every parameter with its default and its range or choices. A reference that
 * is typed by hand is wrong by the second release, so nothing on that page is
 * written here except the framing prose and the table layout. Edit this file
 * for the layout; regenerate for the content; never edit nodes.mdx.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(join(root, 'data', 'terrainforge-nodes.json'), 'utf8'))
const target = join(root, 'content', 'docs', 'automation-forge', 'terrainforge', 'nodes.mdx')

/** The categories in the order the editor's node library shows them. */
const CATEGORY_ORDER = ['Generate', 'Landforms', 'Layer', 'Shape', 'Simulate', 'Water', 'Select', 'Color', 'Export']

const CATEGORY_NOTE = {
  Generate: 'Nodes with no terrain input: a starting heightfield from a file, noise, a ramp or a constant.',
  Landforms: 'Placed features in world metres: ranges, peaks, canyons, volcanoes, islands, dunes, plateaus, lava and rock strata.',
  Layer: 'Ways to combine two or more heightfields.',
  Shape: 'Filters and deformations of one heightfield. Most take an optional mask that limits where they apply.',
  Select: 'Nodes that turn a heightfield into a mask, or combine masks. Several of these feed biome rules and paint layers.',
  Simulate: 'Erosion, weathering, glaciers, geology and snow. These are the expensive nodes, and the ones the GPU speeds up.',
  Water: 'Rivers, lakes, drainage, floodplains and coast.',
  Color: 'Colour and packed-data outputs for materials. They do not change the terrain.',
  Export: 'The node whose terrain becomes the build output.',
}

/** The port legend the editor's library uses. */
const PORT = { terrain: 'elevation', mask: 'mask', color: 'colour', rgb: 'RGB data' }

/** MDX-safe text: braces and angle brackets are JSX, pipes end table cells. */
function esc(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*/g, '\\*')
    .replace(/\|/g, '\\|')
}

const num = (v) => (typeof v === 'number' ? String(v) : esc(v))

function ports(map) {
  const entries = Object.entries(map ?? {})
  if (entries.length === 0) return 'none'
  return entries
    .map(([name, type]) => {
      const optional = type.endsWith('?')
      const base = optional ? type.slice(0, -1) : type
      return `\`${name}\` (${PORT[base] ?? base}${optional ? ', optional' : ''})`
    })
    .join(', ')
}

function defaultOf(p) {
  switch (p.type) {
    case 'points':
      return `${p.default.length} points`
    case 'pointWidths':
      return p.default.length === 0 ? 'empty' : `${p.default.length} widths`
    case 'order':
      return p.default.join(', ')
    case 'asset':
      return 'none'
    case 'boolean':
      return p.default ? 'on' : 'off'
    case 'select':
    case 'color':
      return `\`${p.default}\``
    default:
      return num(p.default)
  }
}

function allowedOf(p) {
  switch (p.type) {
    case 'number':
    case 'integer': {
      const kind = p.type === 'integer' ? 'whole numbers ' : ''
      const step = p.step !== undefined && p.type !== 'integer' ? `, step ${p.step}` : ''
      if (p.min === undefined && p.max === undefined) return p.type === 'integer' ? 'whole number' : 'number'
      return `${kind}${num(p.min)} to ${num(p.max)}${step}`
    }
    case 'select':
      return p.options.map((o) => `\`${o}\``).join(', ')
    case 'boolean':
      return 'on or off'
    case 'points':
      return `${p.minPoints} to ${p.maxPoints} points in world metres${p.closed ? ', a closed outline' : ''}`
    case 'pointWidths':
      return `one width per point of \`${p.points}\`, ${num(p.min)} to ${num(p.max)} m, at most ${p.maxCount}`
    case 'order':
      return 'an order of the layers'
    case 'color':
      return 'an sRGB colour'
    case 'asset':
      return 'a raster embedded in the definition'
    default:
      return esc(p.type)
  }
}

function notesOf(p) {
  const notes = []
  if (p.createDefault !== undefined) {
    notes.push(`New nodes start at \`${p.createDefault}\`; saved graphs keep the default.`)
  }
  if (p.runtimeOnly) notes.push('Runtime only: chooses the device, not the result.')
  if (p.description) notes.push(esc(p.description))
  return notes.length ? `<br />${notes.join(' ')}` : ''
}

function paramTable(params) {
  const entries = Object.entries(params ?? {})
  if (entries.length === 0) return 'No parameters.\n'
  const rows = entries.map(([key, p]) => {
    const label = p.group ? `${esc(p.group)} · ${esc(p.label)}` : esc(p.label)
    return `| ${label} \`${key}\`${notesOf(p)} | ${defaultOf(p)} | ${allowedOf(p)} |`
  })
  return ['| Parameter | Default | Allowed |', '|---|---|---|', ...rows].join('\n') + '\n'
}

const byCategory = new Map()
for (const n of data.nodes) {
  if (!byCategory.has(n.category)) byCategory.set(n.category, [])
  byCategory.get(n.category).push(n)
}
const categories = [
  ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
  ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
]

const out = []
out.push(`---
title: Node reference
description: Every node in the TerrainForge catalog, with its ports and every parameter's default and range.
status: shipped
plugins: [TerrainForge]
icon: Workflow
---

{/* GENERATED by tools/gen-terrainforge-nodes.mjs from data/terrainforge-nodes.json. Do not edit this file. */}

This page is generated from the plugin's own node catalog, not written by hand.
Each native node carries its catalog entry in its source file, and the editor's
node library, the node inspector and the agent tool \`ListNodeTypes\` all read
that same entry. The labels, descriptions, ports, defaults and ranges below are
copied from it.

To regenerate after the catalog changes, from the root of the wiki repository:

\`\`\`powershell
node tools/export-terrainforge-nodes.mjs <path to the TerrainForge plugin folder>
node tools/gen-terrainforge-nodes.mjs
\`\`\`

The first reads the source and writes \`data/terrainforge-nodes.json\`; the
second writes this page from that file.

<Callout type="info">
  **Every node runs natively.** There is no node that needs another program or
  a service. Where a node has a GPU kernel and the Compute setting allows it,
  part of it runs on the graphics card; the result is checked against the CPU
  version. See [GPU compute](/docs/automation-forge/terrainforge#gpu-compute).
</Callout>

## Reading the tables

- **Ports** carry one of four kinds of data: *elevation* (a heightfield in
  metres), *mask* (0 to 1), *colour* (sRGB, for display) and *RGB data* (linear
  packed masks). They are not interchangeable: validation refuses a link between
  different kinds.
- An input marked **optional** can stay unconnected. A required input must be
  connected before that branch can be previewed or built.
- **Distances and heights are in metres**, areas in square metres, angles in
  degrees, unless the label says otherwise. Positions are metres from the map
  centre, X east and Y south.
- **"New nodes start at"** marks a parameter whose default for a new node
  differs from the value an older saved graph keeps. Saved graphs are not
  changed by an update.
- **Runtime only** marks the per-node \`compute\` choice (\`auto\`, \`cpu\`,
  \`gpu\`). It decides where the node runs, not what it computes.

## Categories

| Category | Nodes | What is in it |
|---|---:|---|
${categories.map((c) => `| [${c}](#${c.toLowerCase()}) | ${byCategory.get(c).length} | ${CATEGORY_NOTE[c] ?? ''} |`).join('\n')}
`)

for (const c of categories) {
  out.push(`## ${c}\n`)
  if (CATEGORY_NOTE[c]) out.push(`${CATEGORY_NOTE[c]}\n`)
  for (const n of byCategory.get(c)) {
    out.push(`### ${esc(n.label)}\n`)
    out.push(`Type \`${n.type}\`.\n`)
    out.push(`${esc(n.description)}\n`)
    out.push(`- **Inputs:** ${ports(n.inputs)}`)
    out.push(`- **Outputs:** ${ports(n.outputs)}\n`)
    out.push(paramTable(n.params))
  }
}

writeFileSync(target, out.join('\n'))
console.log(`gen-terrainforge-nodes: ${data.nodes.length} nodes in ${categories.length} categories -> ${target}`)
