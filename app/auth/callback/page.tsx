import { createClient } from '@/lib/supabase/server' // SERVER CLIENT
import { redirect } from 'next/navigation'

export default async function AuthCallback() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  redirect('/auth/login') // fallback
}
