import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export default async function StoryPage({ params }: PageProps) {
  // Fetch story by slug
  const { data: story } = await supabase
    .from('deep_dive_stories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!story) {
    notFound();
  }

  // Fetch related TripKit
  let tripkit = null;
  if (story.tripkit_id) {
    const { data: tk } = await supabase
      .from('tripkits')
      .select('id, name, slug, code')
      .or(`code.eq.${story.tripkit_id},code.eq.${story.tripkit_id.replace('TKE-', 'TK-')}`)
      .single();
    tripkit = tk;
  }

  // Parse markdown content (basic rendering - you may want to use a markdown library)
  const content = story.content_markdown || story.summary || '';

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Link */}
        {tripkit && (
          <Link
            href={`/tripkits/${tripkit.slug}/view`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tripkit.name}
          </Link>
        )}

        {/* Story Header */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {story.featured_image_url && (
            <div className="relative h-96 w-full">
              <SafeImage
                src={story.featured_image_url}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="p-8">
            {/* Story Meta */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              {story.reading_time_minutes && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {story.reading_time_minutes} min read
                </span>
              )}
              {story.category && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  {story.category}
                </span>
              )}
            </div>

            {/* Title and Share */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  {story.title}
                </h1>
                {story.subtitle && (
                  <p className="text-xl text-gray-600 italic mb-6">
                    {story.subtitle}
                  </p>
                )}
              </div>
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com'}/stories/${story.slug}`}
                title={story.title}
                description={story.subtitle || story.summary || ''}
                image={story.featured_image_url || undefined}
                variant="dropdown"
              />
            </div>

            {/* Location Info */}
            {story.location_name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">{story.location_name}</div>
                    {story.location_address && (
                      <div className="text-sm text-gray-600">{story.location_address}</div>
                    )}
                    {story.drive_time_from_slc && (
                      <div className="text-sm text-gray-600 mt-1">
                        {Math.floor(story.drive_time_from_slc / 60)}h {story.drive_time_from_slc % 60}m from SLC Airport
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {story.summary && (
              <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-gray-700 leading-relaxed">{story.summary}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {content ? (
                <div 
                  className="story-content"
                  dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                />
              ) : (
                <p className="text-gray-600">Content coming soon...</p>
              )}
            </div>

            {/* Share CTA */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  💡 Share This Story
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Know someone interested in this story? Share it with friends and family!
                </p>
                <div className="flex justify-center">
                  <ShareButton
                    url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com'}/stories/${story.slug}`}
                    title={story.title}
                    description={story.subtitle || story.summary || ''}
                    image={story.featured_image_url || undefined}
                    variant="dropdown"
                  />
                </div>
              </div>
            </div>

            {/* Related TripKit CTA */}
            {tripkit && (
              <div className="mt-6 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Explore More in {tripkit.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This story is part of the {tripkit.name} TripKit. Explore all destinations and stories.
                  </p>
                  <Link
                    href={`/tripkits/${tripkit.slug}/view`}
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Full TripKit →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
