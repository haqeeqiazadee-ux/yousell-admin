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
