import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// No-auth health check endpoint to diagnose scan failures
// Visit: /api/admin/scan/health
export async function GET() {
  const checks: Array<{ test: string; status: 'PASS' | 'FAIL'; detail: string }> = [];

  // 1. Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  checks.push({
    test: 'NEXT_PUBLIC_SUPABASE_URL',
    status: supabaseUrl ? 'PASS' : 'FAIL',
    detail: supabaseUrl ? `Set: ${supabaseUrl.slice(0, 30)}...` : 'NOT SET — add to Netlify env vars',
  });

  checks.push({
    test: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    status: anonKey ? 'PASS' : 'FAIL',
    detail: anonKey ? `Set: ${anonKey.slice(0, 20)}...` : 'NOT SET — add to Netlify env vars',
  });

  checks.push({
    test: 'SUPABASE_SERVICE_ROLE_KEY',
    status: serviceKey ? 'PASS' : 'FAIL',
    detail: serviceKey ? `Set: ${serviceKey.slice(0, 20)}...` : 'NOT SET — add to Netlify env vars and REDEPLOY',
  });

  // 2. Test admin client connection
  if (supabaseUrl && serviceKey) {
    try {
      const admin = createAdminClient();

      // Test scan_history access
      const { data: scanData, error: scanErr } = await admin
        .from('scan_history')
        .select('id')
        .limit(1);

      checks.push({
        test: 'scan_history table (admin client)',
        status: scanErr ? 'FAIL' : 'PASS',
        detail: scanErr ? `Error: ${scanErr.message}` : `OK — ${scanData?.length ?? 0} rows sampled`,
      });

      // Test products table access
      const { data: prodData, error: prodErr } = await admin
        .from('products')
        .select('id')
        .limit(1);

      checks.push({
        test: 'products table (admin client)',
        status: prodErr ? 'FAIL' : 'PASS',
        detail: prodErr ? `Error: ${prodErr.message}` : `OK — ${prodData?.length ?? 0} rows sampled`,
      });

      // Test insert into scan_history
      const { data: testScan, error: insertErr } = await admin
        .from('scan_history')
        .insert({ scan_mode: 'quick', status: 'running', progress: 0, cost_estimate: 0 })
        .select('id')
        .single();

      if (insertErr) {
        checks.push({
          test: 'scan_history INSERT',
          status: 'FAIL',
          detail: `Insert failed: ${insertErr.message}`,
        });
      } else {
        checks.push({
          test: 'scan_history INSERT',
          status: 'PASS',
          detail: `Insert OK — id: ${testScan.id}`,
        });
        // Clean up test record
        await admin.from('scan_history').delete().eq('id', testScan.id);
      }

      // Test check_user_role RPC
      const { error: rpcErr } = await admin.rpc('check_user_role', { user_id: '00000000-0000-0000-0000-000000000000' });
      checks.push({
        test: 'check_user_role RPC',
        status: rpcErr ? 'FAIL' : 'PASS',
        detail: rpcErr ? `RPC error: ${rpcErr.message}` : 'RPC function exists and works',
      });

      // Test profiles table
      const { data: profiles, error: profErr } = await admin
        .from('profiles')
        .select('id, email, role')
        .in('role', ['admin', 'super_admin']);

      checks.push({
        test: 'Admin users in profiles',
        status: profErr ? 'FAIL' : (profiles && profiles.length > 0 ? 'PASS' : 'FAIL'),
        detail: profErr
          ? `Error: ${profErr.message}`
          : profiles && profiles.length > 0
          ? `Found ${profiles.length} admin(s): ${profiles.map((p: { email: string }) => p.email).join(', ')}`
          : 'No admin users found in profiles table',
      });

    } catch (e) {
      checks.push({
        test: 'Supabase connection',
        status: 'FAIL',
        detail: `Connection failed: ${e instanceof Error ? e.message : 'unknown'}`,
      });
    }
  } else {
    checks.push({
      test: 'Supabase connection',
      status: 'FAIL',
      detail: 'Skipped — missing env vars (see above)',
    });
  }

  const failCount = checks.filter(c => c.status === 'FAIL').length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    verdict: failCount === 0 ? 'ALL CHECKS PASS — scan should work' : `${failCount} FAILURE(S) — fix before scanning`,
    checks,
  });
}
