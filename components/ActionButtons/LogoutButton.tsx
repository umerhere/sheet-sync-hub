'use client'

import { createClient } from '@supabase/supabase-js'
import { redirect } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
        redirect("/auth/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Disconnect Google Account 
    </button>
  )
}
