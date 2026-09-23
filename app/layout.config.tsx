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
  /**
   * `on: 'nav'` on the product lines is load-bearing.
   *
   * Inside the docs layout these same three sections are already the sidebar's
   * root switcher, so letting them render in the sidebar menu too puts every
   * product line on screen twice, three rows apart. They belong in the header,
   * where they are the only navigation a non-docs page has.
   *
   * Changelogs is left off `'nav'` for the opposite reason: it *is* a docs
   * root, so the sidebar switcher already offers it, and a header link as well
   * would put it on screen twice. It stays here so the non-docs pages have a
   * way in.
   */
  links: [
    {
      text: 'Automation Forge',
      url: '/docs/automation-forge',
      active: 'nested-url',
      description: 'The plugin family for Unreal Engine',
      on: 'nav',
    },
    {
      text: 'Tools',
      url: '/docs/tools',
      active: 'nested-url',
      description: 'Utilities that are not part of a Forge set',
      on: 'nav',
    },
    {
      text: 'Company',
      url: '/docs/company',
      active: 'nested-url',
      description: 'PlayableOps, the vision, and who we are',
      on: 'nav',
    },
    {
      text: 'Changelogs',
      url: '/docs/releases',
      active: 'nested-url',
      description: 'Every released version, one page per plugin',
    },
  ],
  /** Renders its own icon button. Adding a second GitHub link duplicates it. */
  githubUrl: 'https://github.com/AutomationForgeHQ/kovati-docs',
}
