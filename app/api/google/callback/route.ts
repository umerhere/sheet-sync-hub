// app/api/google/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET (req: NextRequest) {
  const supabase = await createClient()

  // ✅ Get the currently logged-in Supabase user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (!user || userError) {
    console.error('User not authenticated:', userError)
    return NextResponse.json({ error: 'User not logged in' }, { status: 401 })
  }

  // ✅ Get the Google auth code from URL
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing Google code' }, { status: 400 })
  }

  // ✅ Exchange code for tokens
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
        // redirect_uri: 'http://localhost:3000/api/google/callback',
        redirect_uri: new URL('/api/google/callback', req.url).toString(),
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: 'Token exchange failed', details: tokenData },
        { status: 500 }
      )
    }

    // ✅ Save to Supabase
    const { error: upsertError } = await supabase.from('google_tokens').upsert(
      [
        {
          user_email: user.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type,
          created_at: new Date().toISOString()
        }
      ],
      { onConflict: 'user_email' } // 👈 ensure this column is UNIQUE in Supabase
    )

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to store token', details: upsertError.message },
        { status: 500 }
      )
    }
    return NextResponse.redirect(new URL('/', req.url))
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}
