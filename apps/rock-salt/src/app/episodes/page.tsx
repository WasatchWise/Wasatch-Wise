import { getEpisodes } from '@/lib/supabase/queries'
import Container from '@/components/Container'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Episodes | The Rock Salt',
  description: 'Radio episodes with local sessions and interviews.',
}

export default async function EpisodesPage() {
  const episodes = await getEpisodes(50)

  return (
    <Container className="py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-4">
          Episodes
        </h1>
        <p className="text-lg text-zinc-400">
          Live sessions, interviews, and performances.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-md">
          <p className="text-xl text-zinc-400">
            No episodes yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {episodes.map((episode) => (
            <article
              key={episode.id}
              className="bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden hover:border-amber-500 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-zinc-100">
                    {episode.title}
                  </h2>
                  {episode.featured && (
                    <span className="text-amber-200 text-xs uppercase border border-amber-500 px-2 py-1 rounded-md ml-2" title="Featured Episode">
                      Featured
                    </span>
                  )}
                </div>

                {episode.date && (
                  <time className="text-sm text-zinc-500 block mb-4">
                    {new Date(episode.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}

                {episode.description && (
                  <p className="text-zinc-400 mb-4 line-clamp-3">
                    {episode.description}
                  </p>
                )}

                {episode.episode_links && episode.episode_links.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-300">
                      Links
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {episode.episode_links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
                        >
                          {link.label || 'Open'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Container>
  )
}
