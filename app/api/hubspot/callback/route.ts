import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET (req: NextRequest) {
  const supabase = await createClient()

  // ✅ Get current logged-in user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    console.error('Auth error:', authError)
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  try {
    const tokenRes = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        redirect_uri: 'http://localhost:3000/api/hubspot/callback',
        code
      })
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token || !tokenData.refresh_token) {
      return NextResponse.json(
        { error: 'HubSpot token request failed', details: tokenData },
        { status: 500 }
      )
    }

    // ✅ Save to Supabase DB under this user's email
    const { error: insertError } = await supabase
      .from('hubspot_tokens')
      .insert([
        {
          user_email: user.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          created_at: new Date().toISOString()
        }
      ])

    if (insertError) {
      console.error('Supabase insert error:', insertError) // 👈 this will help
      return NextResponse.json(
        { error: 'Failed to store token', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.redirect(new URL('/', req.url))
  } catch (error) {
    console.error('Token error:', error)
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 500 }
    )
  }
}
