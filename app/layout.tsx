import './global.css'
import { RootProvider } from 'fumadocs-ui/provider/next'
import KovatiSearchDialog from '@/components/SearchDialog'
import { Analytics } from '@/components/Analytics'
import { ConsentBanner } from '@/components/ConsentBanner'
import { site } from '@/lib/site'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Archivo is a variable font and renders at weight 600 for display; the hub
 * and the marketing site both do the same, so the three surfaces read as one
 * product rather than three teams.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.kovati.dev'),
  title: {
    default: 'Kovati Docs',
    template: '%s · Kovati Docs',
  },
  description:
    'Documentation for Automation Forge, the Kovati tools, and the PlayableOps discipline behind them.',
  openGraph: {
    siteName: 'Kovati Docs',
    type: 'website',
    url: site.url,
    locale: 'en_GB',
  },
  // Twitter reads its own tags before falling back to Open Graph, and without
  // this a shared link renders as a line of grey text beside the domain.
  // `summary_large_image` is what turns the generated card into the card.
  twitter: {
    card: 'summary_large_image',
    site: '@kovatidev',
    creator: '@kovatidev',
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Consent Mode v2, denied before Google's library is even fetched — the
          only ordering in which the answer can be "no". A previous acceptance
          is re-asserted here rather than after hydration, so a returning
          reader is not measured as a new refusal for the first second.
        */}
        {site.analytics.ga4 && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
var c='denied';try{var v=localStorage.getItem('${site.consentKey}');if(v==='granted')c='granted'}catch(e){}
gtag('consent','default',{analytics_storage:c,ad_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {/*
          The dialog is ours because the index is static — see
          components/SearchDialog.tsx for why the built-in one cannot serve it.
        */}
        <RootProvider search={{ SearchDialog: KovatiSearchDialog }}>
          {children}
        </RootProvider>
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  )
}
