import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Homepage from '@/components/Homepage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  const isAdminSubdomain = hostname.startsWith('admin.')

  // Admin subdomain: redirect (middleware handles this too, but fallback)
  if (isAdminSubdomain) {
    redirect(user ? '/admin' : '/admin/login')
  }

  // Client domain: logged-in users go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Unauthenticated client-domain visitors see the homepage
  return <Homepage />
}
