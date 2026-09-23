'use client'

import { useState } from 'react'

/**
 * A YouTube embed that loads nothing until someone asks for it.
 *
 * YouTube's player is several hundred kilobytes of script that has no business
 * running on a documentation page nobody came to watch a video on. So this
 * renders a poster and a play button, and only mounts the iframe on click —
 * the same trade the marketing site makes, for the same reason.
 *
 * `youtube-nocookie.com` is deliberate: a docs page should not set an
 * advertising cookie on a reader who never pressed play, and with the facade
 * it does not contact YouTube at all until they do. The only request before
 * that is the poster image.
 *
 * The poster falls back from `maxresdefault` (which exists for anything
 * uploaded at 1080 or above) to `hqdefault` (which always exists), so a
 * missing poster is a slightly softer image rather than a hole in the page.
 */
export function YouTube({
  id,
  title,
  start,
  caption,
}: {
  /** The video id, not the URL. */
  id: string
  title: string
  /** Seconds to start at. */
  start?: number
  caption?: string
}) {
  const [playing, setPlaying] = useState(false)
  const [poster, setPoster] = useState(
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  )

  return (
    <figure className="not-prose my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-fd-border bg-fd-muted">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1${
              start ? `&start=${start}` : ''
            }`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Play: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              loading="lazy"
              onError={() => setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/40 backdrop-blur transition-colors group-hover:border-kv-amber">
                <svg
                  width="13"
                  height="15"
                  viewBox="0 0 13 15"
                  aria-hidden="true"
                  className="ms-0.5 fill-white transition-colors group-hover:fill-kv-amber"
                >
                  <path d="M12.5 7.5 0 15V0z" />
                </svg>
              </span>
              <span className="text-start text-sm font-medium text-white drop-shadow">
                {title}
              </span>
            </span>
          </button>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
