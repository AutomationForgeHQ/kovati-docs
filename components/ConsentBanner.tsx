'use client'

import { useEffect, useState } from 'react'
import { GA_ID } from './Analytics'
import { site } from '@/lib/site'

/**
 * The cookie question, asked once and remembered.
 *
 * Deliberately not a dark pattern: Decline is the same size and weight as
 * Accept, neither is pre-selected, and declining is a real answer that sticks
 * rather than a dialog that returns next visit. The choice lives in
 * `localStorage`, which needs no consent of its own because it is what records
 * the consent — and refusing means nothing is ever written beyond it.
 *
 * It uses the same key as kovati.dev, and it will still ask a visitor who
 * already answered there: `localStorage` is per-origin and these are two
 * origins. That is a real cost of keeping the wiki on its own domain, and the
 * shared key is what makes the answer carry over if they are ever merged.
 */
const KEY = site.consentKey
type Choice = 'granted' | 'denied'

function apply(choice: Choice) {
  window.gtag?.('consent', 'update', {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  })
}

function stored(): Choice | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null // private mode, or storage blocked: ask, and forget the answer
  }
}

export function ConsentBanner() {
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    if (!GA_ID) return
    const prior = stored()
    if (prior) apply(prior) // re-assert on every load; consent state is per-page
    else setAsking(true)
  }, [])

  if (!GA_ID || !asking) return null

  const answer = (choice: Choice) => {
    try {
      localStorage.setItem(KEY, choice)
    } catch {
      /* the answer still applies to this page even if it cannot be remembered */
    }
    apply(choice)
    setAsking(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-fd-border bg-fd-card/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fd-muted-foreground">
          We use Google Analytics to see which pages people read. Nothing is
          stored on your device unless you accept, and nothing here identifies
          you.{' '}
          <a
            href={`${site.www}/privacy`}
            className="underline decoration-dotted underline-offset-4 hover:text-fd-primary"
          >
            What we collect
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => answer('denied')}
            className="rounded-md border border-fd-border px-4 py-2 text-sm transition-colors hover:border-fd-primary hover:text-fd-primary"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => answer('granted')}
            className="rounded-md bg-fd-primary px-4 py-2 text-sm text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
