import { createClient } from '@/lib/supabase/server';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'viewer';
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
    const { data: role, error: rpcError } = await supabase.rpc('check_user_role', { user_id: user.id });

    if (rpcError) {
      console.error('[getUser] check_user_role RPC failed:', rpcError.message);
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (role as User['role']) || 'viewer',
    };
  } catch (err) {
    console.error('[getUser] unexpected error:', err);
    return null;
  }
}
