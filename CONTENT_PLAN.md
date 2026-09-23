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

## Screenshots and video

### Capturing a window

`tools/capture-window.ps1` renders a window **from its own handle**
(`PrintWindow` with `PW_RENDERFULLCONTENT`), never by copying the screen.

```powershell
.\tools\capture-window.ps1 -ProcessName AutomationForgeHub -Out public/shots/hub/plugins.png
.\tools\capture-window.ps1 -ProcessName UnrealEditor -TitleLike "MotionForge*" -Out shot.png
```

That distinction is not pedantry. A screen copy captures whatever is in front,
and on 2026-08-28 that captured a private messaging window instead of the
intended one. The script refuses on an ambiguous match rather than guessing,
because **the wrong capture is not a failed capture, it is a leak.** Check
every shot before committing it.

The hub lives in the tray. Running `AutomationForgeHub.exe` again surfaces the
existing instance's window rather than starting a second one.

### Driving the editor to reach a panel: don't

`SlateInspectorToolset` offers Playwright-style control of the editor UI, and
it is genuinely useful for *reading* the widget tree. But on 2026-09-23 its
clicks returned success and changed nothing, most likely because the editor
was not the foreground application.

**The escalation from there — forcing focus, or sending OS-level input — is
the thing that wiped 788 map actors here once.** It is not worth it for a
screenshot. Ask whoever is at the machine to open the panel, then capture it.
That takes them five seconds and carries no risk.

### Using them

`<Shot>` and `<YouTube>` are available in any MDX page:

```mdx
<Shot src="/shots/hub/plugins.png" width={1008} height={761}
      alt="What the picture shows, for someone who cannot see it."
      caption="What to look at, and why it is here." />

<YouTube id="qROAvFtDoBw" title="..." caption="..." />
```

Two rules, both in the components' own comments: a caption says **what to look
at**, not what the picture obviously is; and a screenshot is **a claim with a
date on it** — prose can be corrected in a sentence, a shot has to be retaken.
Prefer one good shot of what a page is about over a gallery that rots.

`<YouTube>` loads nothing until clicked and uses `youtube-nocookie.com`, so a
reader who never presses play is never tracked.

## Deployment

Live at **https://kovati-docs.web.app**, Firebase Hosting site `kovati-docs`
in project `automation-forge-hq` — the same project as kovati.dev (`www`) and
app.kovati.dev (`app`). `docs.kovati.dev` is **not attached yet**; that is a
deliberate second step, so the site can be looked at before anything points at
it.

| Workflow | When | What |
|---|---|---|
| `deploy.yml` | push to main, manual, `repository_dispatch: manifest-updated` | Build, check links, publish |
| `deploy.yml` | pull request | Build and check links, publish nothing |
| `refresh-manifest.yml` | every six hours, manual | Sync the manifest, regenerate changelogs, commit and publish **if a version moved** |
| `publish.yml` | called by both | The build-and-deploy recipe, in one place |

Two things worth knowing before editing these:

- **A push made with `GITHUB_TOKEN` does not trigger other workflows.** That is
  why the refresh publishes from its own run instead of leaving it to
  `deploy.yml`, and why its publish job checks out `main` rather than the
  commit the run started from — the manifest landed after that commit.
- **`FIREBASE_SERVICE_ACCOUNT` is a repository secret and a human adds it.**
  Without it the deploy step fails loudly rather than going green having
  published nothing, which is the failure the website repo actually had for six
  weeks.

The cache headers are scoped rather than blanket: a year and `immutable` only
under `/_next/static/**`, where Next puts a content hash in every filename.
The screenshots under `/shots/**` keep their names when the picture behind them
is replaced, so they revalidate hourly — a corrected screenshot that nobody
could see for a year is a worse outcome than a request.

## Making it the destination

The wiki exists and is published. Nothing points at it yet except the website
and the organisation profile, which means the people most likely to want it —
somebody who has just installed a plugin, or an agent holding its toolset —
still have no route in. Four pieces of work, in the order they are worth doing.

### 1. `DocsURL` in every descriptor

Unreal shows a plugin's `DocsURL` in the Plugins browser, so it is the one link
a person already has. Today it is the GitHub mirror for `open` plugins and
`kovati.dev/plugins/<set>/` for the rest — both from before a wiki existed.
Each should point at that set's page.

**Generate it, do not type it.** 37 descriptors is 37 chances to drift, and
`forge/tools/sync.ps1` already writes generated facts into marked regions. This
belongs as one entry in its `$Generators` table, not as a sweep.

### 2. Every plugin README

Same rule and the same mechanism: a marked region carrying the set's wiki link,
so a README that is regenerated stays right and nobody edits 37 files. The
mirrors pick it up on the next `Mirror sources` run.

### 3. A surface in the editor

The hub is the obvious host — it already has pages a person opens without a
project. Somewhere between a *Documentation* entry on the Automation Forge
menu and a per-panel link that lands on the page for the panel you are looking
at. The second is much better and costs more; the first is worth having while
the second is decided.

### 4. Point agents at it

Less obvious and possibly the most valuable. An agent holding `MeshForgeToolset`
can list the tools but has nothing that explains *why* a stale stage is not a
failed one. The toolsets already carry `UAgentSkill` — four of them do not,
which `forge-inventory` records as an open item — and a skill is the natural
place to name the page.

Worth deciding first: whether an agent should be handed a **URL** (cheap, needs
network) or the **page's text** (costly in context, always available). The
answer is probably a URL plus the one paragraph that matters, which is an
argument for the wiki carrying short canonical summaries an agent can be given
verbatim.

None of this is started. It is written down because "add a link everywhere"
is the kind of task that sounds small, touches 37 repositories, and is done
badly exactly once.

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

### ~~The search index is ~3 MB~~ — split 2026-09-23

There are now two, because one of them has no ceiling.

| Index | Holds | Size today |
|---|---|---|
| `/api/search` | Everything a person reads | 3.4 MB |
| `/api/search-changelogs` | Release notes only | 1.5 MB |

The changelogs were the problem. 121 releases cost about 1.5 MB of index; at
the rate this family ships that is roughly 14 KB a release, so a thousand
releases would have put the single index past 15 MB — and every reader looking
up how garment fit works would have downloaded four years of patch notes to do
it. The dialog has a **Docs / Changelogs** switch and only fetches the second
one if somebody presses it.

The split is by URL prefix (`/docs/releases/*`) rather than a frontmatter flag,
because those pages are generated and a generator that must remember to set a
flag will one day forget. See `lib/search-index.ts`.

Both are uncompressed figures; they gzip far smaller, and neither is fetched
until the dialog opens. If the prose index becomes noticeable on its own, the
answer is a hosted index (Orama Cloud or Algolia), not a server — the site
should stay static.

<!-- A route note worth keeping: the second index cannot live at
     /api/search/changelogs. On a static export /api/search is a file, so it
     cannot also be a directory, and the export fails with EPERM on copyfile.
     Hence the sibling path. -->

### Release notes live per plugin

`tools/gen-changelogs.mjs` writes one page per plugin under
`content/docs/releases/` from the manifest, grouped by minor series, and runs
as part of `build`, `verify` and `sync:manifest`. The pages are generated, so
hand edits are lost — which is the point: they carry hundreds of version
numbers, and this wiki's rule is that no page types one.

**`/releases` is gone.** It rendered every version of every plugin with full
notes on one page, which was already long at 121 and unusable at a thousand.
Capping it to a window was the first attempt and made it worse: the home page
still advertised it as *"All 121 published versions"* while it showed 25.

Everything it had is now somewhere better. The per-plugin pages carry each
version's download link, size and GitHub release — which is where somebody
after a particular build actually looks. The changelogs index is the
cross-plugin view: every plugin, its latest version and its date, in one table.
The home page keeps the six most recent as activity. Nothing lost, one
destination instead of two both called Releases.

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
