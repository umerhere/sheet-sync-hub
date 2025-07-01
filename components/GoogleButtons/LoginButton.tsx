'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginButton() {
  const handleLogin = async () => {
    const token = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // options: {
      //   redirectTo: 'https://gdtxgpqqorllfgjlccun.supabase.co/auth/v1/callback',
      // },
    })
    localStorage.setItem('umar_token_latest', JSON.stringify(token))
    console.log("umar token", token);
  }

  
  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Continue with Google - SUPABASE
    </button>
  )
}

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: 'http://localhost:3000/api/google/callback',
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ].join(' ')
  }).toString()

export function GoogleConnectButton() {
  return (
    <button
      onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
    >
      Connect Google Sheets
    </button>
  )
}
