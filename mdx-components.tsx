import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { File, Folder, Files } from 'fumadocs-ui/components/files'
import { TypeTable } from 'fumadocs-ui/components/type-table'
import type { MDXComponents } from 'mdx/types'
import { SetMembers } from '@/components/SetMembers'
import { PluginVersion } from '@/components/PluginVersion'
import { ReleaseNotes } from '@/components/ReleaseNotes'
import { DistributionTable } from '@/components/DistributionTable'

/**
 * Components every page can use without importing them.
 *
 * The three Kovati-specific ones all exist for the same reason: they read the
 * release manifest so that prose does not have to. `<PluginVersion>` is a
 * number nobody maintains, `<SetMembers>` is a table nobody maintains, and
 * `<ReleaseNotes>` is a history nobody transcribes. Every one of those was a
 * hand-maintained copy somewhere in this family at some point, and every one
 * of them drifted.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    Callout,
    Card,
    Cards,
    Step,
    Steps,
    File,
    Folder,
    Files,
    TypeTable,
    SetMembers,
    PluginVersion,
    ReleaseNotes,
    DistributionTable,
    ...components,
  }
}
