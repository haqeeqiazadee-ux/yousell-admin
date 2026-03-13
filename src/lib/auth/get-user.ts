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
    if (error || !user) return null;

    // Use SECURITY DEFINER RPC to bypass RLS on profiles table
    const { data: role } = await supabase.rpc('check_user_role', { user_id: user.id });

    return {
      id: user.id,
      email: user.email || '',
      role: (role as User['role']) || 'viewer',
    };
  } catch {
    return null;
  }
}
