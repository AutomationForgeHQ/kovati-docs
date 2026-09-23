# What is written, what is reserved, and why

A wiki's worst failure is not a missing page. It is a page that exists,
promises documentation, and delivers a placeholder — because a reader who
follows a link to nothing stops trusting the links. So this file tracks
intent, and the site only carries what is actually written.

## Depth, decided 2026-09-23

Five sets are documented in depth, because five sets have been built,
released and used to finish real work in Colony Origins:

| Set | Depth | Pages |
|---|---|---|
| MotionForge | Deep | index, concepts, providers, quality, retargeting, toolset, troubleshooting |
| MeshForge | Deep | index, concepts, providers, garment, post-processing, toolset |
| SpeechForge | Deep | index, concepts, providers, casting, localisation, toolset |
| FaceForge | Deep | index, concepts, providers, metahuman, correction, toolset |
| PerformanceForge | Deep | index, sessions and takes, toolset |
| AutomationForge | Deep | it is the spine — concepts, pipelines, hub, CLI, keys |
| MontageForge | Overview | one page |
| SurfaceForge | Overview | one page |
| Tools (MeshWeightRemap, NP_ add-ons) | Overview | one page each |

Everything else gets an overview and a feature list, and its page says so.
That is a `status: overview` chip, not an apology in the prose.

## Reserved, not written

### Kovati Studio

The video production workspace — a React browser workspace, a Windows Electron
companion for recording, background processing and FFmpeg export.

**Documented when the desktop app and the companion are both fully released.**
Its own README calls it a "functional first-release candidate" with production
sign-off still pending; a wiki section for it now would document something that
will change before anyone can install it.

When it lands: `content/docs/studio/meta.json` with `"root": true`, and a nav
entry in `app/layout.config.tsx`.

### Kovati Pro

The web-hosted professional pipelines — the same definitions and the same
ledger, operated for a team rather than on one workstation. It does not exist.
The [whitepaper](https://kovati.dev/whitepaper) describes the intent.

When it lands: same shape as Studio.

### The internal tier

The idea: signing in reveals more of *this same site* to people who work at
Kovati — architecture notes, the drift register, release runbooks, the things
`forge-inventory` holds privately today.

Nothing is built. The groundwork that exists:

- `status: internal` is already a valid frontmatter value and renders its own
  chip.
- The site is a static export, so gating has to happen at the edge (Firebase
  Hosting rewrite to a function that checks the account session) or by
  building a second, private site from the same content with a different page
  filter. **The second is much simpler and should be the default choice** —
  a static site cannot keep a secret it has already shipped to the browser.

Do not put anything genuinely confidential in a `status: internal` page until
that decision is made and implemented. Right now it would be public.

## Sources this wiki was written from

Not published, but read constantly while writing:

| Source | What it is good for |
|---|---|
| `forge/<Plugin>/README.md` | 7,000 lines of per-plugin truth, written against the code |
| `forge-inventory/plugins/*.md` | Features split from *documented but not built*, plus the claims audit |
| `AutomationForge/docs/*.md` | The existing public prose — manifesto, PlayableOps, distribution, accounts |
| `manifest.json` | Every version, size, hash and release note. Read, never retyped |
| `forge/plugins.json` | The register — set, role, distribution per plugin |

`forge-inventory` is private and records paid-plugin internals. It is a source
to write *from*, never a source to copy.

## Known issues, to settle before deploying

### ~~RSC segment prefetch 404s~~ — fixed 2026-09-23

Next 16 prefetches route segments, and on a static export the two halves
disagreed about where those files live:

```
requested   /docs/company/manifesto/__next.docs.$oc$slug.__PAGE__.txt?_rsc=…
written     out/docs/company/manifesto/__next.docs/$oc$slug/__PAGE__.txt
```

Every prefetch 404'd. Navigation always worked — Next falls back to a full
page load — so the cost was a lost optimisation plus a console full of red on
every page, **which makes a real error impossible to notice.** That is the
part worth having fixed.

There is no flag in Next 16.3.6 to turn segment prefetching off, and a host
rewrite cannot express the mapping because it is per-route. So
`tools/flatten-segments.mjs` runs after every build and writes a flat copy
beside each nested one. It only ever *adds* files. Verified: six navigations
forward and back with **zero console errors**, where there were 36 before.

**Delete the script and its `build` hook when Next writes both forms itself.**

### The search index is ~3 MB

Uncompressed; it gzips far smaller, and it is fetched on first *open* rather
than on page load. Worth watching as the wiki grows. If it becomes noticeable,
the answer is a hosted index (Orama Cloud or Algolia), not a server — the site
should stay static.

**Search cannot be tested against `next dev` over `127.0.0.1`.** The dev
server blocks cross-origin access to `/_next/` resources, the dialog's chunk is
one, and it fails silently with nothing in the console. Build and serve the
export instead. This cost an hour; it is written down so it costs nobody else
one.

## Drift

This wiki is now one more place a claim about a plugin can be stale. That is
the cost of having it, and it is worth paying — but it has to be on someone's
list. The `forge-audit` skill's scope should grow a `kovati-docs` row:

- Every `<PluginVersion>` and `<SetMembers>` is generated, so version drift is
  impossible by construction.
- **Prose drift is not.** A page saying "the quality gate runs locally" after
  the gate moved to a container is exactly the failure this family keeps
  having, and nothing here catches it.
