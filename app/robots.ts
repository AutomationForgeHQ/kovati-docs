import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

// A static export emits this as a file rather than resolving it per request.
export const dynamic = 'force-static'

/**
 * Everything allowed, the AI crawlers named rather than left to the wildcard.
 *
 * The wildcard already permits them, so this changes no behaviour. It is a
 * statement, and on a documentation site it is the load-bearing one: people
 * increasingly reach software by asking an assistant, and an assistant that is
 * unsure about a site skips it. We sell an agent-native suite; documentation
 * agents cannot read would be an odd thing to publish.
 *
 * `Google-Extended` is not a crawler — it is Google's opt-out token for
 * training and grounding. Leaving it allowed is the same choice made
 * deliberately. Same list as kovati.dev, for the same reasons.
 */
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_AGENTS, allow: '/' },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
