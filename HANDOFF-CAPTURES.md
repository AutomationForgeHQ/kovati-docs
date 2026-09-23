# Handoff: screenshots for the Kovati wiki

You are working on a real, in-use Windows workstation belonging to Bojan
Andrejek at Kovati. Your job is to add screenshots to a documentation site by
capturing the applications the site documents, and to write the short captions
that go with them.

Read all of **Rules that are not negotiable** before you do anything.

---

## Rules that are not negotiable

### 1. Never capture the whole screen or the desktop

Private applications are open on this machine right now — **WhatsApp, Discord,
a personal browser window, an email client**. A full-screen capture, or a
capture of a screen region, will contain someone's private messages.

- Capture **one application window at a time**, by that window's own handle.
- The supplied script does this correctly. Prefer it over your own screenshot
  capability:

  ```powershell
  cd C:\UNREAL\kovati-docs
  .\tools\capture-window.ps1 -ProcessName AutomationForgeHub -Out public\shots\hub\runners.png
  .\tools\capture-window.ps1 -ProcessName UnrealEditor -TitleLike "MotionForge*" -Out shot.png
  ```

  It renders the window from its handle with `PrintWindow`, so nothing in
  front of the window can appear in the image. It refuses when more than one
  window matches, rather than guessing — narrow it with `-TitleLike`.

- **If any image you produce contains anything other than the target
  application window, delete it immediately, do not read it, and say so.**

This has gone wrong here before: on 2026-08-28 a screen copy captured a
private messaging window. That is why the rule exists and why it is first.

### 2. Never click anything that spends money or destroys work

You are in live production software connected to a real paid account.

**Never click:**

- **Generate**, **Generate All**, **Create and open**, or any button showing a
  price — in MotionForge, MeshForge, SpeechForge, FaceForge or SurfaceForge.
  These call paid APIs or start a GPU that bills by the hour.
- **Buy**, **Install set** on a paid plugin, or anything in the hub's account
  area.
- **Rent a GPU**, **Provision**, or any cloud action.
- **Delete**, **Uninstall**, **Remove**, **Discard**, **Force regenerate**,
  **Clear**, or **Reset**.
- **Wrap**, **Finish**, or **Save** inside MeshForge's Garment Studio.

**Safe to click:** tabs, page switches, sidebar entries, collapsible section
headers, and drawers (Keys, Settings, Runners). If you are not certain a
control is read-only, **do not click it — ask.**

### 3. Never send keyboard input to the Unreal editor

Sending `Ctrl+A` then `Delete` to this editor once deleted 788 map actors from
a level. Do not send key combinations to Unreal at all. Navigate by clicking
named tabs and buttons only.

### 4. Never close or force-quit the Unreal editor

If the editor must be closed, ask. Close it normally, never by killing the
process.

### 5. When the software contradicts the documentation, the software is right

If a panel does not match what a page claims, **do not edit the prose to match
your guess and do not invent an explanation.** Record it in a list of
discrepancies and report it at the end. Some pages describe things
deliberately, and some claims are about code you cannot see from the UI.

---

## The project

| | |
|---|---|
| Repo | `C:\UNREAL\kovati-docs` (git, public, remote `AutomationForgeHQ/kovati-docs`) |
| What it is | The Kovati wiki — documentation for Automation Forge, a family of Unreal Engine 5.8 plugins |
| Stack | Next.js 16, React 19, Fumadocs 16, Tailwind 4, static export |
| Content | MDX under `content/docs/` |
| Images | `public/shots/<area>/<name>.png`, referenced as `/shots/<area>/<name>.png` |

### Build and preview

```powershell
cd C:\UNREAL\kovati-docs
npm run build          # builds, exports to out\, writes prefetch aliases
npx serve out -p 3226  # preview at http://127.0.0.1:3226
npm run check:links    # every internal link must resolve
```

A preview server may already be running on port 3226.

**Search does not work under `npm run dev`** — the dev server blocks the
dialog's chunk over `127.0.0.1` and fails silently. Always test against
`npm run build` plus `npx serve out`.

### Applications you will capture

| App | How to reach it |
|---|---|
| **Automation Forge hub** | Already running, may be in the system tray. Running `C:\Users\boyan\AppData\Local\Programs\Automation Forge\AutomationForgeHub.exe` again surfaces the existing window rather than starting a second instance. |
| **Unreal Editor** | Running, project `Kovati_DEMO`. Forge panels are under **Tools ▸ Automation Forge ▸ …** in the menu bar. |

---

## How to add a screenshot

Two components are already registered and available in every MDX page.

```mdx
<Shot
  src="/shots/hub/runners.png"
  width={1008}
  height={761}
  alt="Describe what the picture shows, for a reader who cannot see it. Full sentences. Name the controls and the states you can see."
  caption="Say what to look at and why it is here."
/>
```

```mdx
<YouTube id="qROAvFtDoBw" title="Video title" caption="Optional." />
```

`width` and `height` are the image's real pixel dimensions — the capture
script prints them. They must be right or the layout jumps while loading.

### The two writing rules

1. **A caption says what to look at, not what the picture obviously is.**
   "The Runners tab" is wasted words under a picture of the Runners tab.
   "Docker state is read from Docker itself, so Start and Stop act on what is
   actually there" is why the shot is on the page.

2. **`alt` is for someone who cannot see the image.** Describe the controls,
   the labels and the states visible. It is not a caption and not a repeat of
   one.

### Where shots belong

One good shot per page, placed under the heading it illustrates. **Do not
build galleries.** A screenshot is a claim with a date on it — prose can be
fixed in a sentence, a screenshot has to be retaken — so prefer one capture of
the thing a page is actually about over five that will all rot together.

---

## Part 1 — the test run: the hub page

Page: `content/docs/automation-forge/hub.mdx`
Preview: http://127.0.0.1:3226/docs/automation-forge/hub/

It already has the setup video and one capture of the **Plugins** tab. Read
the page first so your captions continue its voice rather than restating it.

Capture these three, into `public/shots/hub/`:

| Shot | Section it belongs under | What the caption should draw attention to |
|---|---|---|
| **Runners** tab | `## Runners` | That container state is read from Docker itself, so Start and Stop act on what is really there — and that you start a runner *before* opening an editor |
| **Keys** drawer | `## Keys, Settings and the account` | That one page lists every key every installed plugin declares, and that it reaches the Windows Credential Manager at the same entries the plugins use |
| **Settings** drawer | same section | Channel, start with Windows, tray, notifications, and the extra plugin folder |

Then:

```powershell
npm run build
npm run check:links
```

Open the page in the preview and check each image renders, is legible at page
width, and sits under the right heading.

**Stop here and report back** with what you captured and anything that did not
match the page. Do not continue to Part 2 until the hub page is agreed.

---

## Part 2 — the rest of the system

Only after Part 1 is approved.

Work **one set at a time**, in this order. For each: open the panel, capture,
write the caption, build, check the preview, commit, then move on. Do not
batch five sets and commit once.

### MotionForge — `content/docs/automation-forge/motionforge/`

| Page | Shot |
|---|---|
| `index.mdx` | The MotionForge tab, **Get started** page. Make the window tall enough that step 1 is not cut off. Worth showing: it refuses with *"Choose or make a character that suits the provider, in step 2"* — the panel names the step to fix |
| `concepts.mdx` | A Motion Definition window, **Takes** tab — the stage, and the numbered take list with when, provider, model, seed, length, cost and state |
| `concepts.mdx` or `index.mdx` | The **Generate** panel, showing the price on the button before it is pressed. **Do not press it** |
| `sequencer.mdx` | A Motion Prompt Track in Sequencer, one section per beat |
| `providers.mdx` | The Kimodo Runner panel — *This machine* / *Another machine* / *A rented GPU*, and the measured Llama 3 access row |

### MeshForge — `content/docs/automation-forge/meshforge/`

| Page | Shot |
|---|---|
| `concepts.mdx` | A Mesh Definition editor, **Stages** tab — five stages as numbered collapsible boxes with status badges |
| `concepts.mdx` | The **Mesh** tab viewer — A/B compare |
| `garment.mdx` | The Garment Studio, **Pose and place** mode with the joint handles. **Do not press Wrap, Finish or Save** |
| `post-processing.mdx` | A Post stage with a chain of steps and the reorder arrows |

### SpeechForge — `content/docs/automation-forge/speechforge/`

| Page | Shot |
|---|---|
| `casting.mdx` | Speech Library, **Cast** page — the cast list, the profiles with *used by*, the provider browser |
| `concepts.mdx` | The **Write** page — lines with text, direction and speaker |
| `concepts.mdx` | The **Produce** page — the pipeline table and the estimate. **Do not press Generate** |

### FaceForge — `content/docs/automation-forge/faceforge/`

| Page | Shot |
|---|---|
| `concepts.mdx` | The Face Bank panel — clip list with status, origin, layers and staleness, plus the live preview stage |
| `correction.mdx` | A face correction sequence in Sequencer — the absolute base section with the additive section above it |

### PerformanceForge — `content/docs/automation-forge/performanceforge/`

| Page | Shot |
|---|---|
| `index.mdx` | The Performance Capture panel with device selection and preview. **Do not start a recording** |
| `sessions-and-takes.mdx` | The Session page — lines with state and take counts, per-line take lists |

### Lower priority

`montageforge.mdx`, `surfaceforge.mdx`, `tools/mesh-weight-remap.mdx`,
`automation-forge/pipelines.mdx` (the pipeline graph editor),
`automation-forge/keys.mdx` (the in-editor Keys page).

---

## Things about this project you should know before writing anything

- **Never type a version number, a download URL, a file size or a release
  date into a page.** All of that is generated from a release manifest by the
  `<PluginVersion>`, `<SetMembers>`, `<ReleaseNotes>` and `<DistributionTable>`
  components. If you need a version in prose, use the component.
- **Every page declares how far to trust it** in its frontmatter `status`:
  `shipped`, `overview`, `planned` or `internal`. Do not change these.
- **British spelling**, and the existing pages' voice: plain, specific,
  willing to name a limitation. Do not add marketing language.
- Commit messages explain **why**, not which files changed. End them with:

  ```
  Co-Authored-By: <your model name> <noreply@openai.com>
  ```

- Do not push to `main` without saying what you are pushing.

---

## Report back with

1. Each shot: where it went, and its caption.
2. Anything in a panel that contradicted the page — quoted, with the page and
   the panel named. **Do not fix these yourself.**
3. Anything you refused to click, and why.
4. Any image you deleted because it contained something it should not have.
