'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { site } from '@/lib/site'

/**
 * GA4, behind consent. The same three-step shape kovati.dev uses.
 *
 * Three pieces have to happen in this order or the consent is theatre:
 *
 *  1. `consent default` is set to denied, inline in <head> (see layout.tsx),
 *     before gtag.js is fetched. Setting it afterwards is too late — the
 *     library will already have written a cookie.
 *  2. gtag.js loads and, with storage denied, sends *cookieless* pings.
 *     Nothing is written to the device.
 *  3. `ConsentBanner` calls `consent update` when somebody accepts, and only
 *     then does GA behave like GA.
 *
 * Route changes are sent by hand because navigation here is client-side:
 * gtag's own page_view fires once, on first load, and would never fire again
 * however far somebody read — which on a documentation site is most of the
 * reading.
 */
export const GA_ID = site.analytics.ga4

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!GA_ID || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
    })
  }, [pathname])

  if (!GA_ID) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false, anonymize_ip: true });`}
      </Script>
    </>
  )
}
