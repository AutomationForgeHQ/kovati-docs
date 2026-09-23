import './global.css'
import { RootProvider } from 'fumadocs-ui/provider/next'
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
  },
  robots: { index: true, follow: true },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider
          search={{
            options: {
              type: 'static',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
