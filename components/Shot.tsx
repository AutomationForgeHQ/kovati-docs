import Image from 'next/image'

/**
 * A screenshot of a panel, window or page, with a caption.
 *
 * Every shot on this site is rendered from the target window's own handle
 * (`tools/capture-window.ps1`), never copied off the screen — see the comment
 * in that script for why that distinction is not pedantry.
 *
 * Two rules for using this:
 *
 * 1. **The caption says what to look at**, not what the picture obviously is.
 *    "The MotionForge panel" is wasted words under a picture of the MotionForge
 *    panel. "Step 2 refuses to continue, and says which step to fix" is the
 *    reason the shot is there.
 * 2. **A shot is a claim with a date on it.** A panel changes; prose can be
 *    corrected in a sentence but a screenshot has to be retaken. Prefer one
 *    good shot of the thing a page is actually about over a gallery that will
 *    rot in three releases.
 *
 * Images are unoptimised (the export is static), so capture at the size you
 * want to serve rather than relying on a resize.
 */
export function Shot({
  src,
  alt,
  caption,
  width,
  height,
}: {
  /** Path under `public/`, e.g. `/shots/hub/plugins.png`. */
  src: string
  /** What the picture shows, for someone who cannot see it. Required. */
  alt: string
  caption?: string
  width: number
  height: number
}) {
  return (
    <figure className="not-prose my-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full rounded-lg border border-fd-border bg-fd-muted"
      />
      {caption ? (
        <figcaption className="mt-2 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
