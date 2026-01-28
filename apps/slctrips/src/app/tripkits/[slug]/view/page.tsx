import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabase } from '@/lib/supabaseClient';
import { supabaseServer } from '@/lib/supabaseServer';
import { TripKit, Destination, Guardian } from '@/types/database.types';
import TripKitViewer from '@/components/TripKitViewer';
import CountyGuardianViewer from '@/components/CountyGuardianViewer';
import TripKitEmailGate from '@/components/TripKitEmailGate';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;
export const dynamic = 'force-dynamic'; // Force dynamic rendering for access code validation

interface PageProps {
  params: { slug: string };
  searchParams: { access?: string };
}

export default async function TripKitViewerPage({ params, searchParams }: PageProps) {
  // Create SSR Supabase client that can read user session from cookies
  const cookieStore = cookies();

  const supabaseSSR = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          return value;
        },
        set() {},
        remove() {},
      },
    }
  );

  // Fetch TripKit
  const { data: tripkit } = await supabase
    .from('tripkits')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tripkit) {
    notFound();
  }

  const tk = tripkit as TripKit;

  // Check if this is TK-000 (the county-based guardian tripkit)
  const isCountyGuardianTripkit = tk.code === 'TK-000';
  const isTK000 = tk.code === 'TK-000';

  // TK-000 Email Gate: Check for valid access code
  if (isTK000) {
    const accessCodeFromUrl = searchParams.access;

    // If no access code in URL, show email gate
    if (!accessCodeFromUrl) {
      return <TripKitEmailGate
        tripkitSlug={tk.slug}
        tripkitName={tk.name}
        tripkitCode={tk.code}
      />;
    }

    // Validate access code against database (using server client to bypass RLS)
    const { data: validationResult } = await supabaseServer
      .rpc('validate_tripkit_access_code', { p_code: accessCodeFromUrl });

    // Check if validation returned valid access
    const isValidAccess = validationResult &&
                          validationResult.length > 0 &&
                          validationResult[0].is_valid &&
                          validationResult[0].tripkit_id === tk.id;

    if (!isValidAccess) {
      // Invalid access code - show email gate
      return <TripKitEmailGate
        tripkitSlug={tk.slug}
        tripkitName={tk.name}
        tripkitCode={tk.code}
      />;
    }

    // Record access usage
    await supabaseServer.rpc('record_access_code_usage', {
      p_code: accessCodeFromUrl
    });
  }

  // For paid TripKits (non-TK-000), check if user has access
  if (!isTK000 && tk.price > 0 && tk.status !== 'freemium') {
    // Get the current user from SSR client (reads from cookies)
    const { data: { user } } = await supabaseSSR.auth.getUser();

    let hasAccess = false;

    if (user) {
      // Check if user has access via customer_product_access table (using service role to bypass RLS)
      const { data: accessRecord } = await supabaseServer
        .from('customer_product_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', tk.id)
        .eq('product_type', 'tripkit')
        .single();

      if (accessRecord) {
        hasAccess = true;
      }
    }

    // If no access, show access required page
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Access Required</h1>
            <p className="text-gray-600 mb-6">
              This TripKit requires purchase or an access code.
            </p>
            <a
              href={`/tripkits/${params.slug}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to TripKit Info
            </a>
          </div>
        </div>
      );
    }
  }

  // Fetch destinations in this TripKit
  const { data: tripkitDestinations } = await supabase
    .from('tripkit_destinations')
    .select('destination_id')
    .eq('tripkit_id', tk.id);

  const destinationIds = (tripkitDestinations ?? []).map(td => td.destination_id);

  let destinations: Destination[] = [];
  if (destinationIds.length > 0) {
    const { data } = await supabase
      .from('public_destinations')
      .select('*')
      .in('id', destinationIds);

    // CRITICAL: Sanitize destinations before passing to components
    const { sanitizeDestinations } = await import('@/lib/sanitizeDestination');
    destinations = sanitizeDestinations((data as Destination[] | null) ?? []);
  }

  // Fetch deep dive stories for this TripKit (support both TK-XXX and TKE-XXX formats)
  const tkeCode = tk.code.replace('TK-', 'TKE-');
  const { data: stories } = await supabase
    .from('deep_dive_stories')
    .select('id, slug, title, subtitle, summary, reading_time_minutes, featured_image_url')
    .or(`tripkit_id.eq.${tk.code},tripkit_id.eq.${tkeCode}`)
    .order('published_at', { ascending: false });

  // Get actual access code data (for TK-000) or use demo for other free tripkits
  let accessCode = `DEMO-${tk.code}`;
  let accessCodeId = 'demo-access-id';
  let customerEmail = 'preview@slctrips.com';

  if (isTK000 && searchParams.access) {
    // Use the validated access code from TK-000
    accessCode = searchParams.access;

    // Get the access code record details (using server client to bypass RLS)
    const { data: accessRecord } = await supabaseServer
      .from('tripkit_access_codes')
      .select('id, customer_email')
      .eq('access_code', searchParams.access)
      .single();

    if (accessRecord) {
      accessCodeId = accessRecord.id;
      customerEmail = accessRecord.customer_email;
    }
  }

  // For TK-000, fetch guardians and use county-based viewer
  if (isCountyGuardianTripkit) {
    const { data: guardians } = await supabase
      .from('guardians')
      .select('*')
      .order('county');

    return (
      <>
        <Header />
        <ErrorBoundary>
          <CountyGuardianViewer
            tripkit={tk}
            destinations={destinations}
            guardians={(guardians as Guardian[] | null) ?? []}
            accessCode={accessCode}
          />
        </ErrorBoundary>
        <Footer />
      </>
    );
  }

  // Default viewer for other tripkits
  return (
    <>
      <Header />
      <ErrorBoundary>
        <TripKitViewer
          tripkit={tk}
          destinations={destinations}
          stories={stories || []}
          accessCode={accessCode}
          accessCodeId={accessCodeId}
          customerEmail={customerEmail}
          progress={null}
        />
      </ErrorBoundary>
      <Footer />
    </>
  );
}
