import { createClient } from '@/lib/supabase/server';

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'client' | 'viewer';
}

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      if (error) console.error('[getUser] auth.getUser failed:', error.message);
      return null;
    }

    // Use SECURITY DEFINER RPC to bypass RLS on profiles table
    let role: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error: rpcError } = await supabase.rpc('check_user_role', { user_id: user.id });
      if (!rpcError && data) {
        role = data;
        break;
      }
      console.error(`[getUser] check_user_role RPC attempt ${attempt + 1} failed:`, rpcError?.message);
    }

    if (!role) {
      console.error('[getUser] All RPC attempts failed, returning null for safety');
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: role as User['role'],
    };
  } catch (err) {
    console.error('[getUser] unexpected error:', err);
    return null;
  }
}
