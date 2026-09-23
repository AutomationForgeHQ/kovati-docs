import { source } from '@/lib/source'
/**
 * `fumadocs-ui/page` rather than `fumadocs-ui/layouts/docs/page` — the former
 * wraps the latter and is the entry that carries `editOnGithub`, which is the
 * one prop this site genuinely wants: the wiki is public and every page should
 * be one click from the file that produced it.
 */
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/mdx-components'
import { Status, type StatusKind } from '@/components/Status'
import type { Metadata } from 'next'

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body
  const data = page.data as typeof page.data & {
    status?: StatusKind
    plugins?: string[]
    tagline?: string
  }

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: 'AutomationForgeHQ',
        repo: 'kovati-docs',
        sha: 'main',
        path: `content/docs/${page.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <Status kind={data.status} plugins={data.plugins} />
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  // The card is generated per page by app/og/[...slug]/route.tsx. Naming it
  // here is what makes a shared link show this page's title rather than the
  // site's, or - before any of this existed - nothing at all.
  const card = `/og/${page.slugs.length ? page.slugs.join('/') : 'index'}.png`

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      type: 'article',
      images: [{ url: card, width: 1200, height: 630, alt: page.data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [card],
    },
  }
}
