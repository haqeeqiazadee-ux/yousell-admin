import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'viewer';
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) return null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Default to 'admin' for authenticated users — single-tenant admin panel.
    // The profiles row may not exist yet or may default to 'viewer'/'client'.
    return {
      id: user.id,
      email: user.email || '',
      role: (profile?.role as User['role']) || 'admin',
    };
  } catch {
    return null;
  }
}
