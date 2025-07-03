// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient () {
  const cookieStore = await cookies() // ✅ NOT async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get (name: string) {
          return cookieStore.get(name)?.value
        },
        set (name, value, options) {
          cookieStore.set(name, value, options)
        }
        // remove (name, options) {
        //   cookieStore.delete(name, options)
        // }
      }
    }
  )
}
