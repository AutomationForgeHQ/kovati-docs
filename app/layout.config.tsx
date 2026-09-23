import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { KovatiMark } from '@/components/KovatiMark'

/**
 * The shared chrome.
 *
 * Top-level links are *product lines plus the company* — the split chosen on
 * 2026-09-23 — and nothing else. Resist adding a link per popular page: eight
 * flat links is a list, not a structure, and the marketing site already
 * learned that lesson the expensive way.
 *
 * Kovati Studio and Kovati Pro are deliberately absent. Studio ships when the
 * desktop app and the companion are both released; Pro does not exist yet.
 * A nav entry pointing at an empty section is worse than no entry, because it
 * promises documentation that is not there. See CONTENT_PLAN.md.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <KovatiMark className="h-5 w-5" />
        <span className="font-semibold tracking-tight">Kovati Docs</span>
      </>
    ),
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Automation Forge',
      url: '/docs/automation-forge',
      active: 'nested-url',
      description: 'The plugin family for Unreal Engine',
    },
    {
      text: 'Tools',
      url: '/docs/tools',
      active: 'nested-url',
      description: 'Utilities that are not part of a Forge set',
    },
    {
      text: 'Company',
      url: '/docs/company',
      active: 'nested-url',
      description: 'PlayableOps, the vision, and who we are',
    },
    {
      text: 'Releases',
      url: '/releases',
      active: 'nested-url',
      description: 'Every published version, from the manifest',
    },
    {
      type: 'icon',
      icon: <GitHubIcon />,
      text: 'GitHub',
      url: 'https://github.com/AutomationForgeHQ',
      external: true,
    },
  ],
  githubUrl: 'https://github.com/AutomationForgeHQ/kovati-docs',
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}
