import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/**
 * Static export, for the same reason kovati.dev is static: the wiki is public
 * prose and generated release data, none of which needs a server at request
 * time. Firebase Hosting serves `out/` and nothing can be down but the CDN.
 *
 * A build and a running dev server share `.next` and corrupt each other — the
 * dev server keeps writing into the directory the build is replacing, and what
 * comes out is a half-broken site with no error to explain it. `npm run verify`
 * sets NEXT_DIST_DIR so a verification build gets its own scratch space and
 * both can run at once. The exported site still lands in `out/`.
 *
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: { unoptimized: true },
  trailingSlash: true,
  devIndicators: false,
}

export default withMDX(config)
