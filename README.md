# kovati-docs

The Kovati wiki — [docs.kovati.dev](https://docs.kovati.dev). Public
documentation for Automation Forge, the tools around it, and the PlayableOps
discipline behind them.

**Not deployed yet.** The hosting target exists in `firebase.json` and the DNS
does not. This is built and reviewed locally first.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

A build and a running dev server share `.next` and corrupt each other, so use
the separate scratch directory when you want to verify a build while the dev
server is up:

```bash
npm run verify       # builds into .next-verify, exports to out/
```

## The stack, and why

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16 + React 19 | Same family as kovati.dev, so one set of idioms |
| Docs layer | [Fumadocs](https://fumadocs.dev) 16 | MDX in git, docs *roots* per product line, typed frontmatter, search |
| Styling | Tailwind 4 | The Kovati palette, mapped onto Fumadocs' variables in `app/global.css` |
| Search | Orama, static | The index is built at export and searched in the browser — no server |
| Output | `output: 'export'` | Plain files on Firebase Hosting; nothing can be down but the CDN |

Next 16 here against Next 15 on kovati.dev is deliberate. Separate repositories
mean separate upgrade cadences, and the marketing site should not be dragged
through a major version to let the wiki use one.

## Layout

```
content/docs/           the wiki itself, as MDX
  automation-forge/     a docs ROOT — its own sidebar tree
  tools/                a docs ROOT
  company/              a docs ROOT
lib/manifest.ts         reads data/manifest.json — every version, size, hash, note
lib/source.ts           the Fumadocs loader
components/             Status, SetMembers, PluginVersion, ReleaseNotes
app/(home)/             landing page and the releases browser
app/docs/               the wiki routes
tools/sync-manifest.mjs refreshes data/manifest.json
```

### Product lines are content, not routes

A product line is a folder under `content/docs/` whose `meta.json` carries
`"root": true`. Fumadocs then gives it its own sidebar tree and a switcher.

Adding **Kovati Pro** or **Kovati Studio** later is therefore a folder and a
`meta.json` — no route, no layout change, no build change. Both are reserved
and neither is written; see [CONTENT_PLAN.md](CONTENT_PLAN.md) for why.

## The one rule

**No page types a version number, a download URL, a file size or a release
date.**

All of that is read from `data/manifest.json`, which CI generates in the
`automation-forge` repository from the plugin register, the plugin descriptors
and the published GitHub releases. Use the components:

```mdx
MotionForge <PluginVersion plugin="MotionForge" /> added the quality gate.

<SetMembers set="motionforge" />

<ReleaseNotes set="faceforge" limit={5} />
```

This is not fussiness. A number typed twice in this family has drifted three
times in a single day, and the whole `forge-audit` skill exists because of it.
Deriving a fact beats checking it.

Refresh the manifest with:

```bash
npm run sync:manifest                              # from GitHub
node tools/sync-manifest.mjs ../AutomationForge/manifest.json   # from a local clone
```

## Writing a page

Frontmatter beyond Fumadocs' own:

```yaml
---
title: MotionForge
description: One sentence, shown under the title and in search.
status: shipped | overview | planned | internal
plugins: [MotionForge, MotionForgeKimodo]
---
```

`status` renders the chip under the title and is **not optional judgement** —
it is the promise the page makes to a reader:

- `shipped` — written against the source, used in production, honest about
  its edges.
- `overview` — what it is and what it does. No more. Say where the detail is.
- `planned` — being built. Nothing in it is installable.
- `internal` — for people working on Kovati.

`plugins` renders a chip per plugin with its live version and licence tier.

## What is deliberately missing

- **Kovati Studio** — documented when the desktop app *and* the Windows
  companion are both released.
- **Kovati Pro** — does not exist yet.
- **A logged-in internal tier** — the idea is that signing in reveals more of
  the same site to people who work here. Nothing is built for it; when it is,
  `status: internal` pages are where it starts.

## Related repositories

| Repo | Holds |
|---|---|
| [`forge`](https://github.com/AutomationForgeHQ/forge) (private) | Every plugin's source and `plugins.json` — the truth this wiki describes |
| [`automation-forge`](https://github.com/AutomationForgeHQ/automation-forge) | The hub, the `forge` CLI, and `manifest.json` |
| [`releases`](https://github.com/AutomationForgeHQ/releases) | Published binaries for free plugins |
| `website` (private) | kovati.dev and the account app |
| `forge-inventory` (private) | Per-plugin feature registry and drift audit |

When this wiki and the code disagree, **the code is right**. Report it as an
issue rather than fixing the prose to match a guess.
