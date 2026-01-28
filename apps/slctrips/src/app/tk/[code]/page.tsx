import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { TripKit, Destination } from '@/types/database.types';
import TripKitViewer from '@/components/TripKitViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0; // Don't cache - check access every time

interface PageProps {
  params: { code: string };
  searchParams?: { email?: string };
}

export default async function TripKitAccessPage({ params, searchParams }: PageProps) {
  const accessCode = params.code.toUpperCase();
  const customerEmail = searchParams?.email;

  // Validate access code
  const { data: accessData, error: accessError } = await supabase
    .rpc('validate_tripkit_access_code', { p_code: accessCode });

  if (accessError || !accessData || accessData.length === 0 || !accessData[0].is_valid) {
    console.error('Access code validation failed:', accessError);
    notFound();
  }

  const access = accessData[0];

  // Fetch full TripKit details
  const { data: tripkit, error: tripkitError } = await supabase
    .from('tripkits')
    .select('*')
    .eq('id', access.tripkit_id)
    .single();

  if (tripkitError || !tripkit) {
    console.error('TripKit fetch failed:', tripkitError);
    notFound();
  }

  const tk = tripkit as TripKit;

  // Fetch destinations in this TripKit
  const { data: tripkitDestinations } = await supabase
    .from('tripkit_destinations')
    .select('destination_id, display_order')
    .eq('tripkit_id', tk.id)
    .order('display_order', { ascending: true });

  const destinationIds = (tripkitDestinations ?? []).map(td => td.destination_id);

  let destinations: Destination[] = [];
  if (destinationIds.length > 0) {
    const { data, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .in('id', destinationIds);

    if (!destError && data) {
      // CRITICAL: Sanitize destinations before processing
      const { sanitizeDestinations } = await import('@/lib/sanitizeDestination');
      const sanitized = sanitizeDestinations(data as Destination[]);
      
      // Sort destinations by the display_order from tripkit_destinations
      const orderMap = new Map(
        tripkitDestinations?.map(td => [td.destination_id, td.display_order]) ?? []
      );
      destinations = sanitized.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 999;
        const orderB = orderMap.get(b.id) ?? 999;
        return orderA - orderB;
      });
    }
  }

  // Fetch user progress (if exists)
  const { data: progress } = await supabase
    .from('user_tripkit_progress')
    .select('*')
    .eq('access_code_id', access.access_code_id)
    .eq('tripkit_id', tk.id)
    .single();

  // Record access code usage (fire and forget)
  supabase
    .rpc('record_access_code_usage', {
      p_code: accessCode,
      p_ip: null,
      p_ua: null
    })
    .then(
      () => {}, // Success - silently recorded
      () => {} // Failure - silently ignore
    );

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <ErrorBoundary
          fallback={
            <div className="container mx-auto px-4 py-20 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Something went wrong loading your TripKit
              </h1>
              <p className="text-gray-600 mb-6">
                We&apos;re sorry for the inconvenience. Please try refreshing the page.
              </p>
              <a
                href={`/tk/${accessCode}`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </a>
            </div>
          }
        >
          <TripKitViewer
            tripkit={tk}
            destinations={destinations}
            accessCode={accessCode}
            accessCodeId={access.access_code_id}
            customerEmail={access.customer_email}
            progress={progress}
          />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
