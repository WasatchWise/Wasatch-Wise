import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    // #region agent log (debug-session)
    fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'src/app/api/purchases/by-session/route.ts:GET:entry',message:'by-session lookup called',data:{hasSessionId:!!sessionId,sessionIdPrefix:(sessionId||'').slice(0,8)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Look up the access code by Stripe session id
    const { data, error } = await supabase
      .from('tripkit_access_codes')
      .select('access_code')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error || !data) {
      // #region agent log (debug-session)
      fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'src/app/api/purchases/by-session/route.ts:GET:not_found_or_error',message:'by-session lookup returned no access_code (possible RLS/anon client)',data:{sessionIdPrefix:(sessionId||'').slice(0,8),errorCode:(error as any)?.code||null,errorMessage:(error as any)?.message||String(error||'no-data')},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // #region agent log (debug-session)
    fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'src/app/api/purchases/by-session/route.ts:GET:found',message:'by-session lookup found access_code',data:{sessionIdPrefix:(sessionId||'').slice(0,8),accessCodePrefix:(data.access_code||'').slice(0,6)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ found: true, access_code: data.access_code }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


